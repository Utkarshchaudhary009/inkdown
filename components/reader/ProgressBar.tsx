'use client';

import React, { useEffect, useRef } from 'react';
import { useReadingProgress } from '@/lib/db-hooks';
import { getScrollPercentage } from '@/lib/scroll-utils';

interface ProgressBarProps {
  fileId: string;
}

export function ProgressBar({ fileId }: ProgressBarProps) {
  const { progress: savedProgress, setProgress } = useReadingProgress(fileId);
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (savedProgress?.scrollPercent && barRef.current && !barRef.current.style.width) {
      barRef.current.style.width = `${savedProgress.scrollPercent}%`;
    }
  }, [savedProgress]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const calculateProgress = () => {
      if (rafRef.current) return;
      
      rafRef.current = requestAnimationFrame(() => {
        const percent = getScrollPercentage();
        
        if (barRef.current) {
          barRef.current.style.width = `${percent}%`;
        }

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setProgress(Math.round(percent));
        }, 1000);

        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', calculateProgress, { passive: true });
    
    // Trigger once on mount
    calculateProgress();
    
    return () => {
      window.removeEventListener('scroll', calculateProgress);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(timeout);
    };
  }, [setProgress]);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-transparent">
      <div 
        ref={barRef}
        className="h-full bg-primary will-change-[width]"
        style={{ width: '0%' }}
      />
    </div>
  );
}
