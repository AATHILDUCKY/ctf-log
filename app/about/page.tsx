import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicPageShell from '@/components/PublicPageShell';
import { getSitePage } from '@/lib/db/sitePages';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = getSitePage('about');
  const title = page?.seoTitle ?? 'About CTFlogs';
  const description = page?.seoDescription ?? 'Learn about CTFlogs and its cybersecurity writeup archive.';
  return {
    title,
    description,
    alternates: { canonical: '/about' },
    openGraph: { title, description, url: absoluteUrl('/about'), type: 'website' },
  };
}

export default function AboutPage() {
  const page = getSitePage('about');
  if (!page) notFound();
  return <PublicPageShell page={page} />;
}
