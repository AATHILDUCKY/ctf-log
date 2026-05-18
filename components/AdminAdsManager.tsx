'use client';

import { FormEvent, type ReactNode, useMemo, useState } from 'react';
import { Edit3, ImagePlus, Save, Trash2 } from 'lucide-react';
import { Ad, AdInput, AdPlacement, AdStatus, AdType } from '@/types';

const placements: { value: AdPlacement; label: string }[] = [
  { value: 'home-sidebar', label: 'Home sidebar' },
  { value: 'home-feed', label: 'Home feed' },
  { value: 'writeup-left', label: 'Writeup left' },
  { value: 'writeup-right', label: 'Writeup right' },
  { value: 'writeup-bottom', label: 'Writeup bottom' },
  { value: 'writeup-sidebar', label: 'Writeup sidebar (legacy)' },
  { value: 'popup', label: 'Popup ad' },
];

const emptyDraft: AdInput = {
  title: '',
  type: 'image',
  placement: 'home-sidebar',
  status: 'paused',
  linkUrl: '',
  altText: '',
  googleCode: '',
  sponsorLabel: 'Sponsored',
  popupIntervalSeconds: 120,
  sortOrder: 0,
};

export default function AdminAdsManager({ initialAds }: { initialAds: Ad[] }) {
  const [ads, setAds] = useState(initialAds);
  const [draft, setDraft] = useState<AdInput>({ ...emptyDraft });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const groupedAds = useMemo(() => {
    return placements.map((placement) => ({
      ...placement,
      ads: ads.filter((ad) => ad.placement === placement.value),
    }));
  }, [ads]);

  function updateDraft<K extends keyof AdInput>(key: K, value: AdInput[K]) {
    setDraft((current) => {
      const next = { ...current, [key]: value };

      if (key === 'type' && value === 'popup') {
        next.placement = 'popup';
      }

      if (key === 'type' && value !== 'popup' && current.placement === 'popup') {
        next.placement = 'home-sidebar';
      }

      if (key === 'placement' && value === 'popup') {
        next.type = 'popup';
      }

      return next;
    });
  }

  function resetForm() {
    setSelectedId(null);
    setDraft({ ...emptyDraft });
    setImage(null);
    setMessage('');
  }

  function editAd(ad: Ad) {
    setSelectedId(ad.id);
    setDraft({
      title: ad.title,
      type: ad.type,
      placement: ad.placement,
      status: ad.status,
      imageUrl: ad.imageUrl,
      imageSize: ad.imageSize,
      linkUrl: ad.linkUrl ?? '',
      altText: ad.altText ?? '',
      googleCode: ad.googleCode ?? '',
      sponsorLabel: ad.sponsorLabel ?? 'Sponsored',
      popupIntervalSeconds: ad.popupIntervalSeconds ?? 120,
      sortOrder: ad.sortOrder,
    });
    setImage(null);
    setMessage('');
  }

  async function saveAd(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');

    const formData = new FormData();
    formData.set('title', draft.title);
    formData.set('type', draft.type);
    formData.set('placement', draft.placement);
    formData.set('status', draft.status);
    formData.set('linkUrl', draft.linkUrl ?? '');
    formData.set('altText', draft.altText ?? '');
    formData.set('googleCode', draft.googleCode ?? '');
    formData.set('sponsorLabel', draft.sponsorLabel ?? 'Sponsored');
    formData.set('sortOrder', String(draft.sortOrder ?? 0));
    formData.set('imageUrl', draft.imageUrl ?? '');
    formData.set('imageSize', String(draft.imageSize ?? ''));
    formData.set('popupIntervalSeconds', String(draft.popupIntervalSeconds ?? 120));
    if (image) formData.set('image', image);

    const response = await fetch(selectedId ? `/api/ads/${selectedId}` : '/api/ads', {
      method: selectedId ? 'PUT' : 'POST',
      body: formData,
    });

    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setMessage(payload.error ?? 'Unable to save ad.');
      return;
    }

    const saved = payload.ad as Ad;
    setAds((current) => {
      const exists = current.some((ad) => ad.id === saved.id);
      return exists ? current.map((ad) => (ad.id === saved.id ? saved : ad)) : [saved, ...current];
    });
    setSelectedId(saved.id);
    setDraft({
      title: saved.title,
      type: saved.type,
      placement: saved.placement,
      status: saved.status,
      imageUrl: saved.imageUrl,
      imageSize: saved.imageSize,
      linkUrl: saved.linkUrl ?? '',
      altText: saved.altText ?? '',
      googleCode: saved.googleCode ?? '',
      sponsorLabel: saved.sponsorLabel ?? 'Sponsored',
      popupIntervalSeconds: saved.popupIntervalSeconds ?? 120,
      sortOrder: saved.sortOrder,
    });
    setImage(null);
    setMessage(saved.status === 'active' ? 'Ad saved and active.' : 'Ad saved as paused.');
  }

  async function deleteAd(id: string) {
    const response = await fetch(`/api/ads/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      setMessage('Unable to delete ad.');
      return;
    }

    setAds((current) => current.filter((ad) => ad.id !== id));
    if (selectedId === id) resetForm();
    setMessage('Ad deleted.');
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.95fr)_420px]">
      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-4">
          {groupedAds.map((group) => (
            <div key={group.value} className="rounded-lg border border-dracula-line/40 bg-dracula-selection/10 p-4">
              <p className="text-xs font-bold uppercase text-dracula-comment">{group.label}</p>
              <p className="mt-2 text-2xl font-bold text-dracula-green">{group.ads.length}</p>
            </div>
          ))}
        </div>

        {message && <p className="rounded-md border border-dracula-line/40 bg-dracula-selection/20 px-4 py-3 text-sm text-dracula-cyan">{message}</p>}

        {groupedAds.map((group) => (
          <div key={group.value} className="rounded-lg border border-dracula-line/40 bg-dracula-selection/10">
            <div className="border-b border-dracula-line/30 px-4 py-3">
              <h2 className="font-bold">{group.label}</h2>
            </div>
            <div className="divide-y divide-dracula-line/20">
              {group.ads.map((ad) => (
                <div key={ad.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-dracula-fg">{ad.title}</p>
                      <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${ad.status === 'active' ? 'bg-dracula-green/10 text-dracula-green' : 'bg-dracula-orange/10 text-dracula-orange'}`}>
                        {ad.status}
                      </span>
                      <span className="rounded-md bg-dracula-selection/50 px-2 py-1 text-[10px] font-bold uppercase text-dracula-comment">{ad.type}</span>
                    </div>
                    <p className="mt-1 text-xs text-dracula-comment">
                      {ad.type === 'google'
                        ? 'Google ad code'
                        : `${ad.type === 'popup' ? `Popup every ${formatSeconds(ad.popupIntervalSeconds ?? 120)} - ` : ''}${ad.imageSize ? `${(ad.imageSize / 1024).toFixed(1)} KB WebP` : 'Image ad'} ${ad.linkUrl ? `- ${ad.linkUrl}` : ''}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => editAd(ad)} className="flex h-9 w-9 items-center justify-center rounded-md border border-dracula-line/40 text-dracula-cyan hover:bg-dracula-cyan/10" title="Edit ad">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => deleteAd(ad.id)} className="flex h-9 w-9 items-center justify-center rounded-md border border-dracula-red/50 text-dracula-red hover:bg-dracula-red/10" title="Delete ad">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {group.ads.length === 0 && <p className="p-4 text-sm text-dracula-comment">No ads in this placement.</p>}
            </div>
          </div>
        ))}
      </section>

      <form onSubmit={saveAd} className="h-fit rounded-lg border border-dracula-line/40 bg-dracula-selection/10 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-dracula-comment">Ad setup</p>
            <h2 className="text-xl font-bold">{selectedId ? 'Edit ad' : 'Create ad'}</h2>
          </div>
          <button type="button" onClick={resetForm} className="rounded-md border border-dracula-line/50 px-3 py-2 text-sm text-dracula-comment hover:bg-dracula-selection/30 hover:text-dracula-fg">
            Reset
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Title">
            <input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} className="admin-input" placeholder="Affiliate banner" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={draft.type} onChange={(event) => updateDraft('type', event.target.value as AdType)} className="admin-input">
                <option value="image">Image / affiliate</option>
                <option value="google">Google ads</option>
                <option value="popup">Popup ad</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value as AdStatus)} className="admin-input">
                <option value="paused">Paused</option>
                <option value="active">Active</option>
              </select>
            </Field>
          </div>

          <Field label="Placement">
            <select value={draft.placement} onChange={(event) => updateDraft('placement', event.target.value as AdPlacement)} className="admin-input">
              {placements.map((placement) => (
                <option key={placement.value} value={placement.value}>
                  {placement.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sponsor label">
              <input value={draft.sponsorLabel ?? ''} onChange={(event) => updateDraft('sponsorLabel', event.target.value)} className="admin-input" placeholder="Sponsored" />
            </Field>
            <Field label="Order">
              <input type="number" value={draft.sortOrder} onChange={(event) => updateDraft('sortOrder', Number(event.target.value))} className="admin-input" />
            </Field>
          </div>

          {draft.type === 'popup' && (
            <Field label="Popup repeat time in seconds">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="30"
                  max="86400"
                  step="1"
                  value={Math.max(30, Math.round(draft.popupIntervalSeconds ?? 120))}
                  onChange={(event) => updateDraft('popupIntervalSeconds', Math.max(30, Number(event.target.value) || 120))}
                  className="admin-input"
                />
                <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-dracula-comment">seconds</span>
              </div>
              <p className="mt-1 text-xs text-dracula-comment">Example: 60 shows every 1 minute, 120 every 2 minutes, 180 every 3 minutes.</p>
            </Field>
          )}

          {draft.type === 'image' || draft.type === 'popup' ? (
            <>
              <Field label={draft.type === 'popup' ? 'Popup click URL' : 'Affiliate / site link'}>
                <input value={draft.linkUrl ?? ''} onChange={(event) => updateDraft('linkUrl', event.target.value)} className="admin-input" placeholder="https://example.com/?ref=you" />
              </Field>
              <Field label="Alt text">
                <input value={draft.altText ?? ''} onChange={(event) => updateDraft('altText', event.target.value)} className="admin-input" placeholder="Describe the banner" />
              </Field>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-dracula-line/60 bg-dracula-bg/50 p-5 text-center hover:bg-dracula-selection/20">
                <ImagePlus className="mb-2 h-6 w-6 text-dracula-cyan" />
                <span className="text-sm font-bold text-dracula-fg">{image ? image.name : 'Upload image'}</span>
                <span className="mt-1 text-xs text-dracula-comment">Converted to WebP and kept under 30 KB</span>
                <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} className="hidden" />
              </label>
              {draft.imageUrl && !image && <img src={draft.imageUrl} alt={draft.altText || draft.title} className="max-h-40 w-full rounded-md border border-dracula-line/40 object-cover" />}
            </>
          ) : (
            <Field label="Google ad code">
              <textarea
                value={draft.googleCode ?? ''}
                onChange={(event) => updateDraft('googleCode', event.target.value)}
                className="admin-input min-h-44 resize-y font-mono"
                placeholder="<ins class='adsbygoogle' ...></ins><script>...</script>"
              />
            </Field>
          )}

          <button type="submit" disabled={isSaving} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-dracula-purple px-3 py-2 text-sm font-bold text-dracula-bg disabled:opacity-60">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save ad'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-dracula-comment">{label}</span>
      {children}
    </label>
  );
}

function formatSeconds(seconds: number) {
  const safeSeconds = Math.max(30, Math.round(seconds));
  return `${safeSeconds} sec${safeSeconds === 1 ? '' : 's'}`;
}
