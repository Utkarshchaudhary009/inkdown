'use client';

import React, { useEffect, useState } from 'react';
import { useReadingProgress } from '@/lib/db-hooks';

interface ProgressBarProps {
  fileId: string;
}

export function ProgressBar({ fileId }: ProgressBarProps) {
  const { progress: savedProgress, setProgress } = useReadingProgress(fileId);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    if (savedProgress?.scrollPercent) {
      setCurrentProgress(savedProgress.scrollPercent);
    }
  }, [savedProgress]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const calculateProgress = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = totalHeight > 0 ? Math.round((scrollY / totalHeight) * 100) : 0;
      setCurrentProgress(percent);

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setProgress(percent);
      }, 1000); // Save after 1 second of no scrolling
    };

    window.addEventListener('scroll', calculateProgress, { passive: true });
    return () => {
      window.removeEventListener('scroll', calculateProgress);
      clearTimeout(timeout);
    };
  }, [setProgress]);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-transparent">
      <div 
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${currentProgress}%` }}
      />
    </div>
  );
}
