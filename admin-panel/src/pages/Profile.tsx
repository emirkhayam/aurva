import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Новые пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success('Пароль успешно изменен');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Не удалось изменить пароль'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
          Профиль
        </h1>
        <p className="text-[rgb(var(--text-muted))]">
          Управление профилем и настройками
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Информация о пользователе</CardTitle>
            <CardDescription>Ваши данные в системе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[rgb(var(--accent-soft))] flex items-center justify-center">
                <User className="h-6 w-6 text-[rgb(var(--accent))]" />
              </div>
              <div>
                <p className="font-medium text-[rgb(var(--text))]">{user?.name}</p>
                <p className="text-sm text-[rgb(var(--text-muted))]">{user?.email}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[rgb(var(--border))]">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[rgb(var(--text-subtle))]">Роль</p>
                  <p className="font-medium text-[rgb(var(--text))] capitalize">
                    {user?.role === 'admin' ? 'Администратор' : 'Модератор'}
                  </p>
                </div>
                <div>
                  <p className="text-[rgb(var(--text-subtle))]">ID</p>
                  <p className="font-medium text-[rgb(var(--text))]">#{user?.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Изменить пароль</CardTitle>
            <CardDescription>
              Обновите свой пароль для безопасности
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Текущий пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[rgb(var(--text-subtle))]" />
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Новый пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[rgb(var(--text-subtle))]" />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">
                  Подтвердите новый пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[rgb(var(--text-subtle))]" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Изменить пароль'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
