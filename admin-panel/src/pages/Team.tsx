import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  photoUrl?: string;
  bio?: string;
  category: 'leadership' | 'council' | 'other';
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState<'leadership' | 'council' | 'other'>('other');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/team?limit=100');
      const data = response.data.teamMembers || response.data.data || response.data;
      setTeamMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки команды:', error);
      toast.error('Не удалось загрузить членов команды');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPosition('');
    setBio('');
    setCategory('other');
    setIsActive(true);
    setDisplayOrder(0);
    setPhoto(null);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (member: TeamMember) => {
    setEditing(member);
    setName(member.name);
    setPosition(member.position);
    setBio(member.bio || '');
    setCategory(member.category);
    setIsActive(member.isActive);
    setDisplayOrder(member.displayOrder);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('position', position);
    formData.append('bio', bio);
    formData.append('category', category);
    formData.append('isActive', String(isActive));
    formData.append('displayOrder', String(displayOrder));
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      if (editing) {
        await api.put(`/team/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Член команды обновлен');
      } else {
        await api.post('/team', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Член команды добавлен');
      }
      resetForm();
      loadTeamMembers();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Не удалось сохранить');
    }
  };

  const deleteTeamMember = async (id: number) => {
    if (!confirm('Удалить этого члена команды?')) return;

    try {
      await api.delete(`/team/${id}`);
      toast.success('Член команды удален');
      loadTeamMembers();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      toast.error('Не удалось удалить');
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels = {
      leadership: 'Руководство',
      council: 'Экспертный совет',
      other: 'Другое'
    };
    return labels[cat as keyof typeof labels] || cat;
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
            Команда
          </h1>
          <p className="text-[rgb(var(--text-muted))]">Управление членами команды и экспертного совета</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить члена команды
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editing ? 'Редактировать' : 'Новый член команды'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">Имя</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">Должность</label>
                  <Input value={position} onChange={(e) => setPosition(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">Биография</label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">Категория</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as any)}
                          className="w-full px-4 py-2 border rounded-lg">
                    <option value="leadership">Руководство</option>
                    <option value="council">Экспертный совет</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">Порядок</label>
                  <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} min={0} />
                </div>
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">Фото</label>
                  <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded" />
                <label htmlFor="isActive" className="text-sm font-medium text-[rgb(var(--text))]">Активный</label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editing ? 'Сохранить' : 'Добавить'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Отмена</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-[rgb(var(--text-muted))]">Загрузка...</p>
        </div>
      ) : teamMembers.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <p className="text-[rgb(var(--text-muted))]">Членов команды пока нет</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {member.photoUrl && (
                      <img src={member.photoUrl} alt={member.name} className="w-16 h-16 object-cover rounded-full bg-[rgb(var(--bg-surface))]" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        {member.isActive ? <Eye className="h-4 w-4 text-[rgb(var(--success))]" /> : <EyeOff className="h-4 w-4 text-[rgb(var(--text-subtle))]" />}
                      </div>
                      <CardDescription>{member.position} • Порядок: {member.displayOrder}</CardDescription>
                      <Badge variant="default" className="mt-2">{getCategoryLabel(member.category)}</Badge>
                    </div>
                  </div>
                  <Badge variant={member.isActive ? 'success' : 'default'}>{member.isActive ? 'Активный' : 'Неактивный'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {member.bio && <p className="text-sm text-[rgb(var(--text-muted))] mb-4">{member.bio}</p>}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                    <Edit className="h-4 w-4 mr-2" />Редактировать
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteTeamMember(member.id)}>
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
