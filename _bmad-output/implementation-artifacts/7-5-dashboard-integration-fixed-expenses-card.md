# Story 7.5: Dashboard Integration - Fixed Expenses Card

Status: backlog

## Story

As a user,
I want to see my monthly fixed commitments on the dashboard,
So that I'm aware of my recurring bills at a glance.

## Acceptance Criteria

1. **Given** I am on the dashboard, **When** I have fixed expenses set up, **Then** I see an "Engagements fixes" card showing my monthly total

2. **Given** I view the card, **When** I have expenses, **Then** I see: Monthly total (e.g., "850 € / mois"), List of next 3-5 upcoming expenses (by day of month), Link "Gérer les abonnements →"

3. **Given** I have an expense due on the 5th and today is the 3rd, **When** I view the card, **Then** that expense appears at the top (upcoming soon)

4. **Given** I have no fixed expenses, **When** I view the dashboard, **Then** I see a prompt: "Suivez vos abonnements" with link to add first expense

5. **Given** I click "Gérer les abonnements", **When** the link is clicked, **Then** I navigate to `/fixed-expenses`

6. **Given** I have expenses linked to categories, **When** I view the card, **Then** I see category badges next to each expense name

## Tasks / Subtasks

- [ ] **Task 1: Create FixedExpensesCard component** (AC: 1, 2, 3, 4, 6)
  - [ ] Create `src/lib/components/dashboard/FixedExpensesCard.svelte`
  - [ ] Load recurring expenses on mount
  - [ ] Display monthly total prominently at top
  - [ ] Show next 3-5 upcoming expenses
  - [ ] Calculate "upcoming" by comparing current day of month
  - [ ] Sort: expenses with day >= today first, then day < today
  - [ ] Show category badges if expense has category
  - [ ] Add link "Gérer les abonnements →" at bottom
  - [ ] Follow card styling from PatrimoineCard/SavingsCard

- [ ] **Task 2: Implement upcoming expenses logic** (AC: 3)
  - [ ] Get current day of month: `new Date().getDate()`
  - [ ] Filter and sort expenses:
    - Priority 1: day >= current day (upcoming this month)
    - Priority 2: day < current day (passed this month, upcoming next month)
  - [ ] Limit to 3-5 expenses (configurable)
  - [ ] Display format: "Netflix - 15€ - Le 5" with category badge

- [ ] **Task 3: Handle empty state** (AC: 4)
  - [ ] If no recurring expenses exist, show empty state:
    - Icon: calendar-plus with sage color
    - Title: "Suivez vos abonnements"
    - Description: "Ajoutez vos factures récurrentes mensuelles"
    - Link: "Ajouter un abonnement →" (opens /fixed-expenses)
  - [ ] Follow empty state pattern from other dashboard cards

- [ ] **Task 4: Add FixedExpensesCard to dashboard** (AC: 1)
  - [ ] In `src/routes/+page.svelte`, import FixedExpensesCard
  - [ ] Position: between ExpenseBreakdown and Quick Actions (as specified in epic)
  - [ ] Add to existing dashboard grid layout
  - [ ] Ensure responsive behavior on mobile/tablet

- [ ] **Task 5: Implement card styling** (AC: all)
  - [ ] Background: Linen gradient (subtle Coffee to Linen)
  - [ ] Card: `bg-cotton border border-sand rounded-xl p-6 shadow-sm`
  - [ ] Monthly total: Large font, coffee-900, bold
  - [ ] Expense list: Clean, minimal spacing
  - [ ] Link: Sage color with arrow icon `text-sage hover:text-sage-dark`
  - [ ] Match PatrimoineCard and SavingsCard aesthetic

- [ ] **Task 6: Add navigation link** (AC: 5)
  - [ ] "Gérer les abonnements →" links to `/fixed-expenses`
  - [ ] Arrow icon: right-arrow SVG
  - [ ] Hover effect: slight color darkening
  - [ ] Full card clickable (optional) OR just link clickable

- [ ] **Task 7: Add calendar icon to card header** (AC: all)
  - [ ] Icon: calendar with checkmark overlay
  - [ ] Position: left of "Engagements fixes" title
  - [ ] Color: coffee-900 or sage
  - [ ] Size: 24px × 24px
  - [ ] Follow icon pattern from other dashboard cards

## Dev Notes

### Architecture Compliance

- Follow dashboard card patterns: PatrimoineCard, SavingsCard, BudgetOverview
- Use Svelte 5 runes (`$state`, `$derived`) for reactivity
- Load data on mount and visibility change
- Handle loading and empty states
- Gradient background: subtle, warm tones

### Existing Patterns to Follow

