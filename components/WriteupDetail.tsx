'use client';

import { ArrowLeft, Calendar, Clock3, Eye, Share2, Tag, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Writeup } from '@/types';
import MarkdownContent from '@/components/MarkdownContent';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

interface WriteupDetailProps {
  writeup: Writeup;
  backHref?: string;
}

export default function WriteupDetail({ writeup, backHref = '/' }: WriteupDetailProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const shareLinks = useMemo(() => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(writeup.title);
    const encodedSummary = encodeURIComponent(writeup.summary);

    return [
      { label: 'X / Twitter', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
      { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
      { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
      { label: 'Reddit', href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}` },
      { label: 'WhatsApp', href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}` },
      { label: 'Telegram', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedSummary}` },
    ];
  }, [writeup.summary, writeup.title]);

  const copyShareLink = async () => {
    if (typeof window === 'undefined') return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
    setShareOpen(false);
  };

  useEffect(() => {
    if (!shareOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!shareRef.current?.contains(event.target as Node)) {
        setShareOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [shareOpen]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
      <Link href={backHref} className="inline-flex items-center gap-2 text-dracula-comment hover:text-dracula-pink mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to list
      </Link>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-dracula-selection text-dracula-cyan">{writeup.category}</span>
          {writeup.difficulty && (
            <span
              className={`text-sm font-bold uppercase tracking-wider ${
                writeup.difficulty === 'Very Easy'
                  ? 'text-dracula-cyan'
                  : writeup.difficulty === 'Easy'
                    ? 'text-dracula-green'
                    : writeup.difficulty === 'Medium'
                      ? 'text-dracula-yellow'
                      : writeup.difficulty === 'Hard'
                        ? 'text-dracula-orange'
                        : 'text-dracula-red'
              }`}
            >
              {writeup.difficulty}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-dracula-fg mb-6 leading-tight">{writeup.title}</h1>

        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-dracula-comment border-y border-dracula-line/30 py-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-dracula-purple" />
            <span className="text-sm">{writeup.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-dracula-orange" />
            <span className="text-sm">{writeup.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-dracula-cyan" />
            <span className="text-sm">{writeup.views ?? 0} views</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-dracula-yellow" />
            <span className="text-sm">{writeup.readingTimeMinutes ?? 1} min read</span>
          </div>
          <div ref={shareRef} className="relative ml-auto">
            <button
              type="button"
              onClick={() => setShareOpen((open) => !open)}
              className="flex items-center gap-2 text-dracula-pink hover:bg-dracula-selection px-3 py-1 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>

            {shareOpen && (
              <div className="absolute right-0 z-20 mt-2 w-52 border border-dracula-line/50 bg-dracula-bg shadow-xl">
                <div className="border-b border-dracula-line/30 px-3 py-2 text-xs font-bold uppercase tracking-widest text-dracula-comment">Share this post</div>
                <div className="p-1">
                  {shareLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block px-3 py-2 text-sm text-dracula-comment hover:bg-dracula-selection/40 hover:text-dracula-fg"
                      onClick={() => setShareOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      void copyShareLink();
                    }}
                    className="mt-1 block w-full px-3 py-2 text-left text-sm text-dracula-cyan hover:bg-dracula-selection/40"
                  >
                    {copied ? 'Copied link' : 'Copy link'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <MarkdownContent content={writeup.content} fallback="" />

      {writeup.tags.length > 0 && (
        <section className="mt-12 border-t border-dracula-line/30 pt-6">
          <div className="mb-3 flex items-center gap-2 text-dracula-comment">
            <Tag className="h-4 w-4 text-dracula-green" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Tags</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {writeup.tags.map((tag) => (
              <span key={tag} className="border border-dracula-line/40 bg-dracula-selection/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-dracula-cyan">
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
