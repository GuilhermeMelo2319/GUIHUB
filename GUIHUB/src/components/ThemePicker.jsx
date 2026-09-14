import { useState, useEffect, useCallback, useRef } from 'react';

const PRESETS = [
  { name: 'Violeta', hue: 265, accent: 330 },
  { name: 'Azul', hue: 220, accent: 280 },
  { name: 'Ciano', hue: 185, accent: 220 },
  { name: 'Verde', hue: 145, accent: 180 },
  { name: 'Esmeralda', hue: 160, accent: 120 },
  { name: 'Laranja', hue: 25, accent: 350 },
  { name: 'Rosa', hue: 330, accent: 280 },
  { name: 'Vermelho', hue: 0, accent: 30 },
  { name: 'Âmbar', hue: 40, accent: 20 },
];

const STORAGE_KEY = 'guihub-theme';

function getStoredTheme() {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : { hue: 265, accent: 330 };
  } catch { return { hue: 265, accent: 330 }; }
}

export function applyTheme({ hue, accent }) {
  const h = Number(hue);
  const a = Number(accent);
  document.documentElement.style.setProperty('--hue-primary', h);
  document.documentElement.style.setProperty('--hue-accent', a);
  // Setar cores como valores concretos para o browser resolver
  document.documentElement.style.setProperty('--color-primary', `hsl(${h}, 70%, 55%)`);
  document.documentElement.style.setProperty('--color-primary-light', `hsl(${h}, 70%, 72%)`);
  document.documentElement.style.setProperty('--color-primary-glow', `hsl(${h}, 80%, 60%)`);
  document.documentElement.style.setProperty('--color-accent', `hsl(${a}, 80%, 70%)`);
  // Contraste: hues claros (amarelo/verde/ciano) precisam texto escuro
  const isLight = (h >= 35 && h <= 200);
  document.documentElement.style.setProperty('--color-on-primary', isLight ? '#1a1a2e' : '#ffffff');
}

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(getStoredTheme);
  const panelRef = useRef(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    // Apply on mount
    applyTheme(getStoredTheme());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectPreset = useCallback((preset) => {
    const t = { hue: preset.hue, accent: preset.accent };
    setTheme(t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  }, []);

  const setHue = useCallback((hue) => {
    const t = { ...theme, hue: Number(hue) };
    setTheme(t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  }, [theme]);

  const setAccent = useCallback((accent) => {
    const t = { ...theme, accent: Number(accent) };
    setTheme(t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  }, [theme]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="px-2.5 py-1.5 rounded-md text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-lighter)] transition-all flex items-center gap-1.5"
        title="Personalizar cores"
      >
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: `hsl(${theme.hue}, 70%, 55%)` }}
        />
        Tema
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 p-4 rounded-xl bg-[#141418] border border-[var(--color-border)] shadow-2xl">
          {/* Presets */}
          <p className="text-xs text-[var(--color-text-muted)] mb-2 font-medium uppercase tracking-wider">Presets</p>
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => selectPreset(preset)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all ${
                  theme.hue === preset.hue
                    ? 'bg-[var(--color-surface-lighter)] text-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-lighter)]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: `hsl(${preset.hue}, 70%, 55%)` }}
                />
                <span className="truncate">{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Custom sliders */}
          <p className="text-xs text-[var(--color-text-muted)] mb-2 font-medium uppercase tracking-wider">Custom</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
                <span>Primária</span>
                <span className="font-mono">{theme.hue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={theme.hue}
                onChange={(e) => setHue(e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(0,70%,55%), hsl(60,70%,55%), hsl(120,70%,55%), hsl(180,70%,55%), hsl(240,70%,55%), hsl(300,70%,55%), hsl(360,70%,55%))`,
                }}
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
                <span>Destaque</span>
                <span className="font-mono">{theme.accent}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={theme.accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(0,80%,70%), hsl(60,80%,70%), hsl(120,80%,70%), hsl(180,80%,70%), hsl(240,80%,70%), hsl(300,80%,70%), hsl(360,80%,70%))`,
                }}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="mt-3 flex items-center gap-2 pt-3 border-t border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-muted)]">Preview:</span>
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.hue}, 70%, 55%)` }} />
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.hue}, 70%, 72%)` }} />
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.accent}, 80%, 70%)` }} />
          </div>
        </div>
      )}
    </div>
  );
}
