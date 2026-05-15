import { useEffect, useState, useCallback } from 'react';
import { format, startOfDay, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Check,
  Circle,
  Plus,
  Zap,
  Calendar,
  Target,
  ArrowRight,
  Sunrise,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface Todo {
  id: string;
  title: string;
  status: 'inbox' | 'todo' | 'doing' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate?: string;
  goalId?: string;
}

interface HabitLog { id: string; date: string; }

interface Habit {
  id: string;
  title: string;
  color: string;
  frequency: 'daily' | 'weekly';
  logs: HabitLog[];
}

interface Goal { id: string; title: string; status: string; }

const PRIORITY_DOT: Record<string, string> = {
  urgent: '#DC2626',
  high: '#EA580C',
  medium: '#64748B',
  low: '#9CA3AF',
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return { text: '夜深了', icon: Moon, sub: '注意休息' };
  if (hour < 9) return { text: '早上好', icon: Sunrise, sub: '新的一天，从最重要的事开始' };
  if (hour < 12) return { text: '上午好', icon: Sun, sub: '保持专注，高效产出' };
  if (hour < 14) return { text: '中午好', icon: Sun, sub: '适当休息，补充能量' };
  if (hour < 18) return { text: '下午好', icon: Sun, sub: '收尾今日，规划明日' };
  return { text: '晚上好', icon: Sunset, sub: '回顾今天，放松身心' };
}

export default function Today() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [topics, setTopics] = useState<{ id: string; status: string }[]>([]);
  const [reflections, setReflections] = useState<{ id: string; date?: string }[]>([]);
  const [vision, setVision] = useState<{ content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [addingTodo, setAddingTodo] = useState(false);
  const [togglingHabit, setTogglingHabit] = useState<string | null>(null);
  const [togglingTodo, setTogglingTodo] = useState<string | null>(null);

  const today = startOfDay(new Date());
  const todayStr = format(today, 'yyyy-MM-dd');
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const loadData = useCallback(async () => {
    try {
      const [todosRes, habitsRes, goalsRes, topicsRes, reflectionsRes, visionRes] = await Promise.allSettled([
        api.get('/todos'),
        api.get('/habits'),
        api.get('/goals'),
        api.get('/topics'),
        api.get('/reflections'),
        api.get('/visions'),
      ]);
      setTodos(todosRes.status === 'fulfilled' ? todosRes.value.data?.todos ?? [] : []);
      setHabits(habitsRes.status === 'fulfilled' ? habitsRes.value.data?.habits ?? [] : []);
      setGoals(goalsRes.status === 'fulfilled' ? goalsRes.value.data?.goals ?? [] : []);
      setTopics(topicsRes.status === 'fulfilled' ? topicsRes.value.data?.topics ?? [] : []);
      setReflections(reflectionsRes.status === 'fulfilled' ? reflectionsRes.value.data?.reflections ?? [] : []);
      setVision(visionRes.status === 'fulfilled' ? visionRes.value.data?.vision || null : null);
    } catch (err) {
      console.error(err);
      setTodos([]);
      setHabits([]);
      setGoals([]);
      setTopics([]);
      setReflections([]);
      setVision(null);
    }

    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const pendingTodos = todos
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      const pOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return pOrder[a.priority] - pOrder[b.priority];
    });

  const doneTodayCount = todos.filter((t) => t.status === 'done').length;
  const activeGoals = goals.filter((g) => g.status === 'active');
  const activeTopics = topics.filter((t) => t.status !== 'archived');
  const todayReflection = reflections.find((r) =>
    r.date && r.date.startsWith(todayStr)
  );

  const handleAddTodo = async () => {
    const title = newTodo.trim();
    if (!title) return;
    setAddingTodo(true);
    try {
      await api.post('/todos', { title, status: 'todo', priority: 'medium' });
      setNewTodo('');
      await loadData();
    } finally {
      setAddingTodo(false);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    setTogglingTodo(todo.id);
    try {
      const isDone = todo.status === 'done';
      const payload = isDone
        ? { status: 'todo' }
        : { status: 'done', completedAt: new Date().toISOString() };
      await api.patch(`/todos/${todo.id}`, payload);
      await loadData();
    } finally {
      setTogglingTodo(null);
    }
  };

  const toggleHabit = async (habit: Habit) => {
    setTogglingHabit(habit.id);
    try {
      await api.post(`/habits/${habit.id}/log`, { date: todayStr });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingHabit(null);
    }
  };

  const goalName = (goalId?: string) => {
    if (!goalId) return null;
    return goals.find((g) => g.id === goalId)?.title;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="page-enter max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GreetingIcon size={24} style={{ color: 'var(--color-text-tertiary)' }} />
          <h1
            className="text-3xl"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
            }}
          >
            {greeting.text}
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          {greeting.sub} · {format(new Date(), 'yyyy年M月d日 EEEE', { locale: zhCN })}
        </p>
      </div>

      {/* Vision Banner */}
      {vision && (
        <div
          className="rounded-xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--color-text-primary) 0%, #3D3C38 100%)',
            color: 'var(--color-text-inverse)',
          }}
        >
          <div
            className="absolute top-0 right-0 w-24 h-24 opacity-10"
            style={{ background: 'radial-gradient(circle, currentColor 0%, transparent 70%)' }}
          />
          <p className="text-[10px] font-medium uppercase tracking-widest mb-2 opacity-60" style={{ fontFamily: 'var(--font-mono)' }}>
            我的愿景
          </p>
          <p className="text-sm leading-relaxed max-w-2xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>
            {vision.content}
          </p>
        </div>
      )}

      {/* Dashboard Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Link to="/direction?tab=goals" className="card p-4 hover:shadow-sm transition-all">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-tertiary)' }}>活跃目标</p>
          <p className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
            {activeGoals.length}
          </p>
        </Link>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-tertiary)' }}>待办</p>
          <p className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
            {pendingTodos.length}
          </p>
        </div>
        <Link to="/cognition?tab=topics" className="card p-4 hover:shadow-sm transition-all">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-tertiary)' }}>活跃课题</p>
          <p className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
            {activeTopics.length}
          </p>
        </Link>
        <Link to="/reflection?tab=daily" className="card p-4 hover:shadow-sm transition-all">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-tertiary)' }}>反思</p>
          <p className="text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
            {todayReflection ? '✓ 已写' : '—'}
          </p>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Circle size={14} style={{ color: 'var(--color-text-tertiary)' }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>
              待办
            </span>
          </div>
          <p className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
            {pendingTodos.length}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            {doneTodayCount} 项已完成
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} style={{ color: 'var(--color-text-tertiary)' }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>
              习惯
            </span>
          </div>
          <p className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
            {habits.filter((h) => h.logs?.some((l) => isSameDay(startOfDay(new Date(l.date)), today))).length}
            <span className="text-base" style={{ color: 'var(--color-text-tertiary)' }}> / {habits.length}</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            今日已打卡
          </p>
        </div>
        <Link to="/reflection?tab=daily" className="card p-4 hover:border-slate-200 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} style={{ color: 'var(--color-text-tertiary)' }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>
              反思
            </span>
          </div>
          <p className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
            写今日复盘
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            记录收获与明日计划
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Todos Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              今日待办
            </h2>
            <Link
              to="/action/todos"
              className="text-xs flex items-center gap-1"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              全部待办 <ArrowRight size={12} />
            </Link>
          </div>

          {/* Quick Add */}
          <div className="card p-3 mb-3 flex items-center gap-2">
            <Plus size={16} style={{ color: 'var(--color-text-tertiary)' }} />
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddTodo(); }}
              placeholder="快速添加待办..."
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: 'var(--color-text-primary)' }}
            />
            {newTodo.trim() && (
              <button
                onClick={handleAddTodo}
                disabled={addingTodo}
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ backgroundColor: 'var(--color-text-primary)', color: 'var(--color-text-inverse)' }}
              >
                {addingTodo ? '...' : '添加'}
              </button>
            )}
          </div>

          {/* Todo List */}
          <div className="space-y-2">
            {pendingTodos.length === 0 ? (
              <div className="card p-6 text-center">
                <Target size={24} className="mx-auto mb-2" style={{ color: 'var(--color-text-tertiary)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  暂无待办事项，享受当下吧
                </p>
              </div>
            ) : (
              pendingTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="card p-3 flex items-center gap-3 group"
                >
                  <button
                    onClick={() => toggleTodo(todo)}
                    disabled={togglingTodo === todo.id}
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                    style={{
                      border: '1.5px solid var(--color-border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }}
                  >
                    {togglingTodo === todo.id ? (
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-text-tertiary)' }} />
                    ) : (
                      <Check size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-primary)' }} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {todo.title}
                    </p>
                    {goalName(todo.goalId) && (
                      <p className="text-[11px] truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                        {goalName(todo.goalId)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PRIORITY_DOT[todo.priority] || '#9CA3AF' }}
                    />
                    {todo.dueDate && (
                      <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
                        {new Date(todo.dueDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Habits Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              习惯打卡
            </h2>
            <Link
              to="/action/habits"
              className="text-xs flex items-center gap-1"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              全部习惯 <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-2">
            {habits.length === 0 ? (
              <div className="card p-6 text-center">
                <Zap size={24} className="mx-auto mb-2" style={{ color: 'var(--color-text-tertiary)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  暂无习惯，去创建第一个吧
                </p>
              </div>
            ) : (
              habits.map((habit) => {
                const isTodayLogged = habit.logs?.some((l) =>
                  isSameDay(startOfDay(new Date(l.date)), today)
                );
                return (
                  <div
                    key={habit.id}
                    className="card p-3 flex items-center gap-3"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color || 'var(--color-text-tertiary)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {habit.title}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
                        {habit.frequency === 'daily' ? '每日' : '每周'}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleHabit(habit)}
                      disabled={togglingHabit === habit.id}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                      style={
                        isTodayLogged
                          ? { backgroundColor: '#DCFCE7', color: '#16A34A' }
                          : { backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }
                      }
                    >
                      {togglingHabit === habit.id ? (
                        <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'currentColor' }} />
                      ) : (
                        <Check size={14} />
                      )}
                      {isTodayLogged ? '已完成' : '打卡'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
