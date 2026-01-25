# Story 7.6: Modification du type d'une catégorie existante

Status: done

## Story

As a user,
I want to change the type of an existing category,
So that I can reorganize my budget if my situation changes.

## Acceptance Criteria

1. **Given** I am editing a category, **When** I view the edit form, **Then** I see the current type selected and I can change it

2. **Given** I change a category from "variable" to "fixed", **When** I save, **Then** it moves to the fixed section and displays as a list item on the dashboard

3. **Given** I change a category from "fixed" to "variable", **When** I save, **Then** it moves to the variable section and displays as a circular gauge on the dashboard

4. **Given** I change the type of a category with existing expenses, **When** I save, **Then** all existing expenses remain associated and historical data is preserved

## Tasks / Subtasks

- [ ] **Task 1: Update CategoryForm for edit mode** (AC: 1)
  - [ ] Edit `src/lib/components/forms/CategoryForm.svelte`
  - [ ] When in edit mode, pre-select current type
  - [ ] Allow type to be changed via radio buttons
  - [ ] Show helper text for selected type

- [ ] **Task 2: Handle type update in data layer** (AC: 2, 3, 4)
  - [ ] Verify `updateCategory()` in `src/lib/data/categories.ts` handles type changes
  - [ ] Ensure SQL update includes type field
  - [ ] Test that expenses remain linked after type change

- [ ] **Task 3: Test UI transitions** (AC: 2, 3)
  - [ ] After saving, category appears in correct section on Budgets page
  - [ ] Dashboard updates to show category with correct display style
  - [ ] Toast confirms successful update

- [ ] **Task 4: Edge case handling** (AC: 4)
  - [ ] Verify expense history remains intact
  - [ ] Verify spending calculations remain correct
  - [ ] Verify gauge/list item shows correct spent amounts

## Dev Notes

### Form Behavior in Edit Mode

The CategoryForm component should:
1. Detect if editing (category prop is provided)
2. Pre-populate all fields including type
3. Allow all fields to be modified
4. Call `updateCategory()` instead of `createCategory()` on submit

### SQL Considerations

The type change is simply an UPDATE:
```sql
UPDATE budget_categories 
SET type = 'fixed', updated_at = now() 
WHERE id = $1 AND user_id = $2
```

No cascade effects - expenses reference category_id, not category type.

### Testing Scenarios

1. **Variable → Fixed with 0 expenses**: Should work cleanly
2. **Variable → Fixed with expenses**: Expenses should remain, spending should display correctly in list format
3. **Fixed → Variable**: Should now appear as gauge with correct percentage
4. **Rapid toggle**: Change type back and forth, verify no data loss

### Architecture Compliance

- Follow existing edit patterns from AccountForm, GoalForm
- Use same modal/form component for create and edit
- Maintain `{ data, error }` response pattern
- Reactive updates via Svelte 5 runes
