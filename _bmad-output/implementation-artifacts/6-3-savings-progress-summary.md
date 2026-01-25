# Story 6.3: Savings Progress Summary

Status: ready-for-dev

## Story

As a user,
I want to see how my savings goals progressed this month,
So that I can track my wealth-building momentum.

## Acceptance Criteria

1. **Given** I am viewing the monthly recap, **When** I look at the "Épargne du mois" section, **Then** I see a summary of savings activity

2. **Given** I have savings goals with allocations this month, **When** I view the section, **Then** I see each goal with: Goal name, Alloué ce mois, Transféré, Progression

3. **Given** I allocated 200€ to "Voyage Japon" and transferred 150€, **When** I view the goal, **Then** I see "Voyage Japon: 150 € transféré (200 € alloué)" and the progress bar updated

4. **Given** I have multiple goals, **When** I view the section, **Then** I see a total "Total Épargne: +X € ce mois"

5. **Given** I have no savings allocations this month, **When** I view the section, **Then** I see "Aucune épargne ce mois" without negative messaging and a link "Configurer l'épargne →" to /epargne

6. **Given** I also allocated to accounts (not just goals), **When** I view the section, **Then** I see accounts separately: "Comptes épargne: +X €"

## Tasks / Subtasks

- [ ] **Task 1: Add savings progress to analytics** (AC: 1, 2, 3, 4, 6)
  - [ ] Add `getSavingsProgress(month: string)` to `src/lib/data/analytics.ts`
  - [ ] Use existing `getSavingsAllocations(month)` function
  - [ ] Return structure:
    ```typescript
    {
      goals: Array<{
        id: string;
        name: string;
        targetAmount: number;
        currentAmount: number;
        allocatedThisMonth: number;
        transferredThisMonth: number;
        progressPercent: number;
      }>;
      accounts: Array<{
        id: string;
        name: string;
        allocatedThisMonth: number;
        transferredThisMonth: number;
      }>;
      totalAllocated: number;
      totalTransferred: number;
    }
    ```

- [ ] **Task 2: Create SavingsRecapCard component** (AC: all)
  - [ ] Create `src/lib/components/bilan/SavingsRecapCard.svelte`
  - [ ] Props: `{ savingsProgress, month }`
  - [ ] Display section header "Épargne du mois"
  - [ ] Display total at top: "Total Épargne: +X € ce mois"
  - [ ] Render goals list with progress details
  - [ ] Render accounts list separately if present
  - [ ] Handle empty state with message and link

- [ ] **Task 3: Create SavingsGoalRecapRow component** (AC: 2, 3)
  - [ ] Create `src/lib/components/bilan/SavingsGoalRecapRow.svelte`
  - [ ] Props: `{ goal }`
  - [ ] Display goal name
  - [ ] Display "X € transféré (Y € alloué)" format
  - [ ] Show progress bar from currentAmount to targetAmount
  - [ ] Highlight pending allocation (allocated - transferred) differently

- [ ] **Task 4: Integrate into Bilan page** (AC: all)
  - [ ] Import SavingsRecapCard into `/bilan/+page.svelte`
  - [ ] Call `getSavingsProgress()` in loadData
  - [ ] Pass data to component
  - [ ] Position after CategoryComparisonTable

## Dev Notes

### Architecture Compliance

- Add function to `src/lib/data/analytics.ts`
- Use existing `getSavingsAllocations()` from `savings-allocations.ts`
- Follow `{ data, error }` response pattern

### Existing Patterns to Follow

**Savings Allocations Query** (from `savings-allocations.ts`):
```typescript
export async function getSavingsAllocations(month: string): Promise<{
  data: SavingsAllocationWithDetails[] | null;
  error: PostgrestError | null;
}> {
  // Returns allocations with goal and account details joined
}
```

**SavingsAllocationWithDetails Type**:
```typescript
interface SavingsAllocationWithDetails {
  id: string;
  month: string;
  goal_id: string | null;
  account_id: string | null;
  allocated_amount: number;
  transferred_amount: number;
  goal?: { id: string; name: string; target_amount: number; current_amount: number } | null;
  account?: { id: string; name: string } | null;
}
```

**Progress Bar Pattern** (from existing components):
```svelte
<div class="relative h-2 bg-sand rounded-full overflow-hidden">
  <!-- Base progress (current amount) -->
  <div
    class="absolute h-full bg-sage rounded-full"
    style="width: {(currentAmount / targetAmount) * 100}%"
  ></div>
  <!-- Pending allocation (allocated - transferred) -->
  <div
    class="absolute h-full bg-sage/40 rounded-full"
    style="left: {(currentAmount / targetAmount) * 100}%; width: {(pending / targetAmount) * 100}%"
  ></div>
</div>
```

### Empty State Pattern

```svelte
{#if !savingsProgress || savingsProgress.goals.length === 0}
  <div class="text-center py-8">
    <p class="text-stone-500">Aucune épargne ce mois</p>
    <a href="/epargne" class="text-sage hover:underline mt-2 inline-block">
      Configurer l'épargne →
    </a>
  </div>
{/if}
```

### Project Structure Notes

**New files to create:**
```
src/lib/components/bilan/
├── SavingsRecapCard.svelte                  ← NEW
└── SavingsGoalRecapRow.svelte               ← NEW
```

**Files to modify:**
```
src/lib/data/analytics.ts                    ← Add getSavingsProgress()
src/routes/bilan/+page.svelte                ← Integrate savings recap
```

### Display Format

**Goal Row Display:**
```
🎯 Voyage Japon
   150 € transféré (200 € alloué)
   [=========>  ] 72% → 78%
   Objectif: 2 500 €
```

**Accounts Section (if any):**
```
💰 Comptes épargne: +350 €
   - Livret A: +200 € transféré
   - PEL: +150 € transféré
```

### Color Reference

- Transferred amount: `text-sage` (positive green)
- Allocated but pending: `text-amber-600`
- Progress bar filled: `bg-sage`
- Progress bar pending: `bg-sage/40` (40% opacity)
- Empty state text: `text-stone-500`

### References

- [Source: src/lib/data/savings-allocations.ts#getSavingsAllocations] - Base query
- [Source: src/lib/components/dashboard/SavingsCard.svelte] - Pattern reference
- [Source: src/lib/types/database.ts#SavingsAllocationWithDetails] - Type definition

## Dev Agent Record

### Agent Model Used

_To be filled during implementation_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled during implementation_
