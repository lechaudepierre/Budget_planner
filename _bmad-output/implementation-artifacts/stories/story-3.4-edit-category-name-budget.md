# Story 3.4: Edit Category Name & Budget

Status: not-started

## Story

As a user,
I want to edit a category's name, color, or budget amount,
so that I can make adjustments as my needs change.

## Acceptance Criteria

1. Inline editing for category name and budget amount
2. Dedicated edit mode per category row
3. Color picker accessible in edit mode
4. Changes saved on blur or Enter key
5. Visual indication of edit mode
6. Cancel editing with Escape key
7. Validation on name (non-empty, max 50 chars)
8. Success feedback on save

## Tasks / Subtasks

- [ ] Task 1: Extend AllocationRow with edit capability (AC: 1, 2, 5)
  - [ ] Add `isEditing` state to AllocationRow component
  - [ ] Toggle edit mode on click/button
  - [ ] Show editable input for name in edit mode
  - [ ] Visual border/highlight when editing

- [ ] Task 2: Implement category update in data layer (AC: 4)
  - [ ] Add `updateCategory(id, { name?, color? })` to budgets.ts
  - [ ] Handle partial updates
  - [ ] Return updated category

- [ ] Task 3: Add inline color picker (AC: 3)
  - [ ] Create color picker dropdown in edit mode
  - [ ] Use predefined palette from Story 3.2
  - [ ] Show current color as selected
  - [ ] Update preview on selection

- [ ] Task 4: Implement save on blur/Enter (AC: 4, 8)
  - [ ] Add blur handler to inputs
  - [ ] Add keydown handler for Enter key
  - [ ] Call update function
  - [ ] Show brief success indicator

- [ ] Task 5: Add Escape key to cancel (AC: 6)
  - [ ] Add keydown handler for Escape
  - [ ] Revert to original values
  - [ ] Exit edit mode

- [ ] Task 6: Add validation (AC: 7)
  - [ ] Validate name is not empty
  - [ ] Validate max 50 characters
  - [ ] Show error if invalid
  - [ ] Prevent save of invalid data

- [ ] Task 7: Update budget amount editing (AC: 1)
  - [ ] Amount already editable in allocation input
  - [ ] Ensure changes sync correctly
  - [ ] Real-time recalculation of remaining

- [ ] Task 8: Test all edit scenarios (AC: 1-8)
  - [ ] Test name editing with Enter
  - [ ] Test name editing with blur
  - [ ] Test color change
  - [ ] Test Escape to cancel
  - [ ] Test validation errors
  - [ ] TypeScript check

## Dev Notes

### Edit Mode Component Update

```svelte
<!-- AllocationRow.svelte -->
<script lang="ts">
  import { updateCategory } from '$lib/data/budgets';
  
  let { category, amount, onAmountChange, totalIncome } = $props<{
    category: BudgetCategory;
    amount: number;
    onAmountChange: (amount: number) => void;
    totalIncome: number;
  }>();
  
  let isEditing = $state(false);
  let editName = $state(category.name);
  let editColor = $state(category.color);
  let isSaving = $state(false);
  let error = $state('');
  
  async function saveChanges() {
    if (!editName.trim()) {
      error = 'Le nom est requis';
      return;
    }
    if (editName.length > 50) {
      error = 'Maximum 50 caractères';
      return;
    }
    
    error = '';
    isSaving = true;
    
    const result = await updateCategory(category.id, {
      name: editName.trim(),
      color: editColor
    });
    
    isSaving = false;
    
    if (result.error) {
      error = result.error.message;
    } else {
      isEditing = false;
      // Parent will refresh data
    }
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      saveChanges();
    } else if (e.key === 'Escape') {
      editName = category.name;
      editColor = category.color;
      isEditing = false;
    }
  }
</script>

<div class="flex items-center gap-3 py-3 px-4 rounded-lg bg-base-100"
     class:ring-2={isEditing}
     class:ring-sage={isEditing}>
  
  {#if isEditing}
    <!-- Color picker dropdown -->
    <div class="dropdown">
      <div tabindex="0" role="button" class="w-4 h-4 rounded-full cursor-pointer"
           style="background-color: {editColor}"></div>
      <ul tabindex="0" class="dropdown-content z-10 p-2 shadow bg-base-100 rounded-box grid grid-cols-5 gap-2">
        {#each CATEGORY_COLORS as color}
          <li>
            <button type="button"
                    class="w-6 h-6 rounded-full"
                    class:ring-2={editColor === color.value}
                    style="background-color: {color.value}"
                    onclick={() => editColor = color.value}>
            </button>
          </li>
        {/each}
      </ul>
    </div>
    
    <!-- Editable name -->
    <input type="text"
           bind:value={editName}
           onkeydown={handleKeydown}
           onblur={saveChanges}
           class="input input-sm input-bordered flex-1"
           class:input-error={error}
           maxlength="50" />
    
    {#if error}
      <span class="text-xs text-error">{error}</span>
    {/if}
  {:else}
    <!-- Display mode -->
    <div class="w-4 h-4 rounded-full" style="background-color: {category.color}"></div>
    <span class="flex-1 cursor-pointer" onclick={() => isEditing = true}>
      {category.name}
    </span>
  {/if}
  
  <!-- Amount input (always visible) -->
  <div class="flex items-center gap-2">
    <input type="number"
           value={amount}
           oninput={(e) => onAmountChange(Number(e.currentTarget.value) || 0)}
           class="input input-sm input-bordered w-24 text-right"
           min="0"
           step="10" />
    <span class="text-sm text-muted">€</span>
  </div>
</div>
```

### Data Layer Update

```typescript
// src/lib/data/budgets.ts
export async function updateCategory(
  id: string,
  updates: { name?: string; color?: string }
): Promise<{ data: BudgetCategory | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('budget_categories')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}
```

### UI Consistency Notes

- Edit mode indicated by ring-2 ring-sage border
- Color picker uses dropdown for space efficiency
- Inline editing feels natural and fast
- Escape always cancels, Enter always saves
- Brief visual feedback on successful save

## Dependencies

- Story 3.2 (Create Category) - Complete
- Story 3.3 (Allocate Amounts) - Complete
- AllocationRow component exists
