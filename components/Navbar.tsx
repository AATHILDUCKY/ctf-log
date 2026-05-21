'use client';

import Link from 'next/link';
import { FileCode2, Flag, Home, Info, Mail, Menu, Newspaper, ShieldCheck, UserCog, X, type LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

const navItems: Array<{ href: string; label: string; icon: LucideIcon; iconOnly?: boolean; live?: boolean }> = [
  { href: '/', label: 'Writeups', icon: Home },
  { href: '/news', label: 'News', icon: Newspaper, live: true },
  { href: '/about', label: 'About', icon: Info },
  { href: '/contact', label: 'Contact', icon: Mail },
  { href: '/privacy-policy', label: 'Privacy', icon: ShieldCheck },
  { href: '/admin', label: 'Admin', icon: UserCog, iconOnly: true },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [siteName, setSiteName] = useState('CTFlogs');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/settings', { signal: controller.signal, cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload?.settings) return;
        setSiteName(payload.settings.siteName || 'CTFlogs');
        setLogoUrl(payload.settings.logoUrl || undefined);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dracula-bg/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-dracula-line/60'
          : 'bg-dracula-bg/80 backdrop-blur-md border-b border-dracula-line/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-dracula-line/60 bg-dracula-selection/30 group-hover:border-dracula-green/50 group-hover:bg-dracula-selection/50 transition-all duration-200">
              {logoUrl ? (
                <img src={logoUrl} alt={`${siteName} logo`} className="h-6 w-6 object-contain" />
              ) : (
                <FileCode2 className="h-5 w-5 text-dracula-fg" />
              )}
              {!logoUrl && (
                <Flag className="absolute -bottom-1 -right-1 h-3.5 w-3.5 text-dracula-green" />
              )}
            </span>
            <span className="text-2xl font-black leading-none tracking-tight">
              <span className="text-dracula-fg group-hover:text-dracula-fg/90 transition-colors">{siteName.slice(0, 3)}</span>
              <span className="text-dracula-green group-hover:text-dracula-green/90 transition-colors [text-shadow:0_0_20px_rgba(80,250,123,0.35)]">
                {siteName.slice(3) || 'logs'}
              </span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <NavLink key={item.href} href={item.href} label={item.label} active={active} live={item.live} icon={<Icon className="h-3.5 w-3.5" />}>
                  {item.iconOnly ? <span className="sr-only">{item.label}</span> : <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-dracula-comment hover:text-dracula-fg hover:bg-dracula-selection/50 transition-colors"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-dracula-line/40 bg-dracula-bg/98 backdrop-blur-xl">
          <div className="px-3 py-3 space-y-0.5">
            {navItems
              .filter((item) => !item.href.startsWith('/admin'))
              .map((item) => {
                const Icon = item.icon;
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

                return (
                  <MobileNavLink
                    key={item.href}
                    href={item.href}
                    active={active}
                    live={item.live}
                    icon={<Icon className="h-4 w-4" />}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </MobileNavLink>
                );
              })}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  label,
  children,
  icon,
  active = false,
  live = false,
}: {
  href: string;
  label: string;
  children: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  live?: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? 'text-dracula-green bg-dracula-green/8'
          : 'text-dracula-comment hover:text-dracula-fg hover:bg-dracula-selection/50'
      }`}
    >
      {active && (
        <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-dracula-green/70 to-transparent" />
      )}
      {icon}
      {children}
      {live && (
        <span className="relative flex h-1.5 w-1.5 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dracula-red opacity-80" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-dracula-red" />
        </span>
      )}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  icon,
  active = false,
  live = false,
  onClick,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  live?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? 'text-dracula-green bg-dracula-green/8 border border-dracula-green/20'
          : 'text-dracula-comment hover:text-dracula-fg hover:bg-dracula-selection/50'
      }`}
    >
      {icon}
      <span className="flex-1">{children}</span>
      {live && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-dracula-red">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dracula-red opacity-80" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-dracula-red" />
          </span>
          Live
        </span>
      )}
    </Link>
  );
}
