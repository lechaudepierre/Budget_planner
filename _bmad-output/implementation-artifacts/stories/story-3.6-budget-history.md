# Story 3.6: Historique des Budgets Mensuels

Status: not-started

## Story

As a user,
I want to view my budget history from previous months in read-only mode,
so that I can track my financial evolution over time.

## Acceptance Criteria

1. Section "Historique" visible below current month budget
2. List of previous months with income and total allocated displayed
3. Click on a month expands to show category breakdown
4. Previous months are read-only (no edit buttons)
5. Visual distinction between current month (editable) and history (read-only)
6. Empty state if no history exists yet
7. Maximum 12 months displayed (pagination or "voir plus" for older)
8. Month cards show: month name, income, % allocated, status indicator

## Tasks / Subtasks

- [ ] Task 1: Create data layer function for budget history
  - [ ] Add `getBudgetHistory(limit?: number)` to budgets.ts
  - [ ] Return months ordered by date descending
  - [ ] Exclude current month from results
  - [ ] Include category allocations summary

- [ ] Task 2: Create BudgetHistoryCard component
  - [ ] Create `src/lib/components/budget/BudgetHistoryCard.svelte`
  - [ ] Display: month name, income, allocation percentage
  - [ ] Visual indicator: balanced (sage), over (terracotta), under (amber)
  - [ ] Expandable/collapsible for category details
  - [ ] Read-only styling (muted, no action buttons)

- [ ] Task 3: Create BudgetHistorySection component
  - [ ] Create `src/lib/components/budget/BudgetHistorySection.svelte`
  - [ ] Header with "Historique" title
  - [ ] List of BudgetHistoryCard components
  - [ ] Empty state if no history
  - [ ] "Voir plus" button if more than 6 months

- [ ] Task 4: Integrate history section into /budgets page
  - [ ] Add section below current month content
  - [ ] Load history on mount
  - [ ] Visual separator between current and history

- [ ] Task 5: Style for read-only distinction
  - [ ] Current month: full colors, interactive
  - [ ] History: slightly muted, no hover effects on values
  - [ ] Badge or label "Archivé" on history cards

- [ ] Task 6: Test and verify
  - [ ] Test with multiple months of data
  - [ ] Test empty state
  - [ ] Test expand/collapse
  - [ ] TypeScript check

## Dev Notes

### UI Design Concept

```
┌─────────────────────────────────────────┐
│           Janvier 2026                   │
│      Budget du mois en cours            │
├─────────────────────────────────────────┤
│  [Carte revenus - éditable]             │
│  [Catégories - éditable]                │
└─────────────────────────────────────────┘

─────────── Historique ───────────

┌─────────────────────────────────────────┐
│ Décembre 2025              Archivé      │
│ Revenus: 3 500 €    Alloué: 92%    ✓   │
│ ▼ Voir les catégories                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Novembre 2025              Archivé      │
│ Revenus: 3 500 €    Alloué: 105%   ⚠   │
│ ▶ Voir les catégories                   │
└─────────────────────────────────────────┘
```

### History Card Component

```svelte
<!-- BudgetHistoryCard.svelte -->
<script lang="ts">
  let { month, income, totalAllocated, categories } = $props<{
    month: string;
    income: number;
    totalAllocated: number;
    categories: { name: string; color: string; amount: number }[];
  }>();
  
  let isExpanded = $state(false);
  
  let allocationPercent = $derived(
    income > 0 ? Math.round((totalAllocated / income) * 100) : 0
  );
  
  let status = $derived(
    allocationPercent > 100 ? 'over' : 
    allocationPercent >= 90 ? 'balanced' : 'under'
  );
</script>

<div class="bg-cotton/50 border border-sand rounded-xl p-4 opacity-90">
  <div class="flex items-center justify-between">
    <div>
      <div class="flex items-center gap-2">
        <span class="font-medium text-coffee-900 capitalize">{formatMonthDisplay(month)}</span>
        <span class="badge badge-sm bg-oat text-stone-500 border-none">Archivé</span>
      </div>
      <div class="flex items-center gap-4 mt-1 text-sm text-stone-500">
        <span>Revenus: {formatCurrency(income)}</span>
        <span>Alloué: {allocationPercent}%</span>
        {#if status === 'balanced'}
          <span class="text-sage">✓</span>
        {:else if status === 'over'}
          <span class="text-terracotta">⚠</span>
        {:else}
          <span class="text-amber">○</span>
        {/if}
      </div>
    </div>
    
    <button 
      type="button"
      class="btn btn-ghost btn-sm text-stone-500"
      onclick={() => isExpanded = !isExpanded}
    >
      {isExpanded ? '▼' : '▶'} Catégories
    </button>
  </div>
  
  {#if isExpanded}
    <div class="mt-4 pt-4 border-t border-sand space-y-2">
      {#each categories as cat}
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" style="background-color: {cat.color}"></div>
            <span class="text-stone-500">{cat.name}</span>
          </div>
          <span class="text-coffee-900">{formatCurrency(cat.amount)}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
```

### Data Layer

```typescript
// src/lib/data/budgets.ts

interface BudgetHistoryItem {
  month: string;
  income: number;
  totalAllocated: number;
  categories: { name: string; color: string; amount: number }[];
}

export async function getBudgetHistory(
  excludeMonth: string,
  limit = 12
): Promise<{ data: BudgetHistoryItem[]; error: PostgrestError | null }> {
  // Get all monthly budgets except current
  const { data: budgets, error } = await supabase
    .from('monthly_budgets')
    .select('*')
    .neq('month', excludeMonth)
    .order('month', { ascending: false })
    .limit(limit);
    
  if (error) return { data: [], error };
  
  // For each month, get category allocations
  // ... (join with category_budgets and budget_categories)
  
  return { data: history, error: null };
}
```

### Visual Distinction

| Aspect | Mois courant | Historique |
|--------|--------------|------------|
| Opacité | 100% | 90% |
| Background | cotton | cotton/50 |
| Actions | Tous les boutons | Aucun |
| Badge | - | "Archivé" |
| Hover | Interactions | Aucun |

## Dependencies

- Story 3.1 (Monthly Income) - Complete
- Story 3.2 (Create Category) - Required for categories display
- Story 3.3 (Allocate Amounts) - Required for allocation data

## Notes

- Cette story peut être implémentée après 3.3 quand les allocations existent
- L'historique se construit automatiquement au fil des mois
- Pas besoin d'action utilisateur pour "archiver" - le changement de mois suffit
