# Story 7.3: Edit Fixed Expense

Status: backlog

## Story

As a user,
I want to edit a fixed expense,
So that I can update amounts or dates when they change.

## Acceptance Criteria

1. **Given** I am viewing my fixed expenses list, **When** I click on an expense card, **Then** an edit modal opens with pre-filled data

2. **Given** I am editing an expense, **When** I change the amount from 15€ to 17€ and click "Enregistrer", **Then** the expense is updated, the monthly total recalculates, and a success toast appears

3. **Given** I change the day from 5 to 10, **When** I save, **Then** the expense appears in the correct sorted position

4. **Given** I change the category, **When** I save, **Then** the category badge updates and category breakdowns reflect the change

5. **Given** I leave required fields empty, **When** I try to save, **Then** I see validation errors

## Tasks / Subtasks

- [ ] **Task 1: Implement updateRecurringExpense data function** (AC: 2, 3, 4)
  - [ ] In `src/lib/data/recurring-expenses.ts`, implement `updateRecurringExpense(id, data)`
  - [ ] Validate input with Zod schema
  - [ ] Update query: `UPDATE recurring_expenses SET ... WHERE id = ? AND user_id = auth.uid()`
  - [ ] Return `{ data, error }` format
  - [ ] Follow pattern from `updateGoal()` in `goals.ts`

- [ ] **Task 2: Update RecurringExpenseForm for edit mode** (AC: 1, 2, 5)
  - [ ] In `RecurringExpenseForm.svelte`, add `expense` prop for edit mode
  - [ ] If `expense` provided, pre-fill form fields with current values
  - [ ] Change button text: "Ajouter" → "Enregistrer" in edit mode
  - [ ] Change form title: "Nouvel engagement" → "Modifier l'engagement"
  - [ ] On submit, call `updateRecurringExpense()` instead of `createRecurringExpense()`
  - [ ] Show validation errors for empty required fields

- [ ] **Task 3: Add edit functionality to RecurringExpenseCard** (AC: 1)
  - [ ] In `RecurringExpenseCard.svelte`, make entire card clickable OR add edit button
  - [ ] On click, emit event to parent with expense data
  - [ ] Parent opens modal with expense passed to form
  - [ ] Follow pattern from `GoalCard.svelte` edit interaction

- [ ] **Task 4: Update Fixed Expenses page with edit modal** (AC: 1, 2)
  - [ ] In `src/routes/fixed-expenses/+page.svelte`:
    - Add modal state for editing
    - Add selected expense state
    - Handle edit event from RecurringExpenseCard
    - Open modal with RecurringExpenseForm in edit mode
    - Reload data after successful update
  - [ ] Follow modal pattern from `/epargne` page

- [ ] **Task 5: Ensure list re-sorts after day change** (AC: 3)
  - [ ] After update, reload expenses list
  - [ ] Query already sorts by day_of_month ASC
  - [ ] Verify card appears in correct position
  - [ ] Consider: optimistic UI update before reload

- [ ] **Task 6: Update monthly total and category breakdown** (AC: 2, 4)
  - [ ] After successful update, recalculate monthly total
  - [ ] If category changed, update category breakdown display
  - [ ] Use reactive `$derived` rune for automatic recalculation
  - [ ] Toast notification confirms update

## Dev Notes

### Architecture Compliance

- Follow data layer pattern: all updates in `src/lib/data/recurring-expenses.ts`
- Return `{ data, error }` from all functions
- Use Zod validation for all inputs
- Use Svelte 5 runes (`$state`, `$derived`) for reactivity
- Optimistic UI updates where appropriate

### Existing Patterns to Follow

**Update Function Pattern** (from `goals.ts`):
```typescript
export async function updateRecurringExpense(id: string, data: Partial<RecurringExpenseInput>) {
  try {
    const validated = recurringExpenseSchema.partial().parse(data);
    const { data: expense, error } = await supabase
      .from('recurring_expenses')
      .update({
        ...validated,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single();

    if (error) throw error;
    return { data: expense, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
```

**Edit Modal Pattern** (from `/epargne`):
```typescript
let editingExpense = $state<RecurringExpense | null>(null);
let showEditModal = $state(false);

function handleEdit(expense: RecurringExpense) {
  editingExpense = expense;
  showEditModal = true;
}

async function handleEditSuccess() {
  showEditModal = false;
  editingExpense = null;
  await loadData(); // Reload expenses
  toast.success('Engagement modifié avec succès');
}
```

**Form Pre-fill Pattern** (from `GoalForm.svelte`):
```svelte
<script>
  let { expense = null, onSuccess } = $props();

  let formData = $state(
    expense
      ? {
          name: expense.name,
          amount: expense.amount,
          day_of_month: expense.day_of_month,
          category_id: expense.category_id
        }
      : {
          name: '',
          amount: 0,
          day_of_month: 1,
          category_id: null
        }
  );

  const isEditMode = !!expense;
</script>
```

### Project Structure Notes

**Files to modify:**
```
src/lib/data/recurring-expenses.ts                        ← Add updateRecurringExpense()
src/lib/components/recurring/RecurringExpenseForm.svelte  ← Add edit mode
src/lib/components/recurring/RecurringExpenseCard.svelte  ← Add click handler
src/routes/fixed-expenses/+page.svelte                    ← Add edit modal
```

### Database Query

**Update recurring expense:**
```sql
UPDATE recurring_expenses
SET
  name = $1,
  amount = $2,
  day_of_month = $3,
  category_id = $4,
  updated_at = now()
WHERE id = $5 AND user_id = auth.uid()
RETURNING *
```

### Color & Styling Reference

- Edit button hover: `hover:bg-sage/10`
- Modal backdrop: `bg-black/50`
- Save button: `bg-sage hover:bg-sage-dark text-white`
- Cancel button: `bg-stone-200 hover:bg-stone-300 text-coffee-900`

### Edge Cases to Handle

- Changing day_of_month requires re-sort of list
- Changing category_id requires recalculation of category breakdown
- Changing amount requires recalculation of monthly total
- Empty name or zero amount should show validation errors
- Network errors during update should show user-friendly message

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.3]
- [Source: src/lib/data/goals.ts#updateGoal] - Update function pattern
- [Source: src/lib/components/goals/GoalForm.svelte] - Edit mode pattern
- [Source: src/routes/epargne/+page.svelte] - Edit modal pattern

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
