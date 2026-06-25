## 2024-05-24 - Missing ARIA labels on icon-only buttons
**Learning:** Icon-only buttons frequently lack `aria-label` or `title` attributes across the application, significantly degrading the screen reader experience. This was specifically observed and addressed in `components/reader/SearchOverlay.tsx`.
**Action:** When working on future components, actively check icon-only buttons for appropriate screen reader accessibility attributes. Consider creating or modifying a shared icon-button component that enforces ARIA labeling.
