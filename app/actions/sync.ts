'use server';

import { db } from '@/lib/db';
import { readingProgress, highlights, bookmarks } from '@/lib/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

function parseFileId(fileId: string) {
  const parts = fileId.split('/');
  const repoFullName = `${parts[0]}/${parts[1]}`;
  const filePath = parts.slice(2).join('/');
  return { repoFullName, filePath };
}

export async function syncReadingProgress(progressData: { fileId: string; scrollPercent: number; lastReadAt: number }[]) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  for (const progress of progressData) {
    const { repoFullName, filePath } = parseFileId(progress.fileId);
    
    const existing = await db.query.readingProgress.findFirst({
      where: and(
        eq(readingProgress.clerkId, userId),
        eq(readingProgress.repoFullName, repoFullName),
        eq(readingProgress.filePath, filePath)
      )
    });

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
    const existing = await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.clerkId, userId),
        eq(bookmarks.repoFullName, repoFullName),
        eq(bookmarks.filePath, filePath),
        eq(bookmarks.scrollPercentage, item.scrollPercent)
      )
    });

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
