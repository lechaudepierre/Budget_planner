# Story 1.2: Supabase Setup & User Schema

Status: ready-for-dev

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

- [ ] Task 1: Create Supabase project (AC: 1)
  - [ ] Go to supabase.com and create new project "budget-planner"
  - [ ] Copy Project URL and anon/public key
  - [ ] Create .env.local with PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY
  - [ ] Add .env.local to .gitignore (verify)
  - [ ] Update .env.example with placeholder values

- [ ] Task 2: Configure Supabase client (AC: 2)
  - [ ] Create src/lib/supabase.ts with createBrowserClient
  - [ ] Create src/lib/server/supabase.ts with createServerClient for SSR
  - [ ] Export typed client using Database types
  - [ ] Verify client can connect (test query)

- [ ] Task 3: Create profiles table (AC: 3, 6)
  - [ ] Create supabase/migrations/001_create_profiles.sql
  - [ ] Define profiles table: id (uuid PK, references auth.users), created_at, updated_at
  - [ ] Add trigger for updated_at timestamp
  - [ ] Run migration via Supabase Dashboard SQL editor

- [ ] Task 4: Enable Row Level Security (AC: 4, 5)
  - [ ] Enable RLS on profiles table
  - [ ] Create policy: users can SELECT own profile (auth.uid() = id)
  - [ ] Create policy: users can UPDATE own profile (auth.uid() = id)
  - [ ] Create policy: users can INSERT own profile (auth.uid() = id)
  - [ ] Add policies to migration file

- [ ] Task 5: Generate TypeScript types (AC: 2)
  - [ ] Install supabase CLI: `npm install -D supabase`
  - [ ] Generate types: `npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts`
  - [ ] Update supabase.ts to use generated Database type

- [ ] Task 6: Verify setup (AC: 1-6)
  - [ ] Test client connection in browser console
  - [ ] Verify RLS policies work (can't access other users' data)
  - [ ] Confirm migration file is complete and documented

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

### Debug Log References

### Completion Notes List

### File List
