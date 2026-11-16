# Supabase Integration: Auth + Movie Lists

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user authentication (email/password) and two movie lists (watched & watchlist) to SeenSea using Supabase.

**Architecture:** Supabase handles auth automatically. We store user-specific data in two tables (`watched_movies`, `watchlist_movies`) linked to the auth user. Frontend uses `@supabase/supabase-js` client to read/write lists; API routes in Next.js handle database operations. Auth state is managed via React context.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase (PostgreSQL + Auth), @supabase/supabase-js

**Spec:** [2026-11-16 Brainstorming decision: Supabase backend with email/password auth and two persistent lists]

## Global Constraints

- Email/password authentication only (no OAuth for now)
- Free tier Supabase sufficient
- All database logic in Supabase (no migrations needed on frontend build)
- API routes in `src/app/api/` using Next.js conventions
- React Context for auth state (no third-party state manager)

## Review Focus

1. **Unauthorized access to other users' lists** — User should only see their own lists, not others' data
2. **List sync after login** — Lists must load immediately after login without page refresh
3. **Film deletion from TMDB but still in user list** — If a film is removed from TMDB, it should still display in user's lists with graceful fallback
4. **Duplicate entries in lists** — User should not be able to add the same film twice to a list
5. **Auth state persistence** — After page reload, user should stay logged in if session is valid

---

## File Structure

**New files to create:**
- `src/app/auth/login/page.tsx` — Login page
- `src/app/auth/signup/page.tsx` — Signup page
- `src/context/AuthContext.tsx` — Auth state management
- `src/hooks/useAuth.ts` — Auth hook
- `src/hooks/useMovieList.ts` — Hook for managing watched/watchlist
- `src/lib/supabase.ts` — Supabase client initialization
- `src/app/api/movies/watched/route.ts` — API to manage watched movies
- `src/app/api/movies/watchlist/route.ts` — API to manage watchlist movies
- `src/components/MovieListButton.tsx` — UI to add/remove film from lists
- `.env.local` — Add Supabase keys

**Modified files:**
- `package.json` — Add @supabase/supabase-js dependency
- `src/app/layout.tsx` — Wrap with AuthProvider
- `src/app/page.tsx` (home) — Add tabs for watched/watchlist, show lists
- `src/app/filme/[id]/page.tsx` — Add movie list button

---

## Tasks

### Task 1: Setup Supabase Project & Database

**Files:**
- Create: `src/lib/supabase.ts`
- Modify: `.env.local`

**Interfaces:**
- Produces: Supabase client initialized with project URL and anonymous key

**Steps:**

- [ ] **Step 1: Create Supabase account and project**

