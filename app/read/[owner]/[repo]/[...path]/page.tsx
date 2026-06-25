"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getFileContent } from "@/lib/github";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { calculateReadingTime, extractPlainText } from "@/lib/reading-utils";
import { ReaderLayout } from "@/components/reader/ReaderLayout";
import { SettingsPanel } from "@/components/reader/SettingsPanel";
import { BookmarkPanel } from "@/components/reader/BookmarkPanel";
import { AutoScroller } from "@/components/reader/AutoScroller";
import { SearchOverlay } from "@/components/reader/SearchOverlay";
import { TTSController } from "@/components/reader/TTSController";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/dexie-db";
import { useRecentlyRead } from "@/lib/db-hooks";

interface ReaderPageProps {
  params: Promise<{
    owner: string;
    repo: string;
    path: string[];
  }>;
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const { owner, repo, path } = use(params);
  const filePath = path.join("/");
  const fileId = `${owner}/${repo}/${filePath}`;
  
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  const { addRecentlyRead } = useRecentlyRead();

  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function calcTime() {
      if (!content) return;
      try {
        const text = await extractPlainText(content);
        const time = await calculateReadingTime(text);
        if (isMounted) setReadingTime(time);
      } catch (err) {
        console.error("Failed to calculate reading time", err);
      }
    }
    calcTime();
    return () => { isMounted = false; };
  }, [content]);

  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      try {
        const cached = await db.cachedFiles.where('fileId').equals(fileId).first();
        if (cached && isMounted) {
          setContent(cached.content);
          setIsLoading(false);
        }

        const freshContent = await getFileContent(owner, repo, filePath);
        
        if (isMounted) {
          if (!cached || cached.content !== freshContent) {
            setContent(freshContent);
            if (cached && cached.id) {
              await db.cachedFiles.update(cached.id, { content: freshContent, fetchedAt: Date.now() });
            } else {
              await db.cachedFiles.add({ fileId, repoFullName: `${owner}/${repo}`, filePath, content: freshContent, fetchedAt: Date.now() });
            }
          }
          setIsOffline(false);
          setIsLoading(false);
          addRecentlyRead(fileId, `${owner}/${repo}`, filePath);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setIsOffline(true);
          const cached = await db.cachedFiles.where('fileId').equals(fileId).first();
          if (cached) {
            if (!content) setContent(cached.content);
            addRecentlyRead(fileId, `${owner}/${repo}`, filePath);
          } else {
            setError("Failed to load file content and no offline cache is available.");
          }
          setIsLoading(false);
        }
      }
    }
    
    loadContent();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, owner, repo, filePath]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center pt-20 px-4">
         <Skeleton className="h-8 w-[200px] mb-8" />
         <Skeleton className="h-6 w-full max-w-2xl mb-4" />
         <Skeleton className="h-6 w-full max-w-2xl mb-4" />
         <Skeleton className="h-6 w-3/4 max-w-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4 flex-col gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive text-center max-w-md">{error}</p>
        <Link href="/library" className="text-primary hover:underline">Return to Library</Link>
      </div>
    );
  }


  const fileName = path[path.length - 1];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative">
      <SearchOverlay />
      
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-[720px] mx-auto flex items-center justify-between px-4 h-14">
          <Link 
            href={`/library`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 shrink-0"
            aria-label="Back to library"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <div className="flex flex-col items-center justify-center min-w-0 px-2">
            <h1 className="text-sm font-semibold truncate w-full text-center max-w-[150px] sm:max-w-[300px]">
              {fileName}
            </h1>
            <span className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
              {isOffline && <span title="Offline mode"><AlertCircle className="w-3 h-3 text-amber-500" /></span>}
              {readingTime} min read
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <BookmarkPanel fileId={fileId} />
            <SettingsPanel />
          </div>
        </div>
      </header>

      <ReaderLayout fileId={fileId}>
        <MarkdownRenderer content={content} />
      </ReaderLayout>
      
      <AutoScroller />
      <TTSController content={content} />
    </div>
  );
}
