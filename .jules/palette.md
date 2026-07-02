## 2024-07-02 - Icon-only Toggles and Inputs Missing Accessible Names
**Learning:** In the library dashboard, icon-only toggle buttons (like grid/list view toggles) and standalone inputs (like search bars) frequently lack proper accessible names and focus indicators.
**Action:** When implementing or reviewing icon-only buttons or standalone inputs, ensure they always have `aria-label`s, `title` attributes (for buttons), and clear `focus-visible` styles (e.g., `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`) by default.
