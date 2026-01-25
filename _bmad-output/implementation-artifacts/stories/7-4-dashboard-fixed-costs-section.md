# Story 7.4: Dashboard - Section Coûts fixes

Status: done

## Story

As a user,
I want to see my fixed costs in a dedicated section on the dashboard,
So that I can track my incompressible expenses at a glance.

## Acceptance Criteria

1. **Given** I am on the dashboard, **When** I have fixed categories, **Then** I see a "🔒 Coûts fixes" section with total header and list of categories

2. **Given** I have a fixed category fully paid (spent >= budget), **When** I view the section, **Then** I see a checkmark (✓) next to it

3. **Given** I have a fixed category partially paid, **When** I view the section, **Then** I see spent/budget with a thin progress bar

4. **Given** I have multiple fixed categories, **When** I view the section, **Then** I see an overall progress bar at the bottom

5. **Given** I have a fixed category where spent > budget, **When** I view the dashboard, **Then** the amount shows in orange/warning color

6. **Given** I have no fixed categories, **When** I view the dashboard, **Then** the "Coûts fixes" section is not displayed

## Tasks / Subtasks

- [ ] **Task 1: Create FixedCostsSection component** (AC: 1, 6)
  - [ ] Create `src/lib/components/dashboard/FixedCostsSection.svelte`
  - [ ] Accept categories array as prop (pre-filtered to type='fixed')
  - [ ] Display section header: "🔒 Coûts fixes"
  - [ ] Display subtitle: "Dépenses incompressibles"
  - [ ] Display total: "X € / mois"
  - [ ] Conditionally render only if fixedCategories.length > 0

- [ ] **Task 2: Create fixed category list items** (AC: 2, 3, 5)
  - [ ] Create `src/lib/components/dashboard/FixedCostItem.svelte`
  - [ ] Display: category name, spent/budget amounts
  - [ ] Show checkmark (✓) when spent >= budget
  - [ ] Show thin progress bar when partially paid
  - [ ] Apply warning color (orange) when spent > budget
  - [ ] Compact list layout (not cards)

- [ ] **Task 3: Add overall progress bar** (AC: 4)
  - [ ] Calculate total spent across all fixed categories
  - [ ] Calculate total budget across all fixed categories
  - [ ] Display: "Payé: X € / Y € attendu"
  - [ ] Thin horizontal progress bar below the list

- [ ] **Task 4: Integrate into dashboard** (AC: 1, 6)
  - [ ] Edit `src/routes/+page.svelte`
  - [ ] Query categories and filter by type='fixed'
  - [ ] Add FixedCostsSection component above variable gauges
  - [ ] Only render if there are fixed categories

## Dev Notes

### Component Design

```svelte
<!-- FixedCostsSection.svelte -->
<script lang="ts">
  import FixedCostItem from './FixedCostItem.svelte';
  import type { CategoryWithSpending } from '$lib/types/database';
  
  let { categories }: { categories: CategoryWithSpending[] } = $props();
  
  let totalBudget = $derived(categories.reduce((sum, c) => sum + c.budget_amount, 0));
  let totalSpent = $derived(categories.reduce((sum, c) => sum + c.spent, 0));
  let progressPercent = $derived(totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0);
</script>
```

### Visual Layout

```
┌─────────────────────────────────────────────────────┐
│ 🔒 Coûts fixes                           870€/mois │
│    Dépenses incompressibles                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Loyer .......................... ✓ 800€           │
│  Assurance auto ................. ✓ 45€            │
│  Abonnements .................... 45€/70€          │
│  [════════░░░░] 64%                                │
│  Électricité .................... ○ 0€/80€         │
│                                                     │
│  ───────────────────────────────────────────────── │
│  Payé: 890€ / 995€ attendu                         │
│  [███████████████████████░░░░░] 89%                │
└─────────────────────────────────────────────────────┘
```

### Styling

- Section background: subtle neutral/gray tint (different from variable section)
- Checkmark: green color for "paid" status
- Warning color: terracotta/orange for overspent
- Progress bars: thin (4px height), rounded
- Font: smaller than gauge labels, clean list layout

### Architecture Compliance

- Follow component patterns from `PatrimoineCard.svelte`, `SavingsCard.svelte`
- Use `$derived` for calculations
- Reuse `formatCurrency` utility
- Consistent with DaisyUI/Tailwind styling
