# Story 4.3: View Expense History List

## User Story
As a user,
I want to see a list of my expenses,
So that I can review my spending history.

## Acceptance Criteria

### AC1: Expense List Display
**Given** I am signed in
**When** I navigate to the Transactions page
**Then** I see a list of my expenses sorted by date (most recent first)
**And** each expense shows: date, description (or category if no description), category badge, amount

### AC2: Pagination/Virtualization
**Given** I have many expenses
**When** I view the list
**Then** the list is paginated for performance
**And** I can navigate through pages or load more

### AC3: Empty State
**Given** I have no expenses yet
**When** I view the Transactions page
**Then** I see an empty state encouraging me to add my first expense

## Technical Notes

### Page Structure (src/routes/expenses/+page.svelte)
```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import { getExpenses } from '$lib/data/expenses';
    import type { ExpenseWithCategory } from '$lib/types/database';
    import ExpenseListItem from '$lib/components/expense/ExpenseListItem.svelte';
    import EmptyState from '$lib/components/shared/EmptyState.svelte';

    let expenses = $state<ExpenseWithCategory[]>([]);
    let loading = $state(true);
    let hasMore = $state(true);
    let page = $state(0);
    const PAGE_SIZE = 30;

    onMount(async () => {
        await loadExpenses();
    });

    async function loadExpenses() {
        loading = true;
        const { data } = await getExpenses({
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE
        });
        
        if (data.length < PAGE_SIZE) {
            hasMore = false;
        }
        
        expenses = page === 0 ? data : [...expenses, ...data];
        loading = false;
    }

    async function loadMore() {
        page++;
        await loadExpenses();
    }
</script>

<div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-semibold text-gray-800 mb-6">Transactions</h1>

    {#if loading && expenses.length === 0}
        <div class="flex justify-center py-12">
            <span class="loading loading-spinner loading-lg text-sage"></span>
        </div>
    {:else if expenses.length === 0}
        <EmptyState
            icon="receipt"
            title="Aucune transaction"
            description="Ajoutez votre première dépense pour commencer à suivre vos finances."
            actionLabel="Ajouter une dépense"
            onAction={() => openAddModal()}
        />
    {:else}
        <div class="space-y-2">
            {#each expenses as expense (expense.id)}
                <ExpenseListItem {expense} onEdit={handleEdit} />
            {/each}
        </div>

        {#if hasMore}
            <div class="flex justify-center mt-6">
                <button 
                    class="btn btn-outline btn-sage"
                    onclick={loadMore}
                    disabled={loading}
                >
                    {loading ? 'Chargement...' : 'Charger plus'}
                </button>
            </div>
        {/if}
    {/if}
</div>
```

### ExpenseListItem Component
```svelte
<script lang="ts">
    import type { ExpenseWithCategory } from '$lib/types/database';
    import { formatCurrency, formatDate } from '$lib/utils/format';

    let { expense, onEdit }: {
        expense: ExpenseWithCategory;
        onEdit: (expense: ExpenseWithCategory) => void;
    } = $props();
</script>

<button 
    class="w-full bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
    onclick={() => onEdit(expense)}
>
    <div class="flex items-center gap-3">
        <div 
            class="w-3 h-3 rounded-full"
            style="background-color: {expense.category?.color || '#9CA3AF'}"
        ></div>
        <div class="text-left">
            <p class="font-medium text-gray-800">
                {expense.description || expense.category?.name || 'Sans catégorie'}
            </p>
            <p class="text-sm text-gray-500">{formatDate(expense.date)}</p>
        </div>
    </div>
    <div class="flex items-center gap-3">
        <span 
            class="badge badge-sm"
            style="background-color: {expense.category?.color}20; color: {expense.category?.color || '#9CA3AF'}"
        >
            {expense.category?.name || 'Aucune'}
        </span>
        <span class="font-semibold text-gray-800">
            -{formatCurrency(expense.amount)}
        </span>
    </div>
</button>
```

### Type Updates (database.ts)
```typescript
export interface ExpenseWithCategory extends Expense {
    category?: {
        id: string;
        name: string;
        color: string;
    } | null;
}
```

### Navigation
- Add "Transactions" link to navigation
- Route: `/expenses`

## Files to Create/Modify
1. `src/routes/expenses/+page.svelte`
2. `src/lib/components/expense/ExpenseListItem.svelte`
3. `src/lib/types/database.ts` - Add ExpenseWithCategory type
4. `src/lib/components/layout/Navigation.svelte` - Add link

## Dependencies
- Story 4.1 must be complete
