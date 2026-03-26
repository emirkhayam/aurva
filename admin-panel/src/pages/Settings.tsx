import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Contact settings
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      const settings = response.data.settings || {};

      setAddress(settings.contact_address || '');
      setPhone(settings.contact_phone || '');
      setEmail(settings.contact_email || '');
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      toast.error('Не удалось загрузить настройки');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const settingsData = {
        contact_address: address,
        contact_phone: phone,
        contact_email: email
      };

      await api.put('/settings', settingsData);
      toast.success('Настройки сохранены');
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      toast.error('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgb(var(--text-muted))]">Загрузка настроек...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
          Настройки сайта
        </h1>
        <p className="text-[rgb(var(--text-muted))]">Управление контактной информацией и другими настройками</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Контактная информация</CardTitle>
          <CardDescription>
            Эта информация отображается в футере сайта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-[rgb(var(--text))] mb-2 block">
                Офис
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Кыргызская Республика, г. Бишкек"
                required
              />
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                Адрес офиса
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-[rgb(var(--text))] mb-2 block">
                Телефон
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+996 550 99 90 10"
                required
              />
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                Контактный телефон
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-[rgb(var(--text))] mb-2 block">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aurva.kg@gmail.com"
                required
              />
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                Email для связи
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
