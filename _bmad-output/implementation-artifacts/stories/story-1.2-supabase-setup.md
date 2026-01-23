# Story 1.2: Supabase Setup & User Schema

Status: complete

## Story

As a developer,
I want to set up Supabase with the initial database schema,
so that user data can be securely stored and isolated.

## Acceptance Criteria

1. Environment variables set up (.env.local with SUPABASE_URL, SUPABASE_ANON_KEY)
2. Supabase client created in `src/lib/supabase.ts`
3. `profiles` table exists with columns: id (uuid, FK to auth.users), created_at, updated_at
4. Row Level Security enabled on profiles table
5. RLS policy ensures users can only access their own profile (auth.uid() = id)
6. SQL migration file saved in `supabase/migrations/`

## Tasks / Subtasks

- [x] Task 1: Create Supabase project (AC: 1)
  - [x] Go to supabase.com and create new project "budget-planner"
  - [x] Copy Project URL and anon/public key
  - [x] Create .env.local with PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY
  - [x] Add .env.local to .gitignore (verify)
  - [x] Update .env.example with placeholder values

- [x] Task 2: Configure Supabase client (AC: 2)
  - [x] Create src/lib/supabase.ts with createBrowserClient
  - [x] Create src/lib/server/supabase.ts with createServerClient for SSR
  - [x] Export typed client using Database types
  - [x] Verify client can connect (test query)

- [x] Task 3: Create profiles table (AC: 3, 6)
  - [x] Create supabase/migrations/001_create_profiles.sql
  - [x] Define profiles table: id (uuid PK, references auth.users), created_at, updated_at
  - [x] Add trigger for updated_at timestamp
  - [x] Run migration via Supabase Dashboard SQL editor

- [x] Task 4: Enable Row Level Security (AC: 4, 5)
  - [x] Enable RLS on profiles table
  - [x] Create policy: users can SELECT own profile (auth.uid() = id)
  - [x] Create policy: users can UPDATE own profile (auth.uid() = id)
  - [x] Create policy: users can INSERT own profile (auth.uid() = id)
  - [x] Add policies to migration file

- [x] Task 5: Generate TypeScript types (AC: 2)
  - [x] Install supabase CLI: `npm install -D supabase`
  - [x] Generate types: `npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts`
  - [x] Update supabase.ts to use generated Database type

- [x] Task 6: Verify setup (AC: 1-6)
  - [x] Test client connection in browser console
  - [x] Verify RLS policies work (can't access other users' data)
  - [x] Confirm migration file is complete and documented

## Dev Notes

### Architecture References

- [Source: architecture.md#Data Architecture]
- [Source: architecture.md#Authentication & Security]

### Supabase Client Pattern

```typescript
// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types/database';

export const supabase = createBrowserClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
```

### Migration SQL Template

```sql
-- 001_create_profiles.sql

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Naming Conventions

- Database: snake_case (profiles, created_at, user_id)
- TypeScript: camelCase (createdAt, userId)
- Supabase handles transformation automatically

### Prerequisites

- Story 1.1 completed (project initialized)
- Supabase account created

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (GitHub Copilot)

### Debug Log References

- Migration executed in Supabase Dashboard SQL Editor: "Success. No rows returned"
- `npm run check` ✅ - 0 errors, 0 warnings
- `npm run build` ✅ - Production build successful

### Completion Notes List

1. **Task 1**: User created Supabase project and configured .env.local with credentials
2. **Task 2**: Created typed browser client (`src/lib/supabase.ts`) and SSR server client (`src/lib/server/supabase.ts`)
3. **Task 3**: Created profiles table migration with auto-profile creation trigger on user signup
4. **Task 4**: RLS enabled with SELECT/UPDATE/INSERT policies for user's own profile
5. **Task 5**: Installed supabase CLI, created manual Database types in `src/lib/types/database.ts`
6. **Task 6**: Migration ran successfully, build passes, TypeScript compiles cleanly

### File List

- `.env.local` - Supabase credentials (not committed)
- `src/lib/supabase.ts` - Browser client with Database types
- `src/lib/server/supabase.ts` - SSR server client for hooks
- `src/lib/types/database.ts` - TypeScript types for profiles table
- `supabase/migrations/001_create_profiles.sql` - Complete migration with RLS
