import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicPageShell from '@/components/PublicPageShell';
import { getSitePage } from '@/lib/db/sitePages';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = getSitePage('privacy-policy');
  const title = page?.seoTitle ?? 'Privacy Policy';
  const description = page?.seoDescription ?? 'Read the CTFlogs privacy policy.';
  return {
    title,
    description,
    alternates: { canonical: '/privacy-policy' },
    openGraph: { title, description, url: absoluteUrl('/privacy-policy'), type: 'website' },
  };
}

export default function PrivacyPolicyPage() {
  const page = getSitePage('privacy-policy');
  if (!page) notFound();
  return <PublicPageShell page={page} />;
}
