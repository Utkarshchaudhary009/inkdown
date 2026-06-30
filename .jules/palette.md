## 2024-05-15 - Interactive Icon Accessibility
**Learning:** Icon-only buttons used across reader tools (TTS, Highlights, Search, Dashboard) lack basic accessibility attributes and keyboard focus indicators, making navigation difficult for screen readers and keyboard users.
**Action:** Always verify custom interactive elements (especially buttons containing only icons) include `aria-label`, `title`, and explicit `focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-primary` Tailwind classes.
