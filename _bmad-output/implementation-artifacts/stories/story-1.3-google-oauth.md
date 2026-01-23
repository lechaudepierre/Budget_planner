# Story 1.3: Google OAuth Sign-In

Status: ready-for-dev

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

- [ ] Task 1: Configure Google OAuth in Supabase (AC: 2)
  - [ ] Go to Supabase Dashboard > Authentication > Providers
  - [ ] Enable Google provider
  - [ ] Create Google Cloud OAuth credentials (console.cloud.google.com)
  - [ ] Configure authorized redirect URI: `<supabase-url>/auth/v1/callback`
  - [ ] Add Client ID and Secret to Supabase

- [ ] Task 2: Create auth layout and login page (AC: 1, 2)
  - [ ] Create src/routes/auth/+page.svelte (login page)
  - [ ] Create src/routes/auth/+layout.svelte (no auth required)
  - [ ] Style with DaisyUI: centered card, Budget_planner logo, sign-in button
  - [ ] Implement signInWithGoogle function using supabase.auth.signInWithOAuth

- [ ] Task 3: Create OAuth callback handler (AC: 3, 4, 5)
  - [ ] Create src/routes/auth/callback/+server.ts
  - [ ] Exchange code for session using supabase.auth.exchangeCodeForSession
  - [ ] Redirect to dashboard on success
  - [ ] Handle errors with redirect to /auth?error=...

- [ ] Task 4: Create profile on first sign-in (AC: 6)
  - [ ] Create src/routes/auth/callback/+server.ts logic to check if profile exists
  - [ ] If no profile, insert new profile record
  - [ ] Use upsert to handle race conditions

- [ ] Task 5: Implement route protection (AC: 7)
  - [ ] Create src/hooks.server.ts for auth middleware
  - [ ] Check session on each request using getSession()
  - [ ] Redirect unauthenticated users to /auth for protected routes
  - [ ] Allow /auth routes without authentication

- [ ] Task 6: Handle OAuth errors (AC: 8)
  - [ ] Display error message if ?error query param exists on /auth
  - [ ] Show user-friendly messages for common errors
  - [ ] Style error display with DaisyUI alert component

- [ ] Task 7: Verify auth flow (AC: 1-8)
  - [ ] Test complete sign-in flow
  - [ ] Verify profile creation on first sign-in
  - [ ] Test protected route redirect
  - [ ] Test error handling (cancel OAuth, etc.)

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

### Debug Log References

### Completion Notes List

### File List
