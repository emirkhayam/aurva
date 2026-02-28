import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Building2, FileText, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  const statCards = [
    {
      title: 'ГОД ОСНОВАНИЯ',
      value: '2024',
      subtitle: 'Год основания',
      icon: Calendar,
      color: 'rgb(var(--accent))',
    },
    {
      title: 'КОМПАНИЙ-ЛИДЕРОВ',
      value: '10+',
      subtitle: 'Компаний-лидеров',
      icon: Building2,
      color: 'rgb(var(--accent))',
    },
    {
      title: 'ЗАКОНОПРОЕКТОВ',
      value: '5+',
      subtitle: 'Законопроектов',
      icon: FileText,
      color: 'rgb(var(--accent))',
    },
    {
      title: 'ПРОЗРАЧНОСТЬ',
      value: '100%',
      subtitle: 'Прозрачность',
      icon: ShieldCheck,
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <li>• <strong>Профиль</strong> — изменение пароля и настроек</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
