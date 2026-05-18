import { Writeup } from '@/types';

export function slugifyWriteupTitle(title: string) {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function writeupHref(writeup: Pick<Writeup, 'title' | 'slug'>) {
  const slug = writeup.slug?.trim() || slugifyWriteupTitle(writeup.title);
  return `/writeups/${slug}`;
}
