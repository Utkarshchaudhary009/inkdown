# AGENTS.md


## Task Completion Requirements

Before considering **any** task complete, the following must pass with zero errors:

```bash
npm run build        # Production build must succeed
npm run lint         # ESLint + Oxlint must pass
npx tsc --noEmit     # TypeScript must compile cleanly
```

- Do **not** mark a task done if any of the above fails.
- Do **not** suppress TypeScript errors with `// @ts-ignore` or `as any` — fix the root cause.
- If you touch database schema (`lib/schema.ts`), run `npm run db:push` to sync with Neon DB and verify no migration errors.

---

## Project Overview

**InkDown** is a premium, offline-first Progressive Web App (PWA) that gives users a Kindle-like reading experience for their GitHub Markdown files.

Users authenticate via **Clerk** (GitHub OAuth), browse their public and private GitHub repositories, pick `.md` files to read, and enjoy a deeply customisable reading environment. All reading data (highlights, bookmarks, progress) syncs to **Neon DB** via **Drizzle ORM**, with **Dexie.js** acting as the offline-first local cache.

This is a **production-quality** app deployed on **Vercel**. There is no room for shortcuts.

---

## Core Priorities

1. **Performance first.** This is a reader — it must feel instant. Every millisecond counts for First Contentful Paint and Time to Interactive.
2. **Reliability first.** Offline mode must work. If the network drops, the user must still be able to read their cached documents.
3. **Predictable behaviour.** The app must behave correctly when: the GitHub API rate-limits, the Clerk session expires, the Neon DB connection fails, or the service worker is updating.

> If a trade-off is required: choose **correctness and robustness** over short-term convenience.

---

## Architecture

```
zealous-tesla/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/             # Clerk-protected route group
│   ├── api/
│   │   └── webhooks/clerk/ # Clerk user-sync webhook (Svix-verified)
│   ├── library/            # Library dashboard + repo browser
│   ├── read/               # Reader view
│   └── ~offline/           # PWA offline fallback page
├── components/             # Shadcn UI + custom reader components
├── lib/
│   ├── db.ts               # Drizzle + Neon DB connection (server-only)
│   ├── schema.ts           # Drizzle table definitions
│   ├── github.ts           # Octokit GitHub API service
│   └── db-hooks.ts         # Dexie React hooks (offline cache)
├── public/sw.js            # Serwist service worker (generated)
└── AGENTS.md               # This file
```

### Key Data Flow

```
User signs in (Clerk)
  └─▶ Clerk webhook fires (user.created / user.updated)
        └─▶ /api/webhooks/clerk upserts user into Neon DB via Drizzle
              └─▶ User is now recognised; reads/writes filtered by clerkId
```

---

## Package Roles

| Package / File | Responsibility |
|---|---|
| `app/` | All Next.js routes and pages (App Router) |
| `components/` | Shadcn UI components + custom reader UI (Shadcn primitives extended, not replaced) |
| `lib/db.ts` | **Server-only** Drizzle + Neon HTTP connection |
| `lib/schema.ts` | Single source of truth for the database schema |
| `lib/github.ts` | All GitHub API calls via Octokit |
| `lib/db-hooks.ts` | Dexie.js React hooks for offline-first local cache |
| `public/sw.js` | Serwist-generated service worker for PWA |

---



## Maintainability

Long-term maintainability is a core priority:

- If you add new functionality, **check if shared logic already exists** before writing it again. Duplicate logic is a code smell.
- **Extract shared utilities** to `lib/`. Do not solve a general problem with local component logic.
- **Do not be afraid to refactor existing code.** Leaving a mess because "it worked before" is not acceptable.
- If a component exceeds ~200 lines, consider splitting it. Single-responsibility components are easier to test and maintain.

---

## Git & CI Workflow

All code changes follow this PR-based workflow:

1. **Branch**: `git checkout -b feature/<short-description>` or `fix/<short-description>`
2. **Commit**: Use clear, imperative commit messages: `Add TOC sidebar component`, `Fix highlight persistence on reload`
3. **Push & PR**: `gh pr create --title "..." --body "..." --base main`
4. **AI Review**: Wait for agent vulnerability/code-quality reviews in the PR comments
5. **Fix**: Address all agent feedback before merging
6. **Merge**: `gh pr merge --squash` (squash commits to keep `main` history clean)
7. **Verify**: Check that the Vercel deployment build passes before calling the task done

> **Never push directly to `main`.**

---

## Environment Variables

All secrets are in `.env.local` (never committed).

---

## Commands Reference

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint + Oxlint
npm run db:push      # Push schema changes to Neon DB
npm run db:studio    # Open Drizzle Studio (local DB GUI)
npx tsc --noEmit     # Type-check without emitting files
```

---

## What This App Is Not

- It is **not** a Markdown editor. Read-only rendering only.
- It is **not** a general-purpose file manager. It only surfaces `.md` files from GitHub repos.
- It is **not** a social app. No public profiles, no sharing, no comments.

Stay focused. Every feature should serve the core goal: **a beautiful, fast, offline-capable reading experience for GitHub Markdown files.**
