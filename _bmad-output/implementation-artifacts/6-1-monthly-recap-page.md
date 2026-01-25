# Story 6.1: Monthly Recap Page & Navigation

Status: review

## Story

As a user,
I want to access a dedicated Monthly Recap page from the navigation,
So that I can review my spending patterns for any month.

## Acceptance Criteria

1. **Given** I am signed in, **When** I look at the navigation sidebar, **Then** I see a "Bilan" link in the "Objectifs" section (after "Épargne")

2. **Given** I click on "Bilan", **When** the page loads, **Then** I see a Monthly Recap page for the current month with header showing "Bilan - Janvier 2026"

3. **Given** I am on the Monthly Recap page, **When** I use the month navigation arrows, **Then** I can navigate to previous months and the data updates accordingly

4. **Given** I view a month that is still in progress, **When** I look at the header, **Then** I see a badge "En cours" next to the month name

5. **Given** I view a past archived month, **When** I look at the header, **Then** I see a badge "Clôturé" next to the month name

6. **Given** I view the recap, **When** I look at the summary section, **Then** I see: Total Revenus, Total Dépensé, Total Épargné, Solde

## Tasks / Subtasks

- [x] **Task 1: Create analytics data layer** (AC: 6)
  - [x] Create `src/lib/data/analytics.ts`
  - [x] Implement `getMonthlyRecap(month: string)` function
    - Returns: `{ income, totalSpent, totalSaved, balance, isArchived }`
    - Uses existing `getMonthlyBudget()`, `getMonthlyIncome()`, `getSavingsAllocations()`
  - [x] Follow `{ data, error }` response pattern from architecture

- [x] **Task 2: Add Bilan link to Navbar** (AC: 1)
  - [x] Edit `src/lib/components/ui/Navbar.svelte`
  - [x] Add `{ href: '/bilan', label: 'Bilan', icon: 'bilan' }` to `goalItems` array
  - [x] Create clipboard SVG icon following existing icon patterns

- [x] **Task 3: Create route and page structure** (AC: 2)
  - [x] Create `src/routes/bilan/+page.svelte`
  - [x] Import necessary data functions and components
  - [x] Set up page layout following existing patterns (header + content)

- [x] **Task 4: Create RecapHeader component** (AC: 2, 3, 4, 5)
  - [x] Create `src/lib/components/bilan/RecapHeader.svelte`
  - [x] Add month title with format "Bilan - Janvier 2026"
  - [x] Reuse `MonthYearPicker.svelte` pattern for navigation arrows
  - [x] Add status badge: "En cours" (current month) or "Clôturé" (archived)
  - [x] Style badge: amber for "En cours", sage for "Clôturé"

- [x] **Task 5: Create RecapSummaryCard component** (AC: 6)
  - [x] Create `src/lib/components/bilan/RecapSummaryCard.svelte`
  - [x] Display 4 KPIs in a grid:
    - Total Revenus (from income_entries)
    - Total Dépensé (sum of expenses)
    - Total Épargné (from savings allocations - transferred)
    - Solde (Revenus - Dépensé - Épargné)
  - [x] Use `formatCurrency()` utility for display
  - [x] Apply card styling from existing dashboard cards

- [x] **Task 6: Wire up page with data loading** (AC: all)
  - [x] Implement `loadData()` function with month parameter
  - [x] Add month state and navigation handlers
  - [x] Handle loading state
  - [x] Add visibility change listener for data refresh

## Dev Notes

### Architecture Compliance

- Follow data layer pattern: all queries in `src/lib/data/analytics.ts`
- Return `{ data, error }` from all functions
- Use Svelte 5 runes (`$state`, `$derived`) for reactivity
- File naming: `kebab-case.svelte`

### Existing Patterns to Follow

**Data Loading Pattern** (from `SavingsCard.svelte`):
```typescript
let loading = $state(true);
let data = $state<RecapData | null>(null);

async function loadData() {
  loading = true;
  const result = await getMonthlyRecap(currentMonth);
  data = result.data;
  loading = false;
}

onMount(() => {
  loadData();
  // Visibility change listener
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') loadData();
  };
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
});
```

**Month Navigation Pattern** (from `MonthYearPicker.svelte`):
```typescript
import { getCurrentMonth, navigateMonth, formatMonthDisplay } from '$lib/data/budgets';
```

### Project Structure Notes

**New files to create:**
```
src/lib/data/analytics.ts                    ← NEW
src/routes/bilan/+page.svelte                ← NEW
src/lib/components/bilan/
├── RecapHeader.svelte                       ← NEW
└── RecapSummaryCard.svelte                  ← NEW
```

**Files to modify:**
```
src/lib/components/ui/Navbar.svelte          ← Add "Bilan" link
```

### Color & Styling Reference

- Card background: `bg-cotton`
- Border: `border-sand`
- Primary accent: `bg-sage`, `text-sage`
- Badge "En cours": `bg-amber-100 text-amber-700`
- Badge "Clôturé": `bg-sage/10 text-sage`
- Text primary: `text-coffee-900`
- Text secondary: `text-stone-500`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure]
- [Source: src/lib/components/ui/Navbar.svelte] - Navigation pattern
- [Source: src/lib/components/dashboard/SavingsCard.svelte] - Data loading pattern
- [Source: src/lib/data/budgets.ts] - Month utilities (getCurrentMonth, formatMonthDisplay)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created analytics data layer with `getMonthlyRecap()` function that aggregates income, expenses, and savings
- Added "Bilan" navigation link in the Objectifs section of the sidebar
- Created `/bilan` route with month navigation and status display
- Implemented RecapHeader component with month title, navigation arrows, and status badge (En cours/Clôturé)
- Implemented RecapSummaryCard component displaying 4 KPIs: Revenus, Dépensé, Épargné, Solde
- All components follow existing patterns (Svelte 5 runes, data layer responses, styling)
- Build passes with no errors

### File List

**New files:**
- `src/lib/data/analytics.ts` - Analytics data layer with getMonthlyRecap()
- `src/routes/bilan/+page.svelte` - Monthly recap page
- `src/lib/components/bilan/RecapHeader.svelte` - Header with navigation
- `src/lib/components/bilan/RecapSummaryCard.svelte` - Summary KPI cards

**Modified files:**
- `src/lib/components/ui/Navbar.svelte` - Added "Bilan" link with clipboard icon
