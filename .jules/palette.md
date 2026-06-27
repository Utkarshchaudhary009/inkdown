## 2024-06-12 - ARIA Labels on Highlight Buttons

**Learning:** The reader interface includes icon-only buttons for applying highlights (`HighlightManager.tsx`), which were inaccessible to screen readers because they lacked `aria-label` attributes.
**Action:** Always verify that purely visual interactive elements (like color swatches or icon-only buttons) have descriptive `aria-label`s.
