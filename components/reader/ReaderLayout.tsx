'use client';

import React, { useRef } from 'react';
import { ProgressBar } from './ProgressBar';
import { TOCSidebar } from './TOCSidebar';
import { HighlightManager } from './HighlightManager';


interface ReaderLayoutProps {
  fileId: string;
  children: React.ReactNode;
}

export function ReaderLayout({ fileId, children }: ReaderLayoutProps) {
  const contentRef = useRef<HTMLElement>(null);

  return (
    <>
      <ProgressBar fileId={fileId} />
      
      {/* Settings Panel is usually placed in the header, but we'll export it from here to keep layout logic contained, or we can just render the TOC and Highlights here */}
      <TOCSidebar contentRef={contentRef} />
      <HighlightManager fileId={fileId} containerRef={contentRef} />
      
      <main ref={contentRef} className="max-w-[720px] mx-auto px-4 py-8 sm:py-12 pb-24 markdown-container" style={{ fontFamily: 'var(--font-family)' }}>
        {children}
      </main>
    </>
  );
}
