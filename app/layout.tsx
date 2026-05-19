import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import GlobalPopupAds from '@/components/GlobalPopupAds';
import { absoluteUrl, siteConfig, socialLinks } from '@/lib/seo';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  referrer: 'origin-when-cross-origin',
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.authorName, url: siteConfig.url }],
  creator: siteConfig.authorName,
  publisher: siteConfig.authorName,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl('/og-default.svg'),
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Open Graph image`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [absoluteUrl('/og-default.svg')],
    creator: '@AathilDucky',
    site: '@AathilDucky',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'technology',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  name: siteConfig.name,
                  url: siteConfig.url,
                  description: siteConfig.description,
                  publisher: {
                    '@type': 'Person',
                    name: siteConfig.authorName,
                    url: siteConfig.url,
                  },
                  sameAs: socialLinks.map((link) => link.href),
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: absoluteUrl('/?q={search_term_string}'),
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Person',
                  name: siteConfig.authorName,
                  url: siteConfig.url,
                  sameAs: socialLinks.map((link) => link.href),
                  knowsAbout: [
                    'CTF writeups',
                    'ethical hacking',
                    'cybersecurity',
                    'HackTheBox',
                    'TryHackMe',
                    'CVE research',
                  ],
                },
              ],
            }),
          }}
        />
        <GlobalPopupAds />
        {children}
      </body>
    </html>
  );
}
