import { useState, useEffect, useCallback, useRef } from 'react';
import Widget from './Widget';
import { TodoIcon } from './Icons';

const STORAGE_KEY = 'todolist_tasks';

const PRIORITY_COLORS = {
  alta: 'var(--color-accent)',
  média: 'var(--color-warning)',
  baixa: 'var(--color-success)',
};

export default function TodoList() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('média');
  const [filter, setFilter] = useState('todas');
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const newTask = {
      id: Date.now().toString(),
      text,
      priority,
      done: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setInput('');
    if (inputRef.current) inputRef.current.focus();
  }, [input, priority]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') addTask();
  }, [addTask]);

  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const moveTask = useCallback((index, direction) => {
    setTasks((prev) => {
      const newTasks = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newTasks.length) return prev;
      [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
      return newTasks;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.done));
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pendentes') return !t.done;
    if (filter === 'concluídas') return t.done;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.done).length;

  return (
    <Widget title="Tarefas" icon={<TodoIcon />}>
      <div className="flex flex-col gap-3">
        {/* Input area */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nova tarefa..."
            className="flex-1 bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded-lg px-2 py-2 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          >
            <option value="alta">Alta</option>
            <option value="média">Média</option>
            <option value="baixa">Baixa</option>
          </select>
          <button
            onClick={addTask}
            className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] transition-colors"
          >
            +
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-[var(--color-surface)] rounded-lg p-1">
            {['todas', 'pendentes', 'concluídas'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 text-xs rounded-md transition-colors capitalize ${
                  filter === f
                    ? 'bg-[var(--color-surface-lighter)] text-[var(--color-text)] font-medium'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Task list */}
        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
          {filteredTasks.length === 0 && (
            <p className="text-center text-sm text-[var(--color-text-muted)] py-4">
              {filter === 'todas' ? 'Nenhuma tarefa ainda' : `Nenhuma tarefa ${filter}`}
            </p>
          )}
          {filteredTasks.map((task, index) => {
            const globalIndex = tasks.findIndex((t) => t.id === task.id);
            return (
              <div
                key={task.id}
                className={`flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface)] group transition-opacity ${
                  task.done ? 'opacity-60' : ''
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    task.done
                      ? 'bg-[var(--color-success)] border-[var(--color-success)]'
                      : 'border-[var(--color-surface-lighter)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {task.done && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </button>

                {/* Priority dot */}
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                  title={`Prioridade: ${task.priority}`}
                />

                {/* Text */}
                <span
                  className={`flex-1 text-sm text-[var(--color-text)] ${
                    task.done ? 'line-through' : ''
                  }`}
                >
                  {task.text}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveTask(globalIndex, -1)}
                    disabled={globalIndex === 0}
                    className="w-5 h-5 flex items-center justify-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para cima"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveTask(globalIndex, 1)}
                    disabled={globalIndex === tasks.length - 1}
                    className="w-5 h-5 flex items-center justify-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para baixo"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="w-5 h-5 flex items-center justify-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                    title="Excluir"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clear completed */}
        {tasks.some((t) => t.done) && (
          <button
            onClick={clearCompleted}
            className="self-end text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors underline"
          >
            🗑️ Limpar concluídas
          </button>
        )}
      </div>
    </Widget>
  );
}
