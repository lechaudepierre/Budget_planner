# Story 3.3: Allocate Budget Amounts

Status: not-started

## Story

As a user,
I want to allocate specific amounts to each category and see what's remaining,
so that I can distribute my income across my expenses.

## Acceptance Criteria

1. Each category has an input field for budget amount
2. Visual progress bar shows percentage of income allocated per category
3. "Restant: X €" displays and updates in real-time
4. Allocation percentage shown per category (e.g., "21%")
5. When allocation exceeds income, "Restant" shows negative in orange
6. Over-allocation is informational only (no blocking error)
7. "Enregistrer" button saves all allocations
8. Success toast confirms save

## Tasks / Subtasks

- [ ] Task 1: Create category_budgets table migration (AC: 7)
  - [ ] Create `supabase/migrations/005_create_category_budgets.sql`
  - [ ] Table: id (uuid), category_id (uuid FK), month (text YYYY-MM), amount (numeric), created_at, updated_at
  - [ ] RLS policies through category ownership
  - [ ] Unique constraint on (category_id, month)
  - [ ] Index on (category_id, month)

- [ ] Task 2: Create TypeScript types for category budgets (AC: 7)
  - [ ] Add CategoryBudget type to `src/lib/types/database.ts`
  - [ ] Create allocation schema in `src/lib/schemas/budget.ts`

- [ ] Task 3: Extend data layer for allocations (AC: 7)
  - [ ] Add to `src/lib/data/budgets.ts`
  - [ ] Implement `getCategoryBudgets(month: string)` - returns all allocations for month
  - [ ] Implement `saveCategoryBudgets(month: string, allocations: {categoryId, amount}[])`
  - [ ] Batch save for efficiency

- [ ] Task 4: Create AllocationRow component (AC: 1, 2, 4)
  - [ ] Create `src/lib/components/budget/AllocationRow.svelte`
  - [ ] Display: color dot, category name, amount input, percentage, progress bar
  - [ ] Amount input with € suffix
  - [ ] Progress bar colored by category color
  - [ ] Percentage calculated from income

- [ ] Task 5: Create BudgetSummary component (AC: 3, 5, 6)
  - [ ] Create `src/lib/components/budget/BudgetSummary.svelte`
  - [ ] Display: Total revenus, Total alloué, Restant
  - [ ] Real-time calculation with $derived
  - [ ] Orange color when remaining is negative
  - [ ] Informational styling (not error)

- [ ] Task 6: Integrate allocation UI into /budgets page (AC: 1-6)
  - [ ] Display income at top (from Story 3.1)
  - [ ] List all categories with allocation inputs
  - [ ] Show summary with remaining amount
  - [ ] Real-time updates on input change

- [ ] Task 7: Implement save functionality (AC: 7, 8)
  - [ ] Add "Enregistrer" button at bottom
  - [ ] Collect all allocation values
  - [ ] Batch save to database
  - [ ] Show success toast
  - [ ] Disable button while saving

- [ ] Task 8: Verify and test (AC: 1-8)
  - [ ] Test allocation input and display
  - [ ] Test real-time remaining calculation
  - [ ] Test negative remaining display
  - [ ] Test save functionality
  - [ ] TypeScript compilation check

## Dev Notes

### Database Schema

```sql
CREATE TABLE public.category_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.budget_categories(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: "2026-01"
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(category_id, month)
);

-- RLS through category ownership
CREATE POLICY "Users can manage their category budgets"
    ON public.category_budgets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.budget_categories c
            WHERE c.id = category_id AND c.user_id = auth.uid()
        )
    );
```

### Real-time Calculation

```typescript
// In budget page
let income = $state(0);
let allocations = $state<Map<string, number>>(new Map());

let totalAllocated = $derived(
  Array.from(allocations.values()).reduce((sum, amt) => sum + amt, 0)
);

let remaining = $derived(income - totalAllocated);
let isOverBudget = $derived(remaining < 0);
```

### UI Design Reference

- Match ux-design-directions-v3.html budget allocation style
- Progress bars with category colors
- Clean row layout with good spacing
- Remaining amount prominent at bottom
- Save button in sage color

## Dependencies

- Story 3.1 (Monthly Income) - Complete
- Story 3.2 (Create Category) - Complete
- Categories exist to allocate to
