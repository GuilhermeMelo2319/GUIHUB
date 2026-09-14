import { useState, useEffect } from 'react';
import Widget from './Widget';

const STORAGE_KEY = 'guihub-agenda-id';

function loadCalendarId() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch (e) { return ''; }
}

function saveCalendarId(id) {
  localStorage.setItem(STORAGE_KEY, id);
}

function AgendaIcon() {
  return (
    <svg className="w-4 h-4 stroke-current stroke-[1.5] fill-none text-[var(--color-primary-light)]" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <rect x="7" y="13" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Agenda() {
  const [calendarId, setCalendarId] = useState(loadCalendarId);
  const [showConfig, setShowConfig] = useState(false);
  const [inputId, setInputId] = useState(calendarId);
  const [mode, setMode] = useState('AGENDA'); // AGENDA or WEEK

  useEffect(() => {
    setInputId(calendarId);
  }, [calendarId]);

  const handleSave = () => {
    const trimmed = inputId.trim();
    setCalendarId(trimmed);
    saveCalendarId(trimmed);
    setShowConfig(false);
  };

  const calendarUrl = calendarId
    ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=America/Sao_Paulo&mode=${mode}&showTitle=0&showNav=1&showPrint=0&showTabs=0&showCalendars=0&bgcolor=%23000000&color=%237c3aed`
    : '';

  return (
    <Widget title="Agenda" icon={<AgendaIcon />} actions={
      <button
        onClick={() => setShowConfig(!showConfig)}
        className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        title="Configurar Calendar ID"
      >
        ⚙️
      </button>
    }>

      {/* Config panel */}
      {showConfig && (
        <div className="mb-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
            Google Calendar ID
          </h3>
          <input
            type="text"
            placeholder="email@gmail.com ou ID público"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full px-2 py-1 text-xs rounded bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] outline-none focus:border-[var(--color-primary)] mb-2"
          />
          <button
            onClick={handleSave}
            className="w-full px-2 py-1 text-xs rounded bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-80 transition-opacity"
          >
            Salvar
          </button>
        </div>
      )}

      {/* Mode toggle */}
      {calendarId && (
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => setMode('AGENDA')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              mode === 'AGENDA'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-lighter)]'
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setMode('WEEK')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              mode === 'WEEK'
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-lighter)]'
            }`}
          >
            Semana
          </button>
        </div>
      )}

      {/* Calendar embed or instructions */}
      {calendarId ? (
        <div className="flex-1 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
          <iframe
            src={calendarUrl}
            title="Google Calendar"
            width="100%"
            height="100%"
            style={{ border: 'none', minHeight: '300px' }}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="text-3xl mb-3">📅</div>
          <h3 className="text-sm font-medium text-[var(--color-text)] mb-2">
            Configure seu Google Calendar
          </h3>
          <div className="text-xs text-[var(--color-text-muted)] space-y-1.5 max-w-xs">
            <p>Para obter seu Calendar ID:</p>
            <ol className="text-left list-decimal list-inside space-y-1">
              <li>Abra o Google Calendar</li>
              <li>Clique em ⚙️ → Configurações</li>
              <li>Selecione seu calendário na lista</li>
              <li>Role até "Integrar calendário"</li>
              <li>Copie o "ID da agenda"</li>
            </ol>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Para calendários pessoais, o ID geralmente é seu email.
            </p>
          </div>
          <button
            onClick={() => setShowConfig(true)}
            className="mt-4 px-4 py-1.5 text-xs rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-80 transition-opacity"
          >
            Configurar
          </button>
        </div>
      )}
    </Widget>
  );
}
