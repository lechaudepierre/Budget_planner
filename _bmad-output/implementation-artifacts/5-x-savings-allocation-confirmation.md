# Story 5.X: Savings Allocation Confirmation (Month-End Finalization)

Status: ready-for-dev

## Story

As a user,
I want my monthly savings allocations to be finalized at month-end and added to my goals' current amounts,
So that next month starts with the correct savings progress and I only need to allocate the remaining amount.

## Problem Statement

Currently, savings allocations exist in `monthly_savings_allocations.allocated_amount` but are never confirmed/finalized to update `savings_goals.current_amount`. This means:

- A 800€ allocation towards a 1000€ goal shows progress this month
- But next month, the goal resets to 0% because `current_amount` is still 0
- User has to re-allocate the full amount instead of just the remaining 200€

## Acceptance Criteria

1. **Given** I have savings allocations for the current month, **When** I view a goal in the bilan or épargne page, **Then** I see my allocation reflected in the progress

2. **Given** I'm at the end of the month, **When** I finalize/archive the month, **Then** all allocations are added to the goals' `current_amount`

3. **Given** my allocations were finalized last month, **When** I start a new month, **Then** the goal shows the accumulated progress and I only need to allocate the remaining amount

4. **Given** a goal has 800€ current_amount and 1000€ target, **When** I create a new month's allocation, **Then** I see I only need 200€ more to complete this goal

5. **Given** I finalize the month, **When** allocation is transferred to current_amount, **Then** the allocation record is marked as "finalized" to prevent double-counting

## Proposed Solutions

### Option A: Manual "Finaliser le mois" Button

- Add a button on the Bilan page to finalize the month
- When clicked, all allocations are added to goals' `current_amount`
- Allocations are marked as `is_finalized = true`
- Simple, explicit control for the user

### Option B: Automatic on Month End

- When accessing a new month, auto-finalize previous month
- Less manual work but less control
- Risk of finalizing incomplete allocations

### Option C: Per-Goal Transfer Button

- Each allocation can be individually transferred
- Maximum flexibility but more clicks
- Similar to current `transferred_amount` concept

**Recommended: Option A** - Simple, explicit, matches user's workflow of managing manually at month end.

## Tasks / Subtasks

- [ ] **Task 1: Add is_finalized column to allocations**
  - [ ] Create migration to add `is_finalized` boolean (default false) to `monthly_savings_allocations`
  - [ ] Update TypeScript types

- [ ] **Task 2: Create finalizeMonth function**
  - [ ] Add `finalizeMonthAllocations(month: string)` to data layer
  - [ ] For each allocation where `is_finalized = false`:
    - Update `savings_goals.current_amount += allocated_amount`
    - Set `is_finalized = true`
  - [ ] Return success/error

- [ ] **Task 3: Add "Finaliser le mois" to Bilan**
  - [ ] Add button in RecapHeader or bottom of page
  - [ ] Show only for current/past months
  - [ ] Confirmation modal with summary
  - [ ] Call finalizeMonthAllocations on confirm

- [ ] **Task 4: Update progress displays**
  - [ ] Bilan should distinguish between:
    - Finalized allocations (in current_amount)
    - Pending allocations (this month, not finalized)
  - [ ] Épargne page shows goal progress based on current_amount

## Dev Notes

### Database Changes

```sql
-- Migration: Add is_finalized to allocations
ALTER TABLE monthly_savings_allocations
ADD COLUMN is_finalized BOOLEAN NOT NULL DEFAULT false;
```

### Data Layer Function

```typescript
async function finalizeMonthAllocations(month: string): Promise<DataResponse<null>> {
  // 1. Get all non-finalized allocations for month
  // 2. For each goal allocation:
  //    - Update savings_goals.current_amount += allocated_amount
  //    - Set is_finalized = true
  // 3. For each account allocation:
  //    - Optionally update account balance
  //    - Set is_finalized = true
  // Return success
}
```

### UI Considerations

- Button should be prominent but not intrusive
- Show warning if finalizing mid-month
- Success toast with summary: "3 allocations finalisées, +1685€ ajoutés à vos objectifs"

## Questions for User

1. Should finalization also update account balances in Patrimoine?
2. Should there be an "undo" option after finalization?
3. Should past months auto-finalize or require manual action?

## Dev Agent Record

### Agent Model Used

_To be filled during implementation_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled during implementation_
