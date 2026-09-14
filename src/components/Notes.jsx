import { useState, useEffect, useRef, useCallback } from 'react';
import Widget from './Widget';
import { NotesIcon, PlusIcon } from './Icons';

const STORAGE_KEY = 'guihub-notes';

function loadNotes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading notes:', e);
  }
  return [{ id: Date.now(), title: 'Nova Nota', content: '' }];
}

export default function Notes() {
  const [notes, setNotes] = useState(loadNotes);
  const [activeId, setActiveId] = useState(() => loadNotes()[0]?.id);
  const [copied, setCopied] = useState(false);
  const saveTimeout = useRef(null);

  const activeNote = notes.find((n) => n.id === activeId) || notes[0];

  const saveToStorage = useCallback((updatedNotes) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  const updateNote = useCallback((id, field, value) => {
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, [field]: value } : n
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const createNote = useCallback(() => {
    const newNote = { id: Date.now(), title: 'Nova Nota', content: '' };
    setNotes((prev) => {
      const updated = [...prev, newNote];
      saveToStorage(updated);
      return updated;
    });
    setActiveId(newNote.id);
  }, [saveToStorage]);

  const deleteNote = useCallback((id) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      if (updated.length === 0) {
        const fallback = { id: Date.now(), title: 'Nova Nota', content: '' };
        const final = [fallback];
        saveToStorage(final);
        setActiveId(fallback.id);
        return final;
      }
      saveToStorage(updated);
      if (id === activeId) {
        setActiveId(updated[0].id);
      }
      return updated;
    });
  }, [activeId, saveToStorage]);

  const copyText = useCallback(async () => {
    if (!activeNote) return;
    try {
      await navigator.clipboard.writeText(activeNote.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  }, [activeNote]);

  return (
    <Widget title="Notas" icon={<NotesIcon />} contentAlign="center" actions={
      <button
        onClick={createNote}
        className="p-1 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
        title="Nova nota"
      >
        <PlusIcon />
      </button>
    }>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1 scrollbar-thin">
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => setActiveId(note.id)}
            className={`px-3 py-1 text-sm rounded-lg whitespace-nowrap transition-colors ${
              note.id === activeId
                ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-lighter)]'
            }`}
          >
            {note.title || 'Sem título'}
          </button>
        ))}
      </div>

      {/* Editor */}
      {activeNote && (
        <div className="flex flex-col flex-1 gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => updateNote(activeNote.id, 'title', e.target.value)}
              placeholder="Título da nota..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-surface-lighter)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
            />
            <button
              onClick={() => deleteNote(activeNote.id)}
              className="px-2 py-1.5 text-sm rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
              title="Deletar nota"
            >
              🗑️
            </button>
          </div>

          <textarea
            value={activeNote.content}
            onChange={(e) => updateNote(activeNote.id, 'content', e.target.value)}
            placeholder="Escreva aqui..."
            className="flex-1 min-h-[120px] px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-surface-lighter)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)] resize-none"
          />

          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>{activeNote.content.length} caracteres</span>
            <button
              onClick={copyText}
              className="px-2 py-1 rounded bg-[var(--color-surface-lighter)] hover:bg-[var(--color-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-on-primary)] transition-colors"
            >
              {copied ? '✓ Copiado!' : '📋 Copiar'}
            </button>
          </div>
        </div>
      )}
    </Widget>
  );
}
