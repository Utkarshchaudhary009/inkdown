## 2024-06-29 - Missing accessibility attributes on reader icon-only buttons
**Learning:** Icon-only buttons within the reader components (like SearchOverlay, HighlightManager, etc.) frequently lack `aria-label`, `title`, and explicit focus styles (`focus-visible:ring`), resulting in poor screen reader and keyboard accessibility.
**Action:** When modifying or reviewing reader components, actively ensure that custom interactive elements always include `aria-label`, `title`, and proper focus states using Tailwind's `focus-visible` classes.
