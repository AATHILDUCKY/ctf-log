'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Globe2,
  Instagram,
  Linkedin,
  Search,
  ShieldAlert,
  Terminal,
  Twitter,
  Youtube,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import WriteupCard from '@/components/WriteupCard';
import AdSlot from '@/components/AdSlot';
import { Ad, WriteupListItem } from '@/types';
import { siteConfig, socialLinks } from '@/lib/seo';

const POSTS_PER_PAGE = 10;

export default function Dashboard({
  writeups: initialWriteups,
  ads = [],
  challengeTracks = [],
  initialSearchQuery = '',
  initialTotal,
  initialPage = 1,
  pageSize = POSTS_PER_PAGE,
  initialStats,
}: {
  writeups: WriteupListItem[];
  ads?: Ad[];
  challengeTracks?: string[];
  initialSearchQuery?: string;
  initialTotal: number;
  initialPage?: number;
  pageSize?: number;
  initialStats: { totalWriteups: number; totalViews: number };
}) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [visibleWriteups, setVisibleWriteups] = useState(initialWriteups);
  const [totalResults, setTotalResults] = useState(initialTotal);
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(false);

  const categories: (string | 'All')[] = ['All', ...(challengeTracks.length > 0 ? challengeTracks : ['CTF', 'HackTheBox', 'TryHackMe', 'VulnHub', 'Bug Bounty', 'CVE'])];
  const sidebarAds = ads.filter((ad) => ad.placement === 'home-sidebar');
  const feedAds = ads.filter((ad) => ad.placement === 'home-feed').slice(0, 1);
  const socialIconMap = {
    Portfolio: Globe2,
    YouTube: Youtube,
    LinkedIn: Linkedin,
    X: Twitter,
    Instagram,
  };

  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const pageStart = (currentPage - 1) * pageSize;

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(pageSize),
      });

      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedCategory !== 'All') params.set('category', selectedCategory);

      setIsLoading(true);
      void fetch(`/api/writeups?${params.toString()}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Search failed'))))
        .then((payload: { writeups: WriteupListItem[]; total: number; stats?: { totalWriteups: number; totalViews: number } }) => {
          setVisibleWriteups(payload.writeups);
          setTotalResults(payload.total);
          if (payload.stats) setStats(payload.stats);
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            setVisibleWriteups([]);
            setTotalResults(0);
          }
        })
        .finally(() => setIsLoading(false));
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [searchQuery, selectedCategory, currentPage, pageSize]);

  useEffect(() => {
    const refreshStats = () => {
      void fetch('/api/writeups/stats')
        .then((response) => (response.ok ? response.json() : null))
        .then((payload: { totalWriteups: number; totalViews: number } | null) => {
          if (!payload) return;
          setStats(payload);
        })
        .catch(() => {
          // Ignore transient stat refresh failures.
        });
    };

    const interval = window.setInterval(refreshStats, 15000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-dracula-bg text-dracula-fg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          key="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col lg:flex-row gap-12"
        >
              <aside className="w-full lg:w-80 shrink-0 space-y-8">
                <section className="bg-dracula-selection/20 p-6 rounded-2xl border border-dracula-line/50">
                  <h3 className="text-sm font-bold text-dracula-comment uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Search className="w-4 h-4 text-dracula-purple" />
                    Quick Search
                  </h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search exploits..."
                      value={searchQuery}
                      onChange={(event) => {
                        setCurrentPage(1);
                        setSearchQuery(event.target.value);
                      }}
                      className="w-full bg-dracula-selection/50 border border-dracula-line rounded-xl py-2 px-4 focus:outline-none focus:border-dracula-purple text-dracula-fg text-sm transition-colors"
                    />
                  </div>
                </section>

                <section className="bg-dracula-selection/20 p-6 rounded-2xl border border-dracula-line/50">
                  <h3 className="text-sm font-bold text-dracula-comment uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-dracula-cyan" />
                    Challenge Tracks
                  </h3>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setCurrentPage(1);
                          setSelectedCategory(category);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                          selectedCategory === category
                            ? 'bg-dracula-purple text-dracula-bg shadow-lg shadow-dracula-purple/20'
                            : 'text-dracula-comment hover:text-dracula-fg hover:bg-dracula-selection/50'
                        }`}
                      >
                        {category}
                        {selectedCategory === category && <div className="w-1.5 h-1.5 bg-dracula-bg rounded-full" />}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-dracula-purple/5 p-6 rounded-2xl border border-dracula-purple/20">
                  <h3 className="text-sm font-bold text-dracula-purple uppercase tracking-widest mb-4">Network Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dracula-bg/40 p-3 rounded-xl border border-dracula-line/30">
                      <div className="text-xl font-bold text-dracula-green">{stats.totalWriteups}</div>
                      <div className="text-[10px] text-dracula-comment uppercase font-bold">Writeups</div>
                    </div>
                    <div className="bg-dracula-bg/40 p-3 rounded-xl border border-dracula-line/30">
                      <div className="text-xl font-bold text-dracula-cyan">{formatCompactNumber(stats.totalViews)}</div>
                      <div className="text-[10px] text-dracula-comment uppercase font-bold">Views</div>
                    </div>
                  </div>
                </section>

                <section className="bg-dracula-selection/20 p-6 rounded-2xl border border-dracula-line/50">
                  <h3 className="text-sm font-bold text-dracula-comment uppercase tracking-widest mb-4">Connect with Aathil</h3>
                  <div className="space-y-2">
                    {socialLinks.map((link) => {
                      const Icon = socialIconMap[link.label as keyof typeof socialIconMap] ?? ExternalLink;

                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer me"
                          aria-label={`Visit ${siteConfig.authorName} on ${link.label}`}
                          className="group flex items-center justify-between gap-3 border border-dracula-line/30 bg-dracula-bg/30 px-3 py-2 text-sm text-dracula-comment transition-colors hover:border-dracula-purple hover:text-dracula-fg"
                        >
                          <span className="inline-flex min-w-0 items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0 text-dracula-purple transition-colors group-hover:text-dracula-green" />
                            <span className="min-w-0">
                              <span className="block font-bold text-dracula-fg">{link.label}</span>
                              <span className="block truncate text-xs font-mono">{link.username}</span>
                            </span>
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        </a>
                      );
                    })}
                  </div>
                </section>

                <AdSlot ads={sidebarAds} />
              </aside>

              <div className="flex-1 space-y-12 min-w-0">
                <section className="space-y-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dracula-selection border border-dracula-purple/30 text-dracula-purple text-xs font-medium mb-2"
                  >
                    <Terminal className="w-3 h-3" />
                    Security Knowledge Base
                  </motion.div>
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-dracula-fg">
                    CTF{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-dracula-purple via-dracula-pink to-dracula-cyan">Writeup Hub</span>
                  </h1>
                  <p className="text-dracula-comment max-w-2xl text-base md:text-lg">
                    Comprehensive writeups for ethical hackers. Deep dives into the latest vulnerabilities and CTF tactics.
                  </p>
                </section>

                <div className="flex items-center justify-between border-b border-dracula-line/30 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-dracula-green rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-dracula-comment uppercase tracking-widest">Latest Discoveries</span>
                  </div>
                  <span className="text-xs text-dracula-line font-mono uppercase">
                    {isLoading
                      ? 'Searching...'
                      : `Showing ${totalResults === 0 ? 0 : pageStart + 1}-${Math.min(pageStart + pageSize, totalResults)} of ${totalResults}`}
                  </span>
                </div>

                <section className="space-y-4">
                  {visibleWriteups.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {visibleWriteups.map((writeup, index) => (
                        <div key={writeup.id} className="space-y-4">
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <WriteupCard writeup={writeup} />
                          </motion.div>
                          {index === 1 && <AdSlot ads={feedAds} />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed border-dracula-line rounded-3xl">
                      <ShieldAlert className="w-12 h-12 text-dracula-comment mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-dracula-fg">No records match your query</h3>
                      <p className="text-dracula-comment mt-2">Adjust your filters or clear search to find more writeups</p>
                    </div>
                  )}
                </section>

                {totalPages > 1 && (
                  <div className="flex flex-col gap-3 border-t border-dracula-line/30 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs font-mono uppercase text-dracula-line">
                      Page {currentPage} / {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        className="inline-flex items-center gap-2 border border-dracula-line/50 px-3 py-2 text-sm font-bold text-dracula-comment transition-colors hover:border-dracula-cyan hover:text-dracula-fg disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        className="inline-flex items-center gap-2 border border-dracula-line/50 px-3 py-2 text-sm font-bold text-dracula-comment transition-colors hover:border-dracula-cyan hover:text-dracula-fg disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
        </motion.div>
      </main>

      <footer className="border-t border-dracula-line mt-20 py-12 bg-dracula-selection/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ShieldAlert className="w-6 h-6 text-dracula-green" />
            <span className="text-lg font-bold text-dracula-fg">CTFlogs</span>
          </div>
          <p className="text-dracula-comment text-sm mb-8">
            Built by Aathil Ducky for security enthusiasts and ethical hackers. <br />
            Documenting the world of vulnerabilities, one writeup at a time.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-dracula-comment">
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
        </div>
      </footer>
    </div>
  );
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
