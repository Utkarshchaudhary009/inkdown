import Dexie, { type EntityTable } from 'dexie';

export interface CachedFile {
  id?: number;
  clerkId?: string;
  fileId: string; // typically repoFullName + '/' + path
  repoFullName: string;
  filePath: string;
  content: string;
  fetchedAt: number;
}

export interface ReadingProgress {
  id?: number;
  clerkId?: string;
  fileId: string;
  scrollPercent: number;
  lastReadAt: number;
}

export interface Highlight {
  id?: number;
  clerkId?: string;
  fileId: string;
  startOffset: number;
  endOffset: number;
  color: string;
  text: string;
  createdAt: number;
  syncStatus?: 'pending' | 'synced';
}

export interface Bookmark {
  id?: number;
  clerkId?: string;
  fileId: string;
  scrollPercent: number;
  label: string;
  createdAt: number;
}

export interface RecentlyRead {
  id?: number;
  clerkId?: string;
  fileId: string;
  repoFullName: string;
  filePath: string;
  lastReadAt: number;
}

export interface LikedFile {
  id?: number;
  clerkId?: string;
  fileId: string;
  repoFullName: string;
  filePath: string;
  likedAt: number;
}

export interface Setting {
  key: string;
  value: unknown;
}

const db = new Dexie('InkDownDB') as Dexie & {
  cachedFiles: EntityTable<CachedFile, 'id'>;
  readingProgress: EntityTable<ReadingProgress, 'id'>;
  highlights: EntityTable<Highlight, 'id'>;
  bookmarks: EntityTable<Bookmark, 'id'>;
  recentlyRead: EntityTable<RecentlyRead, 'id'>;
  likedFiles: EntityTable<LikedFile, 'id'>;
  settings: EntityTable<Setting, 'key'>;
};

db.version(1).stores({
  cachedFiles: '++id, fileId, repoFullName, filePath, fetchedAt',
  readingProgress: '++id, fileId, scrollPercent, lastReadAt',
  highlights: '++id, fileId, startOffset, endOffset, color, createdAt, syncStatus',
  bookmarks: '++id, fileId, scrollPercent, label, createdAt',
  recentlyRead: '++id, fileId, repoFullName, filePath, lastReadAt',
  likedFiles: '++id, fileId, repoFullName, filePath, likedAt',
  settings: 'key'
});

db.version(2).stores({
  cachedFiles: '++id, [clerkId+fileId], fileId, repoFullName, filePath, fetchedAt',
  readingProgress: '++id, [clerkId+fileId], fileId, scrollPercent, lastReadAt',
  highlights: '++id, [clerkId+fileId], fileId, startOffset, endOffset, color, createdAt, syncStatus',
  bookmarks: '++id, [clerkId+fileId], fileId, scrollPercent, label, createdAt',
  recentlyRead: '++id, [clerkId+fileId], fileId, repoFullName, filePath, lastReadAt',
  likedFiles: '++id, [clerkId+fileId], fileId, repoFullName, filePath, likedAt',
  settings: 'key'
});

export { db };
