# Story 8.1: Inline Table Container & Custom Dropdown

Status: done

## Story

As a user,
I want my expense list displayed as a structured table with designed dropdowns,
So that the foundation is set for inline transaction management.

## Acceptance Criteria

1. **Given** I navigate to `/expenses` **When** the page loads **Then** I see a table with column headers: Date, Montant, Categorie, Compte, Description **And** existing transactions display in table rows with proper column alignment **And** column widths follow the spec: Date 120px, Amount 100px, Category 150px, Account 130px, Description flex, Actions 80px **And** row height is 48-52px with Sand (`#E2DCD2`) bottom borders **And** categories show as badges with colored dots

2. **Given** I have existing category and date filters **When** I use them **Then** they continue to work exactly as before (FR36-FR37)

3. **Given** I have more transactions than fit on screen **When** I scroll or paginate **Then** pagination works exactly as before (FR38) **And** transaction count and total spent summary remain visible (FR39)

4. **Given** I interact with an InlineDropdown component **When** I click or press Enter/Space on a focused dropdown **Then** a styled dropdown menu opens below the field with 100ms fade-in **And** I can navigate items with Arrow Up/Down keys **And** Enter selects the highlighted item and closes the dropdown **And** Escape closes without selecting **And** typing a character jumps to a matching item **And** the dropdown uses Sage accents and Oat hover highlights

## Tasks / Subtasks

