import { useState, useEffect, useCallback, useRef } from 'react';
import Widget from './Widget';
import { UptimeIcon, PlusIcon } from './Icons';

const STORAGE_KEY = 'guihub-uptime';
const CHECK_INTERVAL = 60 * 1000; // 60 segundos

export default function Uptime() {
  const [urls, setUrls] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const intervalRef = useRef(null);

  // Persistir
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  }, [urls]);

  // Verificar uma URL
  const checkUrl = useCallback(async (url) => {
    const start = Date.now();
    try {
      await fetch(url, { mode: 'no-cors', cache: 'no-store' });
      const latency = Date.now() - start;
      return { status: 'online', latency, lastCheck: new Date().toLocaleTimeString('pt-BR') };
    } catch {
      return { status: 'offline', latency: null, lastCheck: new Date().toLocaleTimeString('pt-BR') };
    }
  }, []);

  // Verificar todas as URLs
  const checkAll = useCallback(async () => {
    const currentUrls = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (currentUrls.length === 0) return;

    // Marcar como checking
    setUrls((prev) => prev.map((item) => ({ ...item, status: 'checking' })));

    // Verificar cada URL
    const results = await Promise.all(
      currentUrls.map(async (item) => {
        const result = await checkUrl(item.url);
        return { ...item, ...result };
      })
    );
    setUrls(results);
  }, [checkUrl]);

  // Auto-refresh
  useEffect(() => {
    if (urls.length > 0) {
      checkAll();
    }
    intervalRef.current = setInterval(() => {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (saved.length > 0) checkAll();
    }, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Adicionar URL
  const handleAdd = useCallback(() => {
    const name = nameInput.trim();
    let url = urlInput.trim();
    if (!name || !url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const newItem = {
      id: Date.now().toString(),
      name,
      url,
      status: 'checking',
      latency: null,
      lastCheck: null,
    };

    setUrls((prev) => [...prev, newItem]);
    setNameInput('');
    setUrlInput('');
    setShowForm(false);

    // Verificar imediatamente
    (async () => {
      const result = await checkUrl(url);
      setUrls((prev) =>
        prev.map((item) => (item.id === newItem.id ? { ...item, ...result } : item))
      );
    })();
  }, [nameInput, urlInput, checkUrl]);

  // Remover URL
  const handleRemove = useCallback((id) => {
    setUrls((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') setShowForm(false);
  }, [handleAdd]);

  const statusDot = (status) => {
    const colors = {
      online: 'bg-green-500',
      offline: 'bg-red-500',
      checking: 'bg-yellow-500 animate-pulse',
    };
    return (
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || 'bg-gray-500'}`}
      />
    );
  };

  const headerActions = (
    <button
      onClick={() => setShowForm((v) => !v)}
      className="p-1 rounded hover:bg-[var(--color-surface-lighter)] text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition-colors"
      title="Adicionar URL"
    >
      <PlusIcon />
    </button>
  );

  return (
    <Widget title="Uptime" icon={<UptimeIcon />} actions={headerActions}>
      <div className="flex flex-col gap-3">
        {/* Formulário */}
        {showForm && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nome (ex: Google)"
              className="bg-[var(--color-bg)] border border-[var(--color-surface-lighter)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              autoFocus
            />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="URL (ex: https://google.com)"
              className="bg-[var(--color-bg)] border border-[var(--color-surface-lighter)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 bg-[var(--color-primary)] text-[var(--color-on-primary)] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] transition-colors"
              >
                Adicionar
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

        {/* Lista de URLs */}
        {urls.length === 0 && !showForm && (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
            Nenhuma URL monitorada. Clique em + para adicionar.
          </p>
        )}

        {urls.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-lighter)]"
          >
            {statusDot(item.status)}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--color-text)] truncate">
                {item.name}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] truncate">
                {item.url}
              </div>
              <div className="flex gap-3 mt-0.5 text-xs text-[var(--color-text-muted)]">
                {item.latency !== null && (
                  <span>{item.latency}ms</span>
                )}
                {item.lastCheck && (
                  <span>Último: {item.lastCheck}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleRemove(item.id)}
              className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-lighter)] transition-colors flex-shrink-0"
              title="Remover"
            >
              <svg className="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}

        {/* Botão refresh manual */}
        {urls.length > 0 && (
          <button
            onClick={checkAll}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition-colors self-center mt-1"
          >
            ↻ Verificar agora
          </button>
        )}
      </div>
    </Widget>
  );
}
