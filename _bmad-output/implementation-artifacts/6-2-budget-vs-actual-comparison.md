# Story 6.2: Budget vs Actual Comparison

Status: ready-for-dev

## Story

As a user,
I want to compare my budget vs actual spending for each category,
So that I can see where I was accurate and where I need to adjust.

## Acceptance Criteria

1. **Given** I am viewing the monthly recap, **When** I look at the "Catégories" section, **Then** I see a table/list with all my budget categories

2. **Given** I look at a category row, **When** I view its details, **Then** I see: Category name (with color), Budget, Dépensé, Écart, Mini-gauge

3. **Given** a category is under budget (spent 580€ of 600€ budget), **When** I view the comparison, **Then** I see "✓ -20 €" in Sage color (#639A88) and the mini-gauge shows the percentage with Sage fill

4. **Given** a category is over budget (spent 420€ of 300€ budget), **When** I view the comparison, **Then** I see "⚠ +120 €" in Amber color (#D4A04D) and the mini-gauge shows >100% with Terracotta fill (#C07D5A)

5. **Given** a category is exactly on budget, **When** I view the comparison, **Then** I see "✓ Pile poil" in Sage color

6. **Given** I view the summary row at the top, **When** I look at the totals, **Then** I see: Total Budgeté, Total Dépensé, Écart Net with colors indicating overall status

7. **Given** I click on a category row, **When** the detail view opens, **Then** I see a list of expenses for that category this month

## Tasks / Subtasks

- [ ] **Task 1: Add category comparison to analytics** (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Add `getCategoryComparison(month: string)` to `src/lib/data/analytics.ts`
  - [ ] Return array of: `{ categoryId, name, color, budget, spent, difference, percentage }`
  - [ ] Calculate difference: `spent - budget` (positive = over, negative = under)
  - [ ] Calculate percentage: `(spent / budget) * 100`
  - [ ] Include totals summary in response

- [ ] **Task 2: Create CategoryComparisonRow component** (AC: 2, 3, 4, 5)
  - [ ] Create `src/lib/components/bilan/CategoryComparisonRow.svelte`
  - [ ] Props: `{ category, budget, spent, difference, percentage, onClick }`
  - [ ] Display category color dot + name
  - [ ] Display budget amount
  - [ ] Display spent amount
  - [ ] Display difference with icon and color:
    - Under budget: `✓ -X €` in Sage
    - Over budget: `⚠ +X €` in Amber
    - Exact: `✓ Pile poil` in Sage
  - [ ] Add mini progress bar (inline, not CircularGauge)
    - Width based on percentage (max 100% visual)
    - Color: Sage (0-75%), Amber (75-100%), Terracotta (>100%)

- [ ] **Task 3: Create CategoryComparisonTable component** (AC: 1, 6)
  - [ ] Create `src/lib/components/bilan/CategoryComparisonTable.svelte`
  - [ ] Props: `{ categories, totals, onCategoryClick }`
  - [ ] Render summary row at top with totals
  - [ ] Map and render CategoryComparisonRow for each category
  - [ ] Add table headers: Catégorie, Budget, Dépensé, Écart
  - [ ] Style with consistent spacing and dividers

- [ ] **Task 4: Implement category drill-down** (AC: 7)
  - [ ] Add click handler to CategoryComparisonRow
  - [ ] Reuse `CategoryExpensesModal.svelte` from dashboard
  - [ ] Pass selected category ID and month
  - [ ] Modal shows expenses filtered by category and month

- [ ] **Task 5: Integrate into Bilan page** (AC: all)
  - [ ] Import CategoryComparisonTable into `/bilan/+page.svelte`
  - [ ] Call `getCategoryComparison()` in loadData
  - [ ] Pass data to component
  - [ ] Handle modal state for drill-down

## Dev Notes

### Architecture Compliance

- Add functions to `src/lib/data/analytics.ts`
- Use existing `getCategoryBudgets()` and `getAllCategoriesSpending()`
- Follow `{ data, error }` response pattern

### Existing Patterns to Follow

**Category Spending Query** (from `expenses.ts`):
```typescript
export async function getAllCategoriesSpending(): Promise<{
  data: Map<string, number> | null;
  error: PostgrestError | null;
}> {
  // Returns Map of categoryId -> total spent
}
```

**Mini Progress Bar Pattern** (inline, simpler than CircularGauge):
```svelte
<div class="h-2 bg-sand rounded-full overflow-hidden w-24">
  <div
    class="h-full rounded-full transition-all"
    class:bg-sage={percentage <= 75}
    class:bg-amber={percentage > 75 && percentage <= 100}
    class:bg-terracotta={percentage > 100}
    style="width: {Math.min(percentage, 100)}%"
  ></div>
</div>
```

**Modal Reuse** (from dashboard):
```typescript
import CategoryExpensesModal from '$lib/components/dashboard/CategoryExpensesModal.svelte';

let selectedCategoryId = $state<string | null>(null);
let showExpensesModal = $state(false);

function handleCategoryClick(categoryId: string) {
  selectedCategoryId = categoryId;
  showExpensesModal = true;
}
```

### Project Structure Notes

**New files to create:**
```
src/lib/components/bilan/
├── CategoryComparisonTable.svelte           ← NEW
└── CategoryComparisonRow.svelte             ← NEW
```

**Files to modify:**
```
src/lib/data/analytics.ts                    ← Add getCategoryComparison()
src/routes/bilan/+page.svelte                ← Integrate comparison table
```

### Color Reference for Difference Display

```typescript
function getDifferenceDisplay(difference: number): { icon: string; text: string; colorClass: string } {
  if (difference < 0) {
    // Under budget (saved money)
    return { icon: '✓', text: `${formatCurrency(Math.abs(difference))}`, colorClass: 'text-sage' };
  } else if (difference > 0) {
    // Over budget
    return { icon: '⚠', text: `+${formatCurrency(difference)}`, colorClass: 'text-amber-600' };
  } else {
    // Exactly on budget
    return { icon: '✓', text: 'Pile poil', colorClass: 'text-sage' };
  }
}
```

### Data Structure

```typescript
interface CategoryComparison {
  categoryId: string;
  name: string;
  color: string;
  budget: number;
  spent: number;
  difference: number;  // spent - budget
  percentage: number;  // (spent / budget) * 100
}

interface ComparisonTotals {
  totalBudget: number;
  totalSpent: number;
  totalDifference: number;
}

interface ComparisonResult {
  categories: CategoryComparison[];
  totals: ComparisonTotals;
}
```

### References

- [Source: src/lib/components/dashboard/CategoryExpensesModal.svelte] - Reuse for drill-down
- [Source: src/lib/data/expenses.ts#getAllCategoriesSpending] - Spending query
- [Source: src/lib/data/budgets.ts#getCategoryBudgets] - Budget allocations
- [Source: src/lib/components/gauges/gauge-colors.ts] - Color thresholds reference

## Dev Agent Record

### Agent Model Used

_To be filled during implementation_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled during implementation_
