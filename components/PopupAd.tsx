'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Ad } from '@/types';

const DEFAULT_INTERVAL_SECONDS = 120;
const MIN_INTERVAL_SECONDS = 30;

export default function PopupAd({ ads }: { ads: Ad[] }) {
  const popupAds = useMemo(
    () => ads.filter((ad) => ad.status === 'active' && ad.type === 'popup' && ad.imageUrl && ad.linkUrl),
    [ads],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const activeAd = popupAds[activeIndex % Math.max(popupAds.length, 1)];

  useEffect(() => {
    if (popupAds.length === 0 || visible) return;

    const intervalSeconds = Math.max(
      MIN_INTERVAL_SECONDS,
      Number(activeAd?.popupIntervalSeconds ?? DEFAULT_INTERVAL_SECONDS) || DEFAULT_INTERVAL_SECONDS,
    );
    const timer = window.setTimeout(() => setVisible(true), intervalSeconds * 1000);

    return () => window.clearTimeout(timer);
  }, [activeAd?.popupIntervalSeconds, popupAds.length, visible]);

  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePopup();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible]);

  if (!activeAd || !visible) return null;

  function closePopup() {
    setVisible(false);
    setActiveIndex((index) => (index + 1) % popupAds.length);
  }

  function openAd() {
    if (!activeAd?.linkUrl) return closePopup();
    window.open(activeAd.linkUrl, '_blank', 'noopener,noreferrer');
    closePopup();
  }

  function closeOnly(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    closePopup();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={activeAd.title}
      onClick={openAd}
      className="fixed inset-0 z-[90] flex cursor-pointer items-center justify-center bg-dracula-bg/85 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl border border-dracula-green/50 bg-dracula-bg p-3 shadow-2xl shadow-dracula-green/10">
        <button
          type="button"
          onClick={closeOnly}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center border border-dracula-line/60 bg-dracula-bg/90 text-dracula-comment transition-colors hover:border-dracula-red hover:text-dracula-red"
          aria-label="Close popup ad"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-2 flex items-center justify-between gap-4 pr-12 text-[10px] font-bold uppercase tracking-widest text-dracula-comment">
          <span>{activeAd.sponsorLabel || 'Sponsored'}</span>
          <span className="inline-flex items-center gap-1 text-dracula-green">
            Opens advertiser
            <ExternalLink className="h-3 w-3" />
          </span>
        </div>

        <img
          src={activeAd.imageUrl}
          alt={activeAd.altText || activeAd.title}
          className="block max-h-[75vh] w-full border border-dracula-line/40 object-contain"
        />
      </div>
    </div>
  );
}
