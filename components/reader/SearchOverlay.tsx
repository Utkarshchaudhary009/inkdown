'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

interface SearchOverlayProps {
  containerSelector?: string;
}

export function SearchOverlay({ containerSelector = '.markdown-container' }: SearchOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+F to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const clearHighlights = useCallback(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const marks = container.querySelectorAll('mark.search-highlight');
    marks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });
  }, [containerSelector]);

  const highlightMatches = useCallback(() => {
    clearHighlights();
    setMatchCount(0);
    setCurrentIndex(0);

    if (!query.trim()) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const nodesToHighlight: { node: Text; matchIndices: number[] }[] = [];

    const lowerQuery = query.toLowerCase();
    
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue;
      if (!text) continue;
      
      const lowerText = text.toLowerCase();
      let matchIndex = lowerText.indexOf(lowerQuery);
      if (matchIndex !== -1) {
        const indices = [];
        while (matchIndex !== -1) {
          indices.push(matchIndex);
          matchIndex = lowerText.indexOf(lowerQuery, matchIndex + lowerQuery.length);
        }
        nodesToHighlight.push({ node: node as Text, matchIndices: indices });
      }
    }

    let totalMatches = 0;
    // Process backwards to not mess up earlier indices
    for (const { node, matchIndices } of nodesToHighlight) {
      let currentTextNode = node;
      // Process from right to left
      for (let i = matchIndices.length - 1; i >= 0; i--) {
        const index = matchIndices[i];
        
        // Split node
        const middle = currentTextNode.splitText(index);
        currentTextNode = middle.splitText(query.length) as unknown as Text; // The remaining text after match
        
        // Wrap middle
        const mark = document.createElement('mark');
        mark.className = 'search-highlight bg-yellow-300 text-yellow-900 rounded-sm px-0.5';
        mark.textContent = middle.nodeValue;
        middle.parentNode?.replaceChild(mark, middle);
        totalMatches++;
      }
    }

    setMatchCount(totalMatches);
    if (totalMatches > 0) {
      setCurrentIndex(1);
      scrollToMatch(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, clearHighlights, containerSelector]);

  // Re-run highlighting when query changes
  useEffect(() => {
    const debounceId = setTimeout(() => {
      highlightMatches();
    }, 300);
    return () => clearTimeout(debounceId);
  }, [query, highlightMatches]);

  // Clean up on unmount
  useEffect(() => {
    return () => clearHighlights();
  }, [clearHighlights]);

  const scrollToMatch = (index: number) => {
    const marks = document.querySelectorAll(`${containerSelector} mark.search-highlight`);
    if (marks.length > 0 && index > 0 && index <= marks.length) {
      // Remove active class from all
      marks.forEach(m => m.classList.remove('ring-2', 'ring-blue-500', 'bg-yellow-400'));
      
      // Add active class to current
      const activeMark = marks[index - 1] as HTMLElement;
      activeMark.classList.add('ring-2', 'ring-blue-500', 'bg-yellow-400');
      
      // Scroll into view
      activeMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (matchCount === 0) return;
    const next = currentIndex < matchCount ? currentIndex + 1 : 1;
    setCurrentIndex(next);
    scrollToMatch(next);
  };

  const handlePrev = () => {
    if (matchCount === 0) return;
    const prev = currentIndex > 1 ? currentIndex - 1 : matchCount;
    setCurrentIndex(prev);
    scrollToMatch(prev);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-card border border-border shadow-2xl rounded-full px-4 py-2 flex items-center gap-3 animate-in slide-in-from-top-4 fade-in">
      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Find in page..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (e.shiftKey) handlePrev();
            else handleNext();
          }
        }}
        className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
      />
      {query && (
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {matchCount > 0 ? `${currentIndex}/${matchCount}` : '0/0'}
        </span>
      )}
      <div className="flex items-center gap-1 border-l border-border pl-2 shrink-0">
        <button
          onClick={handlePrev}
          disabled={matchCount === 0}
          aria-label="Previous match"
          title="Previous match"
          className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={handleNext}
          disabled={matchCount === 0}
          aria-label="Next match"
          title="Next match"
          className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          onClick={() => { setIsOpen(false); clearHighlights(); }}
          aria-label="Close search"
          title="Close search"
          className="p-1.5 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive ml-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
