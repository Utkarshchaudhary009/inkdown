'use client';

import React, { useState, useEffect } from 'react';
import { RepoCard, type Repo } from "@/components/repo-card";
import { useRecentlyRead, useReadingProgress, useLikedFiles } from '@/lib/db-hooks';
import Link from 'next/link';
import { Clock, FolderGit2, Search, LayoutGrid, List, Heart } from 'lucide-react';
import { getInstallationRepos } from '@/lib/github';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserInstallationStatus } from '@/app/actions/user';


interface ContinueReadingProps {
  id?: number;
  fileId: string;
  repoFullName: string;
  filePath: string;
  lastReadAt: number;
}

function ContinueReadingCard({ fileId, repoFullName, filePath, lastReadAt }: ContinueReadingProps) {
  const { progress } = useReadingProgress(fileId);
  const percent = progress?.scrollPercent || 0;
  
  return (
    <Link href={`/read/${repoFullName}/${filePath}`} className="group flex flex-col gap-3 p-4 rounded-2xl border border-border bg-card hover:bg-secondary/50 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <h3 className="font-semibold text-foreground truncate">{filePath.split('/').pop()}</h3>
          <p className="text-xs text-muted-foreground truncate">{repoFullName}</p>
        </div>
      </div>
      
      <div className="mt-auto pt-2 flex flex-col gap-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">{new Date(lastReadAt).toLocaleDateString()}</span>
          <span className="font-medium text-primary">{Math.round(percent)}%</span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </Link>
  );
}

interface LikedFileProps {
  id?: number;
  fileId: string;
  repoFullName: string;
  filePath: string;
  likedAt: number;
}

function LikedFileCard({ repoFullName, filePath, likedAt }: LikedFileProps) {
  return (
    <Link href={`/read/${repoFullName}/${filePath.split('/').map(encodeURIComponent).join('/')}`} className="group flex flex-col gap-3 p-4 rounded-2xl border border-border bg-card hover:bg-secondary/50 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <h3 className="font-semibold text-foreground truncate">{filePath.split('/').pop()}</h3>
          <p className="text-xs text-muted-foreground truncate">{repoFullName}</p>
        </div>
        <Heart className="h-4 w-4 text-red-500 fill-red-500 shrink-0" />
      </div>
      <div className="mt-auto pt-2 flex items-center text-xs text-muted-foreground">
        <span>Liked {new Date(likedAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}

export function LibraryDashboard() {
  const { recentlyRead } = useRecentlyRead();
  const { likedFiles } = useLikedFiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appInstalled, setAppInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const status = await getUserInstallationStatus();
        setAppInstalled(status.isInstalled);
        
        if (status.isInstalled) {
          const fetched = await getInstallationRepos();
          setRepos(fetched);
        }
      } catch (error) {
        console.error("Failed to fetch repos, might be offline:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredRepos = repos.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Your Library</h1>
        
        <div className="flex items-center gap-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-card border border-border rounded-full text-sm outline-none focus:ring-2 focus:ring-primary w-full sm:w-64 transition-all"
          />
          <div className="flex items-center border border-border rounded-full p-1 bg-card">
            <button 
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              title="Grid view"
              className={`p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${viewMode === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              aria-label="List view"
              title="List view"
              className={`p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${viewMode === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {!searchQuery && recentlyRead.length > 0 && (
        <section className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5 text-primary" /> Continue Reading
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentlyRead.slice(0, 4).map(item => (
              <ContinueReadingCard key={item.id} {...item} />
            ))}
          </div>
        </section>
      )}

      {!searchQuery && likedFiles.length > 0 && (
        <section className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" /> Liked
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {likedFiles.map(item => (
              <LikedFileCard key={item.id} {...item} />
            ))}
          </div>
        </section>
      )}

      {appInstalled === false && !isLoading && (
        <div className="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FolderGit2 className="h-5 w-5" /> Connect GitHub App
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              To read your private repositories, you need to install the InkDown GitHub App.
            </p>
          </div>
          <a 
            href={process.env.NEXT_PUBLIC_GITHUB_APP_NAME ? `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME}/installations/new` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Install App
          </a>
        </div>
      )}

      <section className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <FolderGit2 className="h-5 w-5 text-primary" /> All Repositories
        </h2>
        
        {isLoading ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className={viewMode === 'grid' ? "h-36 w-full rounded-xl" : "h-20 w-full rounded-xl"} />
              </div>
            ))}
          </div>
        ) : appInstalled && filteredRepos.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground bg-card/50 rounded-2xl border border-border border-dashed">
            <FolderGit2 className="h-10 w-10 mx-auto opacity-20 mb-3" />
            <p>No repositories found matching your search.</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }>
            {filteredRepos.map((repo) => (
              <div key={repo.id} className={viewMode === 'list' ? "w-full" : ""}>
                <RepoCard repo={repo} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
