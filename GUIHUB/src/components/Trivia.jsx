import { useState, useEffect, useCallback } from 'react';
import Widget from './Widget';
import { TriviaIcon } from './Icons';

const STORAGE_KEY = 'guihub-trivia';
const DIFFICULTIES = [
  { value: '', label: 'Qualquer' },
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' },
];
const CATEGORIES = [
  { value: '', label: 'Qualquer' },
  { value: '9', label: 'Geral' },
  { value: '17', label: 'Ciência' },
  { value: '18', label: 'Computadores' },
  { value: '21', label: 'Esportes' },
  { value: '22', label: 'Geografia' },
  { value: '23', label: 'História' },
  { value: '11', label: 'Cinema' },
  { value: '14', label: 'TV' },
  { value: '15', label: 'Games' },
  { value: '12', label: 'Música' },
];

function decodeHtml(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadScore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { correct: parsed.correct || 0, total: parsed.total || 0 };
    }
  } catch (e) { /* ignore */ }
  return { correct: 0, total: 0 };
}

function saveScore(score) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
}

export default function Trivia() {
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(loadScore);
  const [difficulty, setDifficulty] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    try {
      let url = `https://opentdb.com/api.php?amount=1&type=multiple`;
      if (difficulty) url += `&difficulty=${difficulty}`;
      if (categoryId) url += `&category=${categoryId}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const q = data.results[0];
        const decoded = {
          question: decodeHtml(q.question),
          correct_answer: decodeHtml(q.correct_answer),
          incorrect_answers: q.incorrect_answers.map(decodeHtml),
          difficulty: q.difficulty,
          category: q.category,
        };
        setQuestion(decoded);
        setOptions(shuffleArray([decoded.correct_answer, ...decoded.incorrect_answers]));
      }
    } catch (e) {
      console.error('Trivia fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [difficulty, categoryId]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleAnswer = (answer) => {
    if (selected !== null) return; // already answered
    setSelected(answer);
    const isCorrect = answer === question.correct_answer;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
    };
    setScore(newScore);
    saveScore(newScore);
  };

  const handleReset = () => {
    const reset = { correct: 0, total: 0 };
    setScore(reset);
    saveScore(reset);
  };

  const getOptionClass = (option) => {
    const base = 'w-full px-4 py-2.5 text-sm text-left rounded-lg border transition-all duration-200 font-medium';
    if (selected === null) {
      return `${base} border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-lighter)] hover:border-[var(--color-primary)] cursor-pointer`;
    }
    if (option === question.correct_answer) {
      return `${base} border-emerald-500 bg-emerald-500/20 text-emerald-300`;
    }
    if (option === selected && option !== question.correct_answer) {
      return `${base} border-red-500 bg-red-500/20 text-red-300`;
    }
    return `${base} border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] opacity-50`;
  };

  return (
    <Widget
      title="Trivia"
      icon={<TriviaIcon />}
      contentAlign="center"
      actions={
        <button
          onClick={handleReset}
          className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-xs"
          title="Resetar score"
        >
          🗑️
        </button>
      }
    >
      <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
        {/* Score */}
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2 py-1 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)]">
            ✅ {score.correct}/{score.total}
          </span>
          {score.total > 0 && (
            <span className="px-2 py-1 rounded-full bg-[var(--color-surface)] text-[var(--color-primary-light)] font-bold">
              {Math.round((score.correct / score.total) * 100)}%
            </span>
          )}
        </div>

        {/* Settings */}
        <div className="flex flex-wrap gap-2 justify-center">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-2 py-1 text-[10px] rounded bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] outline-none"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-2 py-1 text-[10px] rounded bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Question */}
        {loading && (
          <div className="space-y-3 w-full py-4">
            <div className="animate-pulse h-4 bg-[var(--color-surface-lighter)] rounded w-full" />
            <div className="animate-pulse h-4 bg-[var(--color-surface-lighter)] rounded w-3/4 mx-auto" />
          </div>
        )}

        {!loading && question && (
          <>
            <div className="text-center">
              <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-0.5 rounded-full">
                {question.category} • {question.difficulty}
              </span>
              <p className="text-sm text-[var(--color-text)] font-medium leading-relaxed mt-3">
                {question.question}
              </p>
            </div>

            {/* Options */}
            <div className="w-full space-y-2">
              {options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  disabled={selected !== null}
                  className={getOptionClass(option)}
                >
                  <span className="mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>
                  {option}
                </button>
              ))}
            </div>

            {/* Next question */}
            {selected !== null && (
              <button
                onClick={fetchQuestion}
                className="px-5 py-2 text-sm rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-80 transition-opacity font-medium"
              >
                Próxima pergunta →
              </button>
            )}
          </>
        )}
      </div>
    </Widget>
  );
}
