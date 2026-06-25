"use client";

import { use, useEffect, useState } from "react";
import { getRepoTree } from "@/lib/github";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentlyRead } from "@/lib/db-hooks";
import { AlertCircle } from "lucide-react";

type FileNode = {
  path?: string;
  mode?: string;
  type?: string;
  sha?: string;
  size?: number;
  url?: string;
};

export default function RepoPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = use(params);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  
  const { recentlyRead } = useRecentlyRead();
  const repoFullName = `${owner}/${repo}`;
  const offlineFiles = recentlyRead.filter(r => r.repoFullName === repoFullName);

  useEffect(() => {
    async function fetchTree() {
      try {
        const { truncated, tree } = await getRepoTree(owner, repo);
        setFiles(tree);
        setIsTruncated(truncated);
        setIsOffline(false);
      } catch (error) {
        console.error("Failed to fetch repo tree:", error);
        setIsOffline(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTree();
  }, [owner, repo]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/library" className="text-sm text-muted-foreground hover:underline">
          &larr; Back to Library
        </Link>
        <h1 className="text-3xl font-bold mt-2">
          {owner}/{repo}
        </h1>
        {isOffline && (
          <p className="text-sm text-amber-500 mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> You are offline. Showing locally cached files.
          </p>
        )}
        {isTruncated && !isOffline && (
          <p className="text-sm text-amber-500 mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> Repository is too large. Some files may be missing.
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))
        ) : isOffline ? (
          offlineFiles.length === 0 ? (
            <p className="text-muted-foreground col-span-2">No files from this repository are cached offline.</p>
          ) : (
            offlineFiles.map((file) => (
              <Link key={file.filePath} href={`/read/${owner}/${repo}/${file.filePath}`}>
                <Card className="hover:bg-muted/50 transition-colors border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="text-base break-all">{file.filePath}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))
          )
        ) : files.length === 0 ? (
          <p className="text-muted-foreground col-span-2">No markdown files found in this repository.</p>
        ) : (
          files.map((file) => (
            <Link key={file.path} href={`/read/${owner}/${repo}/${file.path}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base break-all">{file.path}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
