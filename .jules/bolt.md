## 2025-06-25 - Extracted React components from Virtuoso render loop

**Learning:** When using `react-virtuoso` with a list of React components, defining component maps inline (such as `components={{ h1: () => <H1 /> }}`) causes React to constantly unmount and remount these DOM nodes. This occurs because every render creates entirely new function references, meaning React's reconciliation treats them as completely new component types, rather than just updating the props. In `MarkdownRenderer.tsx`, this destroyed scroll performance and triggered severe layout shifts during active reading.

**Action:** Always extract component mapping objects (like `components={...}`) outside of the functional component scope or wrap them in a stable `useMemo` so their references do not change between renders. Similarly, wrap row renderers like `itemContent` in a `useCallback`.
