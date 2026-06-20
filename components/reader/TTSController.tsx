'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, SkipForward, Volume2 } from 'lucide-react';
import { extractPlainText } from '@/lib/reading-utils';

interface TTSControllerProps {
  content: string;
}

export function TTSController({ content }: TTSControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize Speech Synthesis and Voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        // Try to pick a good default English voice
        const defaultVoice = availableVoices.find(v => v.lang.startsWith('en') && v.default) || availableVoices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Split content into reasonable sentences
    const text = extractPlainText(content);
    // Simple sentence split: punctuation followed by space or newline
    const splits = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
    setSentences(splits.map(s => s.trim()).filter(s => s.length > 0));

    return () => {
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]); // Removed selectedVoice from dependencies to prevent reset loop

  const speak = useCallback((index: number) => {
    if (index >= sentences.length) {
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentences[index]);
    
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }
    
    utterance.rate = rate;
    
    utterance.onend = () => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (isPlaying && !isPaused) {
          // React state might be stale in this callback, but we trigger the effect via state changes or recursive call?
          // Actually, recursive call is better for SpeechSynthesis to avoid state cycle issues.
          // Wait, better to just let the effect handle the next sentence by updating index.
        }
        return next;
      });
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesisError', e);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [sentences, selectedVoice, voices, rate, isPlaying, isPaused]);

  // Effect to automatically speak next sentence when index changes
  useEffect(() => {
    if (isPlaying && !isPaused && currentIndex < sentences.length) {
      speak(currentIndex);
    } else if (currentIndex >= sentences.length) {
      setIsPlaying(false);
      setCurrentIndex(0);
    }
  }, [currentIndex, isPlaying, isPaused, speak, sentences.length]);

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setIsPaused(false);
      if (currentIndex >= sentences.length) setCurrentIndex(0);
      else speak(currentIndex);
    } else {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(0);
  };

  const skipForward = () => {
    window.speechSynthesis.cancel();
    setCurrentIndex(prev => Math.min(prev + 1, sentences.length - 1));
    if (isPlaying && !isPaused) {
      // The effect will pick it up
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-3 bg-card border border-border shadow-lg rounded-full text-muted-foreground hover:text-foreground transition-colors animate-in fade-in"
        aria-label="Open Text to Speech"
      >
        <Volume2 className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-50 w-[90%] max-w-sm sm:max-w-md bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-4 animate-in slide-in-from-bottom-4 fade-in">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Volume2 className="h-4 w-4" /> Text to Speech
          </h3>
          <button onClick={() => { setIsOpen(false); stop(); }} className="text-muted-foreground hover:text-foreground">
            <Square className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-4 py-2">
          <button onClick={togglePlay} className="p-3 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition-transform active:scale-95">
            {isPlaying && !isPaused ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
          </button>
          <button onClick={stop} className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
            <Square className="h-5 w-5" />
          </button>
          <button onClick={skipForward} className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground flex justify-between">
            <span>Voice</span>
          </label>
          <select 
            value={selectedVoice} 
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full text-sm bg-secondary border border-border rounded-md p-1.5 outline-none text-foreground"
          >
            {voices.map(v => (
              <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground flex justify-between">
            <span>Speed</span>
            <span>{rate}x</span>
          </label>
          <input 
            type="range" min="0.5" max="2" step="0.1" 
            value={rate} 
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        {isPlaying && (
          <div className="mt-2 p-2 bg-secondary/50 rounded-md text-xs text-muted-foreground italic truncate">
            {sentences[currentIndex]}
          </div>
        )}
      </div>
    </div>
  );
}
