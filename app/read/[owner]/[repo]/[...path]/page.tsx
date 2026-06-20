import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getFileContent } from "@/lib/github";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { calculateReadingTime, extractPlainText } from "@/lib/reading-utils";
import { ReaderLayout } from "@/components/reader/ReaderLayout";
import { SettingsPanel } from "@/components/reader/SettingsPanel";
import { CacheSyncer } from "@/components/reader/CacheSyncer";
import { BookmarkPanel } from "@/components/reader/BookmarkPanel";
import { AutoScroller } from "@/components/reader/AutoScroller";
import { SearchOverlay } from "@/components/reader/SearchOverlay";
import { TTSController } from "@/components/reader/TTSController";

interface ReaderPageProps {
  params: Promise<{
    owner: string;
    repo: string;
    path: string[];
  }>;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { owner, repo, path } = await params;
  const filePath = path.join("/");
  const fileId = `${owner}/${repo}/${filePath}`;
  
  let content = "";
  try {
    content = await getFileContent(owner, repo, filePath);
  } catch {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">Failed to load file content. Make sure it exists and is a markdown file.</p>
      </div>
    );
  }

  const readingTime = calculateReadingTime(extractPlainText(content));
  const fileName = path[path.length - 1];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative">
      <CacheSyncer owner={owner} repo={repo} path={filePath} content={content} />
      <SearchOverlay />
      
      {/* Minimal Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-[720px] mx-auto flex items-center justify-between px-4 h-14">
          <Link 
            href={`/library`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
            aria-label="Back to library"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-sm font-semibold truncate max-w-[200px] sm:max-w-[300px]">
              {fileName}
            </h1>
            <span className="text-xs text-muted-foreground">
              {readingTime} min read
            </span>
          </div>

          <div className="flex items-center gap-2">
            <BookmarkPanel fileId={fileId} />
            <SettingsPanel />
          </div>
        </div>
      </header>

      {/* Reader Content */}
      <ReaderLayout fileId={fileId}>
        <MarkdownRenderer content={content} />
      </ReaderLayout>
      
      {/* Floating Controls */}
      <AutoScroller />
      <TTSController content={content} />
    </div>
  );
}
