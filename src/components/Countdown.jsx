import { useState, useEffect, useCallback, useRef } from 'react';
import Widget from './Widget';
import { CountdownIcon, PlusIcon } from './Icons';

const STORAGE_KEY = 'guihub-countdowns';

function formatTimeLeft(targetDate) {
  const now = Date.now();
  const diff = new Date(targetDate).getTime() - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function TimeDisplay({ target }) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(target));
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(formatTimeLeft(target));
    intervalRef.current = setInterval(() => {
      setTimeLeft(formatTimeLeft(target));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [target]);

  if (!timeLeft) {
    return (
      <span className="text-lg font-bold text-[var(--color-success)]">
        Concluído! 🎉
      </span>
    );
  }

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <span className="text-xl font-mono font-bold text-[var(--color-text)]">
      {timeLeft.days > 0 && (
        <>{timeLeft.days}<span className="text-sm text-[var(--color-text-muted)] font-normal">d </span></>
      )}
      {pad(timeLeft.hours)}
      <span className="text-[var(--color-primary-light)]">:</span>
      {pad(timeLeft.minutes)}
      <span className="text-[var(--color-primary-light)]">:</span>
      {pad(timeLeft.seconds)}
    </span>
  );
}

export default function Countdown() {
  const [countdowns, setCountdowns] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [dateInput, setDateInput] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeInput, setTimeInput] = useState('00:00');

  // Persistir
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(countdowns));
  }, [countdowns]);

  // Adicionar countdown
  const handleAdd = useCallback(() => {
    const title = titleInput.trim();
    const date = dateInput.trim();
    const time = timeInput.trim() || '00:00';

    if (!title || !date) return;

    const targetDate = `${date}T${time}:00`;

    const newItem = {
      id: Date.now().toString(),
      title,
      target: targetDate,
      createdAt: Date.now(),
    };

    setCountdowns((prev) => [newItem, ...prev]);
    setTitleInput('');
    setDateInput('');
    setTimeInput('00:00');
    setShowForm(false);
  }, [titleInput, dateInput, timeInput]);

  // Remover countdown
  const handleRemove = useCallback((id) => {
    setCountdowns((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') setShowForm(false);
  }, [handleAdd]);

  const headerActions = (
    <button
      onClick={() => setShowForm((v) => !v)}
      className="p-1 rounded hover:bg-[var(--color-surface-lighter)] text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition-colors"
      title="Novo countdown"
    >
      <PlusIcon />
    </button>
  );

  return (
    <Widget title="Countdown" icon={<CountdownIcon />} actions={headerActions}>
      <div className="flex flex-col gap-3">
        {/* Formulário */}
        {showForm && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Título (ex: Aniversário)"
              className="bg-[var(--color-bg)] border border-[var(--color-surface-lighter)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              autoFocus
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] text-[var(--color-text)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <input
                type="time"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] text-[var(--color-text)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 bg-[var(--color-primary)] text-[var(--color-on-primary)] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] transition-colors"
              >
                Criar
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-lighter)] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de countdowns */}
        {countdowns.length === 0 && !showForm && (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
            Nenhum countdown ativo. Clique em + para criar.
          </p>
        )}

        {countdowns.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-1 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {item.title}
              </span>
              <button
                onClick={() => handleRemove(item.id)}
                className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-lighter)] transition-colors"
                title="Remover"
              >
                <svg className="w-3.5 h-3.5 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <TimeDisplay target={item.target} />
            <span className="text-xs text-[var(--color-text-muted)]">
              {new Date(item.target).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
      </div>
    </Widget>
  );
}
