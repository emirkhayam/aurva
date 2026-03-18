import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Partner } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [benefits, setBenefits] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoType, setLogoType] = useState<'file' | 'url'>('file');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      // Get all partners (both active and inactive) with high limit
      const response = await api.get('/partners?limit=100');
      const data = response.data.partners || response.data.data || response.data;
      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки партнеров:', error);
      toast.error('Не удалось загрузить партнеров');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    console.log('resetForm вызвана');
    setName('');
    setWebsite('');
    setModalTitle('');
    setModalDescription('');
    setBenefits('');
    setIsActive(true);
    setDisplayOrder(0);
    setLogo(null);
    setLogoType('file');
    setLogoUrl('');
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (partner: Partner) => {
    setEditing(partner);
    setName(partner.name);
    setWebsite(partner.website || '');
    setModalTitle(partner.modalTitle || '');
    setModalDescription(partner.modalDescription || '');
    setBenefits(partner.benefits || '');
    setIsActive(partner.isActive);
    setDisplayOrder(partner.displayOrder);

    // Определяем тип логотипа
    if (partner.logoUrl && (partner.logoUrl.startsWith('http://') || partner.logoUrl.startsWith('https://'))) {
      setLogoType('url');
      setLogoUrl(partner.logoUrl);
    } else {
      setLogoType('file');
      setLogoUrl('');
    }

    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('website', website);
    formData.append('modalTitle', modalTitle);
    formData.append('modalDescription', modalDescription);
    formData.append('benefits', benefits);
    formData.append('isActive', String(isActive));
    formData.append('displayOrder', String(displayOrder));

    // Логотип: либо файл, либо URL
    if (logoType === 'url' && logoUrl) {
      formData.append('logoUrl', logoUrl);
    } else if (logoType === 'file' && logo) {
      formData.append('logo', logo);
    }

    try {
      if (editing) {
        await api.put(`/partners/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Партнер обновлен');
      } else {
        await api.post('/partners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Партнер добавлен');
      }
      resetForm();
      loadPartners();
    } catch (error) {
      console.error('Ошибка сохранения партнера:', error);
      toast.error('Не удалось сохранить партнера');
    }
  };

  const deletePartner = async (id: number) => {
    if (!confirm('Удалить этого партнера?')) return;

    try {
      await api.delete(`/partners/${id}`);
      toast.success('Партнер удален');
      loadPartners();
    } catch (error) {
      console.error('Ошибка удаления партнера:', error);
      toast.error('Не удалось удалить партнера');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
            Партнеры
          </h1>
          <p className="text-[rgb(var(--text-muted))]">Управление партнерами ассоциации</p>
        </div>
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            console.log('Кнопка добавления партнера нажата');
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить партнера
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editing ? 'Редактировать партнера' : 'Новый партнер'}
            </CardTitle>
            <CardDescription>
              Заполните информацию о партнере. В поле "Преимущества" каждая строка будет отдельным пунктом списка.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Основная информация */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[rgb(var(--text))] border-b pb-2">
                  Основная информация
                </h3>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    Название партнера *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Match Systems"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    Веб-сайт
                  </label>
                  <Input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                    Необязательное поле
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))] mb-1 block">
                    Логотип
                  </label>
                  <p className="text-xs text-[rgb(var(--text-muted))] mb-3">
                    Необязательное поле
                  </p>

                  {/* Текущий логотип при редактировании */}
                  {editing && editing.logoUrl && (
                    <div className="mb-4 p-4 bg-[rgb(var(--bg-surface))] rounded border border-[rgb(var(--border))]">
                      <p className="text-xs text-[rgb(var(--text-muted))] mb-2">Текущий логотип:</p>
                      <img
                        src={editing.logoUrl}
                        alt={editing.name}
                        className="h-16 object-contain"
                      />
                    </div>
                  )}

                  {/* Переключатель типа логотипа */}
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="logoType"
                        value="file"
                        checked={logoType === 'file'}
                        onChange={() => setLogoType('file')}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-[rgb(var(--text))]">Загрузить файл</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="logoType"
                        value="url"
                        checked={logoType === 'url'}
                        onChange={() => setLogoType('url')}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-[rgb(var(--text))]">Ссылка на изображение</span>
                    </label>
                  </div>

                  {/* Поле для загрузки файла */}
                  {logoType === 'file' && (
                    <>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogo(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                        Рекомендуется квадратное изображение, PNG с прозрачным фоном
                      </p>
                    </>
                  )}

                  {/* Поле для URL */}
                  {logoType === 'url' && (
                    <>
                      <Input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                        Вставьте прямую ссылку на изображение (необязательно)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Информация для модального окна */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[rgb(var(--text))] border-b pb-2">
                  Информация для модального окна
                </h3>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    Заголовок в модалке
                  </label>
                  <Input
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder="Полное название компании"
                  />
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                    Необязательно. Например: "Швейцарская Некоммерческая Ассоциация..."
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    Описание партнера
                  </label>
                  <Textarea
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    rows={3}
                    placeholder="Наша ассоциация гордится партнерством с..."
                  />
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                    Необязательное поле
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">
                    Преимущества партнерства
                  </label>
                  <Textarea
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    rows={6}
                    placeholder="Реализацию совместных проектов и разработок&#10;Организацию зарубежных поездок&#10;Обмен методическими материалами"
                  />
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                    💡 Необязательно. Каждая строка = отдельный пункт списка в модальном окне
                  </p>
                </div>
              </div>

              {/* Настройки отображения */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[rgb(var(--text))] border-b pb-2">
                  Настройки отображения
                </h3>

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

                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-[rgb(var(--text))]">
                        Активный партнер
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button type="submit">
                  {editing ? 'Сохранить' : 'Добавить'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    resetForm();
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Partners List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[rgb(var(--text-muted))]">Загрузка партнеров...</p>
        </div>
      ) : partners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[rgb(var(--text-muted))]">Партнеров пока нет</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {partners.map((partner) => (
            <Card key={partner.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {partner.logoUrl && (
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="w-16 h-16 object-contain bg-[rgb(var(--bg-surface))] rounded p-2"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        {partner.isActive ? (
                          <Eye className="h-4 w-4 text-[rgb(var(--success))]" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-[rgb(var(--text-subtle))]" />
                        )}
                      </div>
                      <CardDescription>
                        Порядок: {partner.displayOrder}
                        {partner.modalTitle && ` • ${partner.modalTitle.substring(0, 50)}...`}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={partner.isActive ? 'success' : 'default'}>
                    {partner.isActive ? 'Активный' : 'Неактивный'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {partner.modalDescription && (
                  <p className="text-sm text-[rgb(var(--text-muted))] mb-3">
                    {partner.modalDescription.substring(0, 150)}...
                  </p>
                )}
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[rgb(var(--accent))] hover:underline flex items-center gap-1 mb-4"
                  >
                    {partner.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(partner)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deletePartner(partner.id)}
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
