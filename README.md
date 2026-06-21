# InkDown

InkDown is a premium, offline-first Progressive Web App that turns GitHub Markdown files into a focused, Kindle-like reading experience.

## Current Implementation Stage

The codebase is past the initial scaffold and is in the **reader-feature integration stage** of the implementation plan:

- **Completed foundation:** Next.js App Router, Clerk-protected routes, Drizzle/Neon schema, Clerk webhook user sync, Shadcn-style UI primitives, Tailwind v4 theme tokens.
- **Completed core flows:** landing page, library dashboard, repository Markdown browser, authenticated GitHub API access, Markdown reader route, reader settings, bookmarks, progress tracking, search, TTS, auto-scroll, and local Dexie persistence.
- **Completed PWA baseline:** PWA metadata, install manifest, custom app icons, Serwist service worker generation, runtime caching, offline document fallback, and local IndexedDB caching helpers are wired into the app.
- **Production verification checklist:** run live Clerk/Neon/GitHub OAuth QA, device-level PWA install/offline QA, and Lighthouse performance validation before launch.

## Quality Review Notes

Recent cleanup moved the app away from network-dependent Google font builds and onto resilient system font stacks, added a custom “In” icon system, wired Serwist-powered PWA caching/offline fallback, replaced the placeholder landing page, documented required environment variables, and removed noisy success logging from the Clerk webhook.

The launch checklist should focus on reliability validation rather than adding more reader controls:

1. **Make offline cache visible:** add a “Saved on this device” section so users trust the product before a flight/train ride.
2. **Sync queue:** persist highlight/bookmark/progress mutations locally first, then replay to Neon when online.
3. **GitHub failure states:** display rate-limit/session-expired/private-repo errors with clear recovery actions.
4. **Reader trust UX:** add a small “saved” indicator after progress/highlight writes. Readers relax when they know the app remembered their place.
5. **Performance budget:** the reader route is feature-rich; split heavyweight reader controls so the default reading path stays instant.

## Product Suggestions

A unicorn-quality reader should feel emotionally safe and habit-forming, not feature-heavy. Suggested additions:

- **Reading streaks without social pressure:** private weekly momentum, focused on “kept your reading habit alive” rather than gamification spam.
- **Smart resume:** open directly at the last meaningful heading, with a one-line recap of where the user stopped.
- **Distraction shield:** a “deep read” mode that hides all controls until pointer/touch movement.
- **Tiny wins:** celebrate finishing a document with next-step suggestions from the same repository.
- **Progressive disclosure:** keep advanced tools behind panels; default experience should be calm, fast, and obvious.

## Environment

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
DATABASE_URL=
```

## Development

```bash
npm run dev
```

## Required Checks

Before shipping any change, run:

```bash
npm run build
npm run lint
npx tsc --noEmit
```
