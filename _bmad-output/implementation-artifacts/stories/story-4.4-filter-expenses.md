# Story 4.4: Filter Expenses by Category & Date

## User Story
As a user,
I want to filter my expenses by category and date range,
So that I can analyze specific spending patterns.

## Acceptance Criteria

### AC1: Category Filter
**Given** I am viewing my expense history
**When** I select a category filter (e.g., "Resto")
**Then** only expenses in that category are shown
**And** I see the total for the filtered expenses

### AC2: Date Range Filter
**Given** I am viewing my expense history
**When** I select a date range (e.g., "This month", "Last month", or custom range)
**Then** only expenses within that range are shown

### AC3: Combined Filters
**Given** I apply both category and date filters
**When** I view the results
**Then** both filters are applied (AND logic)
**And** I can clear filters to see all expenses again

### AC4: No Results State
**Given** no expenses match my filters
**When** I view the results
**Then** I see "Aucune dépense ne correspond à vos filtres"

## Technical Notes

### Filter Component (src/lib/components/expense/ExpenseFilters.svelte)
```svelte
<script lang="ts">
    import type { BudgetCategory } from '$lib/types/database';

    let { 
        categories = [],
        selectedCategoryId = $bindable<string | null>(null),
        dateRange = $bindable<'this-month' | 'last-month' | 'last-3-months' | 'custom'>('this-month'),
        customStartDate = $bindable<string>(''),
        customEndDate = $bindable<string>(''),
        onFilterChange
    }: {
        categories: BudgetCategory[];
        selectedCategoryId: string | null;
        dateRange: string;
        customStartDate: string;
        customEndDate: string;
        onFilterChange: () => void;
    } = $props();

    const dateRangeOptions = [
        { value: 'this-month', label: 'Ce mois' },
        { value: 'last-month', label: 'Mois dernier' },
        { value: 'last-3-months', label: '3 derniers mois' },
        { value: 'all', label: 'Tout' },
        { value: 'custom', label: 'Personnalisé' }
    ];
</script>

<div class="bg-white rounded-lg p-4 shadow-sm mb-4">
    <div class="flex flex-wrap gap-4">
        <!-- Category Filter -->
        <div class="form-control w-full sm:w-auto">
            <label class="label">
                <span class="label-text text-sm">Catégorie</span>
            </label>
            <select 
                class="select select-bordered select-sm"
                bind:value={selectedCategoryId}
                onchange={onFilterChange}
            >
                <option value={null}>Toutes les catégories</option>
                {#each categories as category}
                    <option value={category.id}>{category.name}</option>
                {/each}
            </select>
        </div>

        <!-- Date Range Filter -->
        <div class="form-control w-full sm:w-auto">
            <label class="label">
                <span class="label-text text-sm">Période</span>
            </label>
            <select 
                class="select select-bordered select-sm"
                bind:value={dateRange}
                onchange={onFilterChange}
            >
                {#each dateRangeOptions as option}
                    <option value={option.value}>{option.label}</option>
                {/each}
            </select>
        </div>

        <!-- Custom Date Range (shown only when 'custom' is selected) -->
        {#if dateRange === 'custom'}
            <div class="form-control">
                <label class="label">
                    <span class="label-text text-sm">Du</span>
                </label>
                <input 
                    type="date" 
                    class="input input-bordered input-sm"
                    bind:value={customStartDate}
                    onchange={onFilterChange}
                />
            </div>
            <div class="form-control">
                <label class="label">
                    <span class="label-text text-sm">Au</span>
                </label>
                <input 
                    type="date" 
                    class="input input-bordered input-sm"
                    bind:value={customEndDate}
                    onchange={onFilterChange}
                />
            </div>
        {/if}

        <!-- Clear Filters -->
        {#if selectedCategoryId || dateRange !== 'this-month'}
            <div class="form-control justify-end">
                <button 
                    class="btn btn-ghost btn-sm"
                    onclick={clearFilters}
                >
                    Effacer les filtres
                </button>
            </div>
        {/if}
    </div>
</div>
```

### Date Range Utility (src/lib/utils/date.ts)
```typescript
export function getDateRangeFromPreset(preset: string): { startDate: string; endDate: string } | null {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (preset) {
        case 'this-month':
            return {
                startDate: new Date(year, month, 1).toISOString().split('T')[0],
                endDate: new Date(year, month + 1, 0).toISOString().split('T')[0]
            };
        case 'last-month':
            return {
                startDate: new Date(year, month - 1, 1).toISOString().split('T')[0],
                endDate: new Date(year, month, 0).toISOString().split('T')[0]
            };
        case 'last-3-months':
            return {
                startDate: new Date(year, month - 2, 1).toISOString().split('T')[0],
                endDate: new Date(year, month + 1, 0).toISOString().split('T')[0]
            };
        case 'all':
            return null;
        default:
            return null;
    }
}
```

### Summary Display
```svelte
<!-- Show total for filtered results -->
{#if expenses.length > 0}
    <div class="bg-oat rounded-lg p-3 mb-4 flex justify-between items-center">
        <span class="text-sm text-gray-600">
            {expenses.length} transaction{expenses.length > 1 ? 's' : ''}
        </span>
        <span class="font-semibold text-gray-800">
            Total: {formatCurrency(totalFiltered)}
        </span>
    </div>
{/if}
```

## Files to Create/Modify
1. `src/lib/components/expense/ExpenseFilters.svelte`
2. `src/lib/utils/date.ts` - Add date range utilities
3. `src/routes/expenses/+page.svelte` - Integrate filters

## Dependencies
- Story 4.3 must be complete
