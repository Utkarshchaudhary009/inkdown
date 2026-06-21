'use client';

import React, { useState } from 'react';
import { Bookmark as BookmarkIcon, X, Trash2, ArrowRight } from 'lucide-react';
import { toast } from "sonner";
import { useBookmarks } from '@/lib/db-hooks';

interface BookmarkPanelProps {
  fileId: string;
}

export function BookmarkPanel({ fileId }: BookmarkPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { bookmarks, removeBookmark } = useBookmarks(fileId);

  const jumpTo = (percent: number) => {
    const documentHeight = Math.max(
      document.body.scrollHeight, 
      document.body.offsetHeight, 
      document.documentElement.clientHeight, 
      document.documentElement.scrollHeight, 
      document.documentElement.offsetHeight
    );
    const windowHeight = window.innerHeight;
    const targetScrollY = (percent / 100) * (documentHeight - windowHeight);
    
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full text-muted-foreground hover:bg-secondary transition-colors"
        aria-label="Bookmarks"
        title="Bookmarks"
      >
        <BookmarkIcon className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-card border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookmarkIcon className="h-5 w-5 text-primary" /> Bookmarks
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {bookmarks.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-2">
              <BookmarkIcon className="h-8 w-8 opacity-20" />
              <p className="text-sm">No bookmarks yet</p>
              <p className="text-xs opacity-70">Tap the bookmark icon in the progress bar to add one.</p>
            </div>
          ) : (
            bookmarks.sort((a, b) => a.scrollPercent - b.scrollPercent).map(bookmark => (
              <div 
                key={bookmark.id} 
                className="group flex flex-col gap-2 p-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {Math.round(bookmark.scrollPercent)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(bookmark.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      if (bookmark.id) {
                        removeBookmark(bookmark.id);
                        toast("Bookmark removed");
                      }
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete bookmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <p className="text-sm text-foreground break-words line-clamp-2">
                  {bookmark.label || "Untitled Bookmark"}
                </p>

                <button 
                  onClick={() => jumpTo(bookmark.scrollPercent)}
                  className="mt-1 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Jump to location <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
