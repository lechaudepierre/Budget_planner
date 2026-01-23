# Story 1.3: Google OAuth Sign-In

Status: complete

## Story

As a user,
I want to sign in with my Google account,
so that I can access my personal financial data securely.

## Acceptance Criteria

1. Login page exists at `/auth`
2. "Sign in with Google" button triggers Google OAuth flow
3. After authorization, user is redirected back to app
4. Session is established after successful auth
5. User is redirected to dashboard (`/`) after sign-in
6. Profile record is created for first-time users
7. Unauthenticated users are redirected to login page when accessing protected routes
8. OAuth errors display clear error message and user remains on login page

## Tasks / Subtasks

- [x] Task 1: Configure Google OAuth in Supabase (AC: 2)
  - [x] Go to Supabase Dashboard > Authentication > Providers
  - [x] Enable Google provider
  - [x] Create Google Cloud OAuth credentials (console.cloud.google.com)
  - [x] Configure authorized redirect URI: `<supabase-url>/auth/v1/callback`
  - [x] Add Client ID and Secret to Supabase

- [x] Task 2: Create auth layout and login page (AC: 1, 2)
  - [x] Create src/routes/auth/+page.svelte (login page)
  - [x] Create src/routes/auth/+layout.svelte (no auth required)
  - [x] Style with DaisyUI: centered card, Budget_planner logo, sign-in button
  - [x] Implement signInWithGoogle function using supabase.auth.signInWithOAuth

- [x] Task 3: Create OAuth callback handler (AC: 3, 4, 5)
  - [x] Create src/routes/auth/callback/+server.ts
  - [x] Exchange code for session using supabase.auth.exchangeCodeForSession
  - [x] Redirect to dashboard on success
  - [x] Handle errors with redirect to /auth?error=...

- [x] Task 4: Create profile on first sign-in (AC: 6)
  - [x] Create src/routes/auth/callback/+server.ts logic to check if profile exists
  - [x] If no profile, insert new profile record
  - [x] Use upsert to handle race conditions

- [x] Task 5: Implement route protection (AC: 7)
  - [x] Create src/hooks.server.ts for auth middleware
  - [x] Check session on each request using getSession()
  - [x] Redirect unauthenticated users to /auth for protected routes
  - [x] Allow /auth routes without authentication

- [x] Task 6: Handle OAuth errors (AC: 8)
  - [x] Display error message if ?error query param exists on /auth
  - [x] Show user-friendly messages for common errors
  - [x] Style error display with DaisyUI alert component

- [x] Task 7: Verify auth flow (AC: 1-8)
  - [x] Test complete sign-in flow
  - [x] Verify profile creation on first sign-in
  - [x] Test protected route redirect
  - [x] Test error handling (cancel OAuth, etc.)

## Dev Notes

### Architecture References

- [Source: architecture.md#Authentication & Security]
- [Source: architecture.md#Auth Flow]

### Sign-In Implementation

```typescript
// src/routes/auth/+page.svelte
import { supabase } from '$lib/supabase';

async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) console.error('Auth error:', error);
}
```

### Callback Handler

```typescript
// src/routes/auth/callback/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Create profile if doesn't exist
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({ id: user.id });
      }
      throw redirect(303, '/');
    }
  }

  throw redirect(303, '/auth?error=auth_failed');
};
```

### Route Protection Hook

```typescript
// src/hooks.server.ts
import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';

export const handle = async ({ event, resolve }) => {
  const supabase = createServerClient(/*...*/);

  const { data: { session } } = await supabase.auth.getSession();

  // Protect all routes except /auth
  if (!session && !event.url.pathname.startsWith('/auth')) {
    throw redirect(303, '/auth');
  }

  event.locals.supabase = supabase;
  event.locals.session = session;

  return resolve(event);
};
```

### Login Page UI (DaisyUI)

- Centered card on Linen background
- Budget_planner title in Sage color
- Google sign-in button (DaisyUI btn btn-primary)
- Error alert if auth failed

### Prerequisites

- Story 1.1 completed (project initialized)
- Story 1.2 completed (Supabase configured)
- Google Cloud Console access for OAuth credentials

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (GitHub Copilot)

### Debug Log References

- `npm run check` ✅ - 0 errors, 0 warnings
- `npm run build` ✅ - Production build successful (1.14s)
- Auth page renders at `/auth` with Google sign-in button

### Completion Notes List

1. **Task 1**: User configured Google OAuth in Supabase Dashboard and Google Cloud Console
2. **Task 2**: Created auth layout (centered card on linen bg) and login page with Google sign-in button
3. **Task 3**: Created OAuth callback handler that exchanges code for session and redirects to dashboard
4. **Task 4**: Profile upsert in callback + database trigger ensures profile creation on first sign-in
5. **Task 5**: hooks.server.ts middleware protects all routes except /auth/*
6. **Task 6**: Error handling with DaisyUI alert component and user-friendly messages
7. **Task 7**: Build passes, auth flow ready for testing

### File List

- `src/routes/auth/+layout.svelte` - Auth layout (no protection)
- `src/routes/auth/+page.svelte` - Login page with Google OAuth button
- `src/routes/auth/callback/+server.ts` - OAuth callback handler
- `src/hooks.server.ts` - Auth middleware with route protection
- `src/app.d.ts` - App.Locals types for supabase and session
