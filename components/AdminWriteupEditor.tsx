'use client';

import { type ClipboardEvent, FormEvent, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bold,
  Bug,
  ChevronDown,
  CheckCircle2,
  Code2,
  Copy,
  Eye,
  EyeOff,
  Flag,
  Image as ImageIcon,
  Italic,
  KeyRound,
  Link as LinkIcon,
  List,
  ListChecks,
  Quote,
  Save,
  Search,
  ShieldCheck,
  Table,
  TriangleAlert,
  X,
  Youtube,
} from 'lucide-react';
import MarkdownPreview from '@/components/MarkdownPreview';
import { Category, Writeup, WriteupInput } from '@/types';
import { slugifyWriteupTitle } from '@/lib/writeupRoutes';

const fallbackCategories: Category[] = ['CTF', 'HackTheBox', 'TryHackMe', 'VulnHub', 'Bug Bounty', 'CVE', 'Cyber Security News'];
const difficulties: NonNullable<Writeup['difficulty']>[] = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Insane'];

const ctfTemplate = `## Overview

- Platform:
- Machine / challenge:
- Category:
- Difficulty:
- Objective:

## Scope

- Target:
- Rules of engagement:
- Tools used:

## Reconnaissance

### Initial scan

\`\`\`bash
nmap -sC -sV -oN nmap/initial.txt TARGET
\`\`\`

### Open services

| Port | Service | Notes |
| --- | --- | --- |
|  |  |  |

## Enumeration

- Interesting paths:
- Users / emails:
- Technologies:
- Version findings:

## Exploitation

### Vulnerability

- Finding:
- Impact:
- Evidence:

### Steps

1. 
2. 
3. 

## Foothold

\`\`\`bash
whoami
id
hostname
\`\`\`

## Privilege Escalation

- Local enumeration:
- Misconfiguration:
- Exploit path:

## Flags / Proof

- User flag:
- Root / admin flag:

## Remediation

- Patch / upgrade:
- Configuration fix:
- Detection idea:

## Lessons Learned

- 
`;

const reconTemplate = `## Reconnaissance

\`\`\`bash
nmap -sC -sV -p- --min-rate 5000 -oN nmap/full.txt TARGET
\`\`\`

| Port | Service | Version | Notes |
| --- | --- | --- | --- |
|  |  |  |  |

### Key Findings

- 
`;

const exploitTemplate = `## Exploitation

### Finding

- Vulnerability:
- Affected endpoint / service:
- Why it works:

### Proof

\`\`\`bash

\`\`\`

### Result

- Access gained:
- User context:
- Next step:
`;

const flagsTemplate = `## Flags / Proof

| Proof | Value | Location |
| --- | --- | --- |
| User |  |  |
| Root / Admin |  |  |

> Keep sensitive tokens redacted if this is not a CTF environment.
`;

