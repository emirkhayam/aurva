import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import type { Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\sа-яё-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/cabinet/courses');
      const data = response.data.courses || response.data.data || response.data;
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки курсов:', error);
      toast.error('Не удалось загрузить курсы');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setIsPublished(false);
    setDisplayOrder(0);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (course: Course) => {
    setEditing(course);
    setTitle(course.title);
    setSlug(course.slug);
    setDescription(course.description || '');
    setImageUrl(course.image_url || '');
    setIsPublished(course.is_published);
    setDisplayOrder(course.display_order);
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editing) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      slug,
      description: description || null,
      image_url: imageUrl || null,
      is_published: isPublished,
      display_order: displayOrder,
    };

    try {
      if (editing) {
        await api.put(`/admin/cabinet/courses/${editing.id}`, payload);
        toast.success('Курс обновлен');
      } else {
        await api.post('/admin/cabinet/courses', payload);
        toast.success('Курс создан');
      }
      resetForm();
      loadCourses();
    } catch (error) {
      console.error('Ошибка сохранения курса:', error);
      toast.error('Не удалось сохранить курс');
    }
  };

  const deleteCourse = async (id: number) => {
    if (!confirm('Удалить этот курс?')) return;

    try {
      await api.delete(`/admin/cabinet/courses/${id}`);
      toast.success('Курс удален');
      loadCourses();
    } catch (error) {
      console.error('Ошибка удаления курса:', error);
      toast.error('Не удалось удалить курс');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
            Курсы
          </h1>
          <p className="text-[rgb(var(--text-muted))]">Управление курсами личного кабинета</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить курс
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card ref={formRef} className="mb-6">
          <CardHeader>
            <CardTitle>{editing ? 'Редактировать курс' : 'Новый курс'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Название
                </label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Slug
                </label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                  Автоматически генерируется из названия
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Описание
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    URL изображения
                  </label>
                  <Input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

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
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-[rgb(var(--text))]">
                  Опубликовать сразу
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editing ? 'Сохранить' : 'Создать'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Courses List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[rgb(var(--text-muted))]">Загрузка курсов...</p>
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[rgb(var(--text-muted))]">Курсов пока нет</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {course.image_url && (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-20 h-14 object-cover bg-[rgb(var(--bg-surface))] rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        {course.is_published ? (
                          <Eye className="h-4 w-4 text-[rgb(var(--success))]" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-[rgb(var(--text-subtle))]" />
                        )}
                      </div>
                      <CardDescription>
                        Порядок: {course.display_order} • {formatDateTime(course.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={course.is_published ? 'success' : 'default'}>
                    {course.is_published ? 'Опубликован' : 'Черновик'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {course.description && (
                  <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
                    {course.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/courses/${course.id}/lessons`)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Уроки
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(course)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteCourse(course.id)}
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
