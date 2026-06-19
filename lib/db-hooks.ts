import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Highlight, type Bookmark } from './dexie-db';

export function useReadingProgress(fileId: string) {
  const progress = useLiveQuery(
    () => db.readingProgress.where('fileId').equals(fileId).first(),
    [fileId]
  );

  const setProgress = async (scrollPercent: number) => {
    const existing = await db.readingProgress.where('fileId').equals(fileId).first();
    if (existing && existing.id) {
      await db.readingProgress.update(existing.id, { scrollPercent, lastReadAt: Date.now() });
    } else {
      await db.readingProgress.add({ fileId, scrollPercent, lastReadAt: Date.now() });
    }
  };

  return { progress, setProgress };
}

export function useHighlights(fileId: string) {
  const highlights = useLiveQuery(
    () => db.highlights.where('fileId').equals(fileId).toArray(),
    [fileId]
  ) || [];

  const addHighlight = async (highlightData: Omit<Highlight, 'id' | 'fileId' | 'createdAt' | 'syncStatus'>) => {
    await db.highlights.add({
      ...highlightData,
      fileId,
      syncStatus: 'pending',
      createdAt: Date.now()
    });
  };

  const removeHighlight = async (id: number) => {
    await db.highlights.delete(id);
  };

  return { highlights, addHighlight, removeHighlight };
}

export function useBookmarks(fileId: string) {
  const bookmarks = useLiveQuery(
    () => db.bookmarks.where('fileId').equals(fileId).toArray(),
    [fileId]
  ) || [];

  const addBookmark = async (bookmarkData: Omit<Bookmark, 'id' | 'fileId' | 'createdAt'>) => {
    await db.bookmarks.add({
      ...bookmarkData,
      fileId,
      createdAt: Date.now()
    });
  };

  const removeBookmark = async (id: number) => {
    await db.bookmarks.delete(id);
  };

  return { bookmarks, addBookmark, removeBookmark };
}

export function useSettings() {
  const settingsArray = useLiveQuery(() => db.settings.toArray());
  const settings = settingsArray?.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, unknown>) || {};

  const setSetting = async (key: string, value: unknown) => {
    await db.settings.put({ key, value });
  };

  return { settings, setSetting };
}

export function useRecentlyRead() {
  const recentlyRead = useLiveQuery(
    () => db.recentlyRead.orderBy('lastReadAt').reverse().toArray()
  ) || [];

  const addRecentlyRead = async (fileId: string, repoFullName: string, filePath: string) => {
    const existing = await db.recentlyRead.where('fileId').equals(fileId).first();
    if (existing && existing.id) {
      await db.recentlyRead.update(existing.id, { lastReadAt: Date.now() });
    } else {
      await db.recentlyRead.add({ fileId, repoFullName, filePath, lastReadAt: Date.now() });
    }
  };

  return { recentlyRead, addRecentlyRead };
}
