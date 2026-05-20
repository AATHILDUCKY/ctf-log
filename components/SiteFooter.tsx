'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ExternalLink, Globe2, Instagram, Linkedin, ShieldAlert, Twitter, Youtube } from 'lucide-react';
import { siteConfig, socialLinks } from '@/lib/seo';

const footerLinks = [
  { href: '/', label: 'Writeups' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-and-conditions', label: 'Terms' },
];

export default function SiteFooter() {
  const [siteName, setSiteName] = useState(siteConfig.name);
  const socialIconMap = {
    Portfolio: Globe2,
    YouTube: Youtube,
    LinkedIn: Linkedin,
    X: Twitter,
    Instagram,
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/settings', { signal: controller.signal, cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.settings?.siteName) setSiteName(payload.settings.siteName);
      })
      .catch(() => {
        // Keep configured site name.
      });

    return () => controller.abort();
  }, []);

  return (
    <footer className="border-t border-dracula-line bg-dracula-selection/20 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1.3fr_0.8fr_0.9fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-dracula-green" />
            <span className="text-lg font-bold text-dracula-fg">{siteName}</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-dracula-comment">
            Built by {siteConfig.authorName} for security enthusiasts and ethical hackers. Documenting vulnerabilities, CTF tactics and research notes with practical context.
          </p>
        </div>

        <nav aria-label="Footer" className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-dracula-cyan">Site</h2>
          <div className="grid gap-2 text-sm">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-dracula-comment transition-colors hover:text-dracula-fg">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-dracula-cyan">Connect</h2>
          <div className="flex flex-wrap gap-2 text-dracula-comment">
            {socialLinks.map((link) => {
              const Icon = socialIconMap[link.label as keyof typeof socialIconMap] ?? ExternalLink;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer me"
                  title={`${siteConfig.authorName} on ${link.label}`}
                  aria-label={`Visit ${siteConfig.authorName} on ${link.label}`}
                  className="inline-flex h-10 w-10 items-center justify-center border border-dracula-line/50 transition-colors hover:border-dracula-purple hover:bg-dracula-selection hover:text-dracula-fg"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
          <p className="text-xs text-dracula-line">&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
