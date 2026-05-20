import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicPageShell from '@/components/PublicPageShell';
import { getSitePage } from '@/lib/db/sitePages';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = getSitePage('terms-and-conditions');
  const title = page?.seoTitle ?? 'Terms and Conditions';
  const description = page?.seoDescription ?? 'Review the CTFlogs terms and conditions.';
  return {
    title,
    description,
    alternates: { canonical: '/terms-and-conditions' },
    openGraph: { title, description, url: absoluteUrl('/terms-and-conditions'), type: 'website' },
  };
}

export default function TermsAndConditionsPage() {
  const page = getSitePage('terms-and-conditions');
  if (!page) notFound();
  return <PublicPageShell page={page} />;
}
