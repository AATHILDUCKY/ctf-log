import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getWriteup } from '@/lib/db/writeups';
import { siteConfig, writeupUrl } from '@/lib/seo';

type PageProps = {
  params: Promise<{ id: string; slug: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const writeup = getWriteup(id);

  if (!writeup) {
    return {
      title: `Writeup Not Found | ${siteConfig.name}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: writeup.title,
    description: writeup.summary,
    alternates: {
      canonical: writeupUrl(writeup),
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function LegacyWriteupPage({ params }: PageProps) {
  const { id } = await params;
  const writeup = getWriteup(id);

  if (!writeup) {
    notFound();
  }

  redirect(writeupUrl(writeup).replace(siteConfig.url, ''));
}
