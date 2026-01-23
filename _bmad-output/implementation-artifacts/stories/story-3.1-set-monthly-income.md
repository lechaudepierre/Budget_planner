# Story 3.1: Set Monthly Income

Status: not-started

## Story

As a user,
I want to enter my monthly income,
so that I know how much money I have to allocate across my budgets.

## Acceptance Criteria

1. Budget setup page exists at `/budgets`
2. Field to enter monthly income is visible
3. Income amount is saved for the current month
4. Success toast confirms the save
5. Income is displayed at the top of the budget page
6. Income becomes the base for calculating "remaining" during allocation
7. Previous month's income is pre-filled for new months

## Tasks / Subtasks

- [ ] Task 1: Create monthly_budgets table migration (AC: 3)
  - [ ] Create `supabase/migrations/003_create_monthly_budgets.sql`
  - [ ] Table: id (uuid), user_id (uuid FK), month (text YYYY-MM), income (numeric), created_at, updated_at
  - [ ] RLS policies for user isolation
  - [ ] Index on (user_id, month) for fast lookups
  - [ ] Unique constraint on (user_id, month)

- [ ] Task 2: Create TypeScript types for budgets (AC: 3)
  - [ ] Add MonthlyBudget type to `src/lib/types/database.ts`
  - [ ] Create `src/lib/schemas/budget.ts` with Zod validation

- [ ] Task 3: Create data layer for monthly budgets (AC: 3, 6, 7)
  - [ ] Create `src/lib/data/budgets.ts`
  - [ ] Implement `getMonthlyBudget(month: string)` - returns current or creates from previous
  - [ ] Implement `upsertMonthlyBudget(month: string, income: number)`
  - [ ] Implement `getCurrentMonthKey()` utility
  - [ ] All functions return `{ data, error }` pattern

- [ ] Task 4: Create /budgets page layout (AC: 1, 2, 5)
  - [ ] Create `src/routes/budgets/+page.svelte`
  - [ ] Display month selector at top (current month by default)
  - [ ] Show income input field prominently
  - [ ] Display "Revenus: X €" header when income is set
  - [ ] Loading state while fetching data

- [ ] Task 5: Implement income form and save (AC: 2, 3, 4)
  - [ ] Create inline income editor (click to edit pattern)
  - [ ] Validate income is positive number
  - [ ] Save on blur or Enter key
  - [ ] Show success toast on save
  - [ ] Update display immediately (optimistic UI)

- [ ] Task 6: Implement previous month pre-fill (AC: 7)
  - [ ] When accessing new month, check if income exists
  - [ ] If not, fetch previous month's income
  - [ ] Pre-fill the field (user can modify)
  - [ ] Only save when user explicitly confirms

- [ ] Task 7: Verify and test (AC: 1-7)
  - [ ] Test income save flow
  - [ ] Test month navigation
  - [ ] Test pre-fill from previous month
  - [ ] Verify TypeScript compilation
  - [ ] Test error handling

## Dev Notes

### Database Schema

```sql
CREATE TABLE public.monthly_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: "2026-01"
    income NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(user_id, month)
);
```

### Month Key Format

```typescript
// Format: "2026-01" for January 2026
function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
```

### UI Design Reference

- Income displayed prominently at top of budget page
- Consistent with ux-design-directions-v3.html style
- Use sage color for income display
- Editable inline with click-to-edit pattern

## Dependencies

- Epic 1 (Authentication) - Complete ✓
- Epic 2 (Patrimoine) - Complete ✓
