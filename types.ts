export type Category = string;

export type WriteupStatus = 'public' | 'private';

export type AdType = 'image' | 'google' | 'popup';
export type AdStatus = 'active' | 'paused';
export type AdPlacement = 'home-sidebar' | 'home-feed' | 'writeup-left' | 'writeup-right' | 'writeup-bottom' | 'writeup-sidebar' | 'popup';

export interface Writeup {
  id: string;
  slug?: string;
  title: string;
  category: Category;
  tags: string[];
  author: string;
  date: string;
  summary: string;
  content: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Insane';
  views?: number;
  wordCount?: number;
  readingTimeMinutes?: number;
  status: WriteupStatus;
  createdAt: string;
  updatedAt: string;
}

export type WriteupListItem = Omit<Writeup, 'content'>;

export type WriteupInput = Omit<Writeup, 'id' | 'createdAt' | 'updatedAt' | 'views'>;

export interface Ad {
  id: string;
  title: string;
  type: AdType;
  placement: AdPlacement;
  status: AdStatus;
  imageUrl?: string;
  imageSize?: number;
  linkUrl?: string;
  altText?: string;
  googleCode?: string;
  sponsorLabel?: string;
  popupIntervalSeconds?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type AdInput = Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl' | 'imageSize'> & {
  imageUrl?: string;
  imageSize?: number;
};

export interface SiteSettings {
  siteName: string;
  challengeTracks?: string[];
  logoUrl?: string;
  logoSize?: number;
  updatedAt: string;
}
