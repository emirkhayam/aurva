import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Contact } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { Trash2, RefreshCw, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV, exportToPDF } from '@/lib/export';

const statusLabels: Record<Contact['status'], string> = {
  new: 'Новая',
  contacted: 'Связались',
  processed: 'Обработана',
  rejected: 'Отклонена',
};

const statusVariants: Record<Contact['status'], 'info' | 'warning' | 'success' | 'danger'> = {
  new: 'info',
  contacted: 'warning',
  processed: 'success',
  rejected: 'danger',
};

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Contact['status'] | 'all'>('all');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contacts');
      const data = response.data.contacts || response.data.data || response.data;
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
      toast.error('Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: Contact['status']) => {
    try {
      await api.put(`/contacts/${id}`, { status });
      toast.success('Статус обновлен');
      loadContacts();
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      toast.error('Не удалось обновить статус');
    }
  };

  const deleteContact = async (id: number) => {
    if (!confirm('Удалить эту заявку?')) return;

    try {
      await api.delete(`/contacts/${id}`);
      toast.success('Заявка удалена');
      loadContacts();
    } catch (error) {
      console.error('Ошибка удаления заявки:', error);
      toast.error('Не удалось удалить заявку');
    }
  };

  const filteredContacts = filter === 'all'
    ? contacts
    : contacts.filter((c) => c.status === filter);

  const handleExportCSV = () => {
    exportToCSV(filteredContacts, 'contacts', [
      { key: 'name', label: 'Имя' },
      { key: 'phone', label: 'Телефон' },
      { key: 'status', label: 'Статус' },
      { key: 'notes', label: 'Заметки' },
      { key: 'createdAt', label: 'Дата' },
    ]);
    toast.success('CSV файл скачан');
  };

  const handleExportPDF = () => {
    exportToPDF('Заявки', filteredContacts, [
      { key: 'name', label: 'Имя' },
      { key: 'phone', label: 'Телефон' },
      { key: 'status', label: 'Статус' },
      { key: 'notes', label: 'Заметки' },
      { key: 'createdAt', label: 'Дата' },
    ]);
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
            Заявки на вступление
          </h1>
          <p className="text-[rgb(var(--text-muted))]">
            Управление заявками от компаний
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={loadContacts} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Все ({contacts.length})
        </Button>
        <Button
          variant={filter === 'new' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('new')}
        >
          Новые ({contacts.filter((c) => c.status === 'new').length})
        </Button>
        <Button
          variant={filter === 'contacted' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('contacted')}
        >
          Связались ({contacts.filter((c) => c.status === 'contacted').length})
        </Button>
        <Button
          variant={filter === 'processed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('processed')}
        >
          Обработаны ({contacts.filter((c) => c.status === 'processed').length})
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-[rgb(var(--text-muted))]">Загрузка заявок...</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[rgb(var(--text-muted))]">Заявок нет</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <CardDescription>
                      {contact.phone} • {formatDateTime(contact.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge variant={statusVariants[contact.status]}>
                    {statusLabels[contact.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {contact.notes && (
                  <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
                    <strong>Заметки:</strong> {contact.notes}
                  </p>
                )}

                <div className="flex gap-2">
                  <select
                    className="flex h-9 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 py-2 text-sm"
                    value={contact.status}
                    onChange={(e) =>
                      updateStatus(contact.id, e.target.value as Contact['status'])
                    }
                  >
                    <option value="new">Новая</option>
                    <option value="contacted">Связались</option>
                    <option value="processed">Обработана</option>
                    <option value="rejected">Отклонена</option>
                  </select>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteContact(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
