import { useState, useEffect, useRef, useCallback } from 'react';
import Widget from './Widget';
import { ClockIcon } from './Icons';

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Clock() {
  const [time, setTime] = useState(new Date());
  const [name, setName] = useState(() => localStorage.getItem('clock_user_name') || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleNameClick = useCallback(() => {
    setEditValue(name);
    setIsEditing(true);
  }, [name]);

  const handleNameSave = useCallback(() => {
    const trimmed = editValue.trim();
    setName(trimmed);
    localStorage.setItem('clock_user_name', trimmed);
    setIsEditing(false);
  }, [editValue]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') setIsEditing(false);
  }, [handleNameSave]);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const dateStr = time.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const greeting = getGreeting(time.getHours());

  return (
    <Widget title="Relógio" icon={<ClockIcon />} contentAlign="center">
      <div className="flex flex-col items-center gap-2 py-2">
        <div className="font-mono text-4xl font-bold text-[var(--color-text)] tracking-wider">
          {hours}:{minutes}:{seconds}
        </div>
        <div className="text-sm text-[var(--color-text-muted)] capitalize">
          {dateStr}
        </div>
        <div className="mt-2 text-lg text-[var(--color-primary-light)]">
          {greeting}
          {!isEditing ? (
            <span
              onClick={handleNameClick}
              className="ml-1 cursor-pointer hover:text-[var(--color-primary)] transition-colors"
              title="Clique para editar seu nome"
            >
              {name ? `, ${name}` : ' — clique para adicionar seu nome'}
            </span>
          ) : (
            <span className="ml-1 inline-flex items-center gap-1">
              ,{' '}
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleNameSave}
                className="bg-[var(--color-surface)] border border-[var(--color-surface-lighter)] rounded px-2 py-0.5 text-[var(--color-text)] text-lg w-32 outline-none focus:border-[var(--color-primary)]"
                placeholder="Seu nome"
                maxLength={30}
              />
            </span>
          )}
        </div>
      </div>
    </Widget>
  );
}
