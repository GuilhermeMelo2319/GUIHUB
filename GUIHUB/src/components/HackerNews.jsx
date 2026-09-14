import { useState, useEffect, useCallback, useRef } from 'react';
import Widget from './Widget';
import { HackerNewsIcon } from './Icons';

const API_BASE = 'https://hacker-news.firebaseio.com/v0';
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
const STORY_COUNT = 15;

function timeAgo(timestamp) {
  const now = Date.now();
  const diffMs = now - timestamp * 1000;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${diffDays}d atrás`;
}

export default function HackerNews() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/topstories.json`);
      if (!res.ok) throw new Error('Falha ao buscar stories');
      const ids = await res.json();
      const top = ids.slice(0, STORY_COUNT);

      const items = await Promise.all(
        top.map(async (id) => {
          const r = await fetch(`${API_BASE}/item/${id}.json`);
          if (!r.ok) return null;
          return r.json();
        })
      );

      setStories(items.filter(Boolean));
    } catch (e) {
      console.error('HN fetch error:', e);
      setError('Erro ao carregar Hacker News.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
    intervalRef.current = setInterval(fetchStories, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStories]);

  return (
    <Widget
      title="Hacker News"
      icon={<HackerNewsIcon />}
      actions={
        <button
          onClick={fetchStories}
          disabled={loading}
          className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors disabled:opacity-50"
          title="Atualizar"
        >
          {loading ? '⏳' : '🔄'}
        </button>
      }
    >
      <div className="flex-1 overflow-y-auto space-y-1">
        {error && (
          <p className="text-sm text-[var(--color-warning)] text-center py-2">{error}</p>
        )}

        {loading && stories.length === 0 && (
          <div className="space-y-2 py-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-1">
                <div className="h-3 bg-[var(--color-surface-lighter)] rounded w-full" />
                <div className="h-2 bg-[var(--color-surface-lighter)] rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && stories.length === 0 && !error && (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-4">Nenhuma story disponível.</p>
        )}

        {stories.map((story, i) => (
          <a
            key={story.id}
            href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--color-surface-lighter)] transition-colors group"
          >
            <span className="flex-shrink-0 min-w-[2.2rem] text-center px-1 py-0.5 rounded bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[10px] font-bold">
              {story.score}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs text-[var(--color-text)] group-hover:text-[var(--color-primary-light)] leading-snug line-clamp-2 transition-colors">
                {story.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                <span>{story.by}</span>
                <span>·</span>
                <span>{timeAgo(story.time)}</span>
                {story.descendants != null && (
                  <>
                    <span>·</span>
                    <span>{story.descendants} 💬</span>
                  </>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </Widget>
  );
}
