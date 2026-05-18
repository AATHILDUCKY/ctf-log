'use client';

import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { Ad } from '@/types';

export default function AdSlot({ ads, className = '' }: { ads: Ad[]; className?: string }) {
  if (ads.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {ads.map((ad) => (
        <AdItem key={ad.id} ad={ad} />
      ))}
    </div>
  );
}

function AdItem({ ad }: { ad: Ad }) {
  if (ad.type === 'google') {
    return <GoogleAd ad={ad} />;
  }

  const image = (
    <img
      src={ad.imageUrl}
      alt={ad.altText || ad.title}
      loading="lazy"
      className="block w-full rounded-md border border-dracula-line/30 object-cover"
    />
  );

  return (
    <aside className="rounded-lg border border-dracula-line/40 bg-dracula-selection/10 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-dracula-comment">{ad.sponsorLabel || 'Sponsored'}</span>
        {ad.linkUrl && <ExternalLink className="h-3.5 w-3.5 text-dracula-line" />}
      </div>
      {ad.linkUrl ? (
        <a href={ad.linkUrl} target="_blank" rel="noreferrer sponsored noopener" className="block transition-opacity hover:opacity-90">
          {image}
        </a>
      ) : (
        image
      )}
    </aside>
  );
}

function GoogleAd({ ad }: { ad: Ad }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !ad.googleCode) return;

    ref.current.innerHTML = ad.googleCode;
    const scripts = Array.from(ref.current.querySelectorAll('script'));

    for (const script of scripts) {
      const nextScript = document.createElement('script');
      for (const attribute of Array.from(script.attributes)) {
        nextScript.setAttribute(attribute.name, attribute.value);
      }
      nextScript.text = script.text;
      script.replaceWith(nextScript);
    }
  }, [ad.googleCode]);

  return (
    <aside className="rounded-lg border border-dracula-line/40 bg-dracula-selection/10 p-3">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-dracula-comment">{ad.sponsorLabel || 'Sponsored'}</div>
      <div ref={ref} className="min-h-20 overflow-hidden rounded-md" />
    </aside>
  );
}
