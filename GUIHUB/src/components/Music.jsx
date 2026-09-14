import { useState, useEffect, useCallback } from 'react';
import Widget from './Widget';

const s = "w-4 h-4 stroke-current stroke-[1.5] fill-none text-[var(--color-primary-light)]";

function MusicIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

const STORAGE_KEY = 'guihub-music-key';

const TAGS = [
  { id: 'classic rock', label: 'Classic Rock' },
  { id: '80s', label: '80s' },
  { id: '90s', label: '90s' },
  { id: 'hard rock', label: 'Hard Rock' },
  { id: 'grunge', label: 'Grunge' },
  { id: 'new wave', label: 'New Wave' },
  { id: 'pop rock', label: 'Pop Rock' },
  { id: 'progressive rock', label: 'Prog Rock' },
  { id: 'punk', label: 'Punk' },
  { id: 'metal', label: 'Metal' },
  { id: 'blues', label: 'Blues' },
  { id: 'jazz', label: 'Jazz' },
];

export default function Music() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [keyInput, setKeyInput] = useState('');
  const [tag, setTag] = useState('classic rock');
  const [tracks, setTracks] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracks = useCallback(async (selectedTag) => {
    if (!apiKey) return;
    setLoading(true);
    setError('');
    try {
      const url = `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${encodeURIComponent(selectedTag)}&api_key=${apiKey}&format=json&limit=50`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro na API');
      const data = await res.json();
      if (data.error) throw new Error(data.message || 'API key inválida');
      const list = data.tracks?.track || [];
      setTracks(list);
      if (list.length > 0) {
        setCurrent(list[Math.floor(Math.random() * list.length)]);
      }
    } catch (e) {
      setError(e.message || 'Erro ao buscar músicas');
      setTracks([]);
      setCurrent(null);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey) fetchTracks(tag);
  }, [apiKey, tag, fetchTracks]);

  const discover = () => {
    if (tracks.length > 0) {
      setCurrent(tracks[Math.floor(Math.random() * tracks.length)]);
    }
  };

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setApiKey(trimmed);
      setKeyInput('');
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setTracks([]);
    setCurrent(null);
  };

  const getImageUrl = (track) => {
    if (track.image && track.image.length > 0) {
      const img = track.image.find(i => i.size === 'large') || track.image[track.image.length - 1];
      if (img && img['#text']) return img['#text'];
    }
    return null;
  };

  const getSearchUrl = (track) => {
    const q = encodeURIComponent(`${track.artist.name} ${track.name}`);
    return `https://open.spotify.com/search/${q}`;
  };

  const getYoutubeUrl = (track) => {
    const q = encodeURIComponent(`${track.artist.name} ${track.name}`);
    return `https://www.youtube.com/results?search_query=${q}`;
  };

  // Sem API key: mostrar config
  if (!apiKey) {
    return (
      <Widget title="Música" icon={<MusicIcon />}>
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[var(--color-text-muted)]">
            Configure sua API key do Last.fm para descobrir músicas.
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Crie gratuitamente em{' '}
            <a href="https://www.last.fm/api/account/create" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary-light)] hover:underline">
              last.fm/api/account/create
            </a>
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
              placeholder="Cole sua API key aqui"
              className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
            <button
              onClick={handleSaveKey}
              className="px-3 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-lg text-xs font-medium hover:opacity-80 transition-all"
            >
              Salvar
            </button>
          </div>
        </div>
      </Widget>
    );
  }

  return (
    <Widget title="Música" icon={<MusicIcon />} actions={
      <button
        onClick={handleRemoveKey}
        className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-xs"
        title="Reconfigurar API key"
      >
        ⚙️
      </button>
    }>
      <div className="flex flex-col gap-3">
        {/* Tags */}
        <div className="flex gap-1 flex-wrap">
          {TAGS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTag(id)}
              className={`px-2 py-0.5 text-[10px] rounded-md transition-all ${
                tag === id
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading/Error */}
        {loading && (
          <div className="text-center text-xs text-[var(--color-text-muted)] animate-pulse py-4">
            Buscando músicas...
          </div>
        )}
        {error && (
          <div className="text-center text-xs text-[var(--color-accent)]">{error}</div>
        )}

        {/* Current track */}
        {!loading && current && (
          <div className="flex gap-3 items-center p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
            {getImageUrl(current) ? (
              <img
                src={getImageUrl(current)}
                alt={current.name}
                className="w-16 h-16 rounded-md object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-[var(--color-surface-lighter)] flex items-center justify-center shrink-0">
                <span className="text-2xl">🎵</span>
              </div>
            )}
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-sm font-bold text-[var(--color-text)] truncate">{current.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">{current.artist.name}</p>
              {current.playcount && (
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  ▶ {Number(current.playcount).toLocaleString()} plays
                </p>
              )}
              <div className="flex gap-2 mt-1">
                <a
                  href={getSearchUrl(current)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[var(--color-success)] hover:underline"
                >
                  Spotify
                </a>
                <a
                  href={getYoutubeUrl(current)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[var(--color-accent)] hover:underline"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Discover button */}
        {!loading && tracks.length > 0 && (
          <button
            onClick={discover}
            className="self-center px-4 py-1.5 text-xs rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-80 transition-all font-medium"
          >
            🎲 Descobrir outra
          </button>
        )}
      </div>
    </Widget>
  );
}
