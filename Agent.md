# AGENTS.md

## Project Constraints

1. **Authentication & Database Stack:**
   - **Clerk** is the exclusive authentication provider.
   - **Supabase** is the database provider.
   - **Native Integration:** We use a native integration pattern. Supabase Row Level Security (RLS) policies **MUST** rely strictly on Clerk JWT claims, specifically the `sub` (user ID) and `user_role` claims.
   - **Do NOT** introduce Supabase Auth or duplicate user identity state in our database unless explicitly requested. The source of truth for user identity is the Clerk JWT.

2. **Core Priorities:**
   - **Security & Correctness:** Ensure all RLS policies are secure and correctly parse the Clerk JWT. Do not bypass security for the sake of getting a query to work.
   - **Performance & Reliability:** Keep behavior predictable under load. Minimize unnecessary database roundtrips.

3. **Maintainability:**
   - Extract shared database client and auth logic into dedicated utilities. Duplicate initialization of Supabase clients with custom JWT headers is a code smell. 
   - Don't be afraid to refactor existing code to adhere to this pattern.

4. **Task Completion:**
   - All TypeScript type checks (e.g., `npm run typecheck`) and linting (`npm run lint`) must pass before a task is considered complete.
   - Any database migrations must include both the schema changes AND the corresponding RLS policies referencing Clerk's JWT claims.
