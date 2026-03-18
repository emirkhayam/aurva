import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Users, UserCheck, GraduationCap, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  news_count: number;
  members_count: number;
  clients_count: number;
  courses_count: number;
  contacts_count: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/cabinet/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      toast.error('Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'НОВОСТИ',
      value: stats?.news_count ?? '—',
      subtitle: 'Всего новостей',
      icon: Newspaper,
      color: 'rgb(var(--accent))',
    },
    {
      title: 'УЧАСТНИКИ',
      value: stats?.members_count ?? '—',
      subtitle: 'Всего участников',
      icon: Users,
      color: 'rgb(var(--accent))',
    },
    {
      title: 'ПОЛЬЗОВАТЕЛИ',
      value: stats?.clients_count ?? '—',
      subtitle: 'Пользователей кабинета',
      icon: UserCheck,
      color: 'rgb(var(--accent))',
    },
    {
      title: 'КУРСЫ',
      value: stats?.courses_count ?? '—',
      subtitle: 'Всего курсов',
      icon: GraduationCap,
      color: 'rgb(var(--accent))',
    },
    {
      title: 'ЗАЯВКИ',
      value: stats?.contacts_count ?? '—',
      subtitle: 'Всего заявок',
      icon: Mail,
      color: 'rgb(var(--accent))',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
          Дашборд
        </h1>
        <p className="text-[rgb(var(--text-muted))]">
          Обзор системы управления AURVA
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-[rgb(var(--text-muted))]">Загрузка статистики...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statCards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[rgb(var(--text-muted))]">
                  {card.title}
                </CardTitle>
                <card.icon
                  className="h-5 w-5"
                  style={{ color: card.color }}
                />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display text-[rgb(var(--text))]">
                  {card.value}
                </div>
                <p className="text-xs text-[rgb(var(--text-subtle))] mt-1">
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Добро пожаловать в админ-панель AURVA</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[rgb(var(--text-muted))] mb-4">
            Используйте навигацию слева для управления:
          </p>
          <ul className="space-y-2 text-sm text-[rgb(var(--text-muted))]">
            <li>• <strong>Заявки</strong> — обработка заявок на вступление</li>
            <li>• <strong>Новости</strong> — публикация новостей индустрии</li>
            <li>• <strong>Участники</strong> — управление участниками ассоциации</li>
            <li>• <strong>Пользователи</strong> — управление пользователями кабинета</li>
            <li>• <strong>Курсы</strong> — управление курсами и уроками</li>
            <li>• <strong>Профиль</strong> — изменение пароля и настроек</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
