# Story 8.2: Inline Add Row — Complete Transaction Entry Flow

Status: done

## Story

As a user,
I want to add transactions by typing directly into a persistent form row at the top of the table and pressing Enter,
So that I can log expenses quickly without any popup or context loss.

## Acceptance Criteria

1. **Given** I am on the `/expenses` page **When** the page loads **Then** I see a persistent add row at the top of the table **And** the add row has Linen background (`#FAF7F2`) with a subtle Sage bottom border **And** date field shows today's date (pre-filled) **And** amount field has placeholder "0,00 €" **And** category shows "Categorie..." **And** account shows "Courant" (pre-selected default) **And** description shows "Description (optionnel)" **And** the add row is visually distinct from data rows (FR32) **And** the amount field receives auto-focus (FR9)

2. **Given** I am in the add row **When** I press Tab **Then** focus moves to the next field in order: Date -> Amount -> Category -> Account -> Description (FR19) **And** Shift+Tab moves to the previous field (FR19) **And** each focused field shows a Sage focus ring (`ring-2 ring-[#639A88]/30`) (UX9)

3. **Given** I fill in amount "12" and select category "Resto" **When** I press Enter from any field (FR7, FR20) **Then** the transaction appears instantly in the list at its chronological position (FR22, NFR1 <50ms) **And** the new row shows a Sage 8% background fade that transitions to transparent over 400ms (FR35, UX5) **And** the add row resets to empty state (FR8, NFR3 <50ms) **And** the amount field receives auto-focus (FR9) **And** the DB save happens in background (NFR4 <500ms) **And** the dashboard refresh is triggered on success (FR27)

4. **Given** I press Enter with the category field empty **When** validation runs (FR28) **Then** the category field gets a Terracotta border (`#C07D5A`) with "Categorie requise" text below (FR29, UX10) **And** focus moves to the category field (FR30) **And** all other entered data is preserved (FR31) **And** the error styling clears as soon as I interact with the invalid field

5. **Given** the DB save fails after optimistic insert **When** the error response returns **Then** the optimistic row is removed from the list (FR24, NFR5 <200ms) **And** the add row is re-populated with the failed data (FR25) **And** an error toast appears using the existing app toast pattern (FR26)

6. **Given** I press Escape in the add row **When** the form has data **Then** all fields reset to their defaults (FR21)

## Tasks / Subtasks

