import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import type { UserCourseProgress, Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { ArrowLeft, Plus, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientCourses() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ full_name: string; email: string } | null>(null);
  const [userCourses, setUserCourses] = useState<UserCourseProgress[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserCourses();
      loadAvailableCourses();
    }
  }, [userId]);

  const loadUserCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/cabinet/user-courses/${userId}`);
      setUser(response.data.user);
      setUserCourses(response.data.courses || []);
    } catch (error) {
      console.error('Ошибка загрузки курсов пользователя:', error);
      toast.error('Не удалось загрузить курсы пользователя');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableCourses = async () => {
    try {
      const response = await api.get('/admin/cabinet/courses?limit=1000');
      const allCourses = response.data.courses || response.data.data || response.data;
      setAvailableCourses(Array.isArray(allCourses) ? allCourses : []);
    } catch (error) {
      console.error('Ошибка загрузки курсов:', error);
      toast.error('Не удалось загрузить список курсов');
    }
  };

  const assignCourse = async (courseId: number) => {
    try {
      await api.post('/admin/cabinet/user-courses', {
        userId,
        courseId,
      });
      toast.success('Курс назначен');
      setShowAddModal(false);
      loadUserCourses();
    } catch (error: any) {
      console.error('Ошибка назначения курса:', error);
      if (error.response?.status === 409) {
        toast.error('Курс уже назначен этому пользователю');
      } else {
        toast.error('Не удалось назначить курс');
      }
    }
  };

  const unassignCourse = async (courseId: number) => {
    if (!confirm('Убрать этот курс у пользователя?')) return;

    try {
      await api.delete(`/admin/cabinet/user-courses/${userId}/${courseId}`);
      toast.success('Курс убран');
      loadUserCourses();
    } catch (error) {
      console.error('Ошибка удаления курса:', error);
      toast.error('Не удалось убрать курс');
    }
  };

  const getAssignedCourseIds = () => {
    return userCourses.map((uc) => uc.course_id);
  };

  const getUnassignedCourses = () => {
    const assignedIds = getAssignedCourseIds();
    return availableCourses.filter((course) => !assignedIds.includes(course.id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Завершен</Badge>;
      case 'in_progress':
        return <Badge variant="default">В процессе</Badge>;
      case 'not_started':
        return <Badge>Не начат</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgb(var(--text-muted))]">Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgb(var(--text-muted))]">Пользователь не найден</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate('/admin/clients')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
            Курсы пользователя
          </h1>
          <p className="text-[rgb(var(--text-muted))]">
            {user.full_name} ({user.email})
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Назначить курс
        </Button>
      </div>

      {/* Assigned Courses */}
      {userCourses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-[rgb(var(--text-subtle))]" />
            <p className="text-[rgb(var(--text-muted))]">
              У пользователя пока нет назначенных курсов
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {userCourses.map((userCourse) => {
            const course = userCourse.courses;
            if (!course) return null;

            return (
              <Card key={userCourse.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {course.image_url && (
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="w-20 h-14 object-cover bg-[rgb(var(--bg-surface))] rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          {getStatusBadge(userCourse.status)}
                        </div>
                        <p className="text-sm text-[rgb(var(--text-muted))]">
                          Назначен: {formatDateTime(userCourse.created_at)}
                        </p>
                        {userCourse.started_at && (
                          <p className="text-sm text-[rgb(var(--text-muted))]">
                            Начат: {formatDateTime(userCourse.started_at)}
                          </p>
                        )}
                        {userCourse.completed_at && (
                          <p className="text-sm text-[rgb(var(--text-muted))]">
                            Завершен: {formatDateTime(userCourse.completed_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-sm font-medium text-[rgb(var(--text))]">
                          {userCourse.progress_percent}%
                        </div>
                        <div className="text-xs text-[rgb(var(--text-muted))]">прогресс</div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => unassignCourse(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {course.description && (
                  <CardContent>
                    <p className="text-sm text-[rgb(var(--text-muted))]">{course.description}</p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle>Назначить курс</CardTitle>
            </CardHeader>
            <CardContent>
              {getUnassignedCourses().length === 0 ? (
                <p className="text-center py-8 text-[rgb(var(--text-muted))]">
                  Все доступные курсы уже назначены
                </p>
              ) : (
                <div className="space-y-2">
                  {getUnassignedCourses().map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-3 border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--bg-surface))] transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {course.image_url && (
                          <img
                            src={course.image_url}
                            alt={course.title}
                            className="w-12 h-8 object-cover bg-[rgb(var(--bg-surface))] rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium text-[rgb(var(--text))]">
                            {course.title}
                          </div>
                          {course.description && (
                            <div className="text-sm text-[rgb(var(--text-muted))] line-clamp-1">
                              {course.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => assignCourse(course.id)}>
                        Назначить
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Закрыть
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
