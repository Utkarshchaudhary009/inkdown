# Project: InkDown PWA & UX Polish Implementation

## Architecture
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Service Worker**: Serwist (`@serwist/next`) integration. Precision precaching for app shell and runtime caching strategies for external assets (GitHub API -> StaleWhileRevalidate, fonts/images -> CacheFirst).
- **Offline Storage**: Dexie.js (`lib/dexie-db.ts`, `lib/db-hooks.ts`) stores documents and reader states.
- **Third-Party Libraries**:
  - **Lordicon**: Interactive animated icons wrapped to prevent SSR hydration mismatches, dynamically styled via custom CSS custom properties.
  - **Shadcn Toaster**: Unified UI notifications replacing existing custom alert mechanisms.
- **Animations**: CSS transitions/animations and Framer Motion for micro-animations (page slide/fade, hover states, settings/TOC panels, skeleton loaders).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | PWA Configuration & Manifest | Set up `@serwist/next` config wrapper, `app/sw.ts`, `app/manifest.ts`, and PWA meta tags in `app/layout.tsx` | None | PLANNED |
| 2 | Offline Fallback Page | Implement `app/~offline/page.tsx` retrieving cached read files from Dexie DB, displaying themed offline screen | M1 | PLANNED |
| 3 | Lordicon Integration | Setup Lordicon script/component with strict hydration validation and active reading theme styling integration | None | PLANNED |
| 4 | Shadcn Toaster Integration | Set up Shadcn Toaster inside `layout.tsx` and refactor existing toast notifications | None | PLANNED |
| 5 | Micro-Animations & UX Polish | Add page transitions, card hover effects, sidebar slide-ins, and skeleton loaders | None | PLANNED |
| 6 | E2E Verification & PR Workflow | Create PR on `feature/pwa-offline`, wait 10 min for review, apply feedback, merge to main, verify Vercel build | M1, M2, M3, M4, M5 | PLANNED |

## Interface Contracts
### Service Worker ↔ Next.js Build
- `app/sw.ts` compiles to `public/sw.js` via `@serwist/next` wrapping.
- Offline route `~offline` must be precached or handled as service worker fallback.

### Dexie DB ↔ Offline Page
- Offline page reads from `lib/dexie-db.ts` to display reading list.

### Lordicon Component ↔ Reading Themes
- Lordicon component uses CSS custom properties (e.g., `var(--accent)`) to dynamically adjust colors per theme (Light, Dark, Sepia, Night, Forest).

## Code Layout
- `app/sw.ts` - Service worker logic.
- `app/manifest.ts` - Web App Manifest generator.
- `app/~offline/page.tsx` - Offline fallback page.
- `components/ui/lordicon.tsx` - Safe React component wrapper for Lordicon.
- `components/ui/toaster.tsx` - Shadcn Toaster component.
- `app/layout.tsx` - App layout containing Toaster, PWA meta tags, etc.
