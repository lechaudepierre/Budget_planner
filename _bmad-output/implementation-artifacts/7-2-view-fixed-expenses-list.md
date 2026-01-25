# Story 7.2: View Fixed Expenses List

Status: backlog

## Story

As a user,
I want to see all my recurring expenses in one place,
So that I know my monthly commitments.

## Acceptance Criteria

1. **Given** I am signed in, **When** I navigate to `/fixed-expenses`, **Then** I see a page titled "Engagements fixes" with my monthly total prominently displayed (e.g., "850 € / mois")

2. **Given** I have added fixed expenses, **When** I view the list, **Then** I see each expense with: name, amount, day of month, category badge, and the list is sorted by day of month (ascending)

3. **Given** I have 10 fixed expenses, **When** I view the page, **Then** I see all expenses in a clean card layout

4. **Given** I have no fixed expenses yet, **When** I view the page, **Then** I see an empty state encouraging me to add my first expense

5. **Given** I view an expense with a category, **When** I look at the card, **Then** I see the category name with its color badge

6. **Given** I view the monthly total, **When** expenses are linked to categories, **Then** I can optionally see a breakdown by category (e.g., "Loisirs: 45€, Logement: 700€")

## Tasks / Subtasks

- [ ] **Task 1: Implement getRecurringExpenses data function** (AC: 1, 2)
  - [ ] In `src/lib/data/recurring-expenses.ts`, implement `getRecurringExpenses()`
  - [ ] Query: `SELECT * FROM recurring_expenses WHERE user_id = auth.uid() AND active = true ORDER BY day_of_month ASC`
  - [ ] Join with `budget_categories` to get category name and color
  - [ ] Return `{ data, error }` format
  - [ ] Calculate monthly total: SUM of all active expenses

- [ ] **Task 2: Create RecurringExpenseCard component** (AC: 2, 3, 5)
  - [ ] Create `src/lib/components/recurring/RecurringExpenseCard.svelte`
  - [ ] Display expense details:
    - Name (bold, coffee-900)
    - Amount (formatted currency)
    - Day of month (e.g., "Le 5 du mois")
    - Category badge (if linked)
  - [ ] Add click handler for editing (Story 7.3)
  - [ ] Follow existing card patterns from `GoalCard.svelte` and `AccountCard.svelte`
  - [ ] Use warm color palette styling

- [ ] **Task 3: Update Fixed Expenses page with list view** (AC: 1, 2, 3, 4)
  - [ ] In `src/routes/fixed-expenses/+page.svelte`:
    - Load recurring expenses on mount
    - Display monthly total at top (large, prominent)
    - Map expenses to RecurringExpenseCard components
    - Sort by day_of_month (already sorted from query)
    - Handle loading state
    - Show empty state if no expenses
  - [ ] Empty state:
    - Icon (calendar-plus)
    - Message: "Aucun engagement fixe"
    - Subtitle: "Ajoutez vos abonnements et factures récurrentes"
    - Button: Opens add modal

- [ ] **Task 4: Add monthly total calculation** (AC: 1)
  - [ ] In `src/lib/data/recurring-expenses.ts`, add `getMonthlyTotal()` function
  - [ ] Calculate: `SELECT SUM(amount) FROM recurring_expenses WHERE user_id = auth.uid() AND active = true`
  - [ ] Return formatted total
  - [ ] Display in page header with styling: "850 € / mois" (coffee-900, large font)

- [ ] **Task 5: Optional category breakdown** (AC: 6)
  - [ ] In Fixed Expenses page, add optional category breakdown section
  - [ ] Group expenses by category using `$derived` rune
  - [ ] Display: "Loisirs: 45€ | Logement: 700€ | Autres: 105€"
  - [ ] Use category colors for each label
  - [ ] Collapsible or toggleable display (don't clutter main view)

- [ ] **Task 6: Add navigation icon to Fixed Expenses** (AC: 1)
  - [ ] In `Navbar.svelte`, add calendar icon with recurring symbol
  - [ ] Icon SVG: calendar outline with circular arrow overlay
  - [ ] Match existing icon style (sage color on hover)

## Dev Notes

### Architecture Compliance

- Follow data layer pattern: all queries in `src/lib/data/recurring-expenses.ts`
- Return `{ data, error }` from all functions
- Use Svelte 5 runes (`$state`, `$derived`) for reactivity
- File naming: `kebab-case.svelte`

### Existing Patterns to Follow

**List View Pattern** (from `SavingsCard.svelte`):
```typescript
let expenses = $state<RecurringExpense[]>([]);
let total = $state(0);
let loading = $state(true);

async function loadData() {
  loading = true;
  const [expensesResult, totalResult] = await Promise.all([
    getRecurringExpenses(),
    getMonthlyTotal()
  ]);
  expenses = expensesResult.data || [];
  total = totalResult.data || 0;
  loading = false;
}

onMount(() => {
  loadData();
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') loadData();
  };
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
});
```

**Empty State Pattern** (from `PatrimoineCard.svelte`):
```svelte
{#if expenses.length === 0}
  <div class="text-center py-12">
    <div class="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
      <!-- Icon SVG -->
    </div>
    <p class="text-coffee-900 font-medium mb-2">Aucun engagement fixe</p>
    <p class="text-stone-500 text-sm mb-4">Ajoutez vos abonnements récurrents</p>
    <button onclick={() => showAddModal = true}>+ Ajouter</button>
  </div>
{/if}
```

**Category Breakdown with $derived** (from `SavingsCard.svelte`):
```typescript
let categoryBreakdown = $derived(() => {
  const groups = new Map<string, number>();
  for (const expense of expenses) {
    if (expense.category_name) {
      const current = groups.get(expense.category_name) || 0;
      groups.set(expense.category_name, current + expense.amount);
    }
  }
  return Array.from(groups.entries());
});
```

### Project Structure Notes

**New files to create:**
```
src/lib/components/recurring/RecurringExpenseCard.svelte  ← NEW
```

**Files to modify:**
```
src/routes/fixed-expenses/+page.svelte                    ← Update list view
src/lib/data/recurring-expenses.ts                        ← Add getMonthlyTotal()
src/lib/components/ui/Navbar.svelte                       ← Add icon
```

### Database Query Notes

**Get recurring expenses with category info:**
```sql
SELECT
  re.*,
  bc.name as category_name,
  bc.color as category_color
FROM recurring_expenses re
LEFT JOIN budget_categories bc ON re.category_id = bc.id
WHERE re.user_id = auth.uid() AND re.active = true
ORDER BY re.day_of_month ASC
```

### Color & Styling Reference

- Page background: `bg-sand`
- Card background: `bg-cotton`
- Border: `border-sand`
- Total amount: Large, `text-3xl font-bold text-coffee-900`
- Expense cards: `bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition`
- Category badges: Use category color with 10% opacity background
- Empty state icon: `bg-sage/10 text-sage`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.2]
- [Source: src/lib/components/dashboard/SavingsCard.svelte] - List pattern
- [Source: src/lib/components/goals/GoalCard.svelte] - Card component pattern
- [Source: src/routes/epargne/+page.svelte] - Page layout pattern

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
