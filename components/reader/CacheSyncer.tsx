'use client';

import { useEffect } from 'react';
import { saveToCache } from '@/lib/github-cache';
import { useRecentlyRead } from '@/lib/db-hooks';

interface CacheSyncerProps {
  owner: string;
  repo: string;
  path: string;
  content: string;
}

export function CacheSyncer({ owner, repo, path, content }: CacheSyncerProps) {
  const { addRecentlyRead } = useRecentlyRead();
  
  useEffect(() => {
    const fileId = `${owner}/${repo}/${path}`;
    const repoFullName = `${owner}/${repo}`;
    
    // Save the markdown content to IndexedDB for offline reading
    saveToCache(owner, repo, path, content).catch(console.error);
    
    // Update recently read documents
    addRecentlyRead(fileId, repoFullName, path).catch(console.error);
  }, [owner, repo, path, content, addRecentlyRead]);

  return null;
}
