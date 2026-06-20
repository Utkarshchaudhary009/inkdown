import { db } from './dexie-db';

export async function saveToCache(owner: string, repo: string, path: string, content: string) {
  const fileId = `${owner}/${repo}/${path}`;
  const repoFullName = `${owner}/${repo}`;
  const existing = await db.cachedFiles.where('fileId').equals(fileId).first();
  
  if (existing && existing.id) {
    await db.cachedFiles.update(existing.id, { 
      content, 
      fetchedAt: Date.now() 
    });
  } else {
    await db.cachedFiles.add({ 
      fileId, 
      repoFullName, 
      filePath: path, 
      content, 
      fetchedAt: Date.now() 
    });
  }
}

export async function getCachedFileContent(fileId: string): Promise<string | null> {
  const cached = await db.cachedFiles.where('fileId').equals(fileId).first();
  return cached ? cached.content : null;
}

export async function getCachedFiles() {
  return await db.cachedFiles.toArray();
}
