'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useHighlights } from '@/lib/db-hooks';

interface HighlightSelectionProps {
  fileId: string;
  containerRef: React.RefObject<HTMLElement | null>;
}

// Fallback types for CSS Custom Highlight API
declare global {
  interface CSS {
    highlights?: {
      clear: () => void;
      set: (name: string, highlight: Highlight) => void;
    };
  }
  interface Window {
    CSS: CSS;
  }
}

export function HighlightManager({ fileId, containerRef }: HighlightSelectionProps) {
  const { highlights, addHighlight } = useHighlights(fileId);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [currentSelection, setCurrentSelection] = useState<Range | null>(null);

  // Helper to serialize range to start/end offsets relative to container
  const serializeRange = (range: Range, container: HTMLElement) => {
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(container);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    return { start, end: start + range.toString().length };
  };

  // Helper to deserialize offsets back to a Range using TreeWalker
  const deserializeRange = (start: number, end: number, container: HTMLElement): Range | null => {
    let charCount = 0;
    const range = document.createRange();
    let startSet = false;
    let endSet = false;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode();

    while (node && (!startSet || !endSet)) {
      const nextCharCount = charCount + (node.textContent?.length || 0);
      
      if (!startSet && start >= charCount && start <= nextCharCount) {
        range.setStart(node, start - charCount);
        startSet = true;
      }
      
      if (!endSet && end >= charCount && end <= nextCharCount) {
        range.setEnd(node, end - charCount);
        endSet = true;
      }
      
      charCount = nextCharCount;
      node = walker.nextNode();
    }

    return startSet && endSet ? range : null;
  };

  const applyHighlights = useCallback(() => {
    if (!window.CSS?.highlights || !containerRef.current) return;
    
    // Group highlights by color
    const groups: Record<string, Range[]> = {};
    
    highlights.forEach(h => {
      const range = deserializeRange(h.startOffset, h.endOffset, containerRef.current!);
      if (range) {
        if (!groups[h.color]) groups[h.color] = [];
        groups[h.color].push(range);
      }
    });

    // Clear previous highlights
    window.CSS.highlights.clear();

    // Add new ones
    Object.entries(groups).forEach(([color, ranges]) => {
      const highlight = new Highlight(...ranges);
      window.CSS.highlights!.set(`highlight-${color}`, highlight);
    });
  }, [highlights, containerRef]);

  useEffect(() => {
    // Wait a brief moment for content to render
    const t = setTimeout(applyHighlights, 500);
    return () => clearTimeout(t);
  }, [applyHighlights, highlights]);

  useEffect(() => {
    // Add CSS rules for highlight colors dynamically
    const style = document.createElement('style');
    style.textContent = `
      ::highlight(highlight-yellow) { background-color: var(--highlight-yellow); }
      ::highlight(highlight-green) { background-color: var(--highlight-green); }
      ::highlight(highlight-blue) { background-color: var(--highlight-blue); }
      ::highlight(highlight-red) { background-color: var(--highlight-red); }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) {
      setShowToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    
    // Ensure selection is within our container
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      setShowToolbar(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    setToolbarPos({
      top: rect.top - 40 + window.scrollY,
      left: rect.left + rect.width / 2
    });
    setCurrentSelection(range);
    setShowToolbar(true);
  }, [containerRef]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [containerRef, handleMouseUp]);

  const handleAddHighlight = async (color: string) => {
    if (!currentSelection || !containerRef.current) return;
    
    const text = currentSelection.toString();
    const { start, end } = serializeRange(currentSelection, containerRef.current);
    
    await addHighlight({
      startOffset: start,
      endOffset: end,
      color,
      text
    });
    
    window.getSelection()?.removeAllRanges();
    setShowToolbar(false);
  };

  if (!showToolbar) return null;

  return (
    <div 
      role="toolbar"
      aria-label="Highlight colors"
      className="absolute z-50 flex items-center space-x-2 bg-popover border shadow-lg rounded-md p-2"
      style={{ 
        top: `${toolbarPos.top}px`, 
        left: `${toolbarPos.left}px`,
        transform: 'translateX(-50%)' 
      }}
    >
      <button
        onClick={() => handleAddHighlight('yellow')}
        className="w-6 h-6 rounded-full bg-yellow-300 hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Highlight yellow"
        title="Yellow"
      />
      <button
        onClick={() => handleAddHighlight('green')}
        className="w-6 h-6 rounded-full bg-green-300 hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Highlight green"
        title="Green"
      />
      <button
        onClick={() => handleAddHighlight('blue')}
        className="w-6 h-6 rounded-full bg-blue-300 hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Highlight blue"
        title="Blue"
      />
      <button
        onClick={() => handleAddHighlight('red')}
        className="w-6 h-6 rounded-full bg-red-300 hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Highlight red"
        title="Red"
      />
    </div>
  );
}