export default function AdminWriteupEditor({ initialWriteup, initialDraft }: { initialWriteup?: Writeup | null; initialDraft: WriteupInput }) {
  const router = useRouter();
  const [draft, setDraft] = useState<WriteupInput>(initialDraft);
  const [tagInput, setTagInput] = useState('');
  const [settingsCategories, setSettingsCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useState('');
  const [headingMenuOpen, setHeadingMenuOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const headingMenuRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const categories = useMemo(
    () =>
      Array.from(new Set([...settingsCategories, ...fallbackCategories, draft.category].map((item) => String(item).trim()).filter(Boolean))),
    [draft.category, settingsCategories],
  );
  const seoPreview = useMemo(() => buildSeoPreview(draft), [draft]);

  useEffect(() => {
    void fetch('/api/settings')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { settings?: { challengeTracks?: string[] } } | null) => {
        const tracks = payload?.settings?.challengeTracks ?? [];
        if (!Array.isArray(tracks)) return;
        setSettingsCategories(tracks.map((track) => String(track).trim()).filter(Boolean));
      })
      .catch(() => {
        // Keep fallback categories if settings fetch fails.
      });
  }, []);

  useEffect(() => {
    if (!headingMenuOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!headingMenuRef.current?.contains(event.target as Node)) {
        setHeadingMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [headingMenuOpen]);

  useEffect(() => {
    if (!linkModalOpen) return;
    requestAnimationFrame(() => linkInputRef.current?.focus());
  }, [linkModalOpen]);

  function updateDraft<K extends keyof WriteupInput>(key: K, value: WriteupInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateSlug(value: string) {
    const normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    updateDraft('slug', normalized);
  }

  function setTags(tags: string[]) {
    updateDraft('tags', normalizeTagList(tags));
  }

  function addTagsFromText(value: string) {
    const nextTags = normalizeTagList([...draft.tags, ...value.split(',')]);
    updateDraft('tags', nextTags);
    setTagInput('');
  }

  function updateTagInput(value: string) {
    if (value.includes(',')) {
      const parts = value.split(',');
      const completed = parts.slice(0, -1);
      const remainder = parts[parts.length - 1] ?? '';

      if (completed.some((tag) => tag.trim())) {
        updateDraft('tags', normalizeTagList([...draft.tags, ...completed]));
      }

      setTagInput(remainder);
      return;
    }

    setTagInput(value);
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if ((event.key === 'Enter' || event.key === 'Tab') && tagInput.trim()) {
      event.preventDefault();
      addTagsFromText(tagInput);
      return;
    }

    if (event.key === 'Backspace' && !tagInput && draft.tags.length > 0) {
      setTags(draft.tags.slice(0, -1));
    }
  }

  function removeTag(tagToRemove: string) {
    setTags(draft.tags.filter((tag) => tag !== tagToRemove));
  }

  async function saveWriteup(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    const payloadDraft = {
      ...draft,
      tags: normalizeTagList([...draft.tags, tagInput]),
    };
    setDraft(payloadDraft);
    setTagInput('');

    const response = await fetch(initialWriteup ? `/api/writeups/${initialWriteup.id}` : '/api/writeups', {
      method: initialWriteup ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadDraft),
    });

    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setMessage(payload.error ?? 'Unable to save writeup.');
      return;
    }

    const saved = payload.writeup as Writeup;
    setDraft(toDraft(saved));
    setMessage(saved.status === 'public' ? 'Writeup saved and public.' : 'Writeup saved privately.');

    if (!initialWriteup) {
      router.replace(`/admin/writeups/${saved.id}/edit`);
    } else {
      router.refresh();
    }
  }

  function focusEditorAndReveal(cursorStart: number, cursorEnd: number, trigger?: HTMLButtonElement | null) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();
    textarea.setSelectionRange(cursorStart, cursorEnd);
    textarea.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    const lineHeight = Number.parseFloat(window.getComputedStyle(textarea).lineHeight) || 24;
    const lineIndex = textarea.value.slice(0, cursorStart).split('\n').length - 1;
    const targetTop = Math.max(0, lineIndex * lineHeight - textarea.clientHeight / 2);
    textarea.scrollTo({ top: targetTop, behavior: 'smooth' });

    trigger?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  function insertMarkdown(before: string, after = '', placeholder = '', trigger?: HTMLButtonElement | null) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = draft.content.slice(start, end) || placeholder;
    const nextContent = `${draft.content.slice(0, start)}${before}${selected}${after}${draft.content.slice(end)}`;

    updateDraft('content', nextContent);
    requestAnimationFrame(() => {
      const nextStart = start + before.length;
      focusEditorAndReveal(nextStart, nextStart + selected.length, trigger);
    });
  }

  function insertBlock(markdown: string, trigger?: HTMLButtonElement | null) {
    const textarea = textareaRef.current;
    const currentContent = draft.content;
    const start = textarea?.selectionStart ?? currentContent.length;
    const end = textarea?.selectionEnd ?? currentContent.length;
    const prefix = currentContent.slice(0, start);
    const suffix = currentContent.slice(end);
    const needsLeadingBreak = prefix.trim().length > 0 && !prefix.endsWith('\n\n');
    const needsTrailingBreak = suffix.trim().length > 0 && !markdown.endsWith('\n\n');
    const nextContent = `${prefix}${needsLeadingBreak ? '\n\n' : ''}${markdown}${needsTrailingBreak ? '\n\n' : ''}${suffix}`;

    updateDraft('content', nextContent);
    requestAnimationFrame(() => {
      const cursor = start + (needsLeadingBreak ? 2 : 0) + markdown.length;
      focusEditorAndReveal(cursor, cursor, trigger);
    });
  }

  function insertHeading(level: 1 | 2 | 3 | 4 | 5 | 6, trigger?: HTMLButtonElement | null) {
    insertMarkdown(`${'#'.repeat(level)} `, '', `Heading ${level}`, trigger);
    setHeadingMenuOpen(false);
  }

  function openLinkModal() {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? 0;
    const end = textarea?.selectionEnd ?? 0;
    const selectedText = draft.content.slice(start, end).trim();
    setLinkText(selectedText);
    setLinkUrl('');
    setLinkModalOpen(true);
  }

  function insertLinkFromModal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUrl = linkUrl.trim();
    const cleanText = linkText.trim() || 'link text';
    if (!cleanUrl) {
      setMessage('Please enter a URL.');
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(cleanUrl) ? cleanUrl : `https://${cleanUrl}`;
    insertMarkdown('[', `](${normalizedUrl})`, cleanText);
    setLinkModalOpen(false);
    setMessage('Link inserted.');
  }

  async function pasteMarkdown() {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.replace(/\u200B/g, '').replace(/\r\n/g, '\n').trim();
      updateDraft('content', cleaned ? `${draft.content.trim()}\n\n${cleaned}` : draft.content);
    } catch {
      setMessage('Clipboard access was blocked by the browser.');
    }
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;

    setIsUploadingImage(true);
    setMessage('Optimizing image to WebP under 35 KB...');

    const formData = new FormData();
    formData.append('image', file);

    let response: Response;
    let payload: { error?: string; image?: { url: string; size: number } };

    try {
      response = await fetch('/api/writeup-images', {
        method: 'POST',
        body: formData,
      });
      payload = await response.json();
    } catch {
      setIsUploadingImage(false);
      setMessage('Image upload failed. Check the connection and try again.');
      return;
    }

    if (!response.ok) {
      setIsUploadingImage(false);
      setMessage(payload.error ?? 'Unable to upload image.');
      return;
    }

    if (!payload.image) {
      setIsUploadingImage(false);
      setMessage('Upload finished without an image URL.');
      return;
    }

    const image = payload.image;
    const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'writeup image';
    insertBlock(`![${alt}](${image.url})\n`);
    setIsUploadingImage(false);
    setMessage(`Image added as WebP (${formatBytes(image.size)}).`);
  }

  function insertYouTubeEmbed() {
    const url = window.prompt('YouTube URL');
    if (!url?.trim()) return;

    const trimmedUrl = url.trim();
    if (!isYouTubeUrl(trimmedUrl)) {
      setMessage('Paste a valid YouTube watch, shorts, embed, or youtu.be URL.');
      return;
    }

    insertBlock(`![YouTube video](${trimmedUrl})\n`);
  }

  return (
    <div className="space-y-4">
      {message && <p className="rounded-md border border-dracula-line/40 bg-dracula-selection/20 px-4 py-3 text-sm text-dracula-cyan">{message}</p>}

      <form onSubmit={saveWriteup} className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-dracula-comment">Editor</p>
              <h2 className="text-xl font-bold">{initialWriteup ? 'Edit writeup' : 'Create writeup'}</h2>
            </div>
            <div className="flex gap-2">
              {initialWriteup && (
                <Link href={`/admin/writeups/${initialWriteup.id}`} className="inline-flex items-center gap-2 rounded-md border border-dracula-line/50 px-3 py-2 text-sm text-dracula-comment hover:bg-dracula-selection/30 hover:text-dracula-fg">
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              )}
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-dracula-purple px-3 py-2 text-sm font-bold text-dracula-bg disabled:opacity-60">
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Field label="Title">
              <input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} className="admin-input" placeholder="Walkthrough title" />
            </Field>
            <Field label="SEO Slug">
              <div className="space-y-2">
                <input
                  value={draft.slug ?? ''}
                  onChange={(event) => updateSlug(event.target.value)}
                  className="admin-input"
                  placeholder="custom-seo-url-slug"
                />
                <button
                  type="button"
                  onClick={() => updateDraft('slug', slugifyWriteupTitle(draft.title))}
                  className="text-xs font-semibold uppercase tracking-widest text-dracula-cyan hover:text-dracula-fg"
                >
                  Use title slug
                </button>
              </div>
            </Field>
            <Field label="Author">
              <input value={draft.author} onChange={(event) => updateDraft('author', event.target.value)} className="admin-input" placeholder="Author" />
            </Field>
          </div>

          <Field label="Summary">
            <textarea value={draft.summary} onChange={(event) => updateDraft('summary', event.target.value)} className="admin-input min-h-24 resize-y" placeholder="Short description for the archive list" />
          </Field>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Field label="Category">
              <select value={draft.category} onChange={(event) => updateDraft('category', event.target.value as Category)} className="admin-input">
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </Field>
            <Field label="Difficulty">
              <select value={draft.difficulty ?? ''} onChange={(event) => updateDraft('difficulty', event.target.value as Writeup['difficulty'])} className="admin-input">
                <option value="">None</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty}>{difficulty}</option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input type="date" value={draft.date} onChange={(event) => updateDraft('date', event.target.value)} className="admin-input" />
            </Field>
            <Field label="Visibility">
              <button
                type="button"
                onClick={() => updateDraft('status', draft.status === 'public' ? 'private' : 'public')}
                className={`admin-input inline-flex items-center justify-center gap-2 font-bold ${draft.status === 'public' ? 'text-dracula-green' : 'text-dracula-orange'}`}
              >
                {draft.status === 'public' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {draft.status}
              </button>
            </Field>
          </div>

          <Field label="Tags">
            <div className="flex min-h-10 w-full flex-wrap items-center gap-2 border border-dracula-line/50 bg-dracula-selection/20 px-2 py-1.5 text-sm text-dracula-fg transition-colors focus-within:border-dracula-cyan focus-within:bg-dracula-selection/30">
              {draft.tags.map((tag) => (
                <span key={tag} className="inline-flex h-7 items-center gap-1 border border-dracula-line/40 bg-dracula-bg/60 px-2 text-xs font-bold uppercase tracking-wider text-dracula-cyan">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="inline-flex h-4 w-4 items-center justify-center text-dracula-comment hover:text-dracula-red"
                    title={`Remove ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(event) => updateTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (tagInput.trim()) addTagsFromText(tagInput);
                }}
                className="min-w-32 flex-1 bg-transparent px-1 py-1 outline-none placeholder:text-dracula-line"
                placeholder={draft.tags.length > 0 ? 'Add tag,' : 'web, enumeration, rce'}
              />
            </div>
          </Field>

          <div className="overflow-visible rounded-lg border border-dracula-line/50 bg-dracula-selection/10">
            <div className="relative border-b border-dracula-line/40 bg-dracula-selection/20 p-2">
              <div className="flex items-center gap-1">
                <div ref={headingMenuRef} className="relative z-30 shrink-0">
                <button
                  type="button"
                  title="Heading levels"
                  aria-label="Heading levels"
                  aria-haspopup="menu"
                  aria-expanded={headingMenuOpen}
                  onClick={() => setHeadingMenuOpen((open) => !open)}
                  className="inline-flex h-9 items-center justify-center gap-1 rounded-md px-2 text-sm font-bold text-dracula-comment hover:bg-dracula-selection hover:text-dracula-fg"
                >
                  H
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {headingMenuOpen && (
                  <div role="menu" className="absolute left-0 top-full z-40 mt-1 w-24 rounded-md border border-dracula-line/60 bg-dracula-bg p-1 shadow-xl">
                    {[1, 2, 3, 4, 5, 6].map((level) => (
                      <button
                        key={level}
                        type="button"
                        role="menuitem"
                        onClick={(event) => insertHeading(level as 1 | 2 | 3 | 4 | 5 | 6, event.currentTarget)}
                        className="block w-full rounded px-2 py-1 text-left text-sm text-dracula-comment hover:bg-dracula-selection/40 hover:text-dracula-fg"
                      >
                        H{level}
                      </button>
                    ))}
                  </div>
                )}
              </div>
                <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap pb-1">
                  <ToolButton label="Bold" onClick={(event) => insertMarkdown('**', '**', 'bold text', event.currentTarget)} icon={<Bold className="h-4 w-4" />} />
                  <ToolButton label="Italic" onClick={(event) => insertMarkdown('*', '*', 'italic text', event.currentTarget)} icon={<Italic className="h-4 w-4" />} />
                  <ToolButton label="List" onClick={(event) => insertMarkdown('- ', '', 'item', event.currentTarget)} icon={<List className="h-4 w-4" />} />
                  <ToolButton label="Checklist" onClick={(event) => insertBlock('- [ ] Confirm scope\n- [ ] Capture proof\n- [ ] Add remediation\n', event.currentTarget)} icon={<ListChecks className="h-4 w-4" />} />
                  <ToolButton label="Quote / Note" onClick={(event) => insertMarkdown('> ', '', 'Important observation', event.currentTarget)} icon={<Quote className="h-4 w-4" />} />
                  <ToolButton label="Link" onClick={openLinkModal} icon={<LinkIcon className="h-4 w-4" />} />
                  <ToolButton label="Code" onClick={(event) => insertMarkdown('```bash\n', '\n```', 'command here', event.currentTarget)} icon={<Code2 className="h-4 w-4" />} />
                  <ToolButton label="Table" onClick={(event) => insertBlock('| Item | Value |\n| --- | --- |\n| Target | 10.10.10.10 |\n', event.currentTarget)} icon={<Table className="h-4 w-4" />} />
                  <ToolButton label={isUploadingImage ? 'Uploading Image' : 'Add Image'} onClick={() => imageInputRef.current?.click()} icon={<ImageIcon className="h-4 w-4" />} disabled={isUploadingImage} />
                  <ToolButton label="Embed YouTube" onClick={insertYouTubeEmbed} icon={<Youtube className="h-4 w-4" />} />
                  <ToolbarDivider />
                  <ToolButton label="CTF Template" onClick={(event) => insertBlock(ctfTemplate, event.currentTarget)} icon={<ShieldCheck className="h-4 w-4" />} />
                  <ToolButton label="Recon Section" onClick={(event) => insertBlock(reconTemplate, event.currentTarget)} icon={<Bug className="h-4 w-4" />} />
                  <ToolButton label="Exploit Section" onClick={(event) => insertBlock(exploitTemplate, event.currentTarget)} icon={<KeyRound className="h-4 w-4" />} />
                  <ToolButton label="Flags Section" onClick={(event) => insertBlock(flagsTemplate, event.currentTarget)} icon={<Flag className="h-4 w-4" />} />
                  <ToolButton label="Paste Markdown" onClick={pasteMarkdown} icon={<Copy className="h-4 w-4" />} />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      void uploadImage(event.target.files?.[0]);
                      event.currentTarget.value = '';
                    }}
                  />
                </div>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={draft.content}
              onChange={(event) => updateDraft('content', event.target.value)}
              className="min-h-[560px] w-full resize-y rounded-b-lg bg-dracula-bg/80 p-4 font-mono text-sm leading-6 text-dracula-fg outline-none placeholder:text-dracula-line"
              spellCheck={false}
            />
          </div>
        </section>

        <section className="min-w-0 space-y-4">
          <div className="rounded-lg border border-dracula-line/50 bg-dracula-selection/20 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-dracula-comment">Preview</p>
            <p className="mt-1 line-clamp-1 text-sm text-dracula-fg">{draft.title || 'Untitled writeup'}</p>
          </div>
          <div className="max-h-[820px] overflow-auto rounded-lg border border-dracula-line/50 bg-dracula-bg p-5">
            <MarkdownPreview content={draft.content} />
          </div>
          <SeoPreviewPanel preview={seoPreview} />
        </section>
      </form>

      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dracula-bg/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-dracula-line/60 bg-dracula-selection/95 shadow-2xl">
            <div className="border-b border-dracula-line/40 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-dracula-comment">Insert Link</p>
              <h3 className="mt-1 text-lg font-bold text-dracula-fg">Add a clickable markdown link</h3>
            </div>
            <form onSubmit={insertLinkFromModal} className="space-y-4 px-5 py-4">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">Link Text</span>
                <input
                  ref={linkInputRef}
                  value={linkText}
                  onChange={(event) => setLinkText(event.target.value)}
                  className="admin-input"
                  placeholder="Example: official writeup"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">URL</span>
                <input
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  className="admin-input"
                  placeholder="https://example.com"
                />
              </label>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="rounded-md border border-dracula-line/60 px-3 py-2 text-sm font-semibold text-dracula-comment hover:bg-dracula-selection/40 hover:text-dracula-fg"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-dracula-purple px-3 py-2 text-sm font-bold text-dracula-bg">
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function toDraft(writeup: Writeup): WriteupInput {
  return {
    title: writeup.title,
    slug: writeup.slug ?? '',
    category: writeup.category,
    tags: writeup.tags,
    author: writeup.author,
    date: writeup.date,
    summary: writeup.summary,
    content: writeup.content,
    difficulty: writeup.difficulty,
    status: writeup.status,
  };
}

function normalizeTagList(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .flatMap((tag) => tag.split(','))
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean),
    ),
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">{label}</span>
      {children}
    </label>
  );
}

function SeoPreviewPanel({ preview }: { preview: SeoPreview }) {
  return (
    <section className="space-y-4 rounded-lg border border-dracula-line/50 bg-dracula-bg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-dracula-comment">SEO Preview</p>
          <p className="mt-1 text-sm text-dracula-fg">{preview.grade} SEO audit</p>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-dracula-line/50 bg-dracula-selection/20">
          <span className={`text-lg font-black ${preview.score >= 85 ? 'text-dracula-green' : preview.score >= 70 ? 'text-dracula-yellow' : 'text-dracula-orange'}`}>{preview.score}</span>
        </div>
      </div>

      <div className="border border-dracula-line/40 bg-dracula-selection/10 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-dracula-comment">
          <Search className="h-3.5 w-3.5" />
          Google result
        </div>
        <p className="truncate text-sm text-dracula-cyan">{preview.url}</p>
        <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-dracula-purple">{preview.googleTitle}</h3>
        <p className="mt-1 line-clamp-3 text-sm leading-6 text-dracula-comment">{preview.description}</p>
      </div>

      <div className="border border-dracula-line/40 bg-dracula-selection/10">
        <div className="flex min-h-28 items-end bg-dracula-selection/40 p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-dracula-cyan">{preview.category}</p>
            <p className="mt-2 line-clamp-2 text-xl font-bold text-dracula-fg">{preview.openGraphTitle}</p>
          </div>
        </div>
        <div className="p-3">
          <p className="line-clamp-2 text-sm text-dracula-comment">{preview.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Metric label="Title" value={`${preview.titleLength}/60`} ok={preview.titleLength > 0 && preview.titleLength <= 60} />
        <Metric label="Summary" value={`${preview.descriptionLength}/160`} ok={preview.descriptionLength >= 80 && preview.descriptionLength <= 160} />
        <Metric label="Words" value={`${preview.wordCount}`} ok={preview.wordCount >= 500} />
        <Metric label="Depth" value={preview.depthLabel} ok={preview.wordCount >= 500 && preview.sectionCount >= 4} />
        <Metric label="Headings" value={`${preview.headingCount}`} ok={preview.hasUsefulHeadingStructure} />
        <Metric label="Images" value={`${preview.imageCount}`} ok={preview.imageCount === 0 || preview.imagesMissingAlt === 0} />
        <Metric label="Links" value={`${preview.linkCount}`} ok={preview.linkCount >= 1} />
        <Metric label="CTF" value={`${preview.ctfSignalCount}/4`} ok={preview.ctfSignalCount >= 3} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {preview.keywords.slice(0, 8).map((keyword) => (
          <span key={keyword} className="border border-dracula-line/40 px-2 py-1 text-[11px] font-bold uppercase text-dracula-line">
            {keyword}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {preview.priorityIssues.length > 0 && (
          <div className="border border-dracula-orange/60 bg-dracula-orange/10 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-dracula-orange">Missing / Fix First</p>
            <div className="mt-2 space-y-2">
              {preview.priorityIssues.map((issue) => (
                <div key={issue.label} className="flex items-start gap-2 text-sm text-dracula-orange">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{issue.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {preview.checks.map((check) => (
          <div key={check.label} className={`flex items-start gap-2 text-sm ${check.ok ? 'text-dracula-green' : check.impact === 'critical' ? 'text-dracula-orange' : 'text-dracula-yellow'}`}>
            {check.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="border border-dracula-line/40 bg-dracula-selection/10 p-2">
      <p className="font-bold uppercase tracking-widest text-dracula-comment">{label}</p>
      <p className={ok ? 'mt-1 font-semibold text-dracula-green' : 'mt-1 font-semibold text-dracula-orange'}>{value}</p>
    </div>
  );
}

type SeoPreview = ReturnType<typeof buildSeoPreview>;

function buildSeoPreview(draft: WriteupInput) {
  const title = draft.title.trim();
  const summary = draft.summary.trim();
  const slug = draft.slug?.trim() || slugifyWriteupTitle(title);
  const tags = Array.from(new Set(draft.tags.map((tag) => tag.trim()).filter(Boolean)));
  const content = draft.content.trim();
  const plainText = stripMarkdownForSeo(content);
  const words = plainText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220));
  const headings = Array.from(content.matchAll(/^(#{1,6})\s+(.+)$/gm)).map((match) => ({
    level: match[1].length,
    text: match[2].trim(),
  }));
  const headingCount = headings.length;
  const sectionCount = headings.filter((heading) => heading.level === 2 || heading.level === 3).length;
  const hasH1 = headings.some((heading) => heading.level === 1);
  const hasH2 = headings.some((heading) => heading.level === 2);
  const hasUsefulHeadingStructure = headingCount >= 3 && hasH2;
  const imageMatches = Array.from(content.matchAll(/!\[([^\]]*)]\(([^)]+)\)/g));
  const imageCount = imageMatches.length;
  const imagesMissingAlt = imageMatches.filter((match) => !match[1].trim() || /image|screenshot|img/i.test(match[1].trim())).length;
  const links = Array.from(content.matchAll(/(?<!!)\[([^\]]+)]\(([^)]+)\)/g)).map((match) => ({
    text: match[1].trim(),
    url: match[2].trim(),
  }));
  const linkCount = links.length;
  const externalLinkCount = links.filter((link) => /^https?:\/\//i.test(link.url)).length;
  const weakAnchorCount = links.filter((link) => /^(click here|here|link|read more|source)$/i.test(link.text)).length;
  const codeBlockCount = (content.match(/```[\s\S]*?```/g) ?? []).length;
  const tableCount = (content.match(/^\|.+\|$/gm) ?? []).length > 1 ? 1 : 0;
  const titleTerms = tokenizeSeo(title);
  const summaryTerms = tokenizeSeo(summary);
  const tagTerms = tags.flatMap(tokenizeSeo);
  const contentTerms = new Set(tokenizeSeo(plainText));
  const focusTerms = Array.from(new Set([...tagTerms, draft.category, draft.difficulty ?? ''].flatMap(tokenizeSeo))).filter(Boolean);
  const titleHasFocus = focusTerms.some((term) => titleTerms.includes(term));
  const summaryHasFocus = focusTerms.some((term) => summaryTerms.includes(term));
  const contentHasTags = tagTerms.filter((term) => contentTerms.has(term)).length;
  const ctfSignals = [
    /recon|reconnaissance|enumeration/i.test(content),
    /exploit|exploitation|vulnerability|rce|xss|sqli|injection/i.test(content),
    /privilege|privesc|root|admin|foothold/i.test(content),
    /remediation|mitigation|lessons learned|patch/i.test(content),
  ];
  const ctfSignalCount = ctfSignals.filter(Boolean).length;
  const titleIsGeneric = /^(writeup|walkthrough|ctf|challenge|solution|notes)$/i.test(title);
  const titleSummaryOverlap = titleTerms.length > 0 ? titleTerms.filter((term) => summaryTerms.includes(term)).length / titleTerms.length : 0;
  const keywords = Array.from(new Set([draft.category, draft.difficulty ?? '', ...tags].filter(Boolean)));
  const checks: SeoCheck[] = [
    {
      ok: title.length >= 35 && title.length <= 60,
      label: title.length === 0 ? 'Add a unique, descriptive SEO title.' : 'Keep title descriptive and around 35-60 characters.',
      weight: 12,
      impact: 'critical',
    },
    {
      ok: !titleIsGeneric,
      label: 'Avoid generic titles; include the machine/challenge name and main technique.',
      weight: 5,
      impact: 'critical',
    },
    {
      ok: titleHasFocus,
      label: 'Include a focused keyword/tag in the title.',
      weight: 8,
      impact: 'critical',
    },
    {
      ok: summary.length >= 80 && summary.length <= 160,
      label: 'Write an 80-160 character meta summary.',
      weight: 12,
      impact: 'critical',
    },
    {
      ok: summaryHasFocus,
      label: 'Mention the main topic or technique in the summary.',
      weight: 6,
      impact: 'improve',
    },
    {
      ok: titleSummaryOverlap < 0.85,
      label: 'Make the summary descriptive instead of repeating the title.',
      weight: 4,
      impact: 'improve',
    },
    {
      ok: Boolean(slug) && slug.length <= 75 && !/--/.test(slug),
      label: 'Use a short readable slug with hyphen-separated words.',
      weight: 8,
      impact: 'critical',
    },
    {
      ok: Boolean(draft.author?.trim()) && Boolean(draft.date?.trim()) && Boolean(draft.difficulty),
      label: 'Complete author, publish date, and difficulty for article metadata.',
      weight: 5,
      impact: 'critical',
    },
    {
      ok: tags.length >= 3 && tags.length <= 8,
      label: 'Use 3-8 focused tags, not broad keyword stuffing.',
      weight: 8,
      impact: 'critical',
    },
    {
      ok: contentHasTags >= Math.min(2, tagTerms.length),
      label: 'Use important tags naturally inside the writeup content.',
      weight: 6,
      impact: 'improve',
    },
    {
      ok: hasUsefulHeadingStructure,
      label: 'Add clear H2/H3 sections so users and search engines understand the structure.',
      weight: 10,
      impact: 'critical',
    },
    {
      ok: !hasH1 || headings.filter((heading) => heading.level === 1).length === 1,
      label: 'Use at most one H1 in the markdown content.',
      weight: 4,
      impact: 'improve',
    },
    {
      ok: wordCount >= 500,
      label: 'Add enough depth: aim for at least 500 useful words.',
      weight: 8,
      impact: 'critical',
    },
    {
      ok: ctfSignalCount >= 3,
      label: 'Cover CTF essentials: recon, exploitation, privilege escalation, remediation/lessons.',
      weight: 8,
      impact: 'critical',
    },
    {
      ok: codeBlockCount >= 1,
      label: 'Include command/output code blocks where they help prove the process.',
      weight: 4,
      impact: 'improve',
    },
    {
      ok: imageCount === 0 || imagesMissingAlt === 0,
      label: 'Add descriptive alt text for every image.',
      weight: 5,
      impact: 'critical',
    },
    {
      ok: linkCount >= 1,
      label: 'Add at least one helpful reference or related resource link.',
      weight: 5,
      impact: 'improve',
    },
    {
      ok: weakAnchorCount === 0,
      label: 'Use descriptive link text instead of vague anchors like "click here".',
      weight: 3,
      impact: 'improve',
    },
  ];
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earnedWeight = checks.reduce((sum, check) => sum + (check.ok ? check.weight : 0), 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);
  const priorityIssues = checks.filter((check) => !check.ok && check.impact === 'critical').slice(0, 4);
  const depthLabel = wordCount >= 1200 ? 'deep' : wordCount >= 500 ? 'solid' : 'thin';

  return {
    slug,
    tags,
    keywords,
    checks,
    priorityIssues,
    score,
    grade: score >= 85 ? 'Strong' : score >= 70 ? 'Good' : score >= 50 ? 'Needs work' : 'Weak',
    category: draft.category || 'Writeup',
    googleTitle: title || 'Untitled writeup',
    openGraphTitle: title || 'Untitled writeup',
    description: summary || 'Add a clear summary so search engines and social previews explain the writeup.',
    url: slug ? `ctflogs.com/writeups/${slug}` : 'ctflogs.com/writeups/missing-slug',
    titleLength: title.length,
    descriptionLength: summary.length,
    wordCount,
    readingTime,
    headingCount,
    sectionCount,
    hasH1,
    hasH2,
    hasUsefulHeadingStructure,
    imageCount,
    imagesMissingAlt,
    linkCount,
    externalLinkCount,
    weakAnchorCount,
    codeBlockCount,
    tableCount,
    ctfSignalCount,
    depthLabel,
  };
}

type SeoCheck = {
  ok: boolean;
  label: string;
  weight: number;
  impact: 'critical' | 'improve';
};

function tokenizeSeo(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2 && !seoStopWords.has(term));
}

function stripMarkdownForSeo(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)]\([^)]+\)/g, '$1 ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1 ')
    .replace(/[#>*_`|~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const seoStopWords = new Set(['the', 'and', 'for', 'with', 'from', 'this', 'that', 'into', 'your', 'you', 'are', 'was', 'were', 'has', 'have', 'how', 'why']);

function formatBytes(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function isYouTubeUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, '');
    return hostname === 'youtube.com' || hostname === 'm.youtube.com' || hostname === 'youtu.be';
  } catch {
    return false;
  }
}

function ToolbarDivider() {
  return <span className="mx-1 h-6 w-px shrink-0 bg-dracula-line/40" aria-hidden="true" />;
}

function ToolButton({
  label,
  icon,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: ReactNode;
  onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-dracula-comment hover:bg-dracula-selection hover:text-dracula-fg disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
    </button>
  );
}
