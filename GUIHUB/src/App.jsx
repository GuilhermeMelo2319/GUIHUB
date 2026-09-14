import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import ThemePicker, { applyTheme } from './components/ThemePicker';

// Lazy load all widgets for code splitting
const Clock = lazy(() => import('./components/Clock'));
const Weather = lazy(() => import('./components/Weather'));
const Pomodoro = lazy(() => import('./components/Pomodoro'));
const TodoList = lazy(() => import('./components/TodoList'));
const Notes = lazy(() => import('./components/Notes'));
const Tools = lazy(() => import('./components/Tools'));
const Links = lazy(() => import('./components/Links'));
const News = lazy(() => import('./components/News'));
const Quotes = lazy(() => import('./components/Quotes'));
const Habits = lazy(() => import('./components/Habits'));
const Spotify = lazy(() => import('./components/Spotify'));
const Agenda = lazy(() => import('./components/Agenda'));
const Uptime = lazy(() => import('./components/Uptime'));
const Countdown = lazy(() => import('./components/Countdown'));
const IpInfo = lazy(() => import('./components/IpInfo'));
const Languages = lazy(() => import('./components/Languages'));
const Wikipedia = lazy(() => import('./components/Wikipedia'));
const Music = lazy(() => import('./components/Music'));
const HackerNews = lazy(() => import('./components/HackerNews'));
const Jokes = lazy(() => import('./components/Jokes'));
const Trivia = lazy(() => import('./components/Trivia'));

const STORAGE_KEY = 'guihub_layouts';

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'clock', x: 0, y: 0, w: 2, h: 2 },
    { i: 'weather', x: 2, y: 0, w: 1, h: 2 },
    { i: 'pomodoro', x: 3, y: 0, w: 1, h: 3 },
    { i: 'todo', x: 0, y: 2, w: 2, h: 3 },
    { i: 'notes', x: 2, y: 2, w: 2, h: 3 },
    { i: 'calculator', x: 0, y: 5, w: 2, h: 4 },
    { i: 'links', x: 2, y: 5, w: 1, h: 3 },
    { i: 'quotes', x: 3, y: 5, w: 1, h: 2 },
    { i: 'news', x: 0, y: 9, w: 4, h: 3 },
    { i: 'habits', x: 3, y: 2, w: 1, h: 3 },
    { i: 'spotify', x: 3, y: 7, w: 1, h: 2 },
    { i: 'agenda', x: 1, y: 12, w: 2, h: 3 },
    { i: 'uptime', x: 3, y: 12, w: 1, h: 2 },
    { i: 'countdown', x: 0, y: 15, w: 1, h: 2 },
    { i: 'ipinfo', x: 1, y: 15, w: 1, h: 2 },
    { i: 'languages', x: 2, y: 15, w: 2, h: 3 },
    { i: 'hackernews', x: 0, y: 18, w: 2, h: 4 },
    { i: 'jokes', x: 2, y: 18, w: 2, h: 3 },
    { i: 'trivia', x: 0, y: 22, w: 2, h: 4 },
    { i: 'wikipedia', x: 2, y: 22, w: 2, h: 3 },
    { i: 'music', x: 0, y: 26, w: 2, h: 3 },
  ],
  md: [
    { i: 'clock', x: 0, y: 0, w: 2, h: 2 },
    { i: 'weather', x: 0, y: 2, w: 1, h: 2 },
    { i: 'pomodoro', x: 1, y: 2, w: 1, h: 3 },
    { i: 'todo', x: 0, y: 4, w: 1, h: 3 },
    { i: 'notes', x: 1, y: 4, w: 1, h: 3 },
    { i: 'calculator', x: 0, y: 7, w: 1, h: 3 },
    { i: 'links', x: 1, y: 7, w: 1, h: 3 },
    { i: 'quotes', x: 0, y: 10, w: 1, h: 2 },
    { i: 'news', x: 0, y: 12, w: 2, h: 3 },
    { i: 'habits', x: 1, y: 10, w: 1, h: 3 },
    { i: 'spotify', x: 0, y: 15, w: 2, h: 2 },
    { i: 'agenda', x: 0, y: 20, w: 2, h: 3 },
    { i: 'uptime', x: 1, y: 17, w: 1, h: 2 },
    { i: 'countdown', x: 0, y: 23, w: 1, h: 2 },
    { i: 'ipinfo', x: 1, y: 23, w: 1, h: 2 },
    { i: 'languages', x: 0, y: 25, w: 2, h: 3 },
    { i: 'hackernews', x: 0, y: 28, w: 2, h: 4 },
    { i: 'jokes', x: 0, y: 32, w: 2, h: 3 },
    { i: 'trivia', x: 0, y: 35, w: 2, h: 4 },
    { i: 'wikipedia', x: 0, y: 39, w: 2, h: 3 },
    { i: 'music', x: 0, y: 42, w: 2, h: 3 },
  ],
  sm: [
    { i: 'clock', x: 0, y: 0, w: 1, h: 2 },
    { i: 'weather', x: 0, y: 2, w: 1, h: 2 },
    { i: 'pomodoro', x: 0, y: 4, w: 1, h: 3 },
    { i: 'todo', x: 0, y: 7, w: 1, h: 3 },
    { i: 'notes', x: 0, y: 10, w: 1, h: 3 },
    { i: 'calculator', x: 0, y: 13, w: 1, h: 3 },
    { i: 'links', x: 0, y: 16, w: 1, h: 3 },
    { i: 'quotes', x: 0, y: 19, w: 1, h: 2 },
    { i: 'news', x: 0, y: 21, w: 1, h: 3 },
    { i: 'habits', x: 0, y: 24, w: 1, h: 3 },
    { i: 'spotify', x: 0, y: 27, w: 1, h: 2 },
    { i: 'agenda', x: 0, y: 32, w: 1, h: 3 },
    { i: 'uptime', x: 0, y: 35, w: 1, h: 2 },
    { i: 'countdown', x: 0, y: 37, w: 1, h: 2 },
    { i: 'ipinfo', x: 0, y: 39, w: 1, h: 2 },
    { i: 'languages', x: 0, y: 41, w: 1, h: 3 },
    { i: 'hackernews', x: 0, y: 44, w: 1, h: 4 },
    { i: 'jokes', x: 0, y: 48, w: 1, h: 3 },
    { i: 'trivia', x: 0, y: 51, w: 1, h: 4 },
    { i: 'wikipedia', x: 0, y: 55, w: 1, h: 3 },
    { i: 'music', x: 0, y: 58, w: 1, h: 3 },
  ],
};

