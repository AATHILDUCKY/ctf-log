import { Writeup } from '@/types';

export function slugifyWriteupTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function writeupHref(writeup: Pick<Writeup, 'id' | 'title' | 'slug'>) {
  const slug = writeup.slug?.trim() || slugifyWriteupTitle(writeup.title);
  return `/writeups/${writeup.id}/${slug}`;
}
