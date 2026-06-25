import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Highlight, type Bookmark } from './dexie-db';

export function useReadingProgress(fileId: string) {
  const progress = useLiveQuery(
    () => db.readingProgress.where('fileId').equals(fileId).first(),
    [fileId]
  );

  const setProgress = useCallback(async (scrollPercent: number) => {
    const existing = await db.readingProgress.where('fileId').equals(fileId).first();
    if (existing && existing.id) {
      await db.readingProgress.update(existing.id, { scrollPercent, lastReadAt: Date.now() });
    } else {
      await db.readingProgress.add({ fileId, scrollPercent, lastReadAt: Date.now() });
    }
  }, [fileId]);

  return { progress, setProgress };
}

export function useHighlights(fileId: string) {
  const highlights = useLiveQuery(
    () => db.highlights.where('fileId').equals(fileId).toArray(),
    [fileId]
  ) || [];

  const addHighlight = useCallback(async (highlightData: Omit<Highlight, 'id' | 'fileId' | 'createdAt' | 'syncStatus'>) => {
    await db.highlights.add({
      ...highlightData,
      fileId,
      syncStatus: 'pending',
      createdAt: Date.now()
    });
  }, [fileId]);

  const removeHighlight = useCallback(async (id: number) => {
    await db.highlights.delete(id);
  }, []);

  return { highlights, addHighlight, removeHighlight };
}

export function useBookmarks(fileId: string) {
  const bookmarks = useLiveQuery(
    () => db.bookmarks.where('fileId').equals(fileId).toArray(),
    [fileId]
  ) || [];

  const addBookmark = useCallback(async (bookmarkData: Omit<Bookmark, 'id' | 'fileId' | 'createdAt'>) => {
    await db.bookmarks.add({
      ...bookmarkData,
      fileId,
      createdAt: Date.now()
    });
  }, [fileId]);

  const removeBookmark = useCallback(async (id: number) => {
    await db.bookmarks.delete(id);
  }, []);

  return { bookmarks, addBookmark, removeBookmark };
}

export function useSettings() {
  const settingsArray = useLiveQuery(() => db.settings.toArray());
  const settings = settingsArray?.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, unknown>) || {};

  const setSetting = useCallback(async (key: string, value: unknown) => {
    await db.settings.put({ key, value });
  }, []);

  return { settings, setSetting };
}

export function useRecentlyRead() {
  const recentlyRead = useLiveQuery(
    () => db.recentlyRead.orderBy('lastReadAt').reverse().toArray()
  ) || [];

  const addRecentlyRead = useCallback(async (fileId: string, repoFullName: string, filePath: string) => {
    const existing = await db.recentlyRead.where('fileId').equals(fileId).first();
    if (existing && existing.id) {
      await db.recentlyRead.update(existing.id, { lastReadAt: Date.now() });
    } else {
      await db.recentlyRead.add({ fileId, repoFullName, filePath, lastReadAt: Date.now() });
    }
  }, []);

  return { recentlyRead, addRecentlyRead };
}

export function useLikedFiles() {
  const likedFiles = useLiveQuery(
    () => db.likedFiles.orderBy('likedAt').reverse().toArray()
  ) || [];

  const toggleLike = useCallback(async (fileId: string, repoFullName: string, filePath: string) => {
    const existing = await db.likedFiles.where('fileId').equals(fileId).first();
    if (existing && existing.id) {
      await db.likedFiles.delete(existing.id);
      return false;
    } else {
      await db.likedFiles.add({ fileId, repoFullName, filePath, likedAt: Date.now() });
      return true;
    }
  }, []);

  return { likedFiles, toggleLike };
}
