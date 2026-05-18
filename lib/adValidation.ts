import { AdInput, AdPlacement, AdStatus, AdType } from '@/types';

const adTypes: AdType[] = ['image', 'google', 'popup'];
const adStatuses: AdStatus[] = ['active', 'paused'];
const placements: AdPlacement[] = ['home-sidebar', 'home-feed', 'writeup-left', 'writeup-right', 'writeup-bottom', 'writeup-sidebar', 'popup'];

export function parseAdInput(value: Record<string, FormDataEntryValue | null>, image?: { url: string; size: number }): AdInput {
  const type = String(value.type ?? 'image') as AdType;
  const placement = String(value.placement ?? 'home-sidebar') as AdPlacement;
  const status = String(value.status ?? 'paused') as AdStatus;

  if (!adTypes.includes(type)) throw new Error('Choose a valid ad type.');
  if (!placements.includes(placement)) throw new Error('Choose a valid placement.');
  if (!adStatuses.includes(status)) throw new Error('Choose a valid status.');

  const title = String(value.title ?? '').trim();
  if (!title) throw new Error('Title is required.');

  const googleCode = String(value.googleCode ?? '').trim();
  const linkUrl = String(value.linkUrl ?? '').trim();
  const popupIntervalSeconds = Math.min(Math.max(Number(value.popupIntervalSeconds ?? 120) || 120, 30), 86400);

  if (type === 'google' && !googleCode) throw new Error('Google ad code is required.');
  if ((type === 'image' || type === 'popup') && !image?.url && !String(value.imageUrl ?? '').trim()) throw new Error('Upload an image ad.');
  if (type === 'popup' && !linkUrl) throw new Error('Popup ads require a click URL.');

  return {
    title,
    type,
    placement: type === 'popup' ? 'popup' : placement,
    status,
    imageUrl: image?.url ?? (String(value.imageUrl ?? '').trim() || undefined),
    imageSize: image?.size ?? (Number(value.imageSize || 0) || undefined),
    linkUrl: linkUrl || undefined,
    altText: String(value.altText ?? '').trim() || undefined,
    googleCode: googleCode || undefined,
    sponsorLabel: String(value.sponsorLabel ?? 'Sponsored').trim() || 'Sponsored',
    popupIntervalSeconds,
    sortOrder: Number(value.sortOrder ?? 0) || 0,
  };
}
