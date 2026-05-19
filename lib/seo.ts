import { Writeup } from '@/types';
import { writeupHref } from '@/lib/writeupRoutes';

export const siteConfig = {
  name: 'CTFlogs',
  authorName: 'Aathil Ducky',
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.aathilducky.com',
  title: 'CTFlogs - CTF Writeups, Challenge Solutions and Security Notes',
  description:
    'CTFlogs by Aathil Ducky is a searchable archive of CTF writeups, HackTheBox walkthroughs, TryHackMe notes, CVE research and practical ethical hacking challenge solutions.',
  keywords: [
    'Aathil Ducky',
    'AathilDucky',
    'Aathil Ducky portfolio',
    'CTF writeups',
    'CTF solutions',
    'CTF challenge walkthroughs',
    'HackTheBox writeups',
    'TryHackMe walkthroughs',
    'ethical hacking notes',
    'cybersecurity writeups',
    'pwn',
    'web exploitation',
    'reverse engineering',
    'binary exploitation',
    'privilege escalation',
    'CVE analysis',
  ],
};

export const socialLinks = [
  {
    label: 'Portfolio',
    href: 'https://www.aathilducky.com',
    username: 'aathilducky.com',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@aathilducky',
    username: '@aathilducky',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/aathil-ducky',
    username: 'Aathil Ducky',
  },
  {
    label: 'X',
    href: 'https://twitter.com/AathilDucky',
    username: '@AathilDucky',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/aathilducky',
    username: '@aathilducky',
  },
];

export function absoluteUrl(path = '/') {
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}

export function writeupUrl(writeup: Pick<Writeup, 'title' | 'slug'>) {
  return absoluteUrl(writeupHref(writeup));
}

export function writeupKeywords(writeup: Pick<Writeup, 'title' | 'category' | 'tags' | 'difficulty'>) {
  return Array.from(
    new Set([
      writeup.title,
      writeup.category,
      writeup.difficulty ?? '',
      ...writeup.tags,
      ...siteConfig.keywords,
    ].filter(Boolean)),
  );
}

export function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*_`|~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