- [x] Task 1: Create InlineAddRow component (AC: #1, #2)
  - [x]1.1 Create `/src/lib/components/expense/inline-add-row.svelte`
  - [x]1.2 Use same grid template as data rows: `grid-cols-[120px_100px_150px_130px_1fr_80px]`
  - [x]1.3 Date cell: HTML date input, pre-filled with today's date (`YYYY-MM-DD`), compact styling matching row height
  - [x]1.4 Amount cell: number input, step 0.01, min 0.01, placeholder "0,00 €", auto-focus on mount
  - [x]1.5 Category cell: use `InlineDropdown` component from story 8-1, placeholder "Categorie..."
  - [x]1.6 Account cell: use `InlineDropdown` component, pre-select checking account (or first account)
  - [x]1.7 Description cell: text input, placeholder "Description (optionnel)", maxlength 200
  - [x]1.8 Actions cell: subtle submit button (checkmark icon in Sage)
  - [x]1.9 Linen (`#FAF7F2`) background with subtle Sage bottom border, 48px row height
  - [x]1.10 Props: `categories`, `accounts`, `onSubmit(data)`, `disabled`
  - [x]1.11 Internal state with `$state`: date, amount, categoryId, accountId, description, errors
  - [x]1.12 Auto-focus amount field on mount and after form reset using `$effect`

- [x] Task 2: Implement keyboard navigation and submission (AC: #2, #3, #6)
  - [x]2.1 Tab order: Date -> Amount -> Category -> Account -> Description (natural tab flow via DOM order)
  - [x]2.2 Shift+Tab: reverse navigation (native browser behavior)
  - [x]2.3 Enter from any field: trigger form validation + submission
  - [x]2.4 Escape from any field: reset all fields to defaults (date=today, amount='', category=null, account=default, description='')
  - [x]2.5 Sage focus ring (`ring-2 ring-[#639A88]/30`) on all focused fields (UX9)

- [x] Task 3: Implement inline validation (AC: #4)
  - [x]3.1 Use existing `validateExpense()` from `$lib/schemas/expense` (Zod schema)
  - [x]3.2 Validate on Enter: amount required & positive, category required, date required
  - [x]3.3 Terracotta (`#C07D5A`) border on invalid fields with compact error text below
  - [x]3.4 Focus redirect to first invalid field on validation failure (FR30)
  - [x]3.5 Preserve all entered data on validation failure (FR31)
  - [x]3.6 Clear error styling on field interaction (input/change event)
  - [x]3.7 `aria-invalid="true"` + `aria-describedby` on error fields (UX8)

- [x] Task 4: Implement optimistic insert and save flow (AC: #3, #5)
  - [x]4.1 On valid submission: call `onSubmit(data)` callback to parent page
  - [x]4.2 Parent page (`+page.svelte`): immediately insert new expense into local `expenses` array at correct chronological position (sorted by date DESC, then created_at DESC)
  - [x]4.3 Generate temporary ID for optimistic row (e.g., `temp-${Date.now()}`)
  - [x]4.4 Apply Sage 8% background fade on the new row (`rgba(99,154,136, 0.08)` -> transparent over 400ms)
  - [x]4.5 Reset add row to empty state immediately after optimistic insert
  - [x]4.6 Auto-focus amount field after reset
  - [x]4.7 Call `createExpense()` from `$lib/data/expenses` in background
  - [x]4.8 On success: replace temp ID with real ID from DB, trigger `dashboardRefresh.trigger()`
  - [x]4.9 On failure: remove optimistic row from list, re-populate add row with failed data, show error toast via `toast.error()`
  - [x]4.10 `aria-live="polite"` region for "Transaction ajoutee" announcement (UX8)

- [x] Task 5: Integrate into expenses page (AC: #1, #3)
  - [x]5.1 Import and render `InlineAddRow` between column headers and transaction rows in the grid
  - [x]5.2 Load accounts on mount (add `getAccounts()` call alongside existing `getCategories()`)
  - [x]5.3 Pass categories, accounts, and onSubmit handler to InlineAddRow
  - [x]5.4 Remove the "Ajouter" button from the page header (no longer needed)
  - [x]5.5 Remove `AddExpenseModal` import and component from the page
  - [x]5.6 Delete `/src/lib/components/expense/AddExpenseModal.svelte` file
  - [x]5.7 Add `confirmingId` state for Sage fade animation on newly added rows
  - [x]5.8 Pass `confirmState` prop to ExpenseListItem for fade animation

- [x] Task 6: Add save confirmation animation to ExpenseListItem (AC: #3)
  - [x]6.1 Add `confirmState` prop to ExpenseListItem: `'idle' | 'confirmed'`
  - [x]6.2 When `confirmState === 'confirmed'`: apply Sage 8% background that fades to Cotton over 400ms
  - [x]6.3 Use CSS animation (`@keyframes sage-fade`) for the 400ms ease-out transition
  - [x]6.4 Reset confirmState to 'idle' after animation completes

## Dev Notes

### Architecture Compliance

- **Data layer (AR1, AR2):** Uses existing `createExpense()` from `src/lib/data/expenses.ts` — no direct Supabase imports in components.
- **State management (AR3):** Svelte 5 Runes (`$state`, `$derived`, `$effect`). InlineAddRow manages its own form state. Parent page manages `expenses` array for optimistic updates.
- **Error handling (AR4):** Toast for DB errors (`toast.error()`), inline Terracotta errors for validation.
- **Naming (AR5):** `inline-add-row.svelte` (kebab-case file), `InlineAddRow` (PascalCase usage).
- **Validation (AR6):** Uses existing `validateExpense()` from `src/lib/schemas/expense.ts` — same Zod schema as current AddExpenseModal.
- **Component organization (AR7):** New component in `src/lib/components/expense/` feature folder.

### Technical Requirements

**Optimistic insert pattern:**
```
User presses Enter -> validate -> onSubmit(data) to parent
Parent: push temp expense to expenses[] at sorted position
Parent: reset add row
Parent: call createExpense() async
  On success: replace temp ID, dashboardRefresh.trigger()
  On failure: remove temp, re-populate add row, toast.error()
```

**Chronological insertion:**
New expenses should be inserted at the correct position based on date. Since the list is sorted date DESC, created_at DESC:
- Same date as today: insert at index 0 (top of list, after add row)
- Backdated: find correct index by comparing dates

**Account auto-selection logic (from current AddExpenseModal):**
```typescript
const checkingAccount = accounts.find(a => a.account_type === 'checking');
if (checkingAccount) accountId = checkingAccount.id;
else if (accounts.length > 0) accountId = accounts[0].id;
```

**Form reset after submission:**
```typescript
function resetForm() {
  date = new Date().toISOString().split('T')[0];
  amount = '';
  categoryId = '';
  // accountId stays as default (don't reset)
  description = '';
  errors = {};
  // auto-focus amount field
  amountInput?.focus();
}
```

**Sage fade animation CSS:**
```css
@keyframes sage-fade {
  from { background-color: rgba(99,154,136, 0.08); }
  to { background-color: transparent; }
}
```

### Library & Framework Requirements

- **Svelte 5 Runes:** `$state`, `$derived`, `$effect` — NO legacy patterns
- **No new dependencies:** Uses existing InlineDropdown from story 8-1, existing data layer, existing validation
- **Existing imports needed:** `createExpense`, `getAccounts`, `getCategories`, `validateExpense`, `toast`, `dashboardRefresh`, `formatCurrency`

### File Structure Requirements

**Files to CREATE:**
- `/src/lib/components/expense/inline-add-row.svelte` — Persistent inline form row

**Files to MODIFY:**
- `/src/routes/expenses/+page.svelte` — Add InlineAddRow, remove AddExpenseModal, add optimistic insert logic, load accounts
- `/src/lib/components/expense/ExpenseListItem.svelte` — Add `confirmState` prop for Sage fade animation

**Files to DELETE:**
- `/src/lib/components/expense/AddExpenseModal.svelte` — Replaced by inline add row

### Previous Story Intelligence (8-1)

- CSS grid template `grid-cols-[120px_100px_150px_130px_1fr_80px]` established — InlineAddRow MUST use the same template
- InlineDropdown component created at `src/lib/components/expense/inline-dropdown.svelte` — reuse for category and account fields
- ExpenseListItem already uses `role="row"` and `role="gridcell"` — maintain ARIA consistency
- Account join added to `getExpenses()` — accounts data is now available in expense rows
- Type `ExpenseWithCategory` includes `account?: { id: string; name: string } | null`

### References

- [Source: _bmad-output/planning-artifacts/epics-inline-transactions.md#Story 1.2]
- [Source: _bmad-output/planning-artifacts/prd-inline-transactions.md#FR1-FR9, FR19-FR22, FR25-FR31]
- [Source: _bmad-output/planning-artifacts/ux-design-inline-transactions.md#InlineAddRow Component]
- [Source: _bmad-output/planning-artifacts/ux-design-inline-transactions.md#Save Confirmation Pattern]
- [Source: _bmad-output/planning-artifacts/ux-design-inline-transactions.md#Form Patterns]
- [Source: src/lib/components/expense/AddExpenseModal.svelte — validation logic, account selection, category spending to reference]
- [Source: src/lib/components/expense/inline-dropdown.svelte — reusable dropdown from story 8-1]
- [Source: src/lib/data/expenses.ts — createExpense() function signature]
- [Source: src/lib/schemas/expense.ts — validateExpense() and Zod schema]
- [Source: src/lib/stores/toast.ts — toast.error(), toast.success()]
- [Source: src/lib/stores/refresh.ts — dashboardRefresh.trigger()]
- [Source: src/lib/data/accounts.ts — getAccounts() for account list]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- svelte-check: 0 errors, 47 warnings (all pre-existing)
- npm run build: successful

### Completion Notes List

- Created InlineAddRow component with persistent form row: date input (pre-filled today), amount input (auto-focus), category InlineDropdown, account InlineDropdown (pre-selects checking), description input, checkmark submit button
- Linen (#FAF7F2) background with Sage/20 bottom border, 48px min-height, matching grid-cols-[120px_100px_150px_130px_1fr_80px]
- Keyboard: Enter from any input submits, Enter from dropdown trigger submits when closed (via onEnterClosed prop), Escape resets form, Tab/Shift+Tab natural flow
- Enhanced InlineDropdown: added onEnterClosed prop, fixed Enter to select highlighted item when open (was just toggling), Escape stopPropagation when open to prevent form reset
- Inline validation using existing validateExpense() Zod schema: Terracotta ring on invalid fields, compact error text below, focus redirect to first invalid field, errors clear on interaction
- Optimistic insert: generates temp ID, inserts at correct chronological position (date DESC), Sage 8% fade animation (400ms), resets add row, saves to DB in background
- On DB failure: removes optimistic row, re-populates add row with failed data via repopulateData prop, shows error toast
- On success: replaces temp ID with real DB ID, triggers dashboardRefresh
- Added confirmState prop to ExpenseListItem with sage-fade CSS animation (400ms ease-out from rgba(99,154,136,0.08) to Cotton)
- Removed "Ajouter" button from expenses page header, removed AddExpenseModal import/usage from expenses page
- AddExpenseModal.svelte NOT deleted — still used in Header.svelte for dashboard quick-add
- Accounts loaded in parallel with categories on mount via Promise.all
- Added aria-live="polite" region for "Transaction ajoutee" screen reader announcement
- Grid with headers + inline add row now visible immediately (not hidden behind empty state)

### File List

- `src/lib/components/expense/inline-add-row.svelte` (created) — Persistent inline form row with validation, keyboard nav, auto-focus
- `src/lib/components/expense/inline-dropdown.svelte` (modified) — Added onEnterClosed prop, fixed Enter to select when open, Escape stopPropagation when open
- `src/lib/components/expense/ExpenseListItem.svelte` (modified) — Added confirmState prop with sage-fade CSS animation
- `src/routes/expenses/+page.svelte` (modified) — Integrated InlineAddRow, removed AddExpenseModal, added optimistic insert logic, loads accounts, aria-live region
