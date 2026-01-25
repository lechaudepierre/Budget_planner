# Story 7.4: Delete Fixed Expense

Status: backlog

## Story

As a user,
I want to delete a fixed expense,
So that I can remove cancelled subscriptions.

## Acceptance Criteria

1. **Given** I am viewing/editing an expense, **When** I click the delete button, **Then** a confirmation modal appears: "Supprimer [Name]?"

2. **Given** I confirm deletion, **When** I click "Supprimer", **Then** the expense is removed from the database, the monthly total updates, it disappears from the list, and a success toast appears

3. **Given** I cancel deletion, **When** I click "Annuler", **Then** nothing changes and the modal closes

4. **Given** an expense is deleted, **When** I view my budget page, **Then** the fixed expense total reflects the deletion (if shown there)

## Tasks / Subtasks

- [ ] **Task 1: Implement deleteRecurringExpense data function** (AC: 2)
  - [ ] In `src/lib/data/recurring-expenses.ts`, implement `deleteRecurringExpense(id)`
  - [ ] Hard delete query: `DELETE FROM recurring_expenses WHERE id = ? AND user_id = auth.uid()`
  - [ ] Return `{ data, error }` format
  - [ ] Follow pattern from `deleteGoal()` in `goals.ts`

- [ ] **Task 2: Create confirmation modal component** (AC: 1, 3)
  - [ ] Create reusable `src/lib/components/ui/ConfirmDialog.svelte` (if not exists)
  - [ ] Props: `isOpen`, `title`, `message`, `confirmText`, `onConfirm`, `onCancel`
  - [ ] Display expense name in confirmation message
  - [ ] Danger styling for delete action (terracotta color)
  - [ ] Follow existing modal patterns from project

- [ ] **Task 3: Add delete button to RecurringExpenseForm** (AC: 1)
  - [ ] In `RecurringExpenseForm.svelte`, add delete button (only in edit mode)
  - [ ] Position: bottom-left or secondary action area
  - [ ] Styling: `text-terracotta hover:bg-terracotta/10`
  - [ ] On click, show confirmation dialog
  - [ ] Don't close form until deletion confirmed

- [ ] **Task 4: Add delete button to RecurringExpenseCard** (AC: 1)
  - [ ] In `RecurringExpenseCard.svelte`, add delete icon button
  - [ ] Position: top-right corner or hover-revealed
  - [ ] Icon: trash-outline (red/terracotta on hover)
  - [ ] On click, emit delete event to parent
  - [ ] Stop event propagation to prevent card click

- [ ] **Task 5: Handle deletion in Fixed Expenses page** (AC: 2, 3)
  - [ ] In `src/routes/fixed-expenses/+page.svelte`:
    - Add confirmation dialog state
    - Add expense-to-delete state
    - Handle delete event from RecurringExpenseCard
    - Show confirmation dialog
    - On confirm, call `deleteRecurringExpense()`
    - Reload expenses list after deletion
    - Show success toast
    - Recalculate monthly total
  - [ ] Follow deletion pattern from `/epargne`

- [ ] **Task 6: Update monthly total after deletion** (AC: 2, 4)
  - [ ] After successful deletion, reload expenses
  - [ ] Monthly total recalculates automatically via $derived
  - [ ] Category breakdown updates if needed
  - [ ] Verify dashboard FixedExpensesCard reflects change (Story 7.5)

## Dev Notes

### Architecture Compliance

- Follow data layer pattern: all deletions in `src/lib/data/recurring-expenses.ts`
- Return `{ data, error }` from all functions
- Hard delete (no soft delete flag needed for this entity)
- Use confirmation dialog before destructive actions
- Toast notifications for user feedback

### Existing Patterns to Follow

**Delete Function Pattern** (from `goals.ts`):
```typescript
export async function deleteRecurringExpense(id: string) {
  try {
    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
```

**Confirmation Dialog Pattern** (from `/patrimoine`):
```svelte
<script>
  let showConfirmDialog = $state(false);
  let expenseToDelete = $state<RecurringExpense | null>(null);

  function handleDeleteClick(expense: RecurringExpense) {
    expenseToDelete = expense;
    showConfirmDialog = true;
  }

  async function confirmDelete() {
    if (!expenseToDelete) return;

    const result = await deleteRecurringExpense(expenseToDelete.id);
    if (result.error) {
      toast.error('Erreur lors de la suppression');
      return;
    }

    toast.success('Engagement supprimé avec succès');
    showConfirmDialog = false;
    expenseToDelete = null;
    await loadData();
  }

  function cancelDelete() {
    showConfirmDialog = false;
    expenseToDelete = null;
  }
</script>

{#if showConfirmDialog}
  <ConfirmDialog
    isOpen={showConfirmDialog}
    title="Supprimer l'engagement"
    message={`Êtes-vous sûr de vouloir supprimer "${expenseToDelete?.name}" ?`}
    confirmText="Supprimer"
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
  />
{/if}
```

**Delete Button in Card** (from `GoalCard.svelte`):
```svelte
<button
  onclick={(e) => {
    e.stopPropagation();
    onDelete?.(expense);
  }}
  class="p-2 hover:bg-terracotta/10 rounded-lg transition"
  aria-label="Supprimer"
>
  <svg class="w-5 h-5 text-stone-400 hover:text-terracotta">
    <!-- Trash icon SVG -->
  </svg>
</button>
```

### Project Structure Notes

**Files to create (if needed):**
```
src/lib/components/ui/ConfirmDialog.svelte  ← NEW (if doesn't exist, reuse pattern)
```

**Files to modify:**
```
src/lib/data/recurring-expenses.ts                        ← Add deleteRecurringExpense()
src/lib/components/recurring/RecurringExpenseForm.svelte  ← Add delete button
src/lib/components/recurring/RecurringExpenseCard.svelte  ← Add delete icon
src/routes/fixed-expenses/+page.svelte                    ← Handle deletion
```

### Database Query

**Delete recurring expense:**
```sql
DELETE FROM recurring_expenses
WHERE id = $1 AND user_id = auth.uid()
```

### Color & Styling Reference

- Delete button text: `text-terracotta`
- Delete button hover: `hover:bg-terracotta/10`
- Confirmation dialog confirm button: `bg-terracotta hover:bg-terracotta-dark text-white`
- Cancel button: `bg-stone-200 hover:bg-stone-300 text-coffee-900`
- Success toast: Sage color
- Error toast: Terracotta color

### Edge Cases to Handle

- User cancels deletion → no changes, modal closes
- Network error during deletion → show error toast, keep expense
- Deletion successful → expense disappears, total recalculates
- Delete button in form only shown in edit mode (not create mode)
- Prevent accidental card click when clicking delete icon

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.4]
- [Source: src/lib/data/goals.ts#deleteGoal] - Delete function pattern
- [Source: src/routes/patrimoine/+page.svelte] - Confirmation dialog pattern
- [Source: src/lib/components/goals/GoalCard.svelte] - Delete button pattern

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
