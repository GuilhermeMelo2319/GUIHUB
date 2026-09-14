import { useState, useEffect, useCallback, useRef } from 'react';
import Widget from './Widget';
import { NewsIcon } from './Icons';

const DEFAULT_FEEDS = [
  { name: 'Google News BR', url: 'https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'Dev.to', url: 'https://dev.to/feed' },
];

const STORAGE_KEY = 'guihub-news-feeds';
const PROXY_URL = 'https://api.rss2json.com/v1/api.json?rss_url=';
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

function loadFeeds() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) { /* ignore */ }
  return DEFAULT_FEEDS;
}

function saveFeeds(feeds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feeds));
}

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${diffDays}d atrás`;
}

export default function News() {
  const [feeds, setFeeds] = useState(loadFeeds);
  const [activeTab, setActiveTab] = useState(0);
  const [articles, setArticles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const intervalRef = useRef(null);

  const fetchFeed = useCallback(async (feedUrl, index) => {
    try {
      const response = await fetch(`${PROXY_URL}${encodeURIComponent(feedUrl)}`);
      if (!response.ok) throw new Error('Fetch failed');
      const data = await response.json();
      if (data.status === 'ok' && data.items) {
        setArticles((prev) => ({ ...prev, [index]: data.items.slice(0, 15) }));
        setError('');
      } else {
        throw new Error(data.message || 'Invalid response');
      }
    } catch (e) {
      console.error('Feed fetch error:', e);
      setError('Erro ao carregar feed.');
    }
  }, []);

  const fetchAllFeeds = useCallback(async () => {
    setLoading(true);
    await Promise.all(feeds.map((feed, i) => fetchFeed(feed.url, i)));
    setLoading(false);
  }, [feeds, fetchFeed]);

  useEffect(() => {
    fetchAllFeeds();
    intervalRef.current = setInterval(fetchAllFeeds, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAllFeeds]);

  const handleRemoveFeed = (index) => {
    const updated = feeds.filter((_, i) => i !== index);
    const result = updated.length > 0 ? updated : DEFAULT_FEEDS;
    setFeeds(result);
    saveFeeds(result);
    if (activeTab >= result.length) setActiveTab(0);
  };

  const handleAddFeed = () => {
    if (!newFeedName.trim() || !newFeedUrl.trim()) return;
    const updated = [...feeds, { name: newFeedName.trim(), url: newFeedUrl.trim() }];
    setFeeds(updated);
    saveFeeds(updated);
    setNewFeedName('');
    setNewFeedUrl('');
  };

  const handleResetDefaults = () => {
    setFeeds(DEFAULT_FEEDS);
    saveFeeds(DEFAULT_FEEDS);
    setActiveTab(0);
  };

  const currentArticles = articles[activeTab] || [];

  return (
    <Widget title="Notícias" icon={<NewsIcon />} actions={
      <>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          title="Configurar feeds"
        >
          ⚙️
        </button>
        <button
          onClick={fetchAllFeeds}
          disabled={loading}
          className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors disabled:opacity-50"
          title="Atualizar feeds"
        >
          {loading ? '⏳' : '🔄'}
        </button>
      </>
    }>

      {/* Config Panel */}
      {showConfig && (
        <div className="mb-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
            Feeds Configurados
          </h3>

          {/* Current feeds list */}
          <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
            {feeds.map((feed, i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-1.5 rounded bg-[var(--color-surface-lighter)]">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-[var(--color-text)] block truncate">{feed.name}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] block truncate">{feed.url}</span>
                </div>
                <button
                  onClick={() => handleRemoveFeed(i)}
                  className="flex-shrink-0 p-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                  title="Remover feed"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add new feed */}
          <div className="space-y-1.5">
            <input
              type="text"
              placeholder="Nome do feed"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] outline-none focus:border-[var(--color-primary)]"
            />
            <input
              type="url"
              placeholder="URL do RSS"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFeed()}
              className="w-full px-2 py-1 text-xs rounded bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] outline-none focus:border-[var(--color-primary)]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddFeed}
                className="flex-1 px-2 py-1 text-xs rounded bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-80 transition-opacity"
              >
                Adicionar
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-2 py-1 text-xs rounded bg-[var(--color-surface-lighter)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                Resetar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed Tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {feeds.map((feed, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
              activeTab === i
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-lighter)]'
            }`}
          >
            {feed.name}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {error && (
          <p className="text-sm text-[var(--color-warning)] text-center py-2">{error}</p>
        )}
        {loading && currentArticles.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-4">Carregando...</p>
        )}
        {!loading && currentArticles.length === 0 && !error && (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-4">Nenhum artigo disponível.</p>
        )}
        {currentArticles.map((article, i) => (
          <a
            key={i}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-lighter)] transition-colors"
          >
            <h3 className="text-sm text-[var(--color-text)] font-medium line-clamp-2 mb-1">
              {article.title}
            </h3>
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span className="truncate mr-2">{article.author || feeds[activeTab]?.name}</span>
              <span className="whitespace-nowrap">{timeAgo(article.pubDate)}</span>
            </div>
          </a>
        ))}
      </div>
    </Widget>
  );
}
