import { useState, useEffect, useRef, useCallback } from 'react';
import Widget from './Widget';
import { PomodoroIcon, SkipIcon } from './Icons';

const MODES = {
  focus: { label: 'Foco', defaultTime: 25, color: 'var(--color-primary)' },
  shortBreak: { label: 'Pausa curta', defaultTime: 5, color: 'var(--color-success)' },
  longBreak: { label: 'Pausa longa', defaultTime: 15, color: 'var(--color-accent)' },
};

const STORAGE_KEY_CYCLES = 'pomodoro_cycles';
const STORAGE_KEY_SETTINGS = 'pomodoro_settings';

function playBeep() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  gainNode.gain.value = 0.3;
  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    audioCtx.close();
  }, 300);
}

export default function Pomodoro() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : { focus: 25, shortBreak: 5, longBreak: 15 };
    } catch { return { focus: 25, shortBreak: 5, longBreak: 15 }; }
  });
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cycles, setCycles] = useState(() => {
    return parseInt(localStorage.getItem(STORAGE_KEY_CYCLES) || '0', 10);
  });
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef(null);
  const totalTime = settings[mode] * 60;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CYCLES, cycles.toString());
  }, [cycles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            playBeep();
            if (mode === 'focus') {
              setCycles((c) => c + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  const handleStartPause = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(settings[mode] * 60);
  }, [mode, settings]);

  const handleSkip = useCallback(() => {
    setIsRunning(false);
    if (mode === 'focus') {
      const nextMode = cycles > 0 && (cycles + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(settings[nextMode] * 60);
    } else {
      setMode('focus');
      setTimeLeft(settings.focus * 60);
    }
  }, [mode, cycles, settings]);

  const handleModeChange = useCallback((newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
  }, [settings]);

  const handleSettingChange = useCallback((key, value) => {
    const num = Math.max(1, Math.min(99, parseInt(value, 10) || 1));
    setSettings((prev) => {
      const updated = { ...prev, [key]: num };
      return updated;
    });
  }, []);

  const applySettings = useCallback(() => {
    setTimeLeft(settings[mode] * 60);
    setShowSettings(false);
  }, [settings, mode]);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
  const currentColor = MODES[mode].color;

  // SVG circle progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Widget title="Pomodoro" icon={<PomodoroIcon />} contentAlign="center">
      <div className="flex flex-col items-center gap-3">
        {/* Mode tabs */}
        <div className="flex gap-1 bg-[var(--color-surface)] rounded-lg p-1">
          {Object.entries(MODES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => handleModeChange(key)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                mode === key
                  ? 'bg-[var(--color-surface-lighter)] text-[var(--color-text)] font-medium'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Progress circle */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--color-surface-lighter)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={currentColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold text-[var(--color-text)]">
              {minutes}:{seconds}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">{MODES[mode].label}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleStartPause}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: currentColor, color: 'white' }}
          >
            {isRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text-muted)] rounded-lg text-sm hover:text-[var(--color-text)] transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSkip}
            className="px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text-muted)] rounded-lg text-sm hover:text-[var(--color-text)] transition-colors"
            title="Pular"
          >
            <SkipIcon />
          </button>
        </div>

        {/* Cycles counter */}
        <div className="text-xs text-[var(--color-text-muted)]">
          🔄 Ciclos completados: <span className="text-[var(--color-success)] font-medium">{cycles}</span>
        </div>

        {/* Settings toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] underline"
        >
          ⚙️ Configurar tempos
        </button>

        {showSettings && (
          <div className="w-full flex flex-col gap-2 p-3 bg-[var(--color-surface)] rounded-lg">
            {Object.entries(MODES).map(([key, { label }]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <label className="text-xs text-[var(--color-text-muted)]">{label}</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={settings[key]}
                  onChange={(e) => handleSettingChange(key, e.target.value)}
                  className="w-16 bg-[var(--color-surface-lighter)] border border-[var(--color-surface-lighter)] rounded px-2 py-1 text-xs text-[var(--color-text)] text-center outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            ))}
            <button
              onClick={applySettings}
              className="mt-1 px-3 py-1 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded text-xs font-medium hover:bg-[var(--color-primary-light)] transition-colors"
            >
              Aplicar
            </button>
          </div>
        )}
      </div>
    </Widget>
  );
}
