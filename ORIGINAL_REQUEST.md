# Original User Request

## Initial Request — 2026-06-20T11:01:31Z

# Teamwork Project Prompt — Draft

> Status: Step 9 — Assembled and validated, ready for launch
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Implement Phases 9 + 10 (PWA / Service Worker / Offline Support + UX Polish & Micro-Animations) for InkDown, an existing Next.js 15 markdown reader app. The app already has authentication (Clerk), GitHub integration, a library dashboard, a reader view with reader features, a 5-theme design system, and offline data storage. This phase adds the service worker for full PWA support, an offline fallback page, a comprehensive UX polish pass with animated icons (Lordicon), Shadcn Toaster integration, and micro-animations to make the app feel premium.

Working directory: C:\Users\acerr\Documents\antigravity\zealous-tesla
Integrity mode: development

## Requirements

### R1. Serwist Service Worker Integration
The app must have a Serwist-powered service worker (`@serwist/next` — already installed) that precaches the app shell and applies runtime caching strategies (`StaleWhileRevalidate` for GitHub API, `CacheFirst` for Fonts/Images). Wrap `next.config.ts` with `withSerwist()`.

### R2. PWA Manifest & Installability
The app must expose a valid web app manifest via Next.js `app/manifest.ts` with app name "InkDown", display: "standalone", and icon entries for 192x192 and 512x512 PNGs in `public/icons/`. The root layout must include all PWA meta tags.

### R3. Offline Fallback Page
A dedicated offline fallback page at `app/~offline/page.tsx` must render when offline. It must show a themed "You're offline" message, use an animated Lordicon, and list previously read/cached documents from the existing IndexedDB (`lib/dexie-db.ts`).

### R4. Lordicon Animated Icons Integration & Strict Validation
Integrate Lordicon for animated interactive icons throughout the app (Landing page, Library dashboard, Reader toolbar, Offline page, Settings panel).
**STRICT VALIDATION REQUIRED**: When adding foreign libraries like `lordicon`, validate the implementation rigorously. Ensure there are no hydration mismatches, ensure it works correctly in the Next.js App Router environment (client vs server components), and ensure colors respect the active theme's CSS custom properties.

### R5. Shadcn Toaster Integration
Implement `toaster` from Shadcn UI to handle all notifications across the application. Replace any existing custom toast notifications or alerts with the unified Shadcn Toaster component. Ensure toasts are styled correctly according to the current active theme.

### R6. Micro-Animations & UX Polish
Add comprehensive micro-animations:
- Page transitions (fade + slight upward slide)
- Repo cards in library (subtle scale on hover, shadow elevation)
- Settings panel & TOC sidebar slide-ins
- Shimmer animation on skeleton loaders
- Button hover states (scale + shadow lift)

### R7. Build Integrity
After all changes, `npm run build`, `npm run lint`, and `npx tsc --noEmit` must all pass with zero errors. No `@ts-ignore` or `as any` workarounds.

## Existing Codebase Context
- `app/layout.tsx` — Add PWA meta tags & Shadcn Toaster. Preserve ClerkProvider, ThemeProvider, FOUC script.
- `app/globals.css` — Preserve 5-theme design system.
- `middleware.ts` — Clerk middleware. MUST STILL WORK.
- `lib/dexie-db.ts` & `lib/db-hooks.ts` — Dexie IndexedDB setup. DO NOT MODIFY.
- `next.config.ts` — Needs `withSerwist()` wrapping.
- All components in `components/reader/*`, `components/library/*`, `components/ui/*` must continue to work.

## Acceptance Criteria

### Service Worker & PWA
- [ ] `app/sw.ts` exists and `next.config.ts` uses `withSerwist()`
- [ ] `app/manifest.ts` returns a valid manifest and meta tags are in root layout
- [ ] `app/~offline/page.tsx` lists cached documents from Dexie and uses an animated icon

### Third-Party Library Integration (Lordicon & Toaster)
- [ ] Lordicon is implemented without hydration errors and respects theme colors
- [ ] Shadcn Toaster is added to `layout.tsx` and used for app notifications
- [ ] Code using foreign libraries has been thoroughly validated to work in a Next.js 15 SSR/Client architecture

### UX Polish
- [ ] Micro-animations (page transitions, hover scales, shimmers) are present and smooth
- [ ] Animated icons are used in at least the reader toolbar and library dashboard

### Build Integrity
- [ ] `npm run build`, `npm run lint`, and `npx tsc --noEmit` pass with zero errors
- [ ] Route protection via middleware is intact

### Git Workflow
- [ ] All changes committed on branch `feature/pwa-offline`
- [ ] PR created against `master`
- [ ] Wait 10 minutes for AI review, then address feedback
- [ ] PR is squash-merged to `master`
