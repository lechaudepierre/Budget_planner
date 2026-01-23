# Story 4.6: Dashboard with Budget Gauges (Basic)

## User Story
As a user,
I want to see all my budget categories as gauges on the dashboard,
So that I can instantly see where I stand.

## Acceptance Criteria

### AC1: Gauges Grid Display
**Given** I am signed in and on the dashboard
**When** I view the "Budgets par catégorie" section
**Then** I see a grid of circular gauges (one per category)
**And** each gauge shows: category name, amount spent / budget, percentage

### AC2: Gauge Calculation
**Given** a category has 312 € spent of 600 € budget
**When** I view its gauge
**Then** the gauge shows 52% filled
**And** the remaining amount (288 €) is visible

### AC3: Multiple Categories
**Given** I have 6 categories
**When** I view the dashboard
**Then** I see 6 mini gauges arranged in a grid (2-3 columns)

### AC4: Empty State
**Given** I have no categories or budgets set
**When** I view the dashboard
**Then** I see a prompt to set up my budget

## Technical Notes

### Circular Gauge Component (src/lib/components/gauges/CircularGauge.svelte)
```svelte
<script lang="ts">
    let {
        percentage = 0,
        label,
        spent,
        budget,
        color = '#639A88',
        size = 80
    }: {
        percentage: number;
        label: string;
        spent: number;
        budget: number;
        color?: string;
        size?: number;
    } = $props();

    // SVG calculations
    const strokeWidth = size * 0.1;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    let dashOffset = $derived(circumference - (Math.min(percentage, 100) / 100) * circumference);

    // Determine gauge color based on percentage
    let gaugeColor = $derived.by(() => {
        if (percentage <= 75) return '#639A88'; // Sage - healthy
        if (percentage <= 100) return '#D4A04D'; // Amber - caution
        return '#C07D5A'; // Terracotta - over
    });
</script>

<div class="flex flex-col items-center">
    <svg width={size} height={size} viewBox="0 0 {size} {size}">
        <!-- Background circle -->
        <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E2DCD2"
            stroke-width={strokeWidth}
        />
        <!-- Progress circle -->
        <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={gaugeColor}
            stroke-width={strokeWidth}
            stroke-linecap="round"
            stroke-dasharray={circumference}
            stroke-dashoffset={dashOffset}
            transform="rotate(-90 {size / 2} {size / 2})"
            class="transition-all duration-300 ease-out"
        />
        <!-- Percentage text -->
        <text
            x={size / 2}
            y={size / 2}
            text-anchor="middle"
            dominant-baseline="middle"
            class="text-sm font-semibold"
            fill={gaugeColor}
        >
            {Math.round(percentage)}%
        </text>
    </svg>
    
    <!-- Category name -->
    <span class="text-xs text-gray-600 mt-1 text-center truncate max-w-[80px]">
        {label}
    </span>
    
    <!-- Spent/Budget -->
    <span class="text-xs text-gray-400">
        {formatCompact(spent)} / {formatCompact(budget)}
    </span>
</div>

<script context="module">
    function formatCompact(value: number): string {
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
        }
        return value.toFixed(0) + '€';
    }
</script>
```

### Budget Overview Component (src/lib/components/dashboard/BudgetOverview.svelte)
```svelte
<script lang="ts">
    import CircularGauge from '$lib/components/gauges/CircularGauge.svelte';
    import type { CategoryWithSpending } from '$lib/types/database';

    let { categories = [] }: { categories: CategoryWithSpending[] } = $props();
</script>

{#if categories.length === 0}
    <div class="bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Budgets par catégorie</h2>
        <div class="text-center py-8">
            <div class="text-4xl mb-3">📊</div>
            <p class="text-gray-500 mb-4">Aucun budget configuré</p>
            <a href="/budgets" class="btn btn-primary btn-sm">
                Configurer mon budget
            </a>
        </div>
    </div>
{:else}
    <div class="bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Budgets par catégorie</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {#each categories as category}
                <CircularGauge
                    percentage={(category.spent / category.allocated_amount) * 100}
                    label={category.name}
                    spent={category.spent}
                    budget={category.allocated_amount}
                    color={category.color}
                />
            {/each}
        </div>
    </div>
{/if}
```

### Data Function (add to budgets.ts or create dashboard.ts)
```typescript
export async function getCategoriesWithSpending(): Promise<CategoryWithSpending[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get active budget with categories
    const { data: budget } = await supabase
        .from('monthly_budgets')
        .select(`
            id,
            month,
            categories:budget_categories(
                id,
                name,
                color,
                allocated_amount
            )
        `)
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .single();

    if (!budget?.categories) return [];

    // Get expenses for each category in the budget period
    const monthStart = `${budget.month}-01`;
    const monthEnd = new Date(budget.month + '-01');
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const endDate = monthEnd.toISOString().split('T')[0];

    const { data: expenses } = await supabase
        .from('expenses')
        .select('category_id, amount')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lt('date', endDate);

    // Calculate spending per category
    const spendingByCategory = (expenses || []).reduce((acc, expense) => {
        if (expense.category_id) {
            acc[expense.category_id] = (acc[expense.category_id] || 0) + Number(expense.amount);
        }
        return acc;
    }, {} as Record<string, number>);

    return budget.categories.map(cat => ({
        ...cat,
        spent: spendingByCategory[cat.id] || 0
    }));
}
```

### Types (database.ts)
```typescript
export interface CategoryWithSpending extends BudgetCategory {
    spent: number;
}
```

## Files to Create/Modify
1. `src/lib/components/gauges/CircularGauge.svelte`
2. `src/lib/components/dashboard/BudgetOverview.svelte`
3. `src/lib/data/dashboard.ts` - getCategoriesWithSpending
4. `src/lib/types/database.ts` - Add CategoryWithSpending type
5. `src/routes/+page.svelte` - Dashboard integration

## Dependencies
- Epic 3 complete (categories exist)
- Story 4.1 complete (expenses exist)
