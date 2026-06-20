'use client';

import React, { useEffect, useRef } from 'react';
import { useReadingProgress } from '@/lib/db-hooks';

interface ProgressBarProps {
  fileId: string;
}

export function ProgressBar({ fileId }: ProgressBarProps) {
  const { progress: savedProgress, setProgress } = useReadingProgress(fileId);

  // ⚡ Bolt: By using a ref to the DOM node, we can update the width directly
  // and completely bypass React's render cycle during high-frequency scroll events.
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (savedProgress?.scrollPercent && progressBarRef.current) {
      progressBarRef.current.style.width = `${savedProgress.scrollPercent}%`;
    }
  }, [savedProgress]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let ticking = false;

    const updateProgress = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = totalHeight > 0 ? Math.round((scrollY / totalHeight) * 100) : 0;

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${percent}%`;
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setProgress(percent);
      }, 1000); // Save after 1 second of no scrolling

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Set initial width
    if (!ticking) {
       window.requestAnimationFrame(updateProgress);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timeout);
    };
  }, [setProgress]);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-transparent">
      <div 
        ref={progressBarRef}
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: '0%' }}
      />
    </div>
  );
}
