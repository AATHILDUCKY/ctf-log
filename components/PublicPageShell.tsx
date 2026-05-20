import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import MarkdownContent from '@/components/MarkdownContent';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import type { SitePage } from '@/types';

export default function PublicPageShell({ page, children }: { page: SitePage; children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-dracula-bg text-dracula-fg">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-dracula-comment transition-colors hover:text-dracula-green">
          <ArrowLeft className="h-4 w-4" />
          Back to writeups
        </Link>

        <section className="mt-8 border border-dracula-line/40 bg-dracula-selection/10 p-6 sm:p-8">
          <div className="mb-8 flex items-start gap-4 border-b border-dracula-line/30 pb-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-dracula-purple/40 bg-dracula-purple/10 text-dracula-purple">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-dracula-cyan">CTFlogs</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">{page.title}</h1>
              <p className="mt-4 max-w-3xl text-base text-dracula-comment md:text-lg">{page.summary}</p>
            </div>
          </div>

          <article className="markdown-body max-w-none">
            <MarkdownContent content={page.content} />
          </article>

          {children && <div className="mt-10 border-t border-dracula-line/30 pt-8">{children}</div>}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