- [x] Task 1: Refactor expenses page layout from list to table structure (AC: #1, #2, #3)
  - [x] 1.1 Replace current flex-based list layout in `/src/routes/expenses/+page.svelte` with a `role="grid"` table container
  - [x] 1.2 Add column header row: Date (120px), Montant (100px), Categorie (150px), Compte (130px), Description (flex), Actions (80px)
  - [x] 1.3 Preserve existing filter section (category select, date range presets, custom month/year pickers) — no filter logic changes
  - [x] 1.4 Preserve existing pagination ("Afficher plus" button, page incrementing, hasMore logic)
  - [x] 1.5 Preserve summary card showing transaction count and total amount
  - [x] 1.6 Preserve `h-[calc(100vh-136px)]` viewport height and custom scrollbar styling
  - [x] 1.7 Ensure empty state messaging still works when no transactions match filters

- [x] Task 2: Refactor ExpenseListItem to render as table row (AC: #1)
  - [x] 2.1 Convert `ExpenseListItem.svelte` from flex button layout to table row with column cells matching header widths
  - [x] 2.2 Date cell: French-formatted date (existing `formatDate()` logic), Stone-500 color, 14px
  - [x] 2.3 Amount cell: terracotta color, 14px medium weight, formatted with `formatCurrency()`
  - [x] 2.4 Category cell: badge with colored dot (inline circle using category.color) + category name text
  - [x] 2.5 Account cell: account name text (new — currently not displayed, needs account data joined)
  - [x] 2.6 Description cell: truncated text with `min-w-0` overflow handling
  - [x] 2.7 Actions cell: empty for now (will be used in stories 8-2, 9-1)
  - [x] 2.8 Row height 48-52px, Sand (`#E2DCD2`) bottom border, Cotton (`#FDFBF8`) background
  - [x] 2.9 Apply `role="row"` on each row, `role="gridcell"` on each cell (UX8)
  - [x] 2.10 Sort order: chronological by date DESC, within same date by created_at DESC (UX13 — already implemented in data layer)

- [x] Task 3: Create InlineDropdown component (AC: #4)
  - [x] 3.1 Create `/src/lib/components/expense/inline-dropdown.svelte`
  - [x] 3.2 Props: `items: Array<{id, name, color?}>`, `selected: string | null`, `placeholder: string`, `onSelect: (item) => void`, `error: boolean`
  - [x] 3.3 Closed state: display selected item name (or placeholder in Stone-500), chevron icon
  - [x] 3.4 Focused state: Sage focus ring (`ring-2 ring-[#639A88]/30`) (UX9)
  - [x] 3.5 Open state: dropdown menu below the trigger, 100ms fade-in animation, white bg with warm shadow (`rgba(45,37,32, 0.08)`)
  - [x] 3.6 Items: Oat (`#F5F1EA`) hover highlight, Sage accent on selected item
  - [x] 3.7 For category items: show colored dot before name (matching category.color)
  - [x] 3.8 Keyboard: Enter/Space opens, Arrow Up/Down navigates, Enter selects + closes, Escape closes without selecting
  - [x] 3.9 Type-ahead: typing a character jumps to first matching item
  - [x] 3.10 Error state: Terracotta (`#C07D5A`) border when `error=true`
  - [x] 3.11 ARIA: `role="listbox"` on menu, `role="option"` on items, `aria-expanded` on trigger, `aria-activedescendant` for keyboard nav (UX8)
  - [x] 3.12 Position: anchored below trigger, stays within viewport (flip if near bottom)
  - [x] 3.13 Click outside closes dropdown

- [x] Task 4: Integrate account data into expense list (AC: #1)
  - [x] 4.1 Update `getExpenses()` query in `src/lib/data/expenses.ts` to join account name (similar to existing category join)
  - [x] 4.2 Update `ExpenseWithCategory` type to include account info: `account: { id: string; name: string } | null`
  - [x] 4.3 Display account name in the Account column cell

- [x] Task 5: Visual polish and consistency (AC: #1)
  - [x] 5.1 Column headers: 12px Medium (500) weight, Stone-500 color, uppercase or sentence case matching app convention
  - [x] 5.2 Row data: 14px Regular (400), Coffee-900 (`#2D2520`) text color
  - [x] 5.3 Amount: 14px Medium (500) weight, Terracotta (`#C07D5A`)
  - [x] 5.4 Verify font is Inter Variable (inherited from app.css)
  - [x] 5.5 Ensure no visual regression on existing filter/pagination/summary sections

## Dev Notes

### Architecture Compliance

- **Data layer boundary (AR1, AR2):** All Supabase queries go through `src/lib/data/expenses.ts`. Components NEVER import Supabase client directly. The `getExpenses()` function already handles filtering, pagination, and category joins. Only modification needed: add account join.
- **State management (AR3):** Use Svelte 5 Runes (`$state`, `$derived`). The current expenses page already uses `$state` for expenses, categories, loading, pagination, and filters. No stores needed — local component state is sufficient.
- **Error handling (AR4):** Toast for async errors, inline for form validation. Existing `toast.error()` from `$lib/stores/toast` is the pattern.
- **Naming (AR5):** Files = kebab-case (`inline-dropdown.svelte`), components = PascalCase in usage, functions = camelCase.
- **Validation (AR6):** Zod schemas in `src/lib/schemas/expense.ts` — not directly used in this story (no form submission), but the InlineDropdown component should be designed to work with validation error states for future stories.
- **Component organization (AR7):** New components go in `src/lib/components/expense/` feature folder.

### Technical Requirements

**Data layer modification — `getExpenses()` account join:**

Current query in `src/lib/data/expenses.ts` (line ~80):
```
.select('*, budget_categories(id, name, color)')
```
Needs to become:
```
.select('*, budget_categories(id, name, color), accounts(id, name)')
```

The `account_id` column already exists on the `expenses` table (nullable FK to `accounts`). Supabase will automatically resolve the join.

**Type update — `ExpenseWithCategory`:**

Current type in `src/lib/types/database.ts`:
```typescript
type ExpenseWithCategory = Expense & {
  budget_categories: { id: string; name: string; color: string } | null;
};
```
Needs to add:
```typescript
type ExpenseWithCategory = Expense & {
  budget_categories: { id: string; name: string; color: string } | null;
  accounts: { id: string; name: string } | null;
};
```

**InlineDropdown — Positioning strategy:**

Use CSS `position: absolute` relative to a `position: relative` wrapper. For viewport-aware flipping, check `getBoundingClientRect()` on open and add a `dropUp` class if near viewport bottom. Keep it simple — no floating-ui dependency needed.

**Table structure — CSS Grid vs HTML table:**

Use CSS grid (not `<table>`) for the table layout. This gives more flexibility for the upcoming add-row and edit-row components (stories 8-2, 9-1) which need custom cell rendering. Define a grid template:
```css
grid-template-columns: 120px 100px 150px 130px 1fr 80px;
```

Apply on a container div with `role="grid"`, and each row as a div with `role="row"`.

### Library & Framework Requirements

- **Svelte 5 Runes:** Use `$state`, `$derived`, `$effect` — NO legacy `$:` reactive declarations, NO `writable()` stores for component state
- **Tailwind CSS:** All styling via utility classes. Custom colors already defined in `app.css`: sage, terracotta, coffee-900, stone-500, cotton, oat, sand
- **DaisyUI:** Use for button styles (`btn`), loading spinners only. NO DaisyUI `<select>` or `<table>` components — custom implementations required per UX spec
- **No new dependencies:** This story requires zero new npm packages

### File Structure Requirements

**Files to CREATE:**
- `/src/lib/components/expense/inline-dropdown.svelte` — Reusable custom dropdown component

**Files to MODIFY:**
- `/src/routes/expenses/+page.svelte` — Replace list layout with grid table, keep all filter/pagination/summary logic
- `/src/lib/components/expense/ExpenseListItem.svelte` — Convert to table row with column cells
- `/src/lib/data/expenses.ts` — Add account join to `getExpenses()` select query
- `/src/lib/types/database.ts` — Update `ExpenseWithCategory` to include account data

**Files to NOT touch:**
- `/src/lib/components/expense/AddExpenseModal.svelte` — Still needed until story 8-2 replaces it
- `/src/lib/components/expense/EditExpenseModal.svelte` — Still needed until story 9-1 replaces it
- `/src/lib/schemas/expense.ts` — No validation changes
- `/src/lib/stores/toast.ts` — No changes
- `/src/lib/stores/refresh.ts` — No changes

### Testing Requirements

- Verify table renders with correct column widths and alignment
- Verify all existing transactions display correctly in row format
- Verify category filter still works (select category → list updates)
- Verify date range filter presets still work
- Verify custom month/year date pickers still work
- Verify "Afficher plus" pagination loads next page
- Verify transaction count and total amount summary is correct
- Verify empty state message displays when no transactions
- Verify InlineDropdown opens on click and Enter/Space
- Verify InlineDropdown keyboard navigation (Arrow keys, Enter, Escape)
- Verify InlineDropdown type-ahead jumps to matching item
- Verify InlineDropdown closes on outside click
- Verify account names display in the Account column
- Verify category badges show colored dots
- Verify row height is 48-52px with Sand bottom borders
- Verify column headers are visible with correct typography

### Project Structure Notes

- Alignment with project structure: new component in `src/lib/components/expense/` per architecture's feature folder convention
- File naming follows kebab-case convention: `inline-dropdown.svelte`
- The InlineDropdown component is placed in `expense/` rather than `ui/` because it has expense-specific features (category colored dots) and will be reused across stories 8-2, 9-1 within the expense feature only
- CSS grid approach for table ensures compatibility with upcoming inline-add-row (story 8-2) and inline-edit-row (story 9-1) without refactoring

### References

- [Source: _bmad-output/planning-artifacts/epics-inline-transactions.md#Story 1.1]
- [Source: _bmad-output/planning-artifacts/prd-inline-transactions.md#Functional Requirements - FR1, FR3, FR4, FR36-FR39]
- [Source: _bmad-output/planning-artifacts/ux-design-inline-transactions.md#Field Order & Layout]
- [Source: _bmad-output/planning-artifacts/ux-design-inline-transactions.md#Custom Dropdown Specification]
- [Source: _bmad-output/planning-artifacts/ux-design-inline-transactions.md#Visual Design Foundation]
- [Source: _bmad-output/planning-artifacts/ux-design-inline-transactions.md#Accessibility Compliance]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: src/routes/expenses/+page.svelte — current expenses page with filters, pagination, summary]
- [Source: src/lib/components/expense/ExpenseListItem.svelte — current list item to refactor]
- [Source: src/lib/data/expenses.ts — getExpenses() query to modify for account join]
- [Source: src/lib/types/database.ts — ExpenseWithCategory type to extend]
- [Source: src/app.css — custom color definitions: sage, terracotta, cotton, oat, sand, coffee-900, stone-500]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- svelte-check: 0 errors, 47 warnings (all pre-existing)
- npm run build: successful

### Completion Notes List

- Refactored expenses page from card-based list to CSS grid table with `role="grid"` and column headers (Date, Montant, Categorie, Compte, Description, Actions)
- Grid template: `grid-cols-[120px_100px_150px_130px_1fr_80px]` applied consistently on header and each row
- Refactored ExpenseListItem from flex button layout to grid row with `role="row"` and `role="gridcell"` cells
- Row height 48px with Sand bottom borders, Cotton background, Oat hover highlight with 150ms transition
- Category cell shows colored dot (2.5x2.5 rounded-full) + name text
- Account column now displays account name by joining accounts table in Supabase query
- Added missing `expenses_account_id_fkey` FK relationship to database types to enable account join
- Created InlineDropdown component with full keyboard support (Enter/Space open, Arrow nav, Escape close, type-ahead)
- InlineDropdown features: 100ms fade-in animation, viewport-aware positioning (drop-up near bottom), click-outside-to-close, Sage focus ring, Oat hover, Terracotta error state, ARIA listbox/option roles
- All existing filter logic (category, date range, custom month pickers) preserved unchanged
- Pagination ("Charger plus" button) preserved unchanged
- Summary card (transaction count + total) preserved unchanged
- Empty state messaging preserved unchanged
- No new npm dependencies added

### File List

- `src/routes/expenses/+page.svelte` (modified) — Replaced list layout with CSS grid table, added column headers
- `src/lib/components/expense/ExpenseListItem.svelte` (modified) — Converted to grid row with column cells
- `src/lib/components/expense/inline-dropdown.svelte` (created) — Custom dropdown with keyboard nav, ARIA, positioning
- `src/lib/data/expenses.ts` (modified) — Added account join to getExpenses() query
- `src/lib/types/database.ts` (modified) — Added account to ExpenseWithCategory type, added expenses_account_id_fkey relationship
