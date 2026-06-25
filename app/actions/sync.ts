'use server';

import { db } from '@/lib/db';
import { readingProgress, highlights, bookmarks } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, sql } from 'drizzle-orm';

const findProgressQuery = db
  .select({ id: readingProgress.id, updatedAt: readingProgress.updatedAt })
  .from(readingProgress)
  .where(
    and(
      eq(readingProgress.clerkId, sql.placeholder('userId')),
      eq(readingProgress.repoFullName, sql.placeholder('repoFullName')),
      eq(readingProgress.filePath, sql.placeholder('filePath'))
    )
  )
  .prepare('find_progress');

const findBookmarkQuery = db
  .select({ id: bookmarks.id })
  .from(bookmarks)
  .where(
    and(
      eq(bookmarks.clerkId, sql.placeholder('userId')),
      eq(bookmarks.repoFullName, sql.placeholder('repoFullName')),
      eq(bookmarks.filePath, sql.placeholder('filePath')),
      eq(bookmarks.scrollPercentage, sql.placeholder('scrollPercentage'))
    )
  )
  .prepare('find_bookmark');

function parseFileId(fileId: string) {
  const parts = fileId.split('/');
  if (parts.length < 3) {
    throw new Error('Invalid fileId format');
  }
  const repoFullName = `${parts[0]}/${parts[1]}`;
  const filePath = parts.slice(2).join('/');
  return { repoFullName, filePath };
}

export async function syncReadingProgress(progressData: { fileId: string; scrollPercent: number; lastReadAt: number }[]) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  for (const progress of progressData) {
    const { repoFullName, filePath } = parseFileId(progress.fileId);
    
    const results = await findProgressQuery.execute({ userId, repoFullName, filePath });
    const existing = results[0];

    if (existing) {
      if (progress.lastReadAt > existing.updatedAt.getTime()) {
        await db.update(readingProgress)
          .set({ 
            scrollPercentage: progress.scrollPercent, 
            updatedAt: new Date(progress.lastReadAt) 
          })
          .where(and(eq(readingProgress.id, existing.id), eq(readingProgress.clerkId, userId)));
      }
    } else {
      await db.insert(readingProgress).values({
        clerkId: userId,
        repoFullName,
        filePath,
        scrollPercentage: progress.scrollPercent,
        updatedAt: new Date(progress.lastReadAt),
      });
    }
  }
  return { success: true };
}

export async function syncHighlights(highlightsData: { fileId: string; text: string; color: string; startOffset: number; endOffset: number; createdAt: number }[]) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  for (const item of highlightsData) {
    const { repoFullName, filePath } = parseFileId(item.fileId);
    
    // For simplicity, we just insert pending highlights.
    // In a full implementation we'd check for duplicates or use a client-generated UUID.
    await db.insert(highlights).values({
      clerkId: userId,
      repoFullName,
      filePath,
      text: item.text,
      color: item.color,
      serializedRange: JSON.stringify({ startOffset: item.startOffset, endOffset: item.endOffset }),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(),
    });
  }
  return { success: true };
}

export async function syncBookmarks(bookmarksData: { fileId: string; scrollPercent: number; label?: string; createdAt: number }[]) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  for (const item of bookmarksData) {
    const { repoFullName, filePath } = parseFileId(item.fileId);
    
    // Check if bookmark exists
    const results = await findBookmarkQuery.execute({ userId, repoFullName, filePath, scrollPercentage: item.scrollPercent });
    const existing = results[0];

    if (!existing) {
      await db.insert(bookmarks).values({
        clerkId: userId,
        repoFullName,
        filePath,
        scrollPercentage: item.scrollPercent,
        label: item.label,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(),
      });
    }
  }
  return { success: true };
}
