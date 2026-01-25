# Story 6.4: Previous Month Context for Budget Planning

Status: ready-for-dev

## Story

As a user,
I want to see last month's results when allocating my new budget,
So that I can make informed adjustments based on real data.

## Acceptance Criteria

1. **Given** I am on the Budget page (/budgets), **When** I view the category allocation section, **Then** I see a small hint under each category input showing last month's performance

2. **Given** last month I budgeted 300€ for "Resto" but spent 420€, **When** I view the Resto allocation row, **Then** I see below the input: "Mois dernier: 420/300 € ⚠ +120 €" in Amber

3. **Given** last month I budgeted 200€ for "Loisirs" but only spent 85€, **When** I view the Loisirs allocation row, **Then** I see below the input: "Mois dernier: 85/200 € ✓ -115 €" in Sage

4. **Given** a category is new (didn't exist last month), **When** I view that category, **Then** no previous month hint appears (just the input)

5. **Given** I'm a new user with no previous month data, **When** I view the budget page, **Then** no previous month hints appear anywhere

6. **Given** I want to hide the hints, **When** I look for a toggle, **Then** I see a small "Masquer historique" toggle at the top of allocations that persists my preference

## Tasks / Subtasks

- [ ] **Task 1: Add previous month comparison to analytics** (AC: 1, 2, 3, 4, 5)
  - [ ] Add `getPreviousMonthComparison(currentMonth: string)` to `src/lib/data/analytics.ts`
  - [ ] Calculate previous month from currentMonth
  - [ ] Get category budgets for previous month
  - [ ] Get category spending for previous month
  - [ ] Return Map<categoryId, { budget, spent, difference }>
  - [ ] Handle case where no previous month data exists (return empty map)

- [ ] **Task 2: Create PreviousMonthHint component** (AC: 2, 3, 4)
  - [ ] Create `src/lib/components/budget/PreviousMonthHint.svelte`
  - [ ] Props: `{ budget, spent, difference }`
  - [ ] Display format: "Mois dernier: X/Y € [icon] [difference]"
  - [ ] Color coding:
    - Under budget: `✓ -X €` in Sage
    - Over budget: `⚠ +X €` in Amber
  - [ ] Small text style: `text-xs text-stone-500`

- [ ] **Task 3: Modify AllocationRow to show hints** (AC: 1, 2, 3, 4)
  - [ ] Edit `src/lib/components/budget/AllocationRow.svelte`
  - [ ] Add optional prop: `previousMonthData?: { budget: number; spent: number; difference: number } | null`
  - [ ] Add optional prop: `showHints?: boolean` (default true)
  - [ ] Render PreviousMonthHint below input when data exists and showHints is true
  - [ ] Ensure hint doesn't interfere with existing edit mode

- [ ] **Task 4: Add toggle to budgets page** (AC: 6)
  - [ ] Edit `src/routes/budgets/+page.svelte`
  - [ ] Add state: `let showPreviousMonthHints = $state(true)`
  - [ ] Load preference from localStorage on mount
  - [ ] Save preference to localStorage on change
  - [ ] Add toggle UI above allocation section:
    ```svelte
    <label class="flex items-center gap-2 text-sm text-stone-500">
      <input type="checkbox" bind:checked={showPreviousMonthHints} class="toggle toggle-sm" />
      Afficher historique mois précédent
    </label>
    ```

- [ ] **Task 5: Integrate data loading in budgets page** (AC: 1, 5)
  - [ ] Import `getPreviousMonthComparison` from analytics
  - [ ] Call in loadData() with current active budget month
  - [ ] Store result in state: `let previousMonthData = $state<Map<string, PreviousMonthData>>(new Map())`
  - [ ] Pass to each AllocationRow component

## Dev Notes

### Architecture Compliance

- Add function to `src/lib/data/analytics.ts`
- Modify existing component `AllocationRow.svelte` (minimal changes)
- Use localStorage for user preference persistence
- Follow existing prop patterns

### Existing AllocationRow Structure

The current `AllocationRow.svelte` has these props:
```typescript
let {
  category,
  amount,
  totalIncome,
  onAmountChange,
  onAmountSave,
  onDelete,
  onCategoryUpdate
} = $props<{...}>();
```

**Add new optional props:**
```typescript
let {
  category,
  amount,
  totalIncome,
  onAmountChange,
  onAmountSave,
  onDelete,
  onCategoryUpdate,
  previousMonthData = null,  // NEW
  showHints = true           // NEW
} = $props<{
  // ... existing types
  previousMonthData?: { budget: number; spent: number; difference: number } | null;
  showHints?: boolean;
}>();
```

### Previous Month Calculation

```typescript
function getPreviousMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const prevMonth = monthNum === 1 ? 12 : monthNum - 1;
  const prevYear = monthNum === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
}
```

### LocalStorage Pattern

```typescript
const HINTS_PREFERENCE_KEY = 'budget_show_previous_month_hints';

onMount(() => {
  const saved = localStorage.getItem(HINTS_PREFERENCE_KEY);
  if (saved !== null) {
    showPreviousMonthHints = saved === 'true';
  }
});

$effect(() => {
  localStorage.setItem(HINTS_PREFERENCE_KEY, String(showPreviousMonthHints));
});
```

### Hint Display Location in AllocationRow

Insert hint after the amount input, before the percentage bar:

```svelte
<!-- Existing amount input -->
<input type="number" ... />

<!-- NEW: Previous month hint -->
{#if previousMonthData && showHints}
  <PreviousMonthHint
    budget={previousMonthData.budget}
    spent={previousMonthData.spent}
    difference={previousMonthData.difference}
  />
{/if}

<!-- Existing percentage bar -->
<div class="h-2 bg-sand ...">
```

### Project Structure Notes

**New files to create:**
```
src/lib/components/budget/PreviousMonthHint.svelte    ← NEW
```

**Files to modify:**
```
src/lib/data/analytics.ts                             ← Add getPreviousMonthComparison()
src/lib/components/budget/AllocationRow.svelte        ← Add optional props + render hint
src/routes/budgets/+page.svelte                       ← Add toggle + data loading
```

### Data Structure

```typescript
interface PreviousMonthData {
  budget: number;
  spent: number;
  difference: number;  // spent - budget
}

// Return type from getPreviousMonthComparison
type PreviousMonthComparison = Map<string, PreviousMonthData>;  // categoryId -> data
```

### Styling for Hint

```svelte
<!-- PreviousMonthHint.svelte -->
<div class="text-xs mt-1">
  <span class="text-stone-400">Mois dernier:</span>
  <span class="text-stone-500">{formatCurrency(spent)}/{formatCurrency(budget)} €</span>
  {#if difference < 0}
    <span class="text-sage">✓ {formatCurrency(Math.abs(difference))}</span>
  {:else if difference > 0}
    <span class="text-amber-600">⚠ +{formatCurrency(difference)}</span>
  {:else}
    <span class="text-sage">✓ Pile poil</span>
  {/if}
</div>
```

### Edge Cases

1. **New category**: No previousMonthData for that categoryId → no hint shown
2. **First month ever**: getPreviousMonthComparison returns empty Map → no hints
3. **Category deleted last month**: categoryId won't be in current list → irrelevant
4. **Budget was 0 last month**: Show "0/0 €" or skip if both are 0

### References

- [Source: src/lib/components/budget/AllocationRow.svelte] - Component to modify
- [Source: src/routes/budgets/+page.svelte] - Page to integrate
- [Source: src/lib/data/budgets.ts#getCategoryBudgets] - Budget query
- [Source: src/lib/data/expenses.ts#getAllCategoriesSpending] - Spending query

## Dev Agent Record

### Agent Model Used

_To be filled during implementation_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled during implementation_