function getLayouts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_LAYOUTS;
    }
  }
  return DEFAULT_LAYOUTS;
}

const WIDGETS = {
  clock: { component: Clock, minW: 1, minH: 2 },
  weather: { component: Weather, minW: 1, minH: 2 },
  pomodoro: { component: Pomodoro, minW: 1, minH: 3 },
  todo: { component: TodoList, minW: 1, minH: 2 },
  notes: { component: Notes, minW: 1, minH: 2 },
  calculator: { component: Tools, minW: 1, minH: 3 },
  links: { component: Links, minW: 1, minH: 2 },
  quotes: { component: Quotes, minW: 1, minH: 2 },
  news: { component: News, minW: 1, minH: 2 },
  habits: { component: Habits, minW: 1, minH: 3 },
  spotify: { component: Spotify, minW: 1, minH: 2 },
  agenda: { component: Agenda, minW: 2, minH: 3 },
  uptime: { component: Uptime, minW: 1, minH: 2 },
  countdown: { component: Countdown, minW: 1, minH: 2 },
  ipinfo: { component: IpInfo, minW: 1, minH: 2 },
  languages: { component: Languages, minW: 1, minH: 3 },
  wikipedia: { component: Wikipedia, minW: 1, minH: 2 },
  music: { component: Music, minW: 1, minH: 3 },
  hackernews: { component: HackerNews, minW: 1, minH: 3 },
  jokes: { component: Jokes, minW: 1, minH: 3 },
  trivia: { component: Trivia, minW: 1, minH: 3 },
};

const WIDGET_LABELS = {
  clock: 'Relógio',
  weather: 'Clima',
  pomodoro: 'Pomodoro',
  todo: 'Tarefas',
  notes: 'Notas',
  calculator: 'Ferramentas',
  links: 'Links',
  quotes: 'Frases',
  news: 'Notícias',
  habits: 'Hábitos',
  spotify: 'Spotify',
  agenda: 'Agenda',
  uptime: 'Uptime',
  countdown: 'Countdown',
  ipinfo: 'IP/DNS',
  languages: 'Idiomas',
  wikipedia: 'Neste Dia',
  music: 'Música',
  hackernews: 'Hacker News',
  jokes: 'Piadas',
  trivia: 'Trivia',
};

const VISIBLE_WIDGETS_KEY = 'guihub-visible-widgets';
const ALL_WIDGET_KEYS = Object.keys(WIDGETS);

function getStoredVisibleWidgets() {
  try {
    const d = localStorage.getItem(VISIBLE_WIDGETS_KEY);
    if (d) return new Set(JSON.parse(d));
  } catch {}
  return new Set(ALL_WIDGET_KEYS);
}

