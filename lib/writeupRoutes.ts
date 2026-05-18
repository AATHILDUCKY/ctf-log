import { Writeup } from '@/types';

export function slugifyWriteupTitle(title: string) {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
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
