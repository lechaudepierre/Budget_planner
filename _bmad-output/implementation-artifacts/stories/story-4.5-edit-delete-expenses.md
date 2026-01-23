# Story 4.5: Edit & Delete Expenses

## User Story
As a user,
I want to edit or delete an expense,
So that I can correct mistakes or remove erroneous entries.

## Acceptance Criteria

### AC1: Open Edit Mode
**Given** I am viewing my expense history
**When** I click on an expense
**Then** I can edit its details (amount, category, date, description)

### AC2: Save Edited Expense
**Given** I edit an expense
**When** I save
**Then** the expense is updated
**And** any affected budget gauges update
**And** a success toast appears

### AC3: Delete with Confirmation
**Given** I want to delete an expense
**When** I click delete
**Then** a confirmation appears
**And** upon confirmation, the expense is removed
**And** budget gauges update to reflect the removal

### AC4: Gauge State Update
**Given** I delete an expense from a category that was over 100%
**When** the deletion brings it under 100%
**Then** the gauge updates to reflect the new, healthy state

## Technical Notes

### Data Layer Functions (add to expenses.ts)
```typescript
export async function updateExpense(
    id: string,
    data: {
        category_id?: string;
        amount?: number;
        description?: string | null;
        date?: string;
    }
): Promise<{ data: Expense | null; error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { data: null, error: new Error('Vous devez être connecté') };
    }

    const { data: expense, error } = await supabase
        .from('expenses')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    return { data: expense, error };
}

export async function deleteExpense(id: string): Promise<{ error: Error | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: new Error('Vous devez être connecté') };
    }

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    return { error };
}
```

### Edit Modal Component (src/lib/components/expense/EditExpenseModal.svelte)
```svelte
<script lang="ts">
    import type { ExpenseWithCategory, BudgetCategory } from '$lib/types/database';
    import { updateExpense, deleteExpense } from '$lib/data/expenses';
    import { expenseSchema } from '$lib/schemas/expense';

    let {
        expense,
        categories,
        open = $bindable(false),
        onSave,
        onDelete
    }: {
        expense: ExpenseWithCategory;
        categories: BudgetCategory[];
        open: boolean;
        onSave: () => void;
        onDelete: () => void;
    } = $props();

    let categoryId = $state(expense.category_id || '');
    let amount = $state(expense.amount.toString());
    let description = $state(expense.description || '');
    let date = $state(expense.date);
    let saving = $state(false);
    let deleting = $state(false);
    let showDeleteConfirm = $state(false);
    let errors = $state<Record<string, string>>({});

    async function handleSave() {
        // Validate
        const result = expenseSchema.safeParse({
            category_id: categoryId,
            amount: parseFloat(amount),
            description: description || null,
            date
        });

        if (!result.success) {
            errors = {};
            result.error.issues.forEach(issue => {
                errors[issue.path[0] as string] = issue.message;
            });
            return;
        }

        saving = true;
        const { error } = await updateExpense(expense.id, result.data);
        saving = false;

        if (error) {
            // Show error toast
            return;
        }

        // Success toast
        open = false;
        onSave();
    }

    async function handleDelete() {
        deleting = true;
        const { error } = await deleteExpense(expense.id);
        deleting = false;

        if (error) {
            // Show error toast
            return;
        }

        // Success toast
        open = false;
        onDelete();
    }
</script>

<dialog class="modal" class:modal-open={open}>
    <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Modifier la dépense</h3>
        
        <form onsubmit|preventDefault={handleSave} class="space-y-4">
            <!-- Amount -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Montant *</span>
                </label>
                <div class="input-group">
                    <input 
                        type="number"
                        step="0.01"
                        bind:value={amount}
                        class="input input-bordered w-full"
                        class:input-error={errors.amount}
                    />
                    <span>€</span>
                </div>
                {#if errors.amount}
                    <label class="label">
                        <span class="label-text-alt text-error">{errors.amount}</span>
                    </label>
                {/if}
            </div>

            <!-- Category -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Catégorie *</span>
                </label>
                <select 
                    bind:value={categoryId}
                    class="select select-bordered"
                    class:select-error={errors.category_id}
                >
                    <option value="">Sélectionner une catégorie</option>
                    {#each categories as category}
                        <option value={category.id}>{category.name}</option>
                    {/each}
                </select>
            </div>

            <!-- Date -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Date *</span>
                </label>
                <input 
                    type="date"
                    bind:value={date}
                    class="input input-bordered"
                />
            </div>

            <!-- Description -->
            <div class="form-control">
                <label class="label">
                    <span class="label-text">Description (optionnel)</span>
                </label>
                <input 
                    type="text"
                    bind:value={description}
                    class="input input-bordered"
                    placeholder="Ex: Courses au Carrefour"
                />
            </div>

            <!-- Actions -->
            <div class="modal-action flex justify-between">
                <button 
                    type="button"
                    class="btn btn-error btn-outline"
                    onclick={() => showDeleteConfirm = true}
                >
                    Supprimer
                </button>
                <div class="space-x-2">
                    <button 
                        type="button"
                        class="btn"
                        onclick={() => open = false}
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit"
                        class="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </form>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button onclick={() => open = false}>close</button>
    </form>
</dialog>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
    <dialog class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg">Supprimer cette dépense ?</h3>
            <p class="py-4">
                Cette action est irréversible. La dépense de 
                <strong>{formatCurrency(expense.amount)}</strong> 
                sera définitivement supprimée.
            </p>
            <div class="modal-action">
                <button 
                    class="btn"
                    onclick={() => showDeleteConfirm = false}
                >
                    Annuler
                </button>
                <button 
                    class="btn btn-error"
                    onclick={handleDelete}
                    disabled={deleting}
                >
                    {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
            </div>
        </div>
    </dialog>
{/if}
```

## Files to Create/Modify
1. `src/lib/data/expenses.ts` - Add updateExpense, deleteExpense
2. `src/lib/components/expense/EditExpenseModal.svelte`
3. `src/routes/expenses/+page.svelte` - Integrate edit modal

## Dependencies
- Stories 4.1-4.3 must be complete