function App() {
  const [layouts, setLayouts] = useState(getLayouts);
  const { width, containerRef } = useContainerWidth({ initialWidth: 1280 });
  const [visibleWidgets, setVisibleWidgets] = useState(getStoredVisibleWidgets);
  const [widgetSelectorOpen, setWidgetSelectorOpen] = useState(false);
  const widgetSelectorRef = useRef(null);

  // Aplicar tema salvo ao montar
  useEffect(() => {
    try {
      const d = localStorage.getItem('guihub-theme');
      if (d) applyTheme(JSON.parse(d));
    } catch {}
  }, []);

  // Click outside para fechar widget selector
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (widgetSelectorRef.current && !widgetSelectorRef.current.contains(e.target)) {
        setWidgetSelectorOpen(false);
      }
    };
    if (widgetSelectorOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [widgetSelectorOpen]);

  const toggleWidget = useCallback((key) => {
    setVisibleWidgets(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      localStorage.setItem(VISIBLE_WIDGETS_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const handleLayoutChange = useCallback((_, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleExport = useCallback(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('guihub') || key.startsWith('clock') || key.startsWith('weather') || key.startsWith('pomodoro') || key.startsWith('todolist')) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guihub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, value);
          });
          window.location.reload();
        } catch {
          alert('Arquivo inválido');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] p-3 md:p-5">
      {/* Header fino */}
      <header className="flex items-center justify-between mb-4 px-2 py-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-widest text-[var(--color-primary-light)]">GUIHUB</span>
          <span className="text-xs text-[var(--color-text-muted)]">•</span>
          <span className="text-xs text-[var(--color-text-muted)]">Painel Pessoal</span>
        </div>
        <nav className="flex items-center gap-1">
          {/* Widget Selector */}
          <div className="relative" ref={widgetSelectorRef}>
            <button
              onClick={() => setWidgetSelectorOpen(!widgetSelectorOpen)}
              className="px-2.5 py-1.5 rounded-md text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-lighter)] transition-all flex items-center gap-1.5"
              title="Widgets visíveis"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
              Widgets
            </button>
            {widgetSelectorOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-48 p-3 rounded-xl bg-[#141418] border border-[var(--color-border)] shadow-2xl">
                <p className="text-xs text-[var(--color-text-muted)] mb-2 font-medium uppercase tracking-wider">Widgets visíveis</p>
                <div className="space-y-1">
                  {ALL_WIDGET_KEYS.map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-lighter)] cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={visibleWidgets.has(key)}
                        onChange={() => toggleWidget(key)}
                        className="rounded accent-[var(--color-primary)]"
                      />
                      {WIDGET_LABELS[key]}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <ThemePicker />
          <button
            onClick={handleFullscreen}
            className="px-2.5 py-1.5 rounded-md text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-lighter)] transition-all"
            title="Tela cheia"
          >
            ⛶ Fullscreen
          </button>
          <button
            onClick={handleExport}
            className="px-2.5 py-1.5 rounded-md text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-lighter)] transition-all"
            title="Exportar backup"
          >
            💾 Backup
          </button>
          <button
            onClick={handleImport}
            className="px-2.5 py-1.5 rounded-md text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-lighter)] transition-all"
            title="Importar backup"
          >
            📤 Importar
          </button>
        </nav>
      </header>

      {/* Grid Layout */}
      <div ref={containerRef}>
        {width > 0 && (
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 768, sm: 0 }}
            cols={{ lg: 4, md: 2, sm: 1 }}
            rowHeight={100}
            width={width}
            margin={[12, 12]}
            containerPadding={[0, 0]}
            onLayoutChange={handleLayoutChange}
            isDraggable={true}
            isResizable={true}
            draggableHandle=".widget-drag-handle"
            draggableCancel=".widget-no-drag"
            resizeHandles={['se']}
            compactType="vertical"
            useCSSTransforms
          >
            {Object.entries(WIDGETS)
              .filter(([key]) => visibleWidgets.has(key))
              .map(([key, { component: Component, minW, minH }]) => (
              <div
                key={key}
                data-grid={{ ...layouts.lg?.find(l => l.i === key), minW, minH }}
              >
                <div className="h-full">
                  <Suspense fallback={<div className="widget-card h-full flex items-center justify-center"><span className="text-xs text-[var(--color-text-muted)] animate-pulse">Carregando...</span></div>}>
                    <Component />
                  </Suspense>
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 py-4 border-t border-[var(--color-border)] text-center">
        <p className="text-xs text-[var(--color-text-muted)]">
          GUIHUB v1.0.0 — Desenvolvido com IA{' '}
          <a href="https://kiro.dev" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary-light)] hover:underline">
            Kiro
          </a>
          {' '}(Claude Sonnet) • React + Vite + Tailwind
        </p>
        <p className="text-xs text-[var(--color-text-muted)] opacity-50 mt-1">
          Assistente: Kiro CLI • Model: Claude Sonnet 4 • Runtime: Client-side SPA
        </p>
      </footer>
    </div>
  );
}

export default App;
