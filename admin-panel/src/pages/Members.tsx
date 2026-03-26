import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Member } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Member | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [joinedDate, setJoinedDate] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      // Get all members (both active and inactive) with high limit
      const response = await api.get('/members?limit=100');
      const data = response.data.members || response.data.data || response.data;
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки участников:', error);
      toast.error('Не удалось загрузить участников');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setWebsite('');
    setIsActive(true);
    setDisplayOrder(0);
    setJoinedDate('');
    setLogo(null);
    setLogoUrl('');
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (member: Member) => {
    setEditing(member);
    setName(member.name);
    setDescription(member.description);
    setWebsite(member.website || '');
    setIsActive(member.isActive);
    setDisplayOrder(member.displayOrder);
    setJoinedDate(member.joinedDate.split('T')[0]);
    setLogoUrl(member.logoUrl || '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('website', website);
    formData.append('isActive', String(isActive));
    formData.append('displayOrder', String(displayOrder));
    formData.append('joinedDate', joinedDate);
    if (logo) {
      formData.append('logo', logo);
    }
    if (logoUrl) {
      formData.append('logoUrl', logoUrl);
    }

    try {
      if (editing) {
        await api.put(`/members/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Участник обновлен');
      } else {
        await api.post('/members', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Участник добавлен');
      }
      resetForm();
      loadMembers();
    } catch (error) {
      console.error('Ошибка сохранения участника:', error);
      toast.error('Не удалось сохранить участника');
    }
  };

  const deleteMember = async (id: number) => {
    if (!confirm('Удалить этого участника?')) return;

    try {
      await api.delete(`/members/${id}`);
      toast.success('Участник удален');
      loadMembers();
    } catch (error) {
      console.error('Ошибка удаления участника:', error);
      toast.error('Не удалось удалить участника');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
            Участники
          </h1>
          <p className="text-[rgb(var(--text-muted))]">Управление участниками ассоциации</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить участника
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editing ? 'Редактировать участника' : 'Новый участник'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Название компании
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Описание
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    Веб-сайт
                  </label>
                  <Input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    Дата вступления
                  </label>
                  <Input
                    type="date"
                    value={joinedDate}
                    onChange={(e) => setJoinedDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    Порядок отображения
                  </label>
                  <Input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    min={0}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    Логотип (файл)
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogo(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Логотип (URL)
                </label>
                <Input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                  Если указаны оба варианта, приоритет будет у загруженного файла
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-[rgb(var(--text))]">
                  Активный участник
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editing ? 'Сохранить' : 'Добавить'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[rgb(var(--text-muted))]">Загрузка участников...</p>
        </div>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[rgb(var(--text-muted))]">Участников пока нет</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {members.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {member.logoUrl && (
                      <img
                        src={member.logoUrl}
                        alt={member.name}
                        className="w-16 h-16 object-contain bg-[rgb(var(--bg-surface))] rounded p-2"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        {member.isActive ? (
                          <Eye className="h-4 w-4 text-[rgb(var(--success))]" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-[rgb(var(--text-subtle))]" />
                        )}
                      </div>
                      <CardDescription>
                        Вступил: {formatDate(member.joinedDate)} • Порядок: {member.displayOrder}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={member.isActive ? 'success' : 'default'}>
                    {member.isActive ? 'Активный' : 'Неактивный'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
                  {member.description}
                </p>
                {member.website && (
                  <a
                    href={member.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[rgb(var(--accent))] hover:underline flex items-center gap-1 mb-4"
                  >
                    {member.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMember(member.id)}
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
