import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import type { News as NewsType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function News() {
  const [newsList, setNewsList] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NewsType['category']>('regulation');
  const [published, setPublished] = useState(false);
  const [images, setImages] = useState<FileList | null>(null);
  const [imageUrls, setImageUrls] = useState(''); // Multiple URLs, comma-separated

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      // Get all news (both published and unpublished) with high limit
      const response = await api.get('/news?limit=100');
      const data = response.data.news || response.data.data || response.data;
      setNewsList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
      toast.error('Не удалось загрузить новости');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory('regulation');
    setPublished(false);
    setImages(null);
    setImageUrls('');
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (news: NewsType) => {
    setEditing(news);
    setTitle(news.title);
    setExcerpt(news.excerpt);
    setContent(news.content);
    setCategory(news.category);
    setPublished(news.published);
    setShowForm(true);

    // Scroll to form after a brief delay to ensure it's rendered
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('excerpt', excerpt);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('published', String(published));

    // Append multiple images (file uploads)
    if (images && images.length > 0) {
      Array.from(images).forEach((file) => {
        formData.append('images', file);
      });
    }

    // Append image URLs (if provided)
    if (imageUrls.trim()) {
      // Split by comma, trim each URL, filter empty
      const urls = imageUrls
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      if (urls.length > 0) {
        formData.append('imageUrls', JSON.stringify(urls));
      }
    }

    try {
      if (editing) {
        await api.put(`/news/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Новость обновлена');
      } else {
        await api.post('/news', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Новость создана');
      }
      resetForm();
      loadNews();
    } catch (error) {
      console.error('Ошибка сохранения новости:', error);
      toast.error('Не удалось сохранить новость');
    }
  };

  const deleteNews = async (id: number) => {
    if (!confirm('Удалить эту новость?')) return;

    try {
      await api.delete(`/news/${id}`);
      toast.success('Новость удалена');
      loadNews();
    } catch (error) {
      console.error('Ошибка удаления новости:', error);
      toast.error('Не удалось удалить новость');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
            Новости
          </h1>
          <p className="text-[rgb(var(--text-muted))]">Управление новостями индустрии</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
            // Scroll to form after a brief delay to ensure it's rendered
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить новость
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card ref={formRef} className="mb-6">
          <CardHeader>
            <CardTitle>{editing ? 'Редактировать новость' : 'Новая новость'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Заголовок
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Краткое описание
                </label>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Полный текст
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    Загрузить изображения (можно выбрать несколько)
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImages(e.target.files)}
                  />
                  {images && images.length > 0 && (
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                      Выбрано файлов: {images.length}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    URL изображений (через запятую)
                  </label>
                  <Input
                    type="text"
                    placeholder="https://example.com/image1.jpg, https://..."
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                  />
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                    Введите URL изображений через запятую
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="published" className="text-sm font-medium text-[rgb(var(--text))]">
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

      {/* News List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[rgb(var(--text-muted))]">Загрузка новостей...</p>
        </div>
      ) : newsList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[rgb(var(--text-muted))]">Новостей пока нет</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {newsList.map((news) => (
            <Card key={news.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{news.title}</CardTitle>
                      {news.published ? (
                        <Eye className="h-4 w-4 text-[rgb(var(--success))]" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-[rgb(var(--text-subtle))]" />
                      )}
                    </div>
                    <CardDescription>
                      {formatDateTime(news.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge variant={news.published ? 'success' : 'default'}>
                    {news.published ? 'Опубликовано' : 'Черновик'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
                  {news.excerpt}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(news)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteNews(news.id)}
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
