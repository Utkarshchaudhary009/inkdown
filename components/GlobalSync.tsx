'use client';

import { useEffect } from 'react';
import { db } from '@/lib/dexie-db';
import { syncReadingProgress, syncHighlights, syncBookmarks } from '@/app/actions/sync';
import { useAuth } from '@clerk/nextjs';

export function GlobalSync() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const handleSync = async () => {
      try {
        const progresses = await db.readingProgress.toArray();
        if (progresses.length > 0) {
          await syncReadingProgress(progresses);
        }

        const pendingHighlights = await db.highlights.where('syncStatus').equals('pending').toArray();
        if (pendingHighlights.length > 0) {
          await syncHighlights(pendingHighlights);
          // Mark as synced locally
          for (const h of pendingHighlights) {
            if (h.id) await db.highlights.update(h.id, { syncStatus: 'synced' });
          }
        }

        const bookmarks = await db.bookmarks.toArray();
        if (bookmarks.length > 0) {
          await syncBookmarks(bookmarks);
        }

      } catch (err) {
        console.error('Background sync failed:', err);
      }
    };

    if (navigator.onLine) {
      handleSync();
    }

    window.addEventListener('online', handleSync);
    const interval = setInterval(handleSync, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('online', handleSync);
      clearInterval(interval);
    };
  }, [isLoaded, isSignedIn]);

  return null;
}
