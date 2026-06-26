## 2024-06-26 - ARIA labels in reader components
**Learning:** Several interactive reader components like TTSController rely on Lucide icon-only buttons without ARIA labels, causing accessibility issues for screen readers.
**Action:** Always verify icon-only buttons have dynamic, state-aware `aria-label`s, especially in complex components like the reader overlay.
