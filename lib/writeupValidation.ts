import { WriteupInput } from '@/types';
import { getSiteSettings } from '@/lib/db/settings';

const difficulties = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Insane'] as const;

export function parseWriteupInput(value: unknown): WriteupInput {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid writeup payload.');
  }

  const input = value as Partial<WriteupInput>;
  const rawTags = (value as { tags?: unknown }).tags;
  const tags = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === 'string'
      ? rawTags.split(',')
      : [];

  if (!input.title?.trim()) throw new Error('Title is required.');
  if (!input.author?.trim()) throw new Error('Author is required.');
  if (!input.summary?.trim()) throw new Error('Summary is required.');
  if (!input.content?.trim()) throw new Error('Content is required.');
  if (!input.date?.trim()) throw new Error('Date is required.');
  const rawCategory = String(input.category ?? '').trim();
  if (!rawCategory) throw new Error('Choose a valid category.');

  const tracks = getSiteSettings().challengeTracks ?? [];
  const matchedTrack = tracks.find((t) => t.toLowerCase() === rawCategory.toLowerCase());
  if (tracks.length > 0 && !matchedTrack) {
    throw new Error('Category must match one of the configured challenge tracks.');
  }
  const normalizedCategory = matchedTrack ?? rawCategory;
  if (input.status !== 'public' && input.status !== 'private') throw new Error('Choose a valid visibility.');

  return {
    title: input.title,
    slug: input.slug,
    category: normalizedCategory,
    tags: tags.map(String),
    author: input.author,
    date: input.date,
    summary: input.summary,
    content: input.content,
    difficulty: input.difficulty && difficulties.includes(input.difficulty) ? input.difficulty : undefined,
    status: input.status,
  };
}
