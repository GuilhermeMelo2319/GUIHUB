export default function Widget({ title, icon, actions, children, contentAlign = 'start', className = '' }) {
  const alignClass = contentAlign === 'center' ? 'justify-center' : 'justify-start';
  return (
    <div className={`widget-card h-full flex flex-col ${className}`}>
      {(icon || title || actions) && (
        <div className="widget-drag-handle widget-header flex items-center gap-2 px-4 py-2.5 select-none">
          {icon && <span className="flex-shrink-0 opacity-70">{icon}</span>}
          {title && (
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              {title}
            </h2>
          )}
          {actions && (
            <div className="ml-auto flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
              {actions}
            </div>
          )}
        </div>
      )}
      <div
        className={`widget-no-drag widget-content text-[var(--color-text)] flex-1 p-4 overflow-y-auto flex flex-col ${alignClass}`}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
