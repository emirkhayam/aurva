import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Newspaper, Users, UserCheck, GraduationCap, Mail,
  Plus, ArrowRight, TrendingUp, Clock, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface DashboardStats {
  news_count: number;
  members_count: number;
  clients_count: number;
  courses_count: number;
  contacts_count: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/news?limit=5').then(r => {
        const d = r.data;
        const news = d.news || d.data || d;
        const total = d.pagination?.total ?? (Array.isArray(news) ? news.length : 0);
        return { items: Array.isArray(news) ? news : [], total };
      }),
      api.get('/members?limit=1').then(r => r.data.pagination?.total ?? 0).catch(() => 0),
      api.get('/admin/cabinet/stats').then(r => r.data.stats || r.data).catch(() => ({})),
      api.get('/contacts').then(r => {
        const d = r.data.contacts || r.data.data || r.data;
        return Array.isArray(d) ? d : [];
      }).catch(() => []),
    ]).then(([newsResult, membersTotal, cabinetStats, contactsData]) => {
      setStats({
        news_count: newsResult.total,
        members_count: membersTotal,
        clients_count: cabinetStats.clients?.total ?? 0,
        courses_count: cabinetStats.courses?.total ?? 0,
        contacts_count: contactsData.length,
      });
      setRecentNews(newsResult.items.slice(0, 5));
      setRecentContacts(contactsData);
    }).catch(err => {
      console.error('Dashboard load error:', err);
      toast.error('Не удалось загрузить данные');
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: 'НОВОСТИ', value: stats?.news_count ?? '\u2014', subtitle: 'Всего новостей', icon: Newspaper },
    { title: 'УЧАСТНИКИ', value: stats?.members_count ?? '\u2014', subtitle: 'Всего участников', icon: Users },
    { title: 'ПОЛЬЗОВАТЕЛИ', value: stats?.clients_count ?? '\u2014', subtitle: 'Пользователей кабинета', icon: UserCheck },
    { title: 'КУРСЫ', value: stats?.courses_count ?? '\u2014', subtitle: 'Всего курсов', icon: GraduationCap },
    { title: 'ЗАЯВКИ', value: stats?.contacts_count ?? '\u2014', subtitle: 'Всего заявок', icon: Mail },
  ];

  const contactsByStatus = {
    new: recentContacts.filter(c => c.status === 'new').length,
    contacted: recentContacts.filter(c => c.status === 'contacted').length,
    processed: recentContacts.filter(c => c.status === 'processed').length,
    rejected: recentContacts.filter(c => c.status === 'rejected').length,
  };
  const totalContacts = recentContacts.length || 1;

  const statusColors: Record<string, string> = {
    new: 'rgb(var(--info))',
    contacted: 'rgb(var(--warning))',
    processed: 'rgb(var(--success))',
    rejected: 'rgb(var(--danger))',
  };
  const statusLabels: Record<string, string> = {
    new: 'Новые',
    contacted: 'Связались',
    processed: 'Обработаны',
    rejected: 'Отклонены',
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgb(var(--text-muted))]">Загрузка дашборда...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
          Дашборд
        </h1>
        <p className="text-[rgb(var(--text-muted))]">Обзор системы управления AURVA</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[rgb(var(--text-muted))]">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-[rgb(var(--accent))]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display text-[rgb(var(--text))]">{card.value}</div>
              <p className="text-xs text-[rgb(var(--text-subtle))] mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent News */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[rgb(var(--accent))]" />
              Последние новости
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/news')}>
              Все <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentNews.length === 0 ? (
              <p className="text-sm text-[rgb(var(--text-muted))]">Нет новостей</p>
            ) : (
              <div className="space-y-3">
                {recentNews.map((news: any) => (
                  <div key={news.id} className="flex items-center justify-between py-2 border-b border-[rgb(var(--border))] last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--text))] truncate">{news.title}</p>
                      <p className="text-xs text-[rgb(var(--text-subtle))]">{formatDate(news.createdAt || news.created_at)}</p>
                    </div>
                    <Badge variant={news.published ? 'success' : 'default'} className="ml-2 shrink-0">
                      {news.published ? 'Опубл.' : 'Черновик'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacts by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[rgb(var(--accent))]" />
              Заявки по статусам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(contactsByStatus).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[rgb(var(--text-muted))]">{statusLabels[status]}</span>
                    <span className="font-medium text-[rgb(var(--text))]">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-[rgb(var(--bg-surface))] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(count / totalContacts) * 100}%`,
                        backgroundColor: statusColors[status],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[rgb(var(--accent))]" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/admin/news')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Добавить новость
            </Button>
            <Button onClick={() => navigate('/admin/courses')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Добавить курс
            </Button>
            <Button onClick={() => navigate('/admin/contacts')} variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Просмотр заявок
            </Button>
            <Button onClick={() => navigate('/admin/members')} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Участники
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