**Dashboard Card Pattern** (from `SavingsCard.svelte`):
```typescript
let expenses = $state<RecurringExpense[]>([]);
let total = $state(0);
let loading = $state(true);

// Calculate upcoming expenses
let upcomingExpenses = $derived(() => {
  const today = new Date().getDate();
  const upcoming = expenses
    .filter(e => e.active)
    .sort((a, b) => {
      const aDist = a.day_of_month >= today ? a.day_of_month - today : 31 + a.day_of_month - today;
      const bDist = b.day_of_month >= today ? b.day_of_month - today : 31 + b.day_of_month - today;
      return aDist - bDist;
    })
    .slice(0, 5);
  return upcoming;
});

async function loadData() {
  loading = true;
  const [expensesRes, totalRes] = await Promise.all([
    getRecurringExpenses(),
    getMonthlyTotal()
  ]);
  expenses = expensesRes.data || [];
  total = totalRes.data || 0;
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

**Dashboard Card Styling** (from `PatrimoineCard.svelte`):
```svelte
<div class="bg-cotton border border-sand rounded-xl p-6 shadow-sm">
  <div class="flex items-center mb-4">
    <div class="w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center mr-3">
      <!-- Icon SVG -->
    </div>
    <h3 class="text-lg font-semibold text-coffee-900">Engagements fixes</h3>
  </div>

  {#if loading}
    <div class="animate-pulse">
      <div class="h-8 bg-sand rounded w-1/2 mb-4"></div>
      <div class="h-4 bg-sand rounded w-3/4"></div>
    </div>
  {:else if total > 0}
    <div class="mb-4">
      <p class="text-3xl font-bold text-coffee-900">{formatCurrency(total)} <span class="text-base font-normal text-stone-500">/ mois</span></p>
    </div>

    <div class="space-y-2 mb-4">
      {#each upcomingExpenses as expense}
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2">
            <span class="text-coffee-900">{expense.name}</span>
            {#if expense.category_name}
              <span class="px-2 py-0.5 rounded text-xs" style="background-color: {expense.category_color}10; color: {expense.category_color}">
                {expense.category_name}
              </span>
            {/if}
          </div>
          <div class="flex items-center gap-2">
            <span class="text-stone-500">Le {expense.day_of_month}</span>
            <span class="font-medium text-coffee-900">{formatCurrency(expense.amount)}</span>
          </div>
        </div>
      {/each}
    </div>

    <a href="/fixed-expenses" class="text-sage hover:text-sage-dark text-sm font-medium flex items-center gap-1">
      Gérer les abonnements
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  {:else}
    <!-- Empty state -->
    <div class="text-center py-8">
      <div class="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-3">
        <!-- Calendar-plus icon -->
      </div>
      <p class="text-coffee-900 font-medium mb-1">Suivez vos abonnements</p>
      <p class="text-stone-500 text-sm mb-4">Ajoutez vos factures récurrentes</p>
      <a href="/fixed-expenses" class="text-sage hover:text-sage-dark text-sm font-medium">
        Ajouter un abonnement →
      </a>
    </div>
  {/if}
</div>
```

### Project Structure Notes

**New files to create:**
```
src/lib/components/dashboard/FixedExpensesCard.svelte  ← NEW
```

**Files to modify:**
```
src/routes/+page.svelte  ← Add FixedExpensesCard to dashboard
```

### Dashboard Layout Position

Insert between ExpenseBreakdown and Quick Actions:
```svelte
<!-- Expense Breakdown -->
{#if !loading && categories.length > 0}
  <ExpenseBreakdown {categories} />
{/if}

<!-- NEW: Fixed Expenses Card -->
<FixedExpensesCard />

<!-- Quick Actions -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  ...
</div>
```

### Color & Styling Reference

- Card gradient: `bg-gradient-to-br from-linen via-cotton to-sand`
- Alternative: Simple `bg-cotton border border-sand`
- Title: `text-lg font-semibold text-coffee-900`
- Total: `text-3xl font-bold text-coffee-900`
- Subtitle "/mois": `text-base font-normal text-stone-500`
- Category badge: 10% opacity background with category color
- Link: `text-sage hover:text-sage-dark`
- Empty state icon: `bg-sage/10 text-sage`

### Upcoming Logic Example

```typescript
// Current day: 15th
// Expenses: day 5, day 12, day 18, day 22, day 25
// Result order: 18, 22, 25, 5, 12 (next 5)
// Display: "Le 18" (3 days away), "Le 22" (7 days), "Le 25" (10 days), "Le 5" (next month - 21 days), "Le 12" (next month - 28 days)
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.5]
- [Source: src/lib/components/dashboard/PatrimoineCard.svelte] - Card styling
- [Source: src/lib/components/dashboard/SavingsCard.svelte] - Data loading pattern
- [Source: src/routes/+page.svelte] - Dashboard layout

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
