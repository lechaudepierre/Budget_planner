# Story 1.4: Session Persistence & Sign-Out

Status: ready-for-dev

## Story

As a user,
I want my session to persist across browser sessions and be able to sign out,
so that I don't have to log in every time and can securely end my session.

## Acceptance Criteria

1. Session persists when browser is closed and reopened (up to 30 days)
2. Sign-out button terminates session
3. After sign-out, user is redirected to login page
4. After sign-out, protected routes are inaccessible
5. Expired sessions (30 days inactivity) redirect to login with message

## Tasks / Subtasks

- [ ] Task 1: Configure session persistence (AC: 1)
  - [ ] Verify Supabase auth settings (30 day session by default)
  - [ ] Ensure cookies are set with proper expiration
  - [ ] Test session survives browser restart

- [ ] Task 2: Create sign-out endpoint (AC: 2, 3)
  - [ ] Create src/routes/auth/logout/+server.ts
  - [ ] Call supabase.auth.signOut()
  - [ ] Clear any client-side auth state
  - [ ] Redirect to /auth after logout

- [ ] Task 3: Add sign-out UI (AC: 2)
  - [ ] Add "Sign out" button/link to layout (temporary, will be in navbar later)
  - [ ] Wire button to POST /auth/logout
  - [ ] Show loading state during sign-out

- [ ] Task 4: Verify protected route blocking (AC: 4)
  - [ ] After sign-out, try accessing / directly
  - [ ] Confirm redirect to /auth
  - [ ] Verify no cached data accessible

- [ ] Task 5: Handle expired sessions (AC: 5)
  - [ ] Detect expired session in hooks.server.ts
  - [ ] Redirect to /auth?error=session_expired
  - [ ] Display "Session expired, please sign in again" message

- [ ] Task 6: Test complete session lifecycle (AC: 1-5)
  - [ ] Sign in → close browser → reopen → still signed in
  - [ ] Sign in → sign out → cannot access protected routes
  - [ ] Verify 30-day session configuration

## Dev Notes

### Architecture References

- [Source: architecture.md#Authentication & Security]
- NFR10: Session expires after 30 days of inactivity

### Sign-Out Endpoint

```typescript
// src/routes/auth/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase } }) => {
  await supabase.auth.signOut();
  throw redirect(303, '/auth');
};
```

### Sign-Out Form

```svelte
<!-- Temporary sign-out button -->
<form method="POST" action="/auth/logout">
  <button type="submit" class="btn btn-ghost">Sign out</button>
</form>
```

### Session Check Enhancement

```typescript
// hooks.server.ts - enhanced session handling
const { data: { session }, error } = await supabase.auth.getSession();

if (error?.message?.includes('expired')) {
  throw redirect(303, '/auth?error=session_expired');
}
```

### Cookie Configuration

Supabase SSR handles cookies automatically with:
- Secure flag in production
- HttpOnly for session tokens
- SameSite=Lax
- 30-day expiration (configurable in Supabase dashboard)

### Prerequisites

- Story 1.1 completed
- Story 1.2 completed
- Story 1.3 completed (auth flow working)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
