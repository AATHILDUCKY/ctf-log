'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Edit3, Eye, FilePlus2, Newspaper, Search, ShieldAlert, Trash2, X } from 'lucide-react';
import { Writeup, WriteupStatus } from '@/types';

const NEWS_CATEGORY = 'News';

export default function AdminWriteupsList({ initialWriteups }: { initialWriteups: Writeup[] }) {
  const [writeups, setWriteups] = useState(initialWriteups);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WriteupStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<Writeup | null>(null);
  const [message, setMessage] = useState('');

  const allCategories = useMemo(() => {
    const cats = Array.from(new Set(writeups.map((w) => w.category).filter(Boolean)));
    return cats.sort();
  }, [writeups]);

  const filteredWriteups = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return writeups.filter((writeup) => {
      const matchesStatus = statusFilter === 'all' || writeup.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || writeup.category === categoryFilter;
      const matchesQuery =
        writeup.title.toLowerCase().includes(normalizedQuery) ||
        writeup.summary.toLowerCase().includes(normalizedQuery) ||
        writeup.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesCategory && matchesQuery;
    });
  }, [query, statusFilter, categoryFilter, writeups]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    const response = await fetch(`/api/writeups/${deleteTarget.id}`, { method: 'DELETE' });

    if (!response.ok) {
      setMessage('Unable to delete writeup.');
      setDeleteTarget(null);
      return;
    }

    setWriteups((current) => current.filter((writeup) => writeup.id !== deleteTarget.id));
    setMessage('Writeup deleted.');
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-dracula-line/40 bg-dracula-selection/10 p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-2 rounded-md border border-dracula-line/50 bg-dracula-bg/70 px-3 py-2 xl:w-96">
          <Search className="h-4 w-4 text-dracula-comment" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search writeups..." className="w-full bg-transparent text-sm outline-none placeholder:text-dracula-line" />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'public', 'private'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-md px-3 py-2 text-xs font-bold uppercase transition-colors ${
                statusFilter === status ? 'bg-dracula-cyan text-dracula-bg' : 'bg-dracula-selection/40 text-dracula-comment hover:text-dracula-fg'
              }`}
            >
              {status}
            </button>
          ))}
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className={`rounded-md px-3 py-2 text-xs font-bold uppercase transition-colors bg-dracula-selection/40 outline-none cursor-pointer ${
              categoryFilter !== 'all' ? 'text-dracula-purple border border-dracula-purple/40' : 'text-dracula-comment hover:text-dracula-fg border border-transparent'
            }`}
          >
            <option value="all">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {categoryFilter === NEWS_CATEGORY ? (
            <Link
              href={`/admin/writeups/new?category=${encodeURIComponent(NEWS_CATEGORY)}`}
              className="inline-flex items-center gap-2 rounded-md bg-dracula-pink px-3 py-2 text-sm font-bold text-dracula-bg hover:brightness-95"
            >
              <Newspaper className="h-4 w-4" />
              Add News
            </Link>
          ) : (
            <Link href="/admin/writeups/new" className="inline-flex items-center gap-2 rounded-md bg-dracula-green px-3 py-2 text-sm font-bold text-dracula-bg hover:brightness-95">
              <FilePlus2 className="h-4 w-4" />
              New
            </Link>
          )}
        </div>
      </div>

      {message && <p className="rounded-md border border-dracula-line/40 bg-dracula-selection/20 px-4 py-3 text-sm text-dracula-cyan">{message}</p>}

      <section className="rounded-lg border border-dracula-line/40 bg-dracula-selection/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-dracula-line/30 text-xs uppercase text-dracula-comment">
              <tr>
                <th className="px-4 py-3 font-bold">Blog</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Date</th>
                <th className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWriteups.map((writeup) => (
                <tr key={writeup.id} className="border-b border-dracula-line/20 last:border-0 hover:bg-dracula-selection/20">
                  <td className="max-w-md px-4 py-3">
                    <Link href={`/admin/writeups/${writeup.id}`} className="group block" title="Open writeup">
                      <p className="font-bold text-dracula-fg line-clamp-1 group-hover:text-dracula-purple">{writeup.title}</p>
                      <p className="mt-1 text-xs text-dracula-comment line-clamp-1">{writeup.summary}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-dracula-cyan">{writeup.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold uppercase ${writeup.status === 'public' ? 'bg-dracula-green/10 text-dracula-green' : 'bg-dracula-orange/10 text-dracula-orange'}`}>
                      {writeup.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-dracula-comment">{writeup.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/writeups/${writeup.id}`} title="View post" className="flex h-9 w-9 items-center justify-center rounded-md border border-dracula-line/40 text-dracula-comment hover:bg-dracula-selection/40 hover:text-dracula-fg">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/writeups/${writeup.id}/edit`} title="Edit post" className="flex h-9 w-9 items-center justify-center rounded-md border border-dracula-line/40 text-dracula-cyan hover:bg-dracula-cyan/10">
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button type="button" title="Delete post" onClick={() => setDeleteTarget(writeup)} className="flex h-9 w-9 items-center justify-center rounded-md border border-dracula-red/50 text-dracula-red hover:bg-dracula-red/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredWriteups.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-dracula-comment">
                    No writeups match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {deleteTarget && <DeleteDialog writeup={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />}
    </div>
  );
}

function DeleteDialog({ writeup, onCancel, onConfirm }: { writeup: Writeup; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dracula-bg/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-dracula-red/50 bg-dracula-bg shadow-2xl">
        <div className="flex items-start gap-3 border-b border-dracula-line/30 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-dracula-red/10 text-dracula-red">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold">Delete writeup?</h2>
            <p className="mt-1 text-sm text-dracula-comment line-clamp-2">{writeup.title}</p>
          </div>
          <button type="button" onClick={onCancel} className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-dracula-comment hover:bg-dracula-selection/40 hover:text-dracula-fg">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="p-5 text-sm text-dracula-comment">This action permanently removes the blog post from SQLite and cannot be undone.</p>
        <div className="flex justify-end gap-2 border-t border-dracula-line/30 p-4">
          <button type="button" onClick={onCancel} className="rounded-md border border-dracula-line/60 px-3 py-2 text-sm text-dracula-comment hover:bg-dracula-selection/30 hover:text-dracula-fg">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="inline-flex items-center gap-2 rounded-md bg-dracula-red px-3 py-2 text-sm font-bold text-dracula-bg hover:brightness-95">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
