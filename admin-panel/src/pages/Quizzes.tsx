import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import type { Quiz, QuizQuestion, Course, CourseLesson } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionFormOption {
  option_text: string;
  is_correct: boolean;
}

interface QuestionFormData {
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false';
  explanation: string;
  points: number;
  options: QuestionFormOption[];
}

const emptyQuestion: QuestionFormData = {
  question_text: '',
  question_type: 'single_choice',
  explanation: '',
  points: 1,
  options: [
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ],
};

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);
  const [quizDetail, setQuizDetail] = useState<Quiz | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Quiz form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [timeLimit, setTimeLimit] = useState<number | ''>('');
  const [courseId, setCourseId] = useState<number | ''>('');
  const [lessonId, setLessonId] = useState<number | ''>('');

  // Question form state
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormData>({ ...emptyQuestion });

  useEffect(() => {
    loadQuizzes();
    loadCourses();
  }, []);

  useEffect(() => {
    if (courseId) {
      loadLessons(Number(courseId));
    } else {
      setLessons([]);
      setLessonId('');
    }
  }, [courseId]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quizzes');
      const data = response.data.quizzes || response.data.data || response.data;
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки квизов:', error);
      toast.error('Не удалось загрузить квизы');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await api.get('/admin/cabinet/courses');
      const data = response.data.courses || response.data.data || response.data;
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки курсов:', error);
    }
  };

  const loadLessons = async (cId: number) => {
    try {
      const response = await api.get(`/admin/cabinet/courses/${cId}/lessons`);
      const data = response.data.lessons || response.data.data || response.data;
      setLessons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error);
      setLessons([]);
    }
  };

  const loadQuizDetail = async (id: number) => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      const data = response.data.quiz || response.data;
      setQuizDetail(data);
    } catch (error) {
      console.error('Ошибка загрузки квиза:', error);
      toast.error('Не удалось загрузить детали квиза');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPassingScore(70);
    setMaxAttempts(3);
    setTimeLimit('');
    setCourseId('');
    setLessonId('');
    setEditing(null);
    setShowForm(false);
  };

  const resetQuestionForm = () => {
    setQuestionForm({ ...emptyQuestion, options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }] });
    setEditingQuestion(null);
    setShowQuestionForm(false);
  };

  const handleEdit = (quiz: Quiz) => {
    setEditing(quiz);
    setTitle(quiz.title);
    setDescription(quiz.description || '');
    setPassingScore(quiz.passing_score);
    setMaxAttempts(quiz.max_attempts);
    setTimeLimit(quiz.time_limit_minutes ?? '');
    setCourseId(quiz.course_id ?? '');
    setLessonId(quiz.lesson_id ?? '');
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      description: description || null,
      passing_score: passingScore,
      max_attempts: maxAttempts,
      time_limit_minutes: timeLimit === '' ? null : Number(timeLimit),
      course_id: courseId === '' ? null : Number(courseId),
      lesson_id: lessonId === '' ? null : Number(lessonId),
    };

    try {
      if (editing) {
        await api.put(`/quizzes/${editing.id}`, payload);
        toast.success('Квиз обновлен');
      } else {
        await api.post('/quizzes', payload);
        toast.success('Квиз создан');
      }
      resetForm();
      loadQuizzes();
    } catch (error) {
      console.error('Ошибка сохранения квиза:', error);
      toast.error('Не удалось сохранить квиз');
    }
  };

  const deleteQuiz = async (id: number) => {
    if (!confirm('Удалить этот квиз?')) return;

    try {
      await api.delete(`/quizzes/${id}`);
      toast.success('Квиз удален');
      if (expandedQuiz === id) {
        setExpandedQuiz(null);
        setQuizDetail(null);
      }
      loadQuizzes();
    } catch (error) {
      console.error('Ошибка удаления квиза:', error);
      toast.error('Не удалось удалить квиз');
    }
  };

  const toggleExpand = async (quizId: number) => {
    if (expandedQuiz === quizId) {
      setExpandedQuiz(null);
      setQuizDetail(null);
      resetQuestionForm();
    } else {
      setExpandedQuiz(quizId);
      await loadQuizDetail(quizId);
    }
  };

  // Question handlers
  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      question_text: question.question_text,
      question_type: question.question_type,
      explanation: question.explanation || '',
      points: question.points,
      options: question.options?.map((o) => ({ option_text: o.option_text, is_correct: o.is_correct })) || [],
    });
    setShowQuestionForm(true);
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expandedQuiz) return;

    const payload = {
      question_text: questionForm.question_text,
      question_type: questionForm.question_type,
      explanation: questionForm.explanation || null,
      points: questionForm.points,
      options: questionForm.options.filter((o) => o.option_text.trim()),
    };

    try {
      if (editingQuestion) {
        await api.put(`/quizzes/questions/${editingQuestion.id}`, payload);
        toast.success('Вопрос обновлен');
      } else {
        await api.post(`/quizzes/${expandedQuiz}/questions`, payload);
        toast.success('Вопрос добавлен');
      }
      resetQuestionForm();
      loadQuizDetail(expandedQuiz);
    } catch (error) {
      console.error('Ошибка сохранения вопроса:', error);
      toast.error('Не удалось сохранить вопрос');
    }
  };

  const deleteQuestion = async (questionId: number) => {
    if (!confirm('Удалить этот вопрос?')) return;
    if (!expandedQuiz) return;

    try {
      await api.delete(`/quizzes/questions/${questionId}`);
      toast.success('Вопрос удален');
      loadQuizDetail(expandedQuiz);
    } catch (error) {
      console.error('Ошибка удаления вопроса:', error);
      toast.error('Не удалось удалить вопрос');
    }
  };

  const addOption = () => {
    setQuestionForm((prev) => ({
      ...prev,
      options: [...prev.options, { option_text: '', is_correct: false }],
    }));
  };

  const removeOption = (index: number) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updateOption = (index: number, field: keyof QuestionFormOption, value: string | boolean) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? { ...o, [field]: value } : o)),
    }));
  };

  const questionTypeLabel = (type: string) => {
    switch (type) {
      case 'single_choice': return 'Один ответ';
      case 'multiple_choice': return 'Несколько ответов';
      case 'true_false': return 'Да/Нет';
      default: return type;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[rgb(var(--text))] uppercase tracking-tight mb-2">
            Квизы
          </h1>
          <p className="text-[rgb(var(--text-muted))]">Управление квизами и вопросами</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить квиз
        </Button>
      </div>

      {/* Quiz Form */}
      {showForm && (
        <Card ref={formRef} className="mb-6">
          <CardHeader>
            <CardTitle>{editing ? 'Редактировать квиз' : 'Новый квиз'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">Название</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div>
                <label className="text-sm font-medium text-[rgb(var(--text))]">Описание</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">Проходной балл (%)</label>
                  <Input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    min={0}
                    max={100}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">Макс. попыток</label>
                  <Input
                    type="number"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    min={1}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">Лимит времени (мин)</label>
                  <Input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value === '' ? '' : Number(e.target.value))}
                    min={1}
                    placeholder="Без ограничений"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">Курс</label>
                  <select
                    className="w-full h-10 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text))]"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <option value="">-- Не выбран --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[rgb(var(--text))]">Урок</label>
                  <select
                    className="w-full h-10 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text))]"
                    value={lessonId}
                    onChange={(e) => setLessonId(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={!courseId}
                  >
                    <option value="">-- Не выбран --</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                  {!courseId && (
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Сначала выберите курс</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editing ? 'Сохранить' : 'Создать'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Отмена</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Quizzes List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[rgb(var(--text-muted))]">Загрузка квизов...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[rgb(var(--text-muted))]">Квизов пока нет</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <Badge variant={quiz.is_active ? 'success' : 'default'}>
                        {quiz.is_active ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Проходной: {quiz.passing_score}% | Попыток: {quiz.max_attempts}
                      {quiz.time_limit_minutes && ` | Время: ${quiz.time_limit_minutes} мин`}
                      {' | '}{formatDateTime(quiz.created_at)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {quiz.description && (
                  <p className="text-sm text-[rgb(var(--text-muted))] mb-4">{quiz.description}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleExpand(quiz.id)}>
                    {expandedQuiz === quiz.id ? (
                      <><ChevronUp className="h-4 w-4 mr-2" />Скрыть вопросы</>
                    ) : (
                      <><ChevronDown className="h-4 w-4 mr-2" />Вопросы</>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(quiz)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteQuiz(quiz.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Expanded Questions */}
                {expandedQuiz === quiz.id && quizDetail && (
                  <div className="mt-6 border-t border-[rgb(var(--border))] pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-[rgb(var(--text))]">
                        Вопросы ({quizDetail.questions?.length || 0})
                      </h3>
                      <Button
                        size="sm"
                        onClick={() => {
                          resetQuestionForm();
                          setShowQuestionForm(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить вопрос
                      </Button>
                    </div>

                    {/* Question Form */}
                    {showQuestionForm && (
                      <Card className="mb-4 border-[rgb(var(--accent-soft))]">
                        <CardContent className="pt-6">
                          <form onSubmit={handleQuestionSubmit} className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-[rgb(var(--text))]">Текст вопроса</label>
                              <Textarea
                                value={questionForm.question_text}
                                onChange={(e) => setQuestionForm((prev) => ({ ...prev, question_text: e.target.value }))}
                                rows={2}
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="text-sm font-medium text-[rgb(var(--text))]">Тип вопроса</label>
                                <select
                                  className="w-full h-10 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text))]"
                                  value={questionForm.question_type}
                                  onChange={(e) =>
                                    setQuestionForm((prev) => ({
                                      ...prev,
                                      question_type: e.target.value as QuestionFormData['question_type'],
                                    }))
                                  }
                                >
                                  <option value="single_choice">Один ответ</option>
                                  <option value="multiple_choice">Несколько ответов</option>
                                  <option value="true_false">Да/Нет</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-[rgb(var(--text))]">Баллы</label>
                                <Input
                                  type="number"
                                  value={questionForm.points}
                                  onChange={(e) => setQuestionForm((prev) => ({ ...prev, points: Number(e.target.value) }))}
                                  min={1}
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-[rgb(var(--text))]">Пояснение</label>
                                <Input
                                  value={questionForm.explanation}
                                  onChange={(e) => setQuestionForm((prev) => ({ ...prev, explanation: e.target.value }))}
                                  placeholder="Необязательно"
                                />
                              </div>
                            </div>

                            {/* Options */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-[rgb(var(--text))]">Варианты ответов</label>
                                <Button type="button" size="sm" variant="outline" onClick={addOption}>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Добавить
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {questionForm.options.map((option, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={option.is_correct}
                                      onChange={(e) => updateOption(index, 'is_correct', e.target.checked)}
                                      className="h-4 w-4 rounded"
                                      title="Правильный ответ"
                                    />
                                    <Input
                                      value={option.option_text}
                                      onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                                      placeholder={`Вариант ${index + 1}`}
                                      className="flex-1"
                                    />
                                    {questionForm.options.length > 2 && (
                                      <Button type="button" size="sm" variant="destructive" onClick={() => removeOption(index)}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                                Отметьте галочкой правильные ответы
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button type="submit">{editingQuestion ? 'Сохранить' : 'Добавить'}</Button>
                              <Button type="button" variant="outline" onClick={resetQuestionForm}>Отмена</Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Questions List */}
                    {quizDetail.questions && quizDetail.questions.length > 0 ? (
                      <div className="space-y-3">
                        {quizDetail.questions.map((question, qIndex) => (
                          <div
                            key={question.id}
                            className="p-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-surface))]"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[rgb(var(--text))]">
                                  {qIndex + 1}. {question.question_text}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="info">{questionTypeLabel(question.question_type)}</Badge>
                                  <span className="text-xs text-[rgb(var(--text-muted))]">{question.points} б.</span>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => handleEditQuestion(question)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteQuestion(question.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {question.options && question.options.length > 0 && (
                              <div className="ml-4 mt-2 space-y-1">
                                {question.options.map((opt) => (
                                  <div key={opt.id} className="flex items-center gap-2 text-xs">
                                    <span className={opt.is_correct ? 'text-[rgb(var(--success))] font-medium' : 'text-[rgb(var(--text-muted))]'}>
                                      {opt.is_correct ? '✓' : '○'} {opt.option_text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {question.explanation && (
                              <p className="text-xs text-[rgb(var(--text-muted))] mt-2 italic">
                                Пояснение: {question.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[rgb(var(--text-muted))] text-center py-4">
                        Вопросов пока нет
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
