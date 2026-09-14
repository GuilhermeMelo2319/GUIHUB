const s = "w-4 h-4 stroke-current stroke-[1.5] fill-none text-[var(--color-primary-light)]";

export function ClockIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
  );
}

export function WeatherIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
  );
}

export function PomodoroIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/><path d="M12 2v3"/></svg>
  );
}

export function TodoIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  );
}

export function NotesIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  );
}

export function CalculatorIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><circle cx="8" cy="10" r="0.5"/><circle cx="12" cy="10" r="0.5"/><circle cx="16" cy="10" r="0.5"/><circle cx="8" cy="14" r="0.5"/><circle cx="12" cy="14" r="0.5"/><circle cx="16" cy="14" r="0.5"/><circle cx="8" cy="18" r="0.5"/><line x1="12" y1="18" x2="16" y2="18"/></svg>
  );
}

export function LinksIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  );
}

export function NewsIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="10" y1="6" x2="18" y2="6"/><line x1="10" y1="10" x2="18" y2="10"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
  );
}

export function QuotesIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
  );
}

// Ícone de adição genérico
export function PlusIcon({ className = '' }) {
  return (
    <svg className={`w-4 h-4 stroke-current stroke-[2] fill-none ${className}`} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  );
}

// Ícone de skip
export function SkipIcon({ className = '' }) {
  return (
    <svg className={`w-4 h-4 stroke-current stroke-[2] fill-none ${className}`} viewBox="0 0 24 24"><polygon points="5,4 15,12 5,20" fill="currentColor" stroke="none"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
  );
}

export function UptimeIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  );
}

export function CountdownIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
  );
}

export function IpInfoIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  );
}

export function HackerNewsIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="3" strokeWidth="1.5" />
      <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor" stroke="none" fontFamily="sans-serif">Y</text>
    </svg>
  );
}

export function JokesIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" />
      <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" />
    </svg>
  );
}

export function TriviaIcon() {
  return (
    <svg className={s} viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
    </svg>
  );
}
