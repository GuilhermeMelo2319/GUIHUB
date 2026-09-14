import { useState, useEffect, useCallback, useRef } from 'react';
import Widget from './Widget';

const s = "w-4 h-4 stroke-current stroke-[1.5] fill-none text-[var(--color-primary-light)]";

function ToolsIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  );
}

const TABS = [
  { id: 'calc', label: '🧮' },
  { id: 'password', label: '🔑' },
  { id: 'format', label: '🔤' },
  { id: 'stopwatch', label: '⏱️' },
  { id: 'score', label: '🏆' },
  { id: 'qrcode', label: '📱' },
];

// === CALCULADORA ===
function CalcTool() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');

  const safeEval = (expr) => {
    try {
      const sanitized = expr.replace(/[^0-9+\-*/.%() ]/g, '');
      if (!sanitized) return '';
      const res = new Function(`"use strict"; return (${sanitized})`)();
      if (!isFinite(res)) return 'Erro';
      return Number(res.toFixed(10)).toString();
    } catch { return 'Erro'; }
  };

  const append = (v) => setExpression(p => p + v);
  const calculate = () => { if (expression) setResult(safeEval(expression)); };
  const clear = () => { setExpression(''); setResult(''); };

  const buttons = [
    ['C', '⌫', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  const handleBtn = (b) => {
    if (b === 'C') clear();
    else if (b === '⌫') setExpression(p => p.slice(0, -1));
    else if (b === '=') calculate();
    else append(b);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-[var(--color-surface)] rounded-lg p-3 border border-[var(--color-border)]">
        <div className="text-right text-xs text-[var(--color-text-muted)] min-h-[1rem] break-all">{expression || '0'}</div>
        <div className="text-right text-xl font-bold text-[var(--color-text)] min-h-[1.5rem]">{result}</div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {buttons.flat().map((b) => (
          <button
            key={b}
            onClick={() => handleBtn(b)}
            className={`py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80 ${
              b === '=' ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' :
              ['+', '-', '*', '/', '%'].includes(b) ? 'bg-[var(--color-surface-lighter)] text-[var(--color-accent)]' :
              ['C', '⌫'].includes(b) ? 'bg-[var(--color-surface-lighter)] text-[var(--color-warning)]' :
              'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
            } ${b === '0' ? 'col-span-2' : ''}`}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}

// === GERADOR DE SENHA ===
function PasswordTool() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let chars = '';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    setPassword(Array.from(array, (x) => chars[x % chars.length]).join(''));
    setCopied(false);
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  useEffect(() => { generate(); }, [generate]);

  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggles = [
    { label: 'ABC', state: useUpper, set: setUseUpper },
    { label: 'abc', state: useLower, set: setUseLower },
    { label: '123', state: useNumbers, set: setUseNumbers },
    { label: '#$%', state: useSymbols, set: setUseSymbols },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[var(--color-surface)] rounded-lg p-3 border border-[var(--color-border)] font-mono text-sm break-all text-[var(--color-success)] min-h-[2.5rem] flex items-center">
        {password}
      </div>
      <div className="flex gap-2">
        <button onClick={generate} className="flex-1 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] text-xs font-medium hover:opacity-80 transition-all">
          Gerar
        </button>
        <button onClick={copy} className="flex-1 py-2 rounded-lg bg-[var(--color-surface-lighter)] text-[var(--color-text)] text-xs font-medium hover:opacity-80 transition-all">
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--color-text-muted)]">Tamanho:</span>
        <input
          type="range" min="8" max="64" value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="flex-1 accent-[var(--color-primary)]"
        />
        <span className="text-xs text-[var(--color-text)] font-mono w-6 text-right">{length}</span>
      </div>
      <div className="flex gap-1.5">
        {toggles.map(({ label, state, set }) => (
          <button
            key={label}
            onClick={() => set(!state)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              state ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// === FORMATADOR DE TEXTO ===
function FormatTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const transforms = [
    { label: 'MAIÚSCULAS', fn: (t) => t.toUpperCase() },
    { label: 'minúsculas', fn: (t) => t.toLowerCase() },
    { label: 'Capitalizar', fn: (t) => t.replace(/\b\w/g, c => c.toUpperCase()) },
    { label: 'camelCase', fn: (t) => t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
    { label: 'kebab-case', fn: (t) => t.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') },
    { label: 'snake_case', fn: (t) => t.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '') },
    { label: 'Inverter', fn: (t) => t.split('').reverse().join('') },
    { label: 'Remover espaços', fn: (t) => t.replace(/\s+/g, '') },
  ];

  const apply = (fn) => { setOutput(fn(input)); setCopied(false); };
  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Cole o texto aqui..."
        className="w-full h-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-2 text-xs text-[var(--color-text)] resize-none outline-none focus:border-[var(--color-primary)]"
      />
      <div className="grid grid-cols-2 gap-1.5">
        {transforms.map(({ label, fn }) => (
          <button
            key={label}
            onClick={() => apply(fn)}
            className="py-1.5 rounded-md text-xs bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)] transition-all"
          >
            {label}
          </button>
        ))}
      </div>
      {output && (
        <div className="flex gap-2 items-start">
          <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-2 text-xs text-[var(--color-success)] break-all min-h-[2rem]">
            {output}
          </div>
          <button onClick={copy} className="px-2 py-1.5 rounded-md text-xs bg-[var(--color-surface-lighter)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all shrink-0">
            {copied ? '✓' : '📋'}
          </button>
        </div>
      )}
    </div>
  );
}

// === CRONÔMETRO ===
function StopwatchTool() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setTime(t => t + 10), 10);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = () => setRunning(true);
  const stop = () => setRunning(false);
  const reset = () => { setRunning(false); setTime(0); setLaps([]); };
  const lap = () => setLaps(prev => [time, ...prev]);

  const format = (ms) => {
    const mins = Math.floor(ms / 60000).toString().padStart(2, '0');
    const secs = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const cents = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${mins}:${secs}.${cents}`;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="font-mono text-3xl font-bold text-[var(--color-text)] tracking-wider">
        {format(time)}
      </div>
      <div className="flex gap-2">
        {!running ? (
          <button onClick={start} className="px-4 py-2 rounded-lg bg-[var(--color-success)] text-black text-xs font-medium hover:opacity-80 transition-all">
            ▶ Iniciar
          </button>
        ) : (
          <button onClick={stop} className="px-4 py-2 rounded-lg bg-[var(--color-warning)] text-black text-xs font-medium hover:opacity-80 transition-all">
            ⏸ Pausar
          </button>
        )}
        <button onClick={lap} disabled={!running} className="px-3 py-2 rounded-lg bg-[var(--color-surface-lighter)] text-[var(--color-text)] text-xs font-medium hover:opacity-80 transition-all disabled:opacity-30">
          Volta
        </button>
        <button onClick={reset} className="px-3 py-2 rounded-lg bg-[var(--color-surface-lighter)] text-[var(--color-text-muted)] text-xs font-medium hover:opacity-80 transition-all">
          ↺
        </button>
      </div>
      {laps.length > 0 && (
        <div className="w-full max-h-[80px] overflow-y-auto">
          {laps.map((l, i) => (
            <div key={i} className="flex justify-between text-xs text-[var(--color-text-muted)] py-0.5 border-b border-[var(--color-border)]">
              <span>Volta {laps.length - i}</span>
              <span className="font-mono text-[var(--color-text)]">{format(l)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// === PLACAR ===
function ScoreTool() {
  const [data, setData] = useState(() => {
    try {
      const d = localStorage.getItem('guihub-scores');
      if (!d) return { title: 'Partida', scores: [{ name: 'Time A', score: 0 }, { name: 'Time B', score: 0 }] };
      const parsed = JSON.parse(d);
      // Migrar formato antigo (array) para novo (objeto)
      if (Array.isArray(parsed)) {
        return { title: 'Partida', scores: parsed };
      }
      return parsed;
    } catch { return { title: 'Partida', scores: [{ name: 'Time A', score: 0 }, { name: 'Time B', score: 0 }] }; }
  });

  const scores = data.scores || [{ name: 'Time A', score: 0 }, { name: 'Time B', score: 0 }];

  useEffect(() => {
    localStorage.setItem('guihub-scores', JSON.stringify(data));
  }, [data]);

  const setTitle = (title) => setData(prev => ({ ...prev, title }));

  const update = (idx, delta) => {
    setData(prev => ({
      ...prev,
      scores: prev.scores.map((s, i) => i === idx ? { ...s, score: Math.max(0, s.score + delta) } : s)
    }));
  };

  const rename = (idx, name) => {
    setData(prev => ({
      ...prev,
      scores: prev.scores.map((s, i) => i === idx ? { ...s, name } : s)
    }));
  };

  const reset = () => setData(prev => ({ ...prev, scores: prev.scores.map(s => ({ ...s, score: 0 })) }));

  return (
    <div className="flex flex-col gap-3">
      {/* Título do jogo */}
      <input
        value={data.title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-center text-sm font-bold text-[var(--color-text)] bg-transparent border-b border-[var(--color-border)] outline-none pb-1 focus:border-[var(--color-primary)] transition-colors"
        placeholder="Título do jogo..."
        maxLength={30}
      />

      {/* Placar */}
      <div className="flex gap-3 justify-center items-center">
        {scores.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
            <input
              value={s.name}
              onChange={(e) => rename(i, e.target.value)}
              className="text-xs text-center text-[var(--color-text-muted)] bg-transparent border-none outline-none w-full font-medium hover:text-[var(--color-text)] focus:text-[var(--color-text)] transition-colors"
              placeholder="Time"
              maxLength={15}
            />
            <span className="text-3xl font-bold text-[var(--color-text)]">{s.score}</span>
            <div className="flex gap-1">
              <button onClick={() => update(i, -1)} className="w-8 h-8 rounded-md bg-[var(--color-surface-lighter)] text-[var(--color-accent)] text-lg font-bold hover:opacity-80 transition-all">−</button>
              <button onClick={() => update(i, 1)} className="w-8 h-8 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)] text-lg font-bold hover:opacity-80 transition-all">+</button>
            </div>
          </div>
        ))}
      </div>

      {/* VS separator */}
      <div className="text-center text-xs text-[var(--color-text-muted)]">
        {scores[0]?.name} {scores[0]?.score} × {scores[1]?.score} {scores[1]?.name}
      </div>

      <button onClick={reset} className="self-center px-3 py-1.5 rounded-md text-xs bg-[var(--color-surface-lighter)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all">
        ↺ Zerar placar
      </button>
    </div>
  );
}

// === QR CODE ===
function QRCodeTool() {
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef(null);

  const generateQR = useCallback((value) => {
    if (!value.trim()) {
      setQrUrl('');
      return;
    }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value.trim())}`;
    setQrUrl(url);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => generateQR(value), 500);
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const copyUrl = () => {
    if (!qrUrl) return;
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="Digite texto ou URL..."
        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors"
      />

      {qrUrl ? (
        <>
          <div className="bg-white p-3 rounded-lg">
            <img src={qrUrl} alt="QR Code" className="w-[160px] h-[160px]" />
          </div>
          <div className="flex gap-2">
            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md text-xs bg-[var(--color-primary)] text-[var(--color-on-primary)] font-medium hover:opacity-80 transition-all"
            >
              ⬇ Download
            </a>
            <button
              onClick={copyUrl}
              className="px-3 py-1.5 rounded-md text-xs bg-[var(--color-surface-lighter)] text-[var(--color-text)] font-medium hover:opacity-80 transition-all"
            >
              {copied ? '✓ Copiado' : '📋 Copiar URL'}
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text-muted)]">
          <svg className="w-12 h-12 stroke-current stroke-[0.5] fill-none opacity-30 mb-2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="3" height="3" />
            <rect x="18" y="14" width="3" height="3" />
            <rect x="14" y="18" width="3" height="3" />
            <rect x="18" y="18" width="3" height="3" />
          </svg>
          <span className="text-xs">Digite algo para gerar o QR Code</span>
        </div>
      )}
    </div>
  );
}

// === WIDGET PRINCIPAL ===
export default function Tools() {
  const [activeTab, setActiveTab] = useState('calc');

  const renderTool = () => {
    switch (activeTab) {
      case 'calc': return <CalcTool />;
      case 'password': return <PasswordTool />;
      case 'format': return <FormatTool />;
      case 'stopwatch': return <StopwatchTool />;
      case 'score': return <ScoreTool />;
      case 'qrcode': return <QRCodeTool />;
      default: return null;
    }
  };

  return (
    <Widget title="Ferramentas" icon={<ToolsIcon />}>
      <div className="flex flex-col gap-3 h-full">
        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--color-surface)] rounded-lg p-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-1.5 rounded-md text-sm transition-all ${
                activeTab === id
                  ? 'bg-[var(--color-surface-lighter)] text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
              title={id === 'calc' ? 'Calculadora' : id === 'password' ? 'Gerador de Senha' : id === 'format' ? 'Formatador' : id === 'stopwatch' ? 'Cronômetro' : id === 'score' ? 'Placar' : 'QR Code'}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderTool()}
        </div>
      </div>
    </Widget>
  );
}
