'use client';

import { useMemo, useState } from 'react';
import { Download, FileJson, FileText, Minus, Search, Square, SquareCheck } from 'lucide-react';
import { Writeup } from '@/types';

export default function AdminBulkDownload({ initialWriteups }: { initialWriteups: Writeup[] }) {
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<'md' | 'json' | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return initialWriteups;
    return initialWriteups.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        w.summary.toLowerCase().includes(q) ||
        w.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [query, initialWriteups]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((w) => selectedIds.has(w.id));
  const someFilteredSelected = !allFilteredSelected && filtered.some((w) => selectedIds.has(w.id));
  const selectedCount = selectedIds.size;

  function toggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((w) => next.delete(w.id));
      } else {
        filtered.forEach((w) => next.add(w.id));
      }
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearAll() {
    setSelectedIds(new Set());
  }

  async function download(format: 'md' | 'json') {
    setDownloading(format);
    setMessage(null);
    try {
      const ids = selectedCount > 0 ? Array.from(selectedIds) : initialWriteups.map((w) => w.id);
      const response = await fetch('/api/writeups/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, format }),
      });
      if (!response.ok) {
        setMessage({ text: 'Export failed. Please try again.', ok: false });
        return;
      }
      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') ?? '';
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? `writeups-export.${format}`;
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
      setMessage({ text: `Downloaded ${filename}`, ok: true });
    } catch {
      setMessage({ text: 'Export failed. Please try again.', ok: false });
    } finally {
      setDownloading(null);
    }
  }

  const exportLabel = selectedCount > 0 ? `${selectedCount} selected` : `All ${initialWriteups.length}`;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border border-dracula-line/40 bg-dracula-selection/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-dracula-line/50 bg-dracula-bg/70 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-dracula-comment" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, category, tag…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-dracula-line"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 rounded-md border border-dracula-line/50 bg-dracula-selection/30 px-3 py-2 text-xs font-bold text-dracula-comment transition-colors hover:border-dracula-cyan/60 hover:text-dracula-fg"
          >
            {allFilteredSelected ? (
              <SquareCheck className="h-3.5 w-3.5 text-dracula-cyan" />
            ) : someFilteredSelected ? (
              <Minus className="h-3.5 w-3.5 text-dracula-cyan" />
            ) : (
              <Square className="h-3.5 w-3.5" />
            )}
            {allFilteredSelected ? 'Deselect visible' : 'Select visible'}
          </button>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-md border border-dracula-line/50 px-3 py-2 text-xs font-bold text-dracula-comment transition-colors hover:border-dracula-red/50 hover:text-dracula-red"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Selection count + Download actions */}
      <div className="flex flex-col gap-3 rounded-lg border border-dracula-purple/30 bg-dracula-purple/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-dracula-purple">
            {selectedCount > 0 ? `${selectedCount} of ${initialWriteups.length} selected` : `${initialWriteups.length} writeups total — none selected (exports all)`}
          </p>
          {message && (
            <p className={`mt-1 text-sm ${message.ok ? 'text-dracula-green' : 'text-dracula-red'}`}>{message.text}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => download('md')}
            disabled={downloading !== null}
            className="inline-flex items-center gap-2 rounded-md bg-dracula-cyan px-4 py-2 text-sm font-bold text-dracula-bg transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileText className="h-4 w-4" />
            {downloading === 'md' ? 'Exporting…' : `Markdown · ${exportLabel}`}
          </button>
          <button
            type="button"
            onClick={() => download('json')}
            disabled={downloading !== null}
            className="inline-flex items-center gap-2 rounded-md bg-dracula-green px-4 py-2 text-sm font-bold text-dracula-bg transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileJson className="h-4 w-4" />
            {downloading === 'json' ? 'Exporting…' : `JSON · ${exportLabel}`}
          </button>
        </div>
      </div>

      {/* Writeup list */}
      <section className="rounded-lg border border-dracula-line/40 bg-dracula-selection/10">
        <div className="border-b border-dracula-line/30 px-4 py-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-dracula-comment">
            {filtered.length === initialWriteups.length ? `${filtered.length} writeups` : `${filtered.length} of ${initialWriteups.length} matching`}
          </p>
        </div>
        <ul className="divide-y divide-dracula-line/20">
          {filtered.map((writeup) => {
            const selected = selectedIds.has(writeup.id);
            return (
              <li
                key={writeup.id}
                onClick={() => toggleOne(writeup.id)}
                className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-dracula-selection/20 ${selected ? 'bg-dracula-purple/5' : ''}`}
              >
                <span className={`mt-0.5 shrink-0 rounded border p-0.5 transition-colors ${selected ? 'border-dracula-purple bg-dracula-purple text-dracula-bg' : 'border-dracula-line/50 text-transparent'}`}>
                  <Download className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-bold ${selected ? 'text-dracula-fg' : 'text-dracula-fg/80'}`}>{writeup.title}</p>
                  <p className="mt-0.5 truncate text-xs text-dracula-comment">{writeup.summary}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-dracula-selection/50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-dracula-cyan">{writeup.category}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${writeup.status === 'public' ? 'bg-dracula-green/10 text-dracula-green' : 'bg-dracula-orange/10 text-dracula-orange'}`}>{writeup.status}</span>
                    <span className="font-mono text-[10px] text-dracula-line">{writeup.date}</span>
                  </div>
                </div>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-4 py-12 text-center text-sm text-dracula-comment">No writeups match your search.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
