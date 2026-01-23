# Story 4.2: Expense Entry Modal with Budget Preview

## User Story
As a user,
I want to see how much budget remains in a category when adding an expense,
So that I can make informed spending decisions.

## Acceptance Criteria

### AC1: Budget Preview on Category Selection
**Given** I am adding an expense
**When** I select a category (e.g., "Courses")
**Then** I see a preview showing: Budget: 600 € | Dépensé: 312 € | Reste: 288 €
**And** I see a small progress bar showing 52% utilized

### AC2: Projected Overage Display
**Given** I enter an amount that would exceed the budget
**When** I view the preview
**Then** the preview updates to show the projected overage
**And** no blocking warning - just informational display

### AC3: Preview Updates on Category Change
**Given** I change the category selection
**When** I select a different category
**Then** the budget preview updates to reflect the new category's status

## Technical Notes

### Data Function (add to expenses.ts)
```typescript
export async function getCategorySpending(categoryId: string): Promise<{
    budget: number;
    spent: number;
    remaining: number;
} | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get active budget allocation for this category
    const { data: allocation } = await supabase
        .from('budget_categories')
        .select(`
            allocated_amount,
            monthly_budget:monthly_budgets!inner(is_archived)
        `)
        .eq('id', categoryId)
        .eq('monthly_budgets.is_archived', false)
        .single();

    if (!allocation) return null;

    // Get sum of expenses for this category in the active budget period
    const { data: activeBudget } = await supabase
        .from('monthly_budgets')
        .select('month')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .single();

    if (!activeBudget) return null;

    const monthStart = `${activeBudget.month}-01`;
    const monthEnd = new Date(activeBudget.month + '-01');
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const endDate = monthEnd.toISOString().split('T')[0];

    const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('category_id', categoryId)
        .gte('date', monthStart)
        .lt('date', endDate);

    const spent = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    return {
        budget: Number(allocation.allocated_amount),
        spent,
        remaining: Number(allocation.allocated_amount) - spent
    };
}
```

### Component Updates (AddExpenseModal.svelte)
```svelte
<script lang="ts">
    // ... existing code

    let categorySpending = $state<{
        budget: number;
        spent: number;
        remaining: number;
    } | null>(null);

    // Reactive preview including entered amount
    let previewWithAmount = $derived.by(() => {
        if (!categorySpending) return null;
        const enteredAmount = parseFloat(amount) || 0;
        return {
            budget: categorySpending.budget,
            spent: categorySpending.spent,
            spentWithNew: categorySpending.spent + enteredAmount,
            remaining: categorySpending.remaining - enteredAmount,
            percentage: Math.round(((categorySpending.spent + enteredAmount) / categorySpending.budget) * 100)
        };
    });

    async function onCategoryChange(categoryId: string) {
        if (categoryId) {
            categorySpending = await getCategorySpending(categoryId);
        } else {
            categorySpending = null;
        }
    }
</script>

<!-- Budget Preview Section -->
{#if previewWithAmount}
    <div class="bg-oat rounded-lg p-3 mt-2">
        <div class="flex justify-between text-sm text-sand-dark mb-2">
            <span>Budget: {formatCurrency(previewWithAmount.budget)}</span>
            <span>Dépensé: {formatCurrency(previewWithAmount.spent)}</span>
            <span class:text-terracotta={previewWithAmount.remaining < 0}>
                Reste: {formatCurrency(previewWithAmount.remaining)}
            </span>
        </div>
        <div class="w-full bg-sand rounded-full h-2">
            <div 
                class="h-2 rounded-full transition-all"
                class:bg-sage={previewWithAmount.percentage <= 75}
                class:bg-amber={previewWithAmount.percentage > 75 && previewWithAmount.percentage <= 100}
                class:bg-terracotta={previewWithAmount.percentage > 100}
                style="width: {Math.min(previewWithAmount.percentage, 100)}%"
            ></div>
        </div>
        {#if previewWithAmount.percentage > 100}
            <p class="text-xs text-terracotta mt-1">
                {previewWithAmount.percentage}% du budget (dépassement prévu)
            </p>
        {:else}
            <p class="text-xs text-gray-500 mt-1">{previewWithAmount.percentage}% du budget</p>
        {/if}
    </div>
{/if}
```

### UI/UX
- Preview appears below category dropdown
- Real-time updates as amount changes
- Color coding:
  - 0-75%: Sage (healthy)
  - 75-100%: Amber (caution)
  - >100%: Terracotta (over)
- Non-judgmental tone - informational only
- Smooth transitions

## Files to Modify
1. `src/lib/data/expenses.ts` - Add getCategorySpending function
2. `src/lib/components/expense/AddExpenseModal.svelte` - Add preview section

## Dependencies
- Story 4.1 must be complete
- Active budget must exist
