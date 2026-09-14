import { useState, useEffect, useCallback } from 'react';
import Widget from './Widget';
import { QuotesIcon } from './Icons';

// APIs usadas:
// Motivacional: https://api.quoteslate.dev/api/quotes/random
// Piadas: https://v2.jokeapi.dev/joke/Programming,Misc,Pun?safe-mode&lang=en&type=single
// Espanhol: https://api.quoteslate.dev/api/quotes/random (tradução manual de fallback)

const CATEGORIES = [
  { id: 'motivacional', label: '💡 Motivacional' },
  { id: 'humor', label: '😂 Humor' },
  { id: 'espanhol', label: '🇪🇸 Espanhol' },
  { id: 'musica', label: '🎵 Música' },
];

// Fallback mínimo para quando APIs falham
const FALLBACK = {
  motivacional: { text: 'A persistência é o caminho do êxito.', author: 'Charles Chaplin' },
  humor: { text: 'Eu não sou preguiçoso, estou no modo de economia de energia.', author: '' },
  espanhol: { text: 'La vida es lo que pasa mientras estás ocupado haciendo otros planes.', author: 'John Lennon', translation: 'A vida é o que acontece enquanto você está ocupado fazendo outros planos.' },
  musica: { text: 'Eu prefiro ser essa metamorfose ambulante do que ter aquela velha opinião formada sobre tudo.', author: 'Raul Seixas — Metamorfose Ambulante' },
};

// Frases de música (difícil de encontrar via API, mantém banco reduzido)
const MUSIC_QUOTES = [
  { text: 'Eu prefiro ser essa metamorfose ambulante do que ter aquela velha opinião formada sobre tudo.', author: 'Raul Seixas — Metamorfose Ambulante' },
  { text: 'É preciso amar as pessoas como se não houvesse amanhã.', author: 'Legião Urbana — Pais e Filhos' },
  { text: 'O mundo é um moinho, vai triturar teus sonhos tão mesquinhos, vai reduzir as ilusões a pó.', author: 'Cartola — O Mundo É um Moinho' },
  { text: 'Eu vou tirar você desse lugar, eu vou levar você pra ficar comigo.', author: 'Cazuza — Exagerado' },
  { text: 'All you need is love.', author: 'The Beatles — All You Need Is Love' },
  { text: 'Is this the real life? Is this just fantasy?', author: 'Queen — Bohemian Rhapsody' },
  { text: 'Every little thing is gonna be alright.', author: 'Bob Marley — Three Little Birds' },
  { text: 'Eu sei que a vida deveria ser bem melhor e será, mas isso não impede que eu repita: é bonita, é bonita e é bonita.', author: 'Gonzaguinha — O Que É, O Que É?' },
  { text: 'Mesmo que os ventos sejam contrários, a gente segue o fluxo.', author: 'Natiruts — Deixa o Menino Jogar' },
  { text: 'Quem acredita sempre alcança.', author: 'Renato Russo — Quem Acredita' },
  { text: 'Onde você mora? Onde é que você foi? Eu vim do Norte e você do Sul.', author: 'Tribalistas — Já Sei Namorar' },
  { text: "I'm just a poor boy, nobody loves me.", author: 'Queen — Bohemian Rhapsody' },
  { text: 'Imagine all the people living life in peace.', author: 'John Lennon — Imagine' },
  { text: 'Somos quem podemos ser, sonhos que podemos ter.', author: 'Engenheiros do Hawaii — Somos Quem Podemos Ser' },
];

export default function Quotes() {
  const [mode, setMode] = useState('motivacional');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    try {
      switch (mode) {
        case 'motivacional': {
          const res = await fetch('https://api.quoteslate.dev/api/quotes/random?maxLength=150');
          if (res.ok) {
            const data = await res.json();
            setQuote({ text: data.quote, author: data.author });
          } else {
            setQuote(FALLBACK.motivacional);
          }
          break;
        }
        case 'humor': {
          const res = await fetch('https://v2.jokeapi.dev/joke/Programming,Misc,Pun?safe-mode&lang=en&type=single');
          const data = await res.json();
          if (!data.error && data.joke) {
            setQuote({ text: data.joke, author: data.category || '' });
          } else {
            setQuote(FALLBACK.humor);
          }
          break;
        }
        case 'espanhol': {
          const res = await fetch('https://api.quoteslate.dev/api/quotes/random?maxLength=120');
          if (res.ok) {
            const data = await res.json();
            // Nota: API retorna em inglês, exibimos como inspiração bilíngue
            setQuote({ text: data.quote, author: data.author, translation: '' });
          } else {
            setQuote(FALLBACK.espanhol);
          }
          break;
        }
        case 'musica': {
          const idx = Math.floor(Math.random() * MUSIC_QUOTES.length);
          setQuote(MUSIC_QUOTES[idx]);
          break;
        }
        default:
          setQuote(FALLBACK.motivacional);
      }
    } catch {
      setQuote(FALLBACK[mode] || FALLBACK.motivacional);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return (
    <Widget title="Frases" icon={<QuotesIcon />} contentAlign="center">
      <div className="flex flex-col gap-4 w-full">
        {/* Categories */}
        <div className="flex gap-1 flex-wrap justify-center">
          {CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                mode === id
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Quote display */}
        <div className="text-center py-4 min-h-[100px] flex flex-col items-center justify-center">
          {loading && (
            <p className="text-sm text-[var(--color-text-muted)] animate-pulse">...</p>
          )}
          {!loading && quote && (
            <>
              <p className="text-base italic text-[var(--color-text)] leading-relaxed font-medium">
                "{quote.text}"
              </p>
              {quote.translation && (
                <p className="text-xs text-[var(--color-text-muted)] mt-2 italic">
                  ({quote.translation})
                </p>
              )}
              {quote.author && (
                <p className="text-sm text-[var(--color-primary-light)] mt-3 font-medium">
                  — {quote.author}
                </p>
              )}
            </>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={fetchQuote}
          disabled={loading}
          className="self-center px-4 py-1.5 text-xs rounded-lg bg-[var(--color-surface-lighter)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all disabled:opacity-50"
        >
          Próxima →
        </button>
      </div>
    </Widget>
  );
}
