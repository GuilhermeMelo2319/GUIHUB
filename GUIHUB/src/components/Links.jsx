import { useState, useEffect, useCallback } from 'react';
import Widget from './Widget';
import { LinksIcon, PlusIcon } from './Icons';

const STORAGE_KEY = 'guihub-links';

function loadLinks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
}

export default function Links() {
  const [links, setLinks] = useState(loadLinks);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', url: '' });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  const resetForm = useCallback(() => {
    setForm({ name: '', url: '' });
    setEditingId(null);
    setShowForm(false);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!form.name || !form.url) return;

    const url = form.url.startsWith('http') ? form.url : `https://${form.url}`;

    if (editingId) {
      setLinks((prev) =>
        prev.map((l) => (l.id === editingId ? { ...l, name: form.name, url } : l))
      );
    } else {
      setLinks((prev) => [...prev, { id: Date.now(), name: form.name, url }]);
    }
    resetForm();
  }, [form, editingId, resetForm]);

  const startEdit = useCallback((link) => {
    setForm({ name: link.name, url: link.url });
    setEditingId(link.id);
    setShowForm(true);
  }, []);

  const deleteLink = useCallback((id) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return (
    <Widget title="Links" icon={<LinksIcon />} actions={
      <button
        onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
        className="p-1 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
        title={showForm ? 'Fechar' : 'Adicionar link'}
      >
        {showForm ? '✕' : <PlusIcon />}
      </button>
    }>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3 p-3 bg-[var(--color-surface)] rounded-xl space-y-2">
          <input
            type="text"
            placeholder="Nome do link"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface-lighter)] text-[var(--color-text)] border border-[var(--color-surface-lighter)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
          />
          <input
            type="text"
            placeholder="URL (ex: google.com)"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface-lighter)] text-[var(--color-text)] border border-[var(--color-surface-lighter)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
          />
          <button
            type="submit"
            className="w-full px-4 py-1.5 rounded-lg bg-[var(--color-success)] text-[#1a1a2e] hover:opacity-80 transition-opacity"
          >
            {editingId ? 'Salvar' : 'Adicionar'}
          </button>
        </form>
      )}

      {/* Links List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {links.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
            Nenhum link cadastrado.
          </p>
        )}
        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-lighter)] transition-colors group"
          >
            <img
              src={getFaviconUrl(link.url)}
              alt=""
              className="w-5 h-5 rounded"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-sm text-[var(--color-text)] hover:text-[var(--color-primary-light)] truncate"
            >
              {link.name}
            </a>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startEdit(link)}
                className="px-1.5 py-0.5 text-xs rounded bg-[var(--color-accent)] text-[var(--color-text)]"
              >
                ✏️
              </button>
              <button
                onClick={() => deleteLink(link.id)}
                className="px-1.5 py-0.5 text-xs rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </Widget>
  );
}
