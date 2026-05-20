'use client';

import Link from 'next/link';
import { FileCode2, Flag, Home, Info, Mail, Menu, ShieldCheck, UserCog, X, type LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

const navItems: Array<{ href: string; label: string; icon: LucideIcon; iconOnly?: boolean }> = [
  { href: '/', label: 'Writeups', icon: Home },
  { href: '/about', label: 'About', icon: Info },
  { href: '/contact', label: 'Contact', icon: Mail },
  { href: '/privacy-policy', label: 'Privacy', icon: ShieldCheck },
  { href: '/admin', label: 'Admin', icon: UserCog, iconOnly: true },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [siteName, setSiteName] = useState('CTFlogs');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
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
      .catch(() => {
        // Keep defaults if public settings cannot be reached.
      });

    return () => controller.abort();
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-dracula-bg/80 backdrop-blur-md border-b border-dracula-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-dracula-line/60 bg-dracula-selection/25">
              {logoUrl ? <img src={logoUrl} alt={`${siteName} logo`} className="h-7 w-7 object-contain" /> : <FileCode2 className="h-6 w-6 text-dracula-fg" />}
              {!logoUrl && <Flag className="absolute -bottom-1 -right-1 h-4 w-4 text-dracula-green" />}
            </span>
            <span className="text-3xl font-bold leading-none tracking-tight">
              <span className="text-dracula-fg">{siteName.slice(0, 3)}</span>
              <span className="text-dracula-green">{siteName.slice(3) || 'logs'}</span>
            </span>
          </Link>

          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

                return (
                  <NavLink key={item.href} href={item.href} label={item.label} active={active} icon={Icon ? <Icon className="h-4 w-4" /> : undefined}>
                    {item.iconOnly ? <span className="sr-only">{item.label}</span> : <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-dracula-comment hover:text-dracula-fg hover:bg-dracula-selection transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-dracula-bg border-b border-dracula-line">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <MobileNavLink
                  key={item.href}
                  href={item.href}
                  active={active}
                  icon={Icon ? <Icon className="h-4 w-4" /> : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {item.iconOnly ? <span>{item.label}</span> : item.label}
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
}: {
  href: string;
  label: string;
  children: ReactNode;
  icon?: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active ? 'text-dracula-green bg-dracula-selection' : 'text-dracula-comment hover:text-dracula-fg'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  icon,
  active = false,
  onClick,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
        active ? 'text-dracula-green bg-dracula-selection' : 'text-dracula-comment hover:text-dracula-fg hover:bg-dracula-selection'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
