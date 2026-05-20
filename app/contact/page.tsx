import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContactForm from '@/components/ContactForm';
import PublicPageShell from '@/components/PublicPageShell';
import { getSitePage } from '@/lib/db/sitePages';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = getSitePage('contact');
  const title = page?.seoTitle ?? 'Contact CTFlogs';
  const description = page?.seoDescription ?? 'Contact CTFlogs for corrections, collaborations and cybersecurity research notes.';
  return {
    title,
    description,
    alternates: { canonical: '/contact' },
    openGraph: { title, description, url: absoluteUrl('/contact'), type: 'website' },
  };
}

export default function ContactPage() {
  const page = getSitePage('contact');
  if (!page) notFound();
  return (
    <PublicPageShell page={page}>
      <ContactForm />
    </PublicPageShell>
  );
}
