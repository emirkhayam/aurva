import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Mail,
  Newspaper,
  Users,
  Handshake,
  GraduationCap,
  Settings as SettingsIcon,
  LogOut,
  User as UserIcon,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const openMainSite = () => {
    // Открываем главную страницу сайта
    window.open('/', '_blank');
  };

  type NavItem =
    | { type?: undefined; to: string; icon: React.ComponentType<{ className?: string }>; label: string; end?: boolean }
    | { type: 'separator'; label: string };

  const navItems: NavItem[] = [
    { to: '/admin', icon: LayoutDashboard, label: 'Дашборд', end: true },
    { to: '/admin/contacts', icon: Mail, label: 'Заявки' },
    { to: '/admin/news', icon: Newspaper, label: 'Новости' },
    { to: '/admin/members', icon: Users, label: 'Участники' },
    { to: '/admin/partners', icon: Handshake, label: 'Партнеры' },
    { to: '/admin/team', icon: Users, label: 'Команда' },
    { to: '/admin/settings', icon: SettingsIcon, label: 'Настройки' },
    { type: 'separator', label: 'Кабинет' },
    { to: '/admin/clients', icon: Users, label: 'Пользователи' },
    { to: '/admin/courses', icon: GraduationCap, label: 'Курсы' },
    { to: '/admin/profile', icon: UserIcon, label: 'Профиль' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 h-screen sticky top-0 bg-[rgb(var(--bg-card))] border-r border-[rgb(var(--border))] flex flex-col">
        <div className="p-6 border-b border-[rgb(var(--border))]">
          <img
            src="https://static.tildacdn.one/tild3830-6166-4531-b362-646165626563/_SITE.svg"
            alt="AURVA"
            className="h-8 mb-2"
          />
          <p className="text-xs text-[rgb(var(--text-subtle))]">Админ-панель</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) =>
            item.type === 'separator' ? (
              <div key={`sep-${index}`} className="pt-4 pb-2 px-4">
                <p className="text-xs font-semibold text-[rgb(var(--text-subtle))] uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))]'
                      : 'text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-surface))] hover:text-[rgb(var(--text))]'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="p-4 border-t border-[rgb(var(--border))] space-y-2">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-[rgb(var(--text))]">{user?.name}</p>
            <p className="text-xs text-[rgb(var(--text-subtle))]">{user?.email}</p>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={openMainSite}
          >
            <ExternalLink className="h-4 w-4" />
            Основной сайт
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
