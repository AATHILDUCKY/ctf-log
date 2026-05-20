'use client';

import { type FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Save } from 'lucide-react';
import type { SitePage } from '@/types';

const pageLabels: Record<string, string> = {
  about: 'About',
  contact: 'Contact',
  'privacy-policy': 'Privacy Policy',
  'terms-and-conditions': 'Terms and Conditions',
};

export default function AdminPagesManager({ initialPages }: { initialPages: SitePage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [activeSlug, setActiveSlug] = useState(initialPages[0]?.slug ?? 'about');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const activePage = useMemo(() => pages.find((page) => page.slug === activeSlug) ?? pages[0], [activeSlug, pages]);

  function updateField<K extends keyof SitePage>(field: K, value: SitePage[K]) {
    setPages((current) => current.map((page) => (page.slug === activePage.slug ? { ...page, [field]: value } : page)));
  }

  async function savePage(event: FormEvent) {
    event.preventDefault();
    if (!activePage) return;

    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activePage),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? 'Unable to save page.');
        return;
      }

      setPages((current) => current.map((page) => (page.slug === payload.page.slug ? payload.page : page)));
      setMessage('Page saved.');
    } catch {
      setMessage('Saving failed. Try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!activePage) {
    return <p className="text-sm text-dracula-comment">No pages are available.</p>;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-2">
        {pages.map((page) => (
          <button
            key={page.slug}
            type="button"
            onClick={() => {
              setActiveSlug(page.slug);
              setMessage('');
            }}
            className={`w-full border px-4 py-3 text-left text-sm transition-colors ${
              activeSlug === page.slug
                ? 'border-dracula-cyan/60 bg-dracula-cyan/10 text-dracula-cyan'
                : 'border-dracula-line/40 bg-dracula-selection/10 text-dracula-comment hover:text-dracula-fg'
            }`}
          >
            <span className="block font-bold">{pageLabels[page.slug] ?? page.title}</span>
            <span className="mt-1 block font-mono text-xs text-dracula-line">/{page.slug}</span>
          </button>
        ))}
      </aside>

      <form onSubmit={savePage} className="space-y-5">
        {message && <p className="border border-dracula-line/40 bg-dracula-selection/20 px-4 py-3 text-sm text-dracula-cyan">{message}</p>}

        <section className="border border-dracula-line/40 bg-dracula-selection/10 p-5">
          <div className="flex flex-col gap-3 border-b border-dracula-line/30 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">{pageLabels[activePage.slug] ?? activePage.title}</h2>
              <p className="mt-1 text-sm text-dracula-comment">Manage public copy and SEO metadata for this page.</p>
            </div>
            <Link href={`/${activePage.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 border border-dracula-line/50 px-3 py-2 text-sm text-dracula-comment hover:text-dracula-fg">
              <ExternalLink className="h-4 w-4" />
              View
            </Link>
          </div>

          <div className="mt-5 grid gap-4">
            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">Page Title</span>
              <input value={activePage.title} onChange={(event) => updateField('title', event.target.value)} className="admin-input" maxLength={80} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">Summary</span>
              <textarea value={activePage.summary} onChange={(event) => updateField('summary', event.target.value)} className="admin-input min-h-24" maxLength={180} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">Content</span>
              <textarea value={activePage.content} onChange={(event) => updateField('content', event.target.value)} className="admin-input min-h-72 font-mono" maxLength={12000} />
            </label>
          </div>
        </section>

        <section className="border border-dracula-line/40 bg-dracula-selection/10 p-5">
          <h2 className="text-lg font-bold">SEO</h2>
          <div className="mt-4 grid gap-4">
            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">SEO Title</span>
              <input value={activePage.seoTitle} onChange={(event) => updateField('seoTitle', event.target.value)} className="admin-input" maxLength={70} />
            </label>
            <label>
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">SEO Description</span>
              <textarea value={activePage.seoDescription} onChange={(event) => updateField('seoDescription', event.target.value)} className="admin-input min-h-24" maxLength={160} />
            </label>
          </div>
        </section>

        <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 bg-dracula-purple px-4 py-2 text-sm font-bold text-dracula-bg disabled:opacity-60">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Page'}
        </button>
      </form>
    </div>
  );
}
