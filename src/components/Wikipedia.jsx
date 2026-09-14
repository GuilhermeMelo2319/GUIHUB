import { useState, useEffect, useCallback } from 'react';
import Widget from './Widget';

const s = "w-4 h-4 stroke-current stroke-[1.5] fill-none text-[var(--color-primary-light)]";

function WikiIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="12" y2="15" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-3.5 h-3.5 stroke-current stroke-[1.5] fill-none" viewBox="0 0 24 24">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

export default function Wikipedia() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async (force = false) => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const cacheKey = `guihub-wikipedia-${month}-${day}`;

    if (!force) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          setEvents(JSON.parse(cached));
          setLoading(false);
          return;
        } catch { /* ignore */ }
      }
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!res.ok) throw new Error('Falha ao buscar eventos');
      const data = await res.json();
      const allEvents = data.events || [];
      // Selecionar 5-8 eventos aleatórios
      const shuffled = allEvents.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(8, Math.max(5, shuffled.length)));
      // Ordenar por ano
      selected.sort((a, b) => a.year - b.year);
      setEvents(selected);
      sessionStorage.setItem(cacheKey, JSON.stringify(selected));
    } catch (err) {
      setError(err.message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const refresh = () => fetchEvents(true);

  const actions = (
    <button
      onClick={refresh}
      className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-lighter)] transition-all"
      title="Atualizar"
    >
      <RefreshIcon />
    </button>
  );

  return (
    <Widget title="Neste Dia" icon={<WikiIcon />} actions={actions}>
      <div className="flex flex-col gap-2">
        {loading && (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-xs text-[var(--color-text-muted)]">
            <p>{error}</p>
            <button
              onClick={refresh}
              className="mt-2 px-3 py-1 rounded-md bg-[var(--color-surface-lighter)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all text-xs"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && events.map((event, i) => {
          const link = event.pages?.[0]?.content_urls?.desktop?.page;
          return (
            <div
              key={i}
              className="flex gap-2.5 p-2 rounded-lg hover:bg-[var(--color-surface)] transition-all group"
            >
              <span className="text-sm font-bold text-[var(--color-primary)] shrink-0 w-12 text-right pt-0.5">
                {event.year}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--color-text)] leading-relaxed line-clamp-3">
                  {event.text}
                </p>
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 text-[10px] text-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Wikipedia →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Widget>
  );
}
