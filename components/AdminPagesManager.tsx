'use client';

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bold, Code, ExternalLink, Heading2, Heading3,
  Italic, Link2, List, Minus, Save,
} from 'lucide-react';
import MarkdownContent from '@/components/MarkdownContent';
import type { SitePage } from '@/types';

const PAGE_LABELS: Record<string, string> = {
  about: 'About',
  contact: 'Contact',
  'privacy-policy': 'Privacy Policy',
  'terms-and-conditions': 'Terms & Conditions',
};

type ViewMode = 'write' | 'split' | 'preview';

function seoTitleColor(len: number) {
  if (len > 70) return 'text-dracula-red';
  if (len > 60) return 'text-dracula-orange';
  if (len >= 50) return 'text-dracula-green';
  return 'text-dracula-comment';
}

function seoDescColor(len: number) {
  if (len > 160) return 'text-dracula-red';
  if (len > 155) return 'text-dracula-orange';
  if (len >= 120) return 'text-dracula-green';
  return 'text-dracula-comment';
}

function genericCharColor(len: number, soft: number, hard: number) {
  if (len > hard) return 'text-dracula-red';
  if (len > soft) return 'text-dracula-orange';
  return 'text-dracula-comment';
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function AdminPagesManager({ initialPages }: { initialPages: SitePage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [activeSlug, setActiveSlug] = useState(initialPages[0]?.slug ?? 'about');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveRef = useRef<() => void>(() => {});

  const activePage = useMemo(
    () => pages.find((p) => p.slug === activeSlug) ?? pages[0],
    [activeSlug, pages],
  );

  function updateField<K extends keyof SitePage>(field: K, value: SitePage[K]) {
    setPages((cur) => cur.map((p) => (p.slug === activeSlug ? { ...p, [field]: value } : p)));
  }

  const insertMarkdown = useCallback(
    (before: string, after = '') => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = ta.value.slice(start, end);
      const next = ta.value.slice(0, start) + before + selected + after + ta.value.slice(end);
      setPages((cur) => cur.map((p) => (p.slug === activeSlug ? { ...p, content: next } : p)));
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(
          start + before.length,
          start + before.length + selected.length,
        );
      });
    },
    [activeSlug],
  );

  async function savePage(event?: FormEvent) {
    event?.preventDefault();
    if (!activePage) return;
    setIsSaving(true);
    setNotice(null);
    try {
      const res = await fetch('/api/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activePage),
      });
      const payload = await res.json();
      if (!res.ok) {
        setNotice({ text: payload.error ?? 'Unable to save page.', ok: false });
        return;
      }
      setPages((cur) => cur.map((p) => (p.slug === payload.page.slug ? payload.page : p)));
      setNotice({ text: 'Page saved successfully.', ok: true });
    } catch {
      setNotice({ text: 'Saving failed. Try again.', ok: false });
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    saveRef.current = () => savePage();
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveRef.current();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!activePage) {
    return <p className="text-sm text-dracula-comment">No pages available.</p>;
  }

  const words = wordCount(activePage.content);
  const readTime = Math.max(1, Math.round(words / 200));

  const seoChecks = [
    {
      label: 'SEO title 50–70 characters',
      pass: activePage.seoTitle.length >= 50 && activePage.seoTitle.length <= 70,
    },
    {
      label: 'Description 120–160 characters',
      pass: activePage.seoDescription.length >= 120 && activePage.seoDescription.length <= 160,
    },
    {
      label: 'Content has headings (## or ###)',
      pass: /^#{2,3}\s/m.test(activePage.content),
    },
    {
      label: 'Content is 300+ words',
      pass: words >= 300,
    },
    {
      label: 'Summary is filled in (20+ chars)',
      pass: activePage.summary.length >= 20,
    },
    {
      label: 'SEO title differs from page title',
      pass: activePage.seoTitle.trim() !== activePage.title.trim(),
    },
  ];
  const seoPassCount = seoChecks.filter((c) => c.pass).length;
  const seoScoreColor =
    seoPassCount >= 5 ? 'text-dracula-green' : seoPassCount >= 3 ? 'text-dracula-orange' : 'text-dracula-red';

  const toolbarActions = [
    { icon: Bold,     label: 'Bold',       fn: () => insertMarkdown('**', '**') },
    { icon: Italic,   label: 'Italic',     fn: () => insertMarkdown('_', '_') },
    { icon: Heading2, label: 'Heading 2',  fn: () => insertMarkdown('\n## ') },
    { icon: Heading3, label: 'Heading 3',  fn: () => insertMarkdown('\n### ') },
    { icon: Code,     label: 'Inline code',fn: () => insertMarkdown('`', '`') },
    { icon: Link2,    label: 'Link',       fn: () => insertMarkdown('[', '](url)') },
    { icon: List,     label: 'List item',  fn: () => insertMarkdown('\n- ') },
    { icon: Minus,    label: 'Divider',    fn: () => insertMarkdown('\n\n---\n\n') },
  ];

  return (
    <div className="space-y-5">
      {/* Page tabs */}
      <div className="flex flex-wrap gap-2">
        {pages.map((page) => (
          <button
            key={page.slug}
            type="button"
            onClick={() => { setActiveSlug(page.slug); setNotice(null); }}
            className={`border px-4 py-2 text-sm font-bold transition-colors ${
              activeSlug === page.slug
                ? 'border-dracula-cyan/60 bg-dracula-cyan/10 text-dracula-cyan'
                : 'border-dracula-line/40 bg-dracula-selection/10 text-dracula-comment hover:text-dracula-fg'
            }`}
          >
            {PAGE_LABELS[page.slug] ?? page.title}
          </button>
        ))}
      </div>

      {notice && (
        <p className={`border px-4 py-3 text-sm ${notice.ok ? 'border-dracula-green/40 bg-dracula-green/10 text-dracula-green' : 'border-dracula-red/40 bg-dracula-red/10 text-dracula-red'}`}>
          {notice.text}
        </p>
      )}

      <form onSubmit={savePage} className="space-y-5">
        {/* Header bar */}
        <div className="flex flex-col gap-3 border border-dracula-line/40 bg-dracula-selection/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-dracula-fg">{PAGE_LABELS[activePage.slug] ?? activePage.title}</h2>
            <p className="mt-0.5 font-mono text-xs text-dracula-comment">ctflogs.com/{activePage.slug}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${activePage.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-dracula-line/50 px-3 py-2 text-sm text-dracula-comment hover:text-dracula-fg"
            >
              <ExternalLink className="h-4 w-4" />
              View live
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-dracula-purple px-4 py-2 text-sm font-bold text-dracula-bg disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Core fields: title + summary */}
        <div className="space-y-4 border border-dracula-line/40 bg-dracula-selection/10 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-dracula-comment">Page Content</p>
          <label className="block">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-dracula-comment">Page Title</span>
              <span className={`font-mono text-xs ${genericCharColor(activePage.title.length, 60, 80)}`}>
                {activePage.title.length}/80
              </span>
            </div>
            <input
              value={activePage.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="admin-input"
              maxLength={80}
            />
          </label>
          <label className="block">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-dracula-comment">Summary</span>
              <span className={`font-mono text-xs ${genericCharColor(activePage.summary.length, 140, 180)}`}>
                {activePage.summary.length}/180
              </span>
            </div>
            <textarea
              value={activePage.summary}
              onChange={(e) => updateField('summary', e.target.value)}
              className="admin-input min-h-20 resize-y"
              maxLength={180}
            />
          </label>
        </div>

        {/* Markdown editor with toolbar + live preview */}
        <div className="border border-dracula-line/40 bg-dracula-selection/10">
          {/* Toolbar row */}
          <div className="flex items-center justify-between border-b border-dracula-line/30 px-3 py-2">
            <div className="flex items-center gap-0.5">
              {toolbarActions.map(({ icon: Icon, label, fn }) => (
                <button
                  key={label}
                  type="button"
                  title={label}
                  onClick={fn}
                  className="flex h-7 w-7 items-center justify-center rounded text-dracula-comment hover:bg-dracula-selection/60 hover:text-dracula-fg"
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {(['write', 'split', 'preview'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`rounded px-2 py-1 text-xs font-bold uppercase transition-colors ${
                    viewMode === mode
                      ? 'bg-dracula-cyan/20 text-dracula-cyan'
                      : 'text-dracula-comment hover:text-dracula-fg'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Editor / Preview panes */}
          <div className={viewMode === 'split' ? 'grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-dracula-line/30' : undefined}>
            {viewMode !== 'preview' && (
              <div className="flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={activePage.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      insertMarkdown('  ');
                    }
                  }}
                  className="min-h-[480px] w-full bg-transparent p-4 font-mono text-xs leading-6 text-dracula-fg outline-none placeholder:text-dracula-line"
                  maxLength={12000}
                  placeholder="Write page content in Markdown…"
                />
                <div className="flex items-center justify-between border-t border-dracula-line/20 px-4 py-2">
                  <span className="text-xs text-dracula-comment">
                    {words} words · {readTime} min read
                  </span>
                  <span className={`font-mono text-xs ${genericCharColor(activePage.content.length, 9000, 12000)}`}>
                    {activePage.content.length}/12000
                  </span>
                </div>
              </div>
            )}
            {viewMode !== 'write' && (
              <div className="min-h-[480px] overflow-auto p-5">
                <article className="markdown-body">
                  <MarkdownContent
                    content={activePage.content}
                    fallback="Start writing to see a live preview…"
                  />
                </article>
              </div>
            )}
          </div>
        </div>

        {/* SEO + SERP preview */}
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* SEO fields */}
          <div className="space-y-4 border border-dracula-line/40 bg-dracula-selection/10 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-dracula-comment">SEO Metadata</p>
            <label className="block">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-dracula-comment">SEO Title</span>
                <span className={`font-mono text-xs ${seoTitleColor(activePage.seoTitle.length)}`}>
                  {activePage.seoTitle.length}/70 · ideal 50–60
                </span>
              </div>
              <input
                value={activePage.seoTitle}
                onChange={(e) => updateField('seoTitle', e.target.value)}
                className="admin-input"
                maxLength={70}
              />
            </label>
            <label className="block">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-dracula-comment">Meta Description</span>
                <span className={`font-mono text-xs ${seoDescColor(activePage.seoDescription.length)}`}>
                  {activePage.seoDescription.length}/160 · ideal 120–155
                </span>
              </div>
              <textarea
                value={activePage.seoDescription}
                onChange={(e) => updateField('seoDescription', e.target.value)}
                className="admin-input min-h-20 resize-y"
                maxLength={160}
              />
            </label>

            {/* Google SERP preview */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-dracula-comment">
                Google Preview
              </p>
              <div className="rounded border border-dracula-line/30 bg-white px-5 py-4 font-sans shadow-sm">
                <p className="text-xs text-[#4d5156]">
                  ctflogs.com &rsaquo; {activePage.slug}
                </p>
                <p className="mt-1 line-clamp-1 text-lg font-medium leading-snug text-[#1a0dab]">
                  {activePage.seoTitle || activePage.title || 'Page title'}
                </p>
                <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#4d5156]">
                  {activePage.seoDescription || activePage.summary || 'Meta description will appear here.'}
                </p>
              </div>
            </div>
          </div>

          {/* SEO score panel */}
          <div className="border border-dracula-line/40 bg-dracula-selection/10 p-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-dracula-comment">SEO Score</p>
              <span className={`text-2xl font-bold tabular-nums ${seoScoreColor}`}>
                {seoPassCount}/{seoChecks.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-dracula-selection/40">
              <div
                className={`h-full rounded-full transition-all ${seoPassCount >= 5 ? 'bg-dracula-green' : seoPassCount >= 3 ? 'bg-dracula-orange' : 'bg-dracula-red'}`}
                style={{ width: `${(seoPassCount / seoChecks.length) * 100}%` }}
              />
            </div>

            <ul className="space-y-2.5">
              {seoChecks.map((check) => (
                <li key={check.label} className="flex items-start gap-2 text-xs">
                  <span className={`mt-px shrink-0 font-bold ${check.pass ? 'text-dracula-green' : 'text-dracula-red'}`}>
                    {check.pass ? '✓' : '✗'}
                  </span>
                  <span className={check.pass ? 'text-dracula-comment' : 'text-dracula-fg'}>{check.label}</span>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-xs text-dracula-comment">
              {seoPassCount >= 5 ? 'Great SEO coverage.' : seoPassCount >= 3 ? 'Good — a few improvements left.' : 'Needs attention before publishing.'}
            </p>
          </div>
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between border border-dracula-line/40 bg-dracula-selection/10 px-4 py-3">
          <span className="text-xs text-dracula-comment">
            Last saved: {new Date(activePage.updatedAt).toLocaleString()}
          </span>
          <span className="font-mono text-xs text-dracula-line">Ctrl+S to save</span>
        </div>
      </form>
    </div>
  );
}
