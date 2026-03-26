import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { ClientProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { Trash2, Search, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/cabinet/clients');
      const data = response.data.clients || response.data.data || response.data;
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      toast.error('Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (client: ClientProfile) => {
    try {
      await api.put(`/admin/cabinet/clients/${client.id}`, {
        is_active: !client.is_active,
      });
      toast.success(
        client.is_active ? 'Пользователь деактивирован' : 'Пользователь активирован'
      );
      loadClients();
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      toast.error('Не удалось обновить пользователя');
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm('Удалить этого пользователя?')) return;

    try {
      await api.delete(`/admin/cabinet/clients/${id}`);
      toast.success('Пользователь удален');
      loadClients();
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      toast.error('Не удалось удалить пользователя');
    }
  };

  const filteredClients = clients.filter((client) => {
    const query = search.toLowerCase();
    return (
      client.full_name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
            Пользователи кабинета
          </h1>
          <p className="text-[rgb(var(--text-muted))]">Управление пользователями личного кабинета</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))]" />
          <Input
            placeholder="Поиск по имени или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[rgb(var(--text-muted))]">Загрузка пользователей...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[rgb(var(--text-muted))]">
              {search ? 'Ничего не найдено' : 'Пользователей пока нет'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <th className="text-left p-4 font-medium text-[rgb(var(--text-muted))]">Имя</th>
                    <th className="text-left p-4 font-medium text-[rgb(var(--text-muted))]">Email</th>
                    <th className="text-left p-4 font-medium text-[rgb(var(--text-muted))]">Телефон</th>
                    <th className="text-left p-4 font-medium text-[rgb(var(--text-muted))]">Компания</th>
                    <th className="text-left p-4 font-medium text-[rgb(var(--text-muted))]">Статус</th>
                    <th className="text-left p-4 font-medium text-[rgb(var(--text-muted))]">Последний вход</th>
                    <th className="text-left p-4 font-medium text-[rgb(var(--text-muted))]">Регистрация</th>
                    <th className="text-right p-4 font-medium text-[rgb(var(--text-muted))]">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-[rgb(var(--border))] last:border-b-0 hover:bg-[rgb(var(--bg-surface))]"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {client.avatar_url ? (
                            <img
                              src={client.avatar_url}
                              alt={client.full_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[rgb(var(--accent-soft))] flex items-center justify-center text-xs font-medium text-[rgb(var(--accent))]">
                              {client.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-[rgb(var(--text))]">
                            {client.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-[rgb(var(--text-muted))]">{client.email}</td>
                      <td className="p-4 text-[rgb(var(--text-muted))]">{client.phone || '—'}</td>
                      <td className="p-4 text-[rgb(var(--text-muted))]">{client.company_name || '—'}</td>
                      <td className="p-4">
                        <Badge variant={client.is_active ? 'success' : 'default'}>
                          {client.is_active ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </td>
                      <td className="p-4 text-[rgb(var(--text-muted))]">
                        {client.last_login ? formatDateTime(client.last_login) : '—'}
                      </td>
                      <td className="p-4 text-[rgb(var(--text-muted))]">
                        {formatDateTime(client.created_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/clients/${client.id}/courses`)}
                            title="Управление курсами"
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActive(client)}
                            title={client.is_active ? 'Деактивировать' : 'Активировать'}
                          >
                            {client.is_active ? (
                              <ToggleRight className="h-4 w-4 text-[rgb(var(--success))]" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteClient(client.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