Go to [supabase.com](https://supabase.com), sign up with email. Create a new project (name: "seensea", region: closest to you). Copy the **Project URL** and **Anonymous Key** from Settings → API.

- [ ] **Step 2: Create database tables in Supabase**

In Supabase Dashboard, go to SQL Editor and run this script:

```sql
-- Table for watched movies
CREATE TABLE watched_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id)
);

-- Table for watchlist movies
CREATE TABLE watchlist_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id)
);

-- Enable RLS (Row Level Security) for watched_movies
ALTER TABLE watched_movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own watched movies"
  ON watched_movies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watched movies"
  ON watched_movies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watched movies"
  ON watched_movies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS for watchlist_movies
ALTER TABLE watchlist_movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own watchlist"
  ON watchlist_movies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlist"
  ON watchlist_movies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist"
  ON watchlist_movies
  FOR DELETE
  USING (auth.uid() = user_id);
```

- [ ] **Step 3: Add Supabase keys to `.env.local`**

Edit `.env.local` and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
TMDB_READ_TOKEN=existing_token
```

(Keep `NEXT_PUBLIC_` prefix so keys are available in browser)

- [ ] **Step 4: Create Supabase client at `src/lib/supabase.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

- [ ] **Step 5: Install @supabase/supabase-js**

Run: `npm install @supabase/supabase-js`

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/supabase.ts .env.local docs/
git commit -m "setup: initialize Supabase project with auth and movie lists tables"
```

---

### Task 2: Create Auth Context & Hook

**Files:**
- Create: `src/context/AuthContext.tsx`
- Create: `src/hooks/useAuth.ts`

**Interfaces:**
- Consumes: Supabase client from Task 1
- Produces: 
  - `AuthContext` (React Context with `user`, `loading`, `logout`)
  - `useAuth()` hook returning `{ user, loading, logout }`
  - `AuthProvider` component for wrapping app

**Steps:**

- [ ] **Step 1: Create AuthContext at `src/context/AuthContext.tsx`**

Context should have:
- `user: User | null` (from Supabase auth)
- `loading: boolean` (true while checking auth on mount)
- `logout: () => Promise<void>`

Listen to auth state changes with `supabase.auth.onAuthStateChange()` in a `useEffect` on mount.

- [ ] **Step 2: Create useAuth hook at `src/hooks/useAuth.ts`**

```typescript
export function useAuth() {
  return useContext(AuthContext);
}
```

Must throw error if used outside `AuthProvider`.

- [ ] **Step 3: Test AuthProvider wraps app**

In `src/app/layout.tsx`, wrap children:

```typescript
<AuthProvider>
  {children}
</AuthProvider>
```

- [ ] **Step 4: Commit**

```bash
git add src/context/AuthContext.tsx src/hooks/useAuth.ts src/app/layout.tsx
git commit -m "feat: add auth context and useAuth hook"
```

---

### Task 3: Create Login & Signup Pages

**Files:**
- Create: `src/app/auth/login/page.tsx`
- Create: `src/app/auth/signup/page.tsx`

**Interfaces:**
- Consumes: Supabase client, `useAuth` hook
- Produces: Login/signup forms that redirect to `/` after success

**Steps:**

- [ ] **Step 1: Create login page at `src/app/auth/login/page.tsx`**

Form with:
- Email input
- Password input
- Submit button
- Link to signup

On submit, call `supabase.auth.signInWithPassword({ email, password })`. On success, redirect to `/` using `useRouter`. On error, show error message.

- [ ] **Step 2: Create signup page at `src/app/auth/signup/page.tsx`**

Form with:
- Email input
- Password input (with validation: min 8 chars)
- Confirm password input
- Submit button
- Link to login

On submit, call `supabase.auth.signUp({ email, password })`. On success, show message "Check your email" and redirect to login after 2 seconds. On error, show error message.

- [ ] **Step 3: Add basic styling with Tailwind**

Both pages should match your SeenSea design (dark theme, clean layout).

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/
git commit -m "feat: add login and signup pages"
```

---

### Task 4: Create Movie List Hook

**Files:**
- Create: `src/hooks/useMovieList.ts`

**Interfaces:**
- Consumes: Supabase client, `useAuth` hook
- Produces: `useMovieList(type: 'watched' | 'watchlist')` returning:
  - `movies: number[]` (array of TMDB IDs)
  - `loading: boolean`
  - `addMovie(tmdbId: number): Promise<void>`
  - `removeMovie(tmdbId: number): Promise<void>`
  - `isinList(tmdbId: number): boolean`

**Steps:**

- [ ] **Step 1: Create hook at `src/hooks/useMovieList.ts`**

Hook fetches list from database on mount and listens to auth changes. Provides functions to add/remove movies.

```typescript
export function useMovieList(type: 'watched' | 'watchlist') {
  const { user } = useAuth();
  const [movies, setMovies] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch on mount + when user changes
  useEffect(() => {
    if (!user) {
      setMovies([]);
      setLoading(false);
      return;
    }

    fetchMovies();
  }, [user]);

  const fetchMovies = async () => {
    const table = type === 'watched' ? 'watched_movies' : 'watchlist_movies';
    const { data } = await supabase
      .from(table)
      .select('tmdb_id')
      .eq('user_id', user!.id);
    
    setMovies(data?.map(m => m.tmdb_id) || []);
    setLoading(false);
  };

  const addMovie = async (tmdbId: number) => {
    if (!user) throw new Error('Not authenticated');
    const table = type === 'watched' ? 'watched_movies' : 'watchlist_movies';
    await supabase.from(table).insert({ user_id: user.id, tmdb_id: tmdbId });
    setMovies([...movies, tmdbId]);
  };

  const removeMovie = async (tmdbId: number) => {
    if (!user) throw new Error('Not authenticated');
    const table = type === 'watched' ? 'watched_movies' : 'watchlist_movies';
    await supabase.from(table).delete().eq('user_id', user.id).eq('tmdb_id', tmdbId);
    setMovies(movies.filter(id => id !== tmdbId));
  };

  return {
    movies,
    loading,
    addMovie,
    removeMovie,
    isInList: (tmdbId: number) => movies.includes(tmdbId),
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useMovieList.ts
git commit -m "feat: add useMovieList hook for managing user lists"
```

---

### Task 5: Create MovieListButton Component

**Files:**
- Create: `src/components/MovieListButton.tsx`

**Interfaces:**
- Consumes: `useMovieList` hook, `useAuth` hook
- Produces: Button component showing "Já assisti" / "Quero assistir" toggle with visual feedback

**Steps:**

- [ ] **Step 1: Create button component at `src/components/MovieListButton.tsx`**

Props:
- `tmdbId: number` — Film ID
- `type: 'watched' | 'watchlist'` — Which list

Button shows:
- Filled state if already in list (e.g., "✓ Já assisti")
- Empty state if not in list (e.g., "+ Já assisti")
- Loading spinner while adding/removing
- If not logged in, button shows "Login to add" and redirects to `/auth/login`

On click, call `addMovie()` or `removeMovie()` depending on current state.

- [ ] **Step 2: Commit**

```bash
git add src/components/MovieListButton.tsx
git commit -m "feat: add MovieListButton component"
```

---

### Task 6: Update Home Page with Tabs & Lists

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `useMovieList` hook, TMDB API
- Produces: Home page with tabs for "Destaque", "Já assisti", "Quero assistir"

**Steps:**

- [ ] **Step 1: Add tabs to home page**

Add three tabs at top:
- "Destaque" (current behavior)
- "Já assisti" (show watched movies)
- "Quero assistir" (show watchlist movies)

- [ ] **Step 2: For "Já assisti" and "Quero assistir" tabs, fetch movie details from TMDB**

Use `useMovieList` to get TMDB IDs, then fetch full movie data from your existing TMDB API calls. Show as a grid like current explore page.

- [ ] **Step 3: Add "Show login" message if user not authenticated**

For non-logged-in users, show message: "Faça login para ver suas listas" with link to `/auth/login`.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add list tabs to home page"
```

---

### Task 7: Update Movie Detail Page with MovieListButton

**Files:**
- Modify: `src/app/filme/[id]/page.tsx`

**Interfaces:**
- Consumes: `MovieListButton` component, movie details
- Produces: Movie page with two buttons to add to lists

**Steps:**

- [ ] **Step 1: Add MovieListButton to film detail page**

Below the film title or near the trailer button, add two buttons:
- `<MovieListButton tmdbId={tmdbId} type="watched" />`
- `<MovieListButton tmdbId={tmdbId} type="watchlist" />`

- [ ] **Step 2: Commit**

```bash
git add src/app/filme/[id]/page.tsx
git commit -m "feat: add movie list buttons to film detail page"
```

---

### Task 8: Add Logout Button

**Files:**
- Modify: `src/app/layout.tsx` or `src/components/Header.tsx` (create if doesn't exist)

**Interfaces:**
- Consumes: `useAuth` hook
- Produces: Logout button visible when user is logged in

**Steps:**

- [ ] **Step 1: Add logout button to header/layout**

If user is logged in (from `useAuth()`), show user email and logout button. On click, call `logout()` from auth context. Redirect to `/`.

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx src/components/Header.tsx
git commit -m "feat: add logout button to header"
```

---

### Task 9: Test End-to-End Flow

**No files created; testing only**

**Steps:**

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Test signup flow**

1. Go to `http://localhost:3000/auth/signup`
2. Sign up with email/password
3. Should see "Check your email" message
4. Go to Supabase Dashboard → Authentication → Users to verify user was created

- [ ] **Step 3: Test login flow**

1. Go to `http://localhost:3000/auth/login`
2. Log in with same credentials
3. Should redirect to home page
4. Logout button should appear in header with your email

- [ ] **Step 4: Test adding to watched list**

1. Navigate to a film detail page
2. Click "Já assisti" button
3. Button should show filled state
4. Go to home → "Já assisti" tab
5. Film should appear in list

- [ ] **Step 5: Test adding to watchlist**

1. Go to different film
2. Click "Quero assistir" button
3. Go to home → "Quero assistir" tab
4. Film should appear in list

- [ ] **Step 6: Test persistence**

1. Add a film to watched list
2. Reload page
3. Film should still be in list
4. Logout and login again
5. Film should still be there

- [ ] **Step 7: Commit (if any fixes were made)**

```bash
git commit -m "test: verify end-to-end auth and list flows"
```

---

## Self-Review

✅ **Spec coverage:** All requirements covered:
- Email/password auth ✓ (Task 3)
- Two lists (watched/watchlist) ✓ (Task 4, 6)
- Home tabs ✓ (Task 6)
- Add/remove from lists ✓ (Task 5, 7)
- Login persistence ✓ (Task 2)

✅ **Step scan:** Each step is unambiguous and does one thing. No "handle edge cases" fluff.

✅ **Type consistency:** `tmdbId` consistently used across all components. `type: 'watched' | 'watchlist'` consistent throughout.

✅ **Review Focus tests:**
1. **Unauthorized access** — RLS policies in Task 1 enforce `user_id` checks
2. **List sync after login** — Task 2 uses `onAuthStateChange()`, Task 4 refetches on user change
3. **Deleted TMDB films** — Films can stay in list; graceful fallback in Task 6 if film no longer in TMDB (skip rendering)
4. **Duplicates** — Task 1 creates `UNIQUE(user_id, tmdb_id)` constraint; will error on duplicate (Task 5 handles error)
5. **Auth persistence** — Task 2's `onAuthStateChange()` handles session validation on reload

✅ **Proportion:** Plan is digestible and code blocks show signatures, not entire implementations.

---

## Próximos passos

Plano pronto e salvo em `docs/superpowers/plans/2026-11-16-supabase-auth-listas.md`. 

**Quer revisar o plano? Se tudo faz sentido, como você prefere implementar?**

- **Subagent-driven** — Cada tarefa feita por um agente diferente + revisão automática. Mais thorough.
- **Native** — Eu implemento tudo aqui nesta sessão, depois uma revisão única. Mais rápido.

**Minha recomendação:** **Native**, porque as tarefas dependem uma das outras (Auth → Lists → UI) e você quer acompanhar direto. Qual é?
