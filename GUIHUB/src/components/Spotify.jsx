import { useState, useEffect, useCallback } from 'react';
import Widget from './Widget';

const STORAGE_KEY = 'guihub-spotify';

const SpotifyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 15c3-1 5-1 8 1" />
    <path d="M7 12c4-1.5 6.5-1.5 10 1" />
    <path d="M6 9c5-2 8.5-2 12 1" />
  </svg>
);

function parseSpotifyLink(url) {
  try {
    const parsed = new URL(url.trim());
    if (!parsed.hostname.includes('spotify.com')) return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const type = parts[parts.length - 2];
    const id = parts[parts.length - 1].split('?')[0];

    const validTypes = ['track', 'playlist', 'album', 'episode', 'show'];
    if (!validTypes.includes(type)) return null;

    return { type, id, originalUrl: url.trim() };
  } catch {
    return null;
  }
}

function getEmbedHeight(type) {
  return type === 'track' || type === 'episode' ? 152 : 352;
}

function Spotify() {
  const [embeds, setEmbeds] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setEmbeds(JSON.parse(saved));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(embeds));
  }, [embeds]);

  const handleAdd = useCallback(() => {
    setError('');
    const parsed = parseSpotifyLink(inputValue);
    if (!parsed) {
      setError('Link inválido. Cole um link do Spotify (track, playlist, album, podcast).');
      return;
    }

    setEmbeds((prev) => [...prev, { ...parsed, addedAt: Date.now() }]);
    setInputValue('');
    setShowInput(false);
  }, [inputValue]);

  const handleRemove = useCallback((index) => {
    setEmbeds((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  }, [handleAdd]);

  const actions = (
    <button
      onClick={() => setShowInput((prev) => !prev)}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--color-text-muted)',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '2px 6px',
        borderRadius: '4px',
        lineHeight: 1,
      }}
      title="Adicionar embed"
    >
      +
    </button>
  );

  return (
    <Widget title="Spotify" icon={<SpotifyIcon />} actions={actions}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {(showInput || embeds.length === 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="Cole um link do Spotify..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAdd}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Adicionar
              </button>
            </div>
            {error && (
              <span style={{ color: '#ef4444', fontSize: '12px' }}>{error}</span>
            )}
          </div>
        )}

        {embeds.map((embed, index) => (
          <div
            key={embed.addedAt}
            style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
            }}
          >
            <button
              onClick={() => handleRemove(index)}
              title="Remover embed"
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                zIndex: 10,
                background: 'rgba(0, 0, 0, 0.7)',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
            <iframe
              src={`https://open.spotify.com/embed/${embed.type}/${embed.id}?theme=0`}
              width="100%"
              height={getEmbedHeight(embed.type)}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ display: 'block', borderRadius: '8px' }}
              title={`Spotify ${embed.type}`}
            />
          </div>
        ))}

        {embeds.length === 0 && !showInput && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', margin: 0, textAlign: 'center' }}>
            Adicione um link do Spotify para começar.
          </p>
        )}
      </div>
    </Widget>
  );
}

export default Spotify;
