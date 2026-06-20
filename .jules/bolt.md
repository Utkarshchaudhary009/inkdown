## 2025-02-23 - Bypass React render cycle for scroll-bound animations
**Learning:** Updating React state on high-frequency events like `scroll` (e.g., setting a `scrollPercent` state variable) triggers continuous component re-renders. This is a common performance bottleneck for UI elements tied to scroll position like progress bars.
**Action:** Use a `useRef` to target the specific DOM element and update its inline styles directly (e.g. `ref.current.style.width`) combined with `requestAnimationFrame` to throttle updates and completely bypass the React reconciliation cycle.
