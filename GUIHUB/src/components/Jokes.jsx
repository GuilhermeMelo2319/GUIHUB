import { useState, useEffect, useCallback } from 'react';
import Widget from './Widget';
import { JokesIcon } from './Icons';

const CATEGORIES = ['Programming', 'Misc', 'Pun', 'Dark'];

function buildUrl(category) {
  const cat = category || 'Programming,Misc,Pun';
  return `https://v2.jokeapi.dev/joke/${cat}?safe-mode`;
}

export default function Jokes() {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [category, setCategory] = useState('');

  const fetchJoke = useCallback(async () => {
    setLoading(true);
    setRevealed(false);
    try {
      // Try EN directly (PT support is very limited in JokeAPI)
      const cat = category || 'Programming,Misc,Pun';
      const url = `https://v2.jokeapi.dev/joke/${cat}?safe-mode&lang=en`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.error && data.type) {
        setJoke(data);
      } else {
        // Fallback: try Any category
        const fallbackRes = await fetch('https://v2.jokeapi.dev/joke/Any?safe-mode&lang=en');
        const fallbackData = await fallbackRes.json();
        if (!fallbackData.error) {
          setJoke(fallbackData);
        }
      }
    } catch (e) {
      // Silently fail, keep previous joke
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchJoke();
  }, [fetchJoke]);

  return (
    <Widget
      title="Piadas"
      icon={<JokesIcon />}
      contentAlign="center"
    >
      <div className="flex flex-col items-center justify-center gap-4 w-full max-w-md mx-auto">
        {/* Category selector */}
        <div className="flex flex-wrap gap-1 justify-center">
          <button
            onClick={() => setCategory('')}
            className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
              category === ''
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-lighter)]'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                category === cat
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-lighter)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Joke display */}
        <div className="text-center py-4 min-h-[120px] flex flex-col items-center justify-center">
          {loading && (
            <p className="text-sm text-[var(--color-text-muted)] animate-pulse">Carregando piada...</p>
          )}

          {!loading && joke && joke.type === 'single' && (
            <p className="text-base text-[var(--color-text)] leading-relaxed font-medium">
              {joke.joke}
            </p>
          )}

          {!loading && joke && joke.type === 'twopart' && (
            <div className="space-y-3">
              <p className="text-base text-[var(--color-text)] leading-relaxed font-medium">
                {joke.setup}
              </p>
              {revealed ? (
                <p className="text-base text-[var(--color-primary-light)] leading-relaxed font-bold animate-fade-in">
                  {joke.delivery}
                </p>
              ) : (
                <button
                  onClick={() => setRevealed(true)}
                  className="px-4 py-1.5 text-xs rounded-lg bg-[var(--color-surface-lighter)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] transition-colors"
                >
                  Revelar 👀
                </button>
              )}
            </div>
          )}
        </div>

        {/* Next joke button */}
        <button
          onClick={fetchJoke}
          disabled={loading}
          className="px-5 py-2 text-sm rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-80 transition-opacity disabled:opacity-50 font-medium"
        >
          Próxima piada 😂
        </button>
      </div>
    </Widget>
  );
}
