'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Settings2 } from 'lucide-react';
import { useSettings } from '@/lib/db-hooks';

export function AutoScroller() {
  const { settings, setSetting } = useSettings();
  const [isActive, setIsActive] = useState(false);
  const [speed, setSpeed] = useState<number>(() => {
    return (settings.autoScrollSpeed as number) || 5;
  });
  const [showSettings, setShowSettings] = useState(false);
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const isUserInteractingRef = useRef(false);

  // Sync speed with DB when it changes
  useEffect(() => {
    if (settings.autoScrollSpeed !== undefined && settings.autoScrollSpeed !== speed) {
      setSpeed(settings.autoScrollSpeed as number);
    }
  }, [settings.autoScrollSpeed, speed]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value, 10);
    setSpeed(newSpeed);
    setSetting('autoScrollSpeed', newSpeed).catch(console.error);
  };

  const scrollStep = useCallback((time: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = time;
    }
    const deltaTime = time - lastTimeRef.current;
    
    // Base speed calculation: 1-10 mapped to sensible pixel/sec values
    // e.g., speed 5 = 50px/sec
    const pixelsPerSecond = speed * 10;
    const pixelsToScroll = (pixelsPerSecond * deltaTime) / 1000;

    if (!isUserInteractingRef.current) {
      window.scrollBy({ top: pixelsToScroll, behavior: 'instant' });
    }

    lastTimeRef.current = time;
    if (isActive) {
      requestRef.current = requestAnimationFrame(scrollStep);
    }
  }, [isActive, speed]);

  useEffect(() => {
    if (isActive) {
      lastTimeRef.current = undefined;
      requestRef.current = requestAnimationFrame(scrollStep);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive, scrollStep]);

  // Pause on user interaction
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const onInteract = () => {
      isUserInteractingRef.current = true;
      clearTimeout(timeoutId);
      // Resume scrolling 2 seconds after interaction stops
      timeoutId = setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 2000);
    };

    window.addEventListener('wheel', onInteract, { passive: true });
    window.addEventListener('touchstart', onInteract, { passive: true });
    window.addEventListener('mousedown', onInteract, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', onInteract);
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('mousedown', onInteract);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
      {showSettings && (
        <div className="bg-card/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-border flex flex-col gap-2 w-48 mb-2 animate-in slide-in-from-bottom-2 fade-in">
          <label className="text-xs font-semibold text-card-foreground flex justify-between">
            <span>Speed</span>
            <span>{speed}</span>
          </label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={speed} 
            onChange={handleSpeedChange}
            className="w-full accent-primary"
          />
        </div>
      )}
      
      <div className="flex bg-card/80 backdrop-blur-md rounded-full shadow-lg border border-border p-1">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Auto-scroll settings"
        >
          <Settings2 className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`p-2 rounded-full transition-all ${
            isActive 
              ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]' 
              : 'text-foreground hover:bg-secondary'
          }`}
          aria-label={isActive ? "Pause auto-scroll" : "Start auto-scroll"}
        >
          {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
