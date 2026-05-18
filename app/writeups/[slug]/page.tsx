import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import Navbar from '@/components/Navbar';
import WriteupCard from '@/components/WriteupCard';
import WriteupDetail from '@/components/WriteupDetail';
import { listAds } from '@/lib/db/ads';
import { getWriteupBySlug, incrementWriteupViews, listRelatedWriteups } from '@/lib/db/writeups';
import { siteConfig, stripMarkdown, writeupKeywords, writeupUrl } from '@/lib/seo';
import { slugifyWriteupTitle } from '@/lib/writeupRoutes';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const writeup = getWriteupBySlug(slug);

  if (!writeup) {
    return {
      title: `Writeup Not Found | ${siteConfig.name}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = writeupUrl(writeup);
  const keywords = writeupKeywords(writeup);

  return {
    title: writeup.title,
    description: writeup.summary,
    keywords,
    authors: [{ name: writeup.author }],
    category: writeup.category,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      siteName: siteConfig.name,
      title: writeup.title,
      description: writeup.summary,
      publishedTime: new Date(writeup.date).toISOString(),
      modifiedTime: writeup.updatedAt,
      authors: [writeup.author],
      tags: keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: writeup.title,
      description: writeup.summary,
    },
    other: {
      'article:author': writeup.author,
      'article:section': writeup.category,
      'article:tag': keywords.join(','),
    },
  };
}

export default async function WriteupPage({ params }: PageProps) {
  const { slug } = await params;
  const writeup = getWriteupBySlug(slug);

  if (!writeup) {
    notFound();
  }

  const canonicalSlug = writeup.slug?.trim() || slugifyWriteupTitle(writeup.title);

  if (slug !== canonicalSlug) {
    redirect(`/writeups/${canonicalSlug}`);
  }

  incrementWriteupViews(writeup.id);
  const writeupWithViews = {
    ...writeup,
    views: (writeup.views ?? 0) + 1,
  };

  const ads = listAds({ activeOnly: true });
  const leftAds = ads.filter((ad) => ad.placement === 'writeup-left');
  const rightAds = ads.filter((ad) => ad.placement === 'writeup-right' || ad.placement === 'writeup-sidebar');
  const bottomAds = ads.filter((ad) => ad.placement === 'writeup-bottom').slice(0, 1);
  const relatedWriteups = listRelatedWriteups(writeup, 3);
  const canonicalUrl = writeupUrl(writeup);
  const articleBody = stripMarkdown(writeup.content);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: writeup.title,
    description: writeup.summary,
    articleBody: articleBody.slice(0, 5000),
    url: canonicalUrl,
    datePublished: new Date(writeup.date).toISOString(),
    dateModified: writeup.updatedAt,
    author: {
      '@type': 'Person',
      name: writeup.author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    about: [writeup.category, writeup.difficulty, ...writeup.tags].filter(Boolean),
    keywords: writeupKeywords(writeup).join(', '),
  };

  return (
    <div className="min-h-screen bg-dracula-bg text-dracula-fg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Navbar />
      <main className="mx-auto grid max-w-[88rem] grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:px-8 2xl:grid-cols-[220px_minmax(0,1024px)_220px]">
        <aside className="hidden 2xl:block">
          <div className="sticky top-24">
            <AdSlot ads={leftAds} />
          </div>
        </aside>

        <div className="mx-auto w-full max-w-5xl min-w-0">
          <WriteupDetail writeup={writeupWithViews} />
          {relatedWriteups.length > 0 && (
            <section className="mt-12 border-t border-dracula-line/30 pt-8">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-dracula-comment">Keep Reading</p>
                <h2 className="mt-1 text-2xl font-bold text-dracula-fg">Related writeups</h2>
              </div>
              <div className="space-y-3">
                {relatedWriteups.map((related) => (
                  <WriteupCard key={related.id} writeup={related} />
                ))}
              </div>
            </section>
          )}
          {(leftAds.length > 0 || rightAds.length > 0) && (
            <div className="mt-12 grid grid-cols-1 gap-4 2xl:hidden md:grid-cols-2">
              <AdSlot ads={leftAds} />
              <AdSlot ads={rightAds} />
            </div>
          )}
          <AdSlot ads={bottomAds} className="mt-12" />
        </div>

        <aside className="hidden 2xl:block">
          <div className="sticky top-24">
            <AdSlot ads={rightAds} />
          </div>
        </aside>
      </main>
    </div>
  );
}
