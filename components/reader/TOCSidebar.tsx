'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TOCSidebarProps {
  contentRef: React.RefObject<HTMLElement | null>;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TOCSidebar({ contentRef }: TOCSidebarProps) {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!contentRef.current) return;

    // Wait a brief moment for markdown to render
    const timeout = setTimeout(() => {
      const headings = Array.from(
        contentRef.current!.querySelectorAll('h1, h2, h3, h4, h5, h6')
      );
      
      const tocItems = headings.map(h => ({
        id: h.id,
        text: h.textContent || '',
        level: parseInt(h.tagName.charAt(1), 10)
      })).filter(h => h.id && h.text);

      setItems(tocItems);

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      }, {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
      });

      headings.forEach(h => observer.observe(h));

      return () => observer.disconnect();
    }, 500);

    return () => clearTimeout(timeout);
  }, [contentRef]);

  if (items.length === 0) return null;

  return (
    <div className="hidden xl:block fixed top-20 right-4 w-64 max-h-[calc(100vh-6rem)]">
      <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm h-full flex flex-col">
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">On This Page</h3>
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={cn(
                  "block text-sm py-1 px-2 rounded-md transition-colors hover:bg-muted line-clamp-2",
                  activeId === item.id ? "font-medium text-primary bg-primary/10" : "text-muted-foreground",
                  item.level === 1 ? "ml-0" :
                  item.level === 2 ? "ml-2" :
                  item.level === 3 ? "ml-4" :
                  item.level === 4 ? "ml-6" :
                  item.level === 5 ? "ml-8" : "ml-10"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  setActiveId(item.id);
                }}
              >
                {item.text}
              </a>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
