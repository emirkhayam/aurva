import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import type { CourseLesson, Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Lessons() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CourseLesson | null>(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    loadCourse();
    loadLessons();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const response = await api.get(`/admin/cabinet/courses`);
      const data = response.data.courses || response.data.data || response.data;
      const list = Array.isArray(data) ? data : [];
      const found = list.find((c: Course) => c.id === Number(courseId));
      setCourse(found || null);
    } catch (error) {
      console.error('Ошибка загрузки курса:', error);
    }
  };

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/cabinet/courses/${courseId}/lessons`);
      const data = response.data.lessons || response.data.data || response.data;
      setLessons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error);
      toast.error('Не удалось загрузить уроки');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setVideoUrl('');
    setDisplayOrder(0);
    setIsPublished(false);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (lesson: CourseLesson) => {
    setEditing(lesson);
    setTitle(lesson.title);
    setContent(lesson.content || '');
    setVideoUrl(lesson.video_url || '');
    setDisplayOrder(lesson.display_order);
    setIsPublished(lesson.is_published);
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      content: content || null,
      video_url: videoUrl || null,
      display_order: displayOrder,
      is_published: isPublished,
    };

    try {
      if (editing) {
        await api.put(`/admin/cabinet/lessons/${editing.id}`, payload);
        toast.success('Урок обновлен');
      } else {
        await api.post(`/admin/cabinet/courses/${courseId}/lessons`, payload);
        toast.success('Урок создан');
      }
      resetForm();
      loadLessons();
    } catch (error) {
      console.error('Ошибка сохранения урока:', error);
      toast.error('Не удалось сохранить урок');
    }
  };

  const deleteLesson = async (id: number) => {
    if (!confirm('Удалить этот урок?')) return;

    try {
      await api.delete(`/admin/cabinet/lessons/${id}`);
      toast.success('Урок удален');
      loadLessons();
    } catch (error) {
      console.error('Ошибка удаления урока:', error);
      toast.error('Не удалось удалить урок');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mb-4"
            onClick={() => navigate('/admin/courses')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к курсам
          </Button>
          <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
            Уроки
          </h1>
          <p className="text-[rgb(var(--text-muted))]">
            {course ? `Курс: ${course.title}` : 'Загрузка...'}
          </p>
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
          Добавить урок
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card ref={formRef} className="mb-6">
          <CardHeader>
            <CardTitle>{editing ? 'Редактировать урок' : 'Новый урок'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Название
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Содержание
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    URL видео
                  </label>
                  <Input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
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

      {/* Lessons List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[rgb(var(--text-muted))]">Загрузка уроков...</p>
        </div>
      ) : lessons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[rgb(var(--text-muted))]">Уроков пока нет</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      {lesson.is_published ? (
                        <Eye className="h-4 w-4 text-[rgb(var(--success))]" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-[rgb(var(--text-subtle))]" />
                      )}
                    </div>
                    <CardDescription>
                      Порядок: {lesson.display_order} • {formatDateTime(lesson.created_at)}
                      {lesson.video_url && ' • Видео прикреплено'}
                    </CardDescription>
                  </div>
                  <Badge variant={lesson.is_published ? 'success' : 'default'}>
                    {lesson.is_published ? 'Опубликован' : 'Черновик'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {lesson.content && (
                  <p className="text-sm text-[rgb(var(--text-muted))] mb-4 line-clamp-3">
                    {lesson.content}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(lesson)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteLesson(lesson.id)}
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
