---
status: 'complete'
startedAt: '2026-01-23'
completedAt: '2026-01-23'
epic: 'Epic 2: Patrimoine & Account Management'
storyNumber: '2.1'
---

# Story 2.1: Add Bank Account

## User Story

As a user,
I want to add a bank account with a name and current balance,
So that I can start tracking my total patrimoine.

## Acceptance Criteria

**Given** I am signed in
**When** I navigate to the Patrimoine page
**Then** I see an "Ajouter un compte" button

**Given** I click "Ajouter un compte"
**When** the modal opens
**Then** I see a form with fields for: Nom du compte (text), Solde actuel (number)

**Given** I fill in the account form with valid data
**When** I click "Ajouter"
**Then** the account is saved to the database
**And** I see the new account in my accounts list
**And** a success toast appears

**Given** I try to add an account with empty name or invalid balance
**When** I click "Ajouter"
**Then** I see inline validation errors
**And** the account is not saved

## Implementation Tasks

- [x] Task 1: Create accounts table migration with RLS
- [x] Task 2: Update database types in `src/lib/types/database.ts`
- [x] Task 3: Create Account type and Zod schema
- [x] Task 4: Implement data layer functions (getAccounts, createAccount)
- [x] Task 5: Create AccountForm.svelte component
- [x] Task 6: Create /patrimoine route with accounts list and add button
- [x] Task 7: Integrate modal for adding accounts
- [x] Task 8: Add toast notifications for success/error
- [ ] Task 9: **RUN MIGRATION** in Supabase Dashboard

## Files Created/Modified

- `supabase/migrations/002_create_accounts.sql` - Database migration
- `src/lib/types/database.ts` - Added accounts table types
- `src/lib/schemas/account.ts` - Zod validation schema
- `src/lib/data/accounts.ts` - Data layer functions
- `src/lib/utils/currency.ts` - Currency formatting utilities
- `src/lib/components/forms/AccountForm.svelte` - Account form component
- `src/routes/patrimoine/+page.svelte` - Patrimoine page

## Migration Required

Run this SQL in Supabase Dashboard (SQL Editor):
```sql
-- Copy contents of supabase/migrations/002_create_accounts.sql
```
