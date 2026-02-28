import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import type { LoginResponse } from '@/types';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      login(response.data.token, response.data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  // DEV: Quick login
  const quickLogin = async () => {
    setEmail('admin@aurva.kg');
    setPassword('admin123');
    setError('');
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email: 'admin@aurva.kg',
        password: 'admin123',
      });

      login(response.data.token, response.data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="https://static.tildacdn.one/tild3830-6166-4531-b362-646165626563/_SITE.svg"
            alt="AURVA"
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
            Админ-панель
          </h1>
          <p className="text-sm text-[rgb(var(--text-muted))]">
            Войдите для управления контентом
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>Введите email и пароль</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-white bg-[rgb(var(--danger))] rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(var(--text))]">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[rgb(var(--text-subtle))]" />
                  <Input
                    type="email"
                    placeholder="admin@aurva.kg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(var(--text))]">Пароль</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[rgb(var(--text-subtle))]" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
              </Button>

              {/* DEV: Quick Login Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={quickLogin}
                disabled={loading}
              >
                🚀 DEV: Быстрый вход
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[rgb(var(--text-subtle))] mt-6">
          © 2024 AURVA. Все права защищены.
        </p>
      </div>
    </div>
  );
}
