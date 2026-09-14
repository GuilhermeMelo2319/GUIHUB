import { useState, useEffect, useCallback } from 'react';
import Widget from './Widget';
import { PlusIcon } from './Icons';

const s = "w-4 h-4 stroke-current stroke-[1.5] fill-none text-[var(--color-primary-light)]";

function HabitsIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
  );
}

const STORAGE_KEY = 'guihub-habits';
const STORAGE_KEY_LOG = 'guihub-habits-log';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function Habits() {
  const [habits, setHabits] = useState(() => {
    try {
      const d = localStorage.getItem(STORAGE_KEY);
      return d ? JSON.parse(d) : [
        { id: 1, name: '💧 Beber 2L de água', icon: '💧' },
        { id: 2, name: '🏋️ Exercício físico', icon: '🏋️' },
        { id: 3, name: '📖 Leitura / Estudo', icon: '📖' },
        { id: 4, name: '💻 Código / Dev', icon: '💻' },
        { id: 5, name: '🧘 Alongamento', icon: '🧘' },
      ];
    } catch { return []; }
  });

  const [log, setLog] = useState(() => {
    try {
      const d = localStorage.getItem(STORAGE_KEY_LOG);
      return d ? JSON.parse(d) : {};
    } catch { return {}; }
  });

  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState('');

  const today = getToday();
  const todayLog = log[today] || [];
  const completed = habits.filter(h => todayLog.includes(h.id)).length;
  const total = habits.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(log));
  }, [log]);

  const toggleHabit = useCallback((id) => {
    setLog(prev => {
      const dayLog = prev[today] || [];
      const updated = dayLog.includes(id)
        ? dayLog.filter(x => x !== id)
        : [...dayLog, id];
      return { ...prev, [today]: updated };
    });
  }, [today]);

  const addHabit = useCallback(() => {
    const name = newHabit.trim();
    if (!name) return;
    setHabits(prev => [...prev, { id: Date.now(), name, icon: '✨' }]);
    setNewHabit('');
    setShowAdd(false);
  }, [newHabit]);

  const removeHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addHabit();
    if (e.key === 'Escape') setShowAdd(false);
  };

  // Streak calculation
  const getStreak = () => {
    let streak = 0;
    const d = new Date();
    // Start from yesterday if today isn't complete
    if (progress < 100) d.setDate(d.getDate() - 1);
    while (true) {
      const dateStr = d.toISOString().slice(0, 10);
      const dayLog = log[dateStr] || [];
      if (dayLog.length >= total && total > 0) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = getStreak();

  return (
    <Widget title="Hábitos" icon={<HabitsIcon />} actions={
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="p-1 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
        title={showAdd ? 'Fechar' : 'Adicionar hábito'}
      >
        {showAdd ? '✕' : <PlusIcon />}
      </button>
    }>
      <div className="flex flex-col gap-3">
        {/* Add input (inline) */}
        {showAdd && (
          <div className="flex gap-2">
            <input
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Novo hábito..."
              autoFocus
              className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
            <button
              onClick={addHabit}
              className="p-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-80 transition-all"
            >
              <PlusIcon />
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: progress === 100 ? 'var(--color-success)' : 'var(--color-primary)',
              }}
            />
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)] w-12 text-right">
            {completed}/{total}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-muted)]">
            {progress === 100 ? '🎉 Tudo completo!' : `${progress}% hoje`}
          </span>
          {streak > 0 && (
            <span className="text-xs text-[var(--color-warning)]">🔥 {streak} dias</span>
          )}
        </div>

        {/* Habits list */}
        <div className="flex flex-col gap-1.5">
          {habits.map((habit) => {
            const done = todayLog.includes(habit.id);
            return (
              <div
                key={habit.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  done
                    ? 'bg-[var(--color-success)]/10 border border-[var(--color-success)]/30'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-surface-lighter)]'
                }`}
                onClick={() => toggleHabit(habit.id)}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  done ? 'border-[var(--color-success)] bg-[var(--color-success)]' : 'border-[var(--color-surface-lighter)]'
                }`}>
                  {done && <span className="text-black text-xs font-bold">✓</span>}
                </div>
                <span className={`text-sm flex-1 ${done ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text)]'}`}>
                  {habit.name}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeHabit(habit.id); }}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-all opacity-50 hover:opacity-100"
                  title="Remover"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Widget>
  );
}
