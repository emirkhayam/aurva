import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { AuditLog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');

  const limit = 50;

  useEffect(() => {
    loadLogs();
  }, [page, entityType, action]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (entityType) params.set('entity_type', entityType);
      if (action) params.set('action', action);

      const response = await api.get(`/audit?${params.toString()}`);
      const data = response.data;

      const logsList = data.logs || data.data || data;
      setLogs(Array.isArray(logsList) ? logsList : []);

      if (data.meta) {
        setTotalPages(data.meta.totalPages || 1);
      } else if (data.totalPages) {
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Ошибка загрузки логов:', error);
      toast.error('Не удалось загрузить логи аудита');
    } finally {
      setLoading(false);
    }
  };

  const entityTypes = ['news', 'course', 'lesson', 'quiz', 'user', 'member', 'partner', 'team', 'contact', 'settings'];
  const actions = ['create', 'update', 'delete', 'login', 'logout'];

  const actionColor = (a: string) => {
    switch (a) {
      case 'create': return 'success';
      case 'update': return 'default';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
          Аудит
        </h1>
        <p className="text-[rgb(var(--text-muted))]">Журнал действий администраторов</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-[rgb(var(--text))] block mb-1">Тип сущности</label>
              <select
                className="h-10 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text))]"
                value={entityType}
                onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
              >
                <option value="">Все</option>
                {entityTypes.map((et) => (
                  <option key={et} value={et}>{et}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[rgb(var(--text))] block mb-1">Действие</label>
              <select
                className="h-10 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text))]"
                value={action}
                onChange={(e) => { setAction(e.target.value); setPage(1); }}
              >
                <option value="">Все</option>
                {actions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Логи</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-[rgb(var(--text-muted))]">Загрузка...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[rgb(var(--text-muted))]">Логов не найдено</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--border))]">
                    <th className="text-left py-3 px-4 font-medium text-[rgb(var(--text-muted))]">Дата</th>
                    <th className="text-left py-3 px-4 font-medium text-[rgb(var(--text-muted))]">Пользователь</th>
                    <th className="text-left py-3 px-4 font-medium text-[rgb(var(--text-muted))]">Действие</th>
                    <th className="text-left py-3 px-4 font-medium text-[rgb(var(--text-muted))]">Сущность</th>
                    <th className="text-left py-3 px-4 font-medium text-[rgb(var(--text-muted))]">Детали</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-[rgb(var(--border))] last:border-0">
                      <td className="py-3 px-4 text-[rgb(var(--text-muted))] whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="py-3 px-4 text-[rgb(var(--text))]">
                        {log.user_email || 'Система'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={actionColor(log.action) as any}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[rgb(var(--text))]">
                        {log.entity_type}
                        {log.entity_id && (
                          <span className="text-[rgb(var(--text-muted))]"> #{log.entity_id}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[rgb(var(--text-muted))] max-w-xs truncate">
                        {log.details && Object.keys(log.details).length > 0
                          ? JSON.stringify(log.details).substring(0, 100)
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgb(var(--border))]">
              <p className="text-sm text-[rgb(var(--text-muted))]">
                Страница {page} из {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Назад
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Вперед
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
