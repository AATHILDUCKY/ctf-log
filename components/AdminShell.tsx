'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { BarChart3, FileText, LayoutDashboard, LogOut, Megaphone, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/admin/writeups', label: 'Writeups', display: '/admin/writeups', icon: FileText },
  { href: '/admin/adds', label: 'Adds', display: '/admin/adds', icon: Megaphone },
  { href: '/admin/analytics', label: 'Analytics', display: '/admin/analytics', icon: BarChart3 },
  { href: '/admin/setting', label: 'Setting', display: '/admin/setting', icon: Settings },
];

export default function AdminShell({
  title,
  eyebrow,
  action,
  children,
}: {
  title: string;
  eyebrow: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [siteName, setSiteName] = useState('PwnTrends');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();

    void fetch('/api/settings', { signal: controller.signal, cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload?.settings) return;
        setSiteName(payload.settings.siteName || 'PwnTrends');
        setLogoUrl(payload.settings.logoUrl || undefined);
      })
      .catch(() => {
        // Ignore transient fetch errors and keep defaults.
      });

    return () => controller.abort();
  }, []);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <main className="min-h-screen bg-dracula-bg text-dracula-fg">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-dracula-line/40 bg-dracula-selection/15 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col p-4">
            <div className="mb-6 flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dracula-green/40 bg-dracula-green/10 text-dracula-green">
                {logoUrl ? (
                  <img src={logoUrl} alt={`${siteName} logo`} className="h-6 w-6 rounded object-contain" />
                ) : (
                  <LayoutDashboard className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-dracula-fg">{siteName}</p>
                <p className="text-xs text-dracula-comment">Admin dashboard</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? 'border-dracula-cyan/60 bg-dracula-cyan/10 text-dracula-cyan'
                        : 'border-transparent text-dracula-comment hover:border-dracula-line/50 hover:bg-dracula-selection/30 hover:text-dracula-fg'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </span>
                    <span className="truncate pl-2 text-[11px] font-mono text-dracula-line">{item.display}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto hidden space-y-2 pt-6 lg:block">
              <Link href="/" className="block rounded-md border border-dracula-line/50 px-3 py-2 text-sm text-dracula-comment hover:bg-dracula-selection/30 hover:text-dracula-fg">
                Public site
              </Link>
              <button
                onClick={logout}
                type="button"
                className="flex w-full items-center gap-2 rounded-md border border-dracula-line/50 px-3 py-2 text-sm text-dracula-comment hover:bg-dracula-selection/30 hover:text-dracula-fg"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-dracula-line/40 bg-dracula-bg/95 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-dracula-cyan">{eyebrow}</p>
                <h1 className="mt-1 text-2xl font-bold md:text-3xl">{title}</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/" className="rounded-md border border-dracula-line/60 px-3 py-2 text-sm text-dracula-comment transition-colors hover:bg-dracula-selection/30 hover:text-dracula-fg lg:hidden">
                  Public site
                </Link>
                <button
                  onClick={logout}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-dracula-line/60 px-3 py-2 text-sm text-dracula-comment transition-colors hover:bg-dracula-selection/30 hover:text-dracula-fg lg:hidden"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
                {action}
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
