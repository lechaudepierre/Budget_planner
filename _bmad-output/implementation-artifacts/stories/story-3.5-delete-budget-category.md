# Story 3.5: Delete Budget Category

Status: not-started

## Story

As a user,
I want to delete a category I no longer need,
so that my budget view stays clean and relevant.

## Acceptance Criteria

1. Delete button visible on each category row
2. Confirmation modal before deletion: "Supprimer cette catégorie ?"
3. Modal shows warning about losing allocation history
4. Soft delete preserves data (deleted_at timestamp)
5. Category immediately disappears from UI after deletion
6. Remaining amount recalculates after deletion
7. Success toast confirms deletion
8. Cannot delete the last category (at least one required)

## Tasks / Subtasks

- [ ] Task 1: Add soft delete column to budget_categories (AC: 4)
  - [ ] Create migration `006_add_soft_delete_to_categories.sql`
  - [ ] Add deleted_at TIMESTAMPTZ column (nullable)
  - [ ] Update RLS policies to exclude deleted

- [ ] Task 2: Implement soft delete in data layer (AC: 4)
  - [ ] Add `deleteCategory(id)` to budgets.ts
  - [ ] Set deleted_at = now() instead of DELETE
  - [ ] Return success/error

- [ ] Task 3: Update queries to exclude deleted categories (AC: 5)
  - [ ] Update `getCategories()` to filter deleted_at IS NULL
  - [ ] Ensure all category fetches exclude deleted

- [ ] Task 4: Add delete button to AllocationRow (AC: 1)
  - [ ] Add trash icon button at end of row
  - [ ] Subtle styling, visible on hover
  - [ ] Disable if only one category remains

- [ ] Task 5: Create DeleteCategoryModal component (AC: 2, 3)
  - [ ] Create `src/lib/components/budget/DeleteCategoryModal.svelte`
  - [ ] Show category name and color
  - [ ] Warning about losing allocation history
  - [ ] Confirm/Cancel buttons
  - [ ] French text throughout

- [ ] Task 6: Implement delete flow (AC: 5, 6, 7)
  - [ ] Show modal on delete button click
  - [ ] Call deleteCategory on confirm
  - [ ] Remove from local state immediately
  - [ ] Recalculate remaining amount
  - [ ] Show success toast

- [ ] Task 7: Prevent deletion of last category (AC: 8)
  - [ ] Check category count before showing delete button
  - [ ] Disable or hide if only 1 category
  - [ ] Show tooltip explaining why

- [ ] Task 8: Test delete scenarios (AC: 1-8)
  - [ ] Test delete confirmation flow
  - [ ] Test soft delete in database
  - [ ] Test UI update after deletion
  - [ ] Test remaining recalculation
  - [ ] Test last category protection
  - [ ] TypeScript check

## Dev Notes

### Soft Delete Migration

```sql
-- supabase/migrations/006_add_soft_delete_to_categories.sql

-- Add soft delete column
ALTER TABLE public.budget_categories
ADD COLUMN deleted_at TIMESTAMPTZ;

-- Update RLS policy to exclude deleted categories
DROP POLICY IF EXISTS "Users can view own categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can manage own categories" ON public.budget_categories;

CREATE POLICY "Users can view own active categories"
    ON public.budget_categories
    FOR SELECT
    USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "Users can insert own categories"
    ON public.budget_categories
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories"
    ON public.budget_categories
    FOR UPDATE
    USING (user_id = auth.uid());

-- Note: No DELETE policy - we use soft delete
```

### Data Layer

```typescript
// src/lib/data/budgets.ts

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error: PostgrestError | null }> {
  const { error } = await supabase
    .from('budget_categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
    
  return { success: !error, error };
}

// Update getCategories to exclude deleted (automatic with RLS)
export async function getCategories(): Promise<{
  data: BudgetCategory[];
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from('budget_categories')
    .select('*')
    .order('sort_order', { ascending: true });
    
  return { data: data ?? [], error };
}
```

### Delete Confirmation Modal

```svelte
<!-- src/lib/components/budget/DeleteCategoryModal.svelte -->
<script lang="ts">
  import type { BudgetCategory } from '$lib/types/database';
  
  let { category, isOpen, onConfirm, onCancel } = $props<{
    category: BudgetCategory;
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }>();
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal modal-open" role="dialog" aria-modal="true">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Supprimer cette catégorie ?</h3>
      
      <div class="py-4">
        <div class="flex items-center gap-3 p-3 bg-base-200 rounded-lg mb-4">
          <div class="w-4 h-4 rounded-full" style="background-color: {category.color}"></div>
          <span class="font-medium">{category.name}</span>
        </div>
        
        <div class="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-sm">L'historique des allocations pour cette catégorie sera perdu.</span>
        </div>
      </div>
      
      <div class="modal-action">
        <button type="button" class="btn btn-ghost" onclick={onCancel}>
          Annuler
        </button>
        <button type="button" class="btn btn-error" onclick={onConfirm}>
          Supprimer
        </button>
      </div>
    </div>
    
    <div class="modal-backdrop"
         role="button"
         tabindex="0"
         aria-label="Fermer"
         onclick={onCancel}
         onkeydown={(e) => e.key === 'Escape' && onCancel()}>
    </div>
  </div>
{/if}
```

### Delete Button in Row

```svelte
<!-- In AllocationRow.svelte -->
<script lang="ts">
  let { category, canDelete = true, onDelete } = $props<{
    category: BudgetCategory;
    canDelete?: boolean;
    onDelete: () => void;
    // ... other props
  }>();
</script>

<!-- Delete button at end of row -->
{#if canDelete}
  <button type="button"
          class="btn btn-ghost btn-sm opacity-50 hover:opacity-100 hover:text-error"
          aria-label="Supprimer {category.name}"
          onclick={onDelete}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  </button>
{:else}
  <div class="w-8" title="Au moins une catégorie requise"></div>
{/if}
```

### Integration in Budget Page

```svelte
<!-- In /budgets page -->
<script lang="ts">
  import DeleteCategoryModal from '$lib/components/budget/DeleteCategoryModal.svelte';
  import { toast } from '$lib/stores/toast';
  
  let categoryToDelete = $state<BudgetCategory | null>(null);
  
  async function handleDeleteConfirm() {
    if (!categoryToDelete) return;
    
    const result = await deleteCategory(categoryToDelete.id);
    
    if (result.error) {
      toast.error('Erreur lors de la suppression');
    } else {
      categories = categories.filter(c => c.id !== categoryToDelete.id);
      allocations.delete(categoryToDelete.id);
      toast.success('Catégorie supprimée');
    }
    
    categoryToDelete = null;
  }
</script>

{#each categories as category}
  <AllocationRow
    {category}
    canDelete={categories.length > 1}
    onDelete={() => categoryToDelete = category}
    {/* ...other props */}
  />
{/each}

<DeleteCategoryModal
  category={categoryToDelete}
  isOpen={categoryToDelete !== null}
  onConfirm={handleDeleteConfirm}
  onCancel={() => categoryToDelete = null}
/>
```

## Dependencies

- Story 3.2 (Create Category) - Complete
- Story 3.3 (Allocate Amounts) - Complete
- Story 3.4 (Edit Category) - Complete
- Categories and allocations exist in UI
