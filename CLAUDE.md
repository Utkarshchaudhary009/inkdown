AGENTS.md

## Coding Standards

### General
- **No `any` types.** Infer or explicitly define. If you genuinely can't type something, use `unknown` and narrow it.
- **No barrel files** (`index.ts` re-exporting everything). Import directly from the source file.
- **No unused imports or variables.** The linter enforces this — do not add lint-disable comments.
- **Prefer `const` over `let`.** Only use `let` if reassignment is unavoidable.
- **Avoid magic numbers.** Extract constants with descriptive names.

### React / Next.js
- **Server Components by default.** Only add `"use client"` when the component genuinely requires browser APIs, state, or event handlers.
- **Server Actions for mutations.** Do not create API routes for simple form submissions — use `"use server"` actions.
- **No `useEffect` for data fetching.** Use RSC data fetching or `useSWR` / React Query instead.
- **All database access is server-side only.** Never import `lib/db.ts` in a Client Component or a file that can be bundled client-side.

### Database (Drizzle + Neon)
- **Always filter by `clerkId`** when reading or writing user data. Never expose one user's data to another.
- **Schema changes go in `lib/schema.ts`.** Run `npm run db:push` after any change to sync to Neon DB.
- **No raw SQL strings** outside of `lib/db.ts`. Use Drizzle's query builder.

### Auth (Clerk)
- **Use `auth()` from `@clerk/nextjs/server`** in Server Components / Actions to get the current user ID.
- **The webhook endpoint `/api/webhooks/clerk` must remain public** (excluded from Clerk middleware). Never accidentally protect it.
- **Never trust client-sent user IDs.** Always derive the user ID server-side from the Clerk session.

### Styling (Tailwind + Shadcn)
- **Use Shadcn components** (`components/ui/`) wherever a primitive exists (Button, Dialog, Slider, Sheet, etc.). Do not recreate them.
- **Use Tailwind utility classes** for layout and spacing. Avoid inline `style` props unless dealing with dynamic CSS custom properties for reading themes.
- **Reading themes** (light, dark, sepia, night, forest) are implemented as CSS custom properties on `[data-theme="..."]`. Use these variables in the reader view, not hardcoded Tailwind colour classes.
- **No `!important` in CSS.** Restructure specificity instead.

### Markdown (Streamdown)
- **Use `<Streamdown>` component** from the `streamdown` package for all markdown rendering.
- Include plugins: `@streamdown/code` (Shiki), `@streamdown/math` (KaTeX), `@streamdown/mermaid`.
- **Custom renderers** for headings must inject `id` attributes for TOC anchor navigation.
- The `@source` directives for Streamdown and its plugins must remain in `app/globals.css`.

### PWA / Offline (Serwist)
- **Do not edit `public/sw.js` directly.** Edit `app/sw.ts` and let the build regenerate it.
- **Offline reads must work.** If a user has previously viewed a document, it must be readable offline via Dexie cache. Test this explicitly.

---
