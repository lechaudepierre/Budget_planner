---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
status: 'complete'
completedAt: '2026-02-08'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd-inline-transactions.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-inline-transactions.md'
scope: 'targeted-feature'
parentPrd: '_bmad-output/planning-artifacts/prd-inline-transactions.md'
---

# Budget_planner - Inline Transaction UX — Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the Inline Transaction UX feature of Budget_planner, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Inline Transaction Entry (FR1-FR9):**

- FR1: User can add a new transaction directly from a persistent inline form row at the top of the transaction list
- FR2: User can enter transaction amount via an inline input field
- FR3: User can select a transaction category via an inline dropdown
- FR4: User can select a source account via an inline dropdown
- FR5: User can set the transaction date via an inline date picker (defaults to today)
- FR6: User can enter an optional description via an inline text field
- FR7: User can submit the inline form by pressing Enter
- FR8: System resets the inline add row to empty state after successful submission
- FR9: System auto-focuses the amount field after form reset for rapid consecutive entry

**Inline Transaction Editing (FR10-FR14):**

- FR10: User can enter edit mode on any existing transaction by clicking its row
- FR11: User can modify any field of a transaction in edit mode (amount, category, account, date, description)
- FR12: User can save edits by pressing Enter
- FR13: User can cancel edits by pressing Escape, reverting to original values
- FR14: System displays only one row in edit mode at a time (clicking another row cancels the current edit)

**Inline Transaction Deletion (FR15-FR18):**

- FR15: User can access a delete action from a transaction in edit mode
- FR16: System displays an inline confirmation before deleting a transaction
- FR17: User can confirm or cancel the deletion
- FR18: System removes the deleted transaction from the list with a visual transition

**Keyboard Navigation (FR19-FR21):**

- FR19: User can navigate between inline form fields using Tab (forward) and Shift+Tab (backward)
- FR20: User can submit a form with Enter in any field
- FR21: User can cancel an edit with Escape from any field

**Optimistic UI & Data Sync (FR22-FR27):**

- FR22: System inserts new transactions into the list immediately on submission (before DB confirmation)
- FR23: System updates edited transactions in the list immediately on save (before DB confirmation)
- FR24: System reverts a transaction to its previous state if the DB operation fails
- FR25: System re-populates the form with failed data so user can retry without re-typing
- FR26: System displays an error toast when a DB operation fails
- FR27: System triggers a dashboard refresh after successful transaction operations

**Inline Validation (FR28-FR31):**

- FR28: System validates all fields inline before submission (same rules as current: amount required & positive, category required, date required)
- FR29: System highlights invalid fields with error styling and a concise error message
- FR30: System redirects focus to the first invalid field on validation failure
- FR31: System preserves all entered data when validation fails (no data loss)

**Visual States & Feedback (FR32-FR35):**

- FR32: System visually distinguishes the add row from existing transaction rows
- FR33: System visually distinguishes a row in edit mode from rows in read mode
- FR34: System provides hover feedback on clickable transaction rows (cursor change, highlight)
- FR35: System provides visual confirmation when a transaction is saved (brief row highlight or animation)

**Existing Functionality Preservation (FR36-FR39):**

- FR36: User can filter transactions by category (unchanged)
- FR37: User can filter transactions by date range (unchanged)
- FR38: User can load more transactions via pagination (unchanged)
- FR39: System displays transaction count and total spent summary (unchanged)

### NonFunctional Requirements

**Performance (NFR1-NFR6):**

- NFR1: Optimistic insert appears in list < 50ms after Enter
- NFR2: Row transition to edit mode on click < 100ms
- NFR3: Form reset after successful submit < 50ms
- NFR4: DB save completes in background < 500ms
- NFR5: Rollback on DB failure < 200ms after failure detected
- NFR6: List re-render after add/edit/delete < 16ms (single frame at 60fps)

**Usability (NFR7-NFR10):**

- NFR7: Visual distinction between add row, read rows, and edit rows immediately obvious without instructions
- NFR8: Error states visible without scrolling — error shown on the field itself
- NFR9: Consistent with existing Budget_planner design language (same DaisyUI components, color palette, spacing)
- NFR10: Keyboard-only operation possible for add flow (Tab + Enter workflow completes full transaction entry)

### Additional Requirements

**From Architecture:**

- AR1: All data operations go through centralized data layer (`src/lib/data/expenses.ts`), returning `{ data, error }` shape
- AR2: Components never import Supabase client directly
- AR3: State management uses Svelte 5 Runes (`$state`, `$derived`)
- AR4: Error handling pattern: Toast (global) + Inline (forms)
- AR5: File naming: kebab-case for files, PascalCase for components, camelCase for functions
- AR6: Zod validation schemas used for runtime validation (existing `src/lib/schemas/expense.ts`)
- AR7: Component organization follows feature folders under `src/lib/components/`
- AR8: Optimistic UI updates pattern with local loading states per component

**From UX Design:**

- UX1: Custom Svelte dropdowns replacing native `<select>` for category and account fields (styled with DaisyUI menu base, Sage accents, arrow key navigation)
- UX2: Row height 48-52px, column widths: Date 120px, Amount 100px, Category 150px, Account 130px, Description flex, Actions 80px
- UX3: Add row identity: Linen background (`#FAF7F2`) with subtle Sage bottom border
- UX4: Edit mode: Cotton background (`#FDFBF8`), text to inputs with identical font/size/position (zero layout shift)
- UX5: Save confirmation: Sage 8% background fade (`rgba(99,154,136, 0.08)` to transparent) over 400ms ease-out
- UX6: Delete confirmation: inline popover anchored to row (not modal), row dims to opacity 0.4, fade-out 300ms on confirm
- UX7: Edit transition: 150ms ease. Hover: Oat background (`#F5F1EA`) 150ms ease. Dropdown open: 100ms fade-in
- UX8: Screen reader support: `role="grid"`, `aria-live` regions for save/edit/delete announcements, `aria-invalid` on error fields
- UX9: Focus ring: Sage `ring-2 ring-[#639A88]/30` on active fields
- UX10: Validation errors: Terracotta (`#C07D5A`) border + compact error text below field, clears on user interaction
- UX11: Category badges with colored dots for visual scanning in read mode
- UX12: Delete action intentionally mouse-only (no keyboard shortcut) — safety choice
- UX13: Sort order: chronological (newest at top), within same date newest entry first, cross-date insertion at correct position
- UX14: Quiet edit transition — text becomes inputs with same font, size, position; no border explosion, no height change

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Persistent inline add row at top of list |
| FR2 | Epic 1 | Amount input field |
| FR3 | Epic 1 | Category inline dropdown |
| FR4 | Epic 1 | Account inline dropdown |
| FR5 | Epic 1 | Date picker (defaults to today) |
| FR6 | Epic 1 | Description text field |
| FR7 | Epic 1 | Enter to submit |
| FR8 | Epic 1 | Form reset after success |
| FR9 | Epic 1 | Auto-focus amount after reset |
| FR10 | Epic 2 | Click row to enter edit mode |
| FR11 | Epic 2 | Modify any field in edit mode |
| FR12 | Epic 2 | Enter to save edits |
| FR13 | Epic 2 | Escape to cancel edits |
| FR14 | Epic 2 | Single row edit mode |
| FR15 | Epic 2 | Delete action in edit mode |
| FR16 | Epic 2 | Inline delete confirmation |
| FR17 | Epic 2 | Confirm or cancel deletion |
| FR18 | Epic 2 | Animated row removal |
| FR19 | Epic 1 | Tab/Shift+Tab navigation |
| FR20 | Epic 1+2 | Enter submits from any field |
| FR21 | Epic 1+2 | Escape cancels from any field |
| FR22 | Epic 1 | Optimistic insert |
| FR23 | Epic 2 | Optimistic update |
| FR24 | Epic 2 | Revert on DB failure |
| FR25 | Epic 1+2 | Re-populate form on failure |
| FR26 | Epic 1+2 | Error toast on DB failure |
| FR27 | Epic 1+2 | Dashboard refresh after success |
| FR28 | Epic 1 | Inline validation before submit |
| FR29 | Epic 1 | Error styling on invalid fields |
| FR30 | Epic 1 | Focus redirect to first invalid field |
| FR31 | Epic 1 | Preserve data on validation failure |
| FR32 | Epic 1 | Add row visual distinction |
| FR33 | Epic 2 | Edit mode visual distinction |
| FR34 | Epic 2 | Hover feedback on rows |
| FR35 | Epic 1+2 | Save confirmation animation |
| FR36 | Epic 1 | Category filter preserved |
| FR37 | Epic 1 | Date filter preserved |
| FR38 | Epic 1 | Pagination preserved |
| FR39 | Epic 1 | Transaction count/total preserved |

## Epic List

### Epic 1: Inline Transaction Entry
**Goal:** User can add transactions directly into the list via a persistent inline form row — no more popup modal.

This epic builds the new inline table structure and the primary add flow. After completion, users can add transactions with the Tab/Enter keyboard flow, see optimistic inserts with Sage fade confirmation, and enjoy auto-reset for rapid consecutive entry. Existing filter, pagination, and summary functionality is preserved.

**FRs covered:** FR1-FR9, FR19-FR21, FR22, FR25-FR27, FR28-FR31, FR32, FR35, FR36-FR39
**NFRs addressed:** NFR1, NFR3, NFR4, NFR6-NFR10

---

### Epic 2: Inline Edit & Delete
**Goal:** User can click any transaction to edit it in-place, or delete it with a quick inline confirmation — completing the modal-free transaction experience.

This epic transforms ExpenseListItem into a dual-mode component (read/edit), adds click-to-edit with the quiet transition pattern, and implements inline delete with popover confirmation. After completion, all transaction CRUD operates inline, both old modal components are removed, and the full keyboard-driven workflow is complete.

**FRs covered:** FR10-FR18, FR20-FR21 (edit context), FR23-FR27, FR33-FR35
**NFRs addressed:** NFR2, NFR4-NFR7

---

## Epic 1: Inline Transaction Entry

**Goal:** User can add transactions directly into the list via a persistent inline form row — no more popup modal.

### Story 1.1: Inline Table Container & Custom Dropdown

As a user,
I want my expense list displayed as a structured table with designed dropdowns,
So that the foundation is set for inline transaction management.

**Acceptance Criteria:**

**Given** I navigate to `/expenses`
**When** the page loads
**Then** I see a table with column headers: Date, Montant, Categorie, Compte, Description
**And** existing transactions display in table rows with proper column alignment
**And** column widths follow the spec: Date 120px, Amount 100px, Category 150px, Account 130px, Description flex, Actions 80px
**And** row height is 48-52px with Sand (`#E2DCD2`) bottom borders
**And** categories show as badges with colored dots

**Given** I have existing category and date filters
**When** I use them
**Then** they continue to work exactly as before (FR36-FR37)

**Given** I have more transactions than fit on screen
**When** I scroll or paginate
**Then** pagination works exactly as before (FR38)
**And** transaction count and total spent summary remain visible (FR39)

**Given** I interact with an InlineDropdown component
**When** I click or press Enter/Space on a focused dropdown
**Then** a styled dropdown menu opens below the field with 100ms fade-in
**And** I can navigate items with Arrow Up/Down keys
**And** Enter selects the highlighted item and closes the dropdown
**And** Escape closes without selecting
**And** typing a character jumps to a matching item
**And** the dropdown uses Sage accents and Oat hover highlights

**Technical Notes:**
- Refactor `/src/routes/expenses/+page.svelte` — replace current list layout with table container
- Adapt `ExpenseListItem.svelte` to render as table row with column structure
- Create `/src/lib/components/expense/inline-dropdown.svelte` — reusable for category + account
- `role="grid"` on table, `role="row"` on rows (UX8)
- `role="listbox"` on dropdown, `role="option"` on items, `aria-expanded`, `aria-activedescendant` (UX8)
- Sort order: chronological, newest at top, within same date newest first (UX13)

---

### Story 1.2: Inline Add Row — Complete Transaction Entry Flow

As a user,
I want to add transactions by typing directly into a persistent form row at the top of the table and pressing Enter,
So that I can log expenses quickly without any popup or context loss.

**Acceptance Criteria:**

**Given** I am on the `/expenses` page
**When** the page loads
**Then** I see a persistent add row at the top of the table
**And** the add row has Linen background (`#FAF7F2`) with a subtle Sage bottom border
**And** date field shows today's date (pre-filled)
**And** amount field has placeholder "0,00 €"
**And** category shows "Categorie..."
**And** account shows "Courant" (pre-selected default)
**And** description shows "Description (optionnel)"
**And** the add row is visually distinct from data rows (FR32)

**Given** the add row is visible
**When** the page loads
**Then** the amount field receives auto-focus (FR9)

**Given** I am in the add row
**When** I press Tab
**Then** focus moves to the next field in order: Date → Amount → Category → Account → Description (FR19)
**And** Shift+Tab moves to the previous field (FR19)
**And** each focused field shows a Sage focus ring (`ring-2 ring-[#639A88]/30`) (UX9)

**Given** I fill in amount "12" and select category "Resto"
**When** I press Enter from any field (FR7, FR20)
**Then** the transaction appears instantly in the list at its chronological position (FR22, NFR1 <50ms)
**And** the new row shows a Sage 8% background fade that transitions to transparent over 400ms (FR35, UX5)
**And** the add row resets to empty state (FR8, NFR3 <50ms)
**And** the amount field receives auto-focus (FR9)
**And** the DB save happens in background (NFR4 <500ms)
**And** the dashboard refresh is triggered on success (FR27)

**Given** I press Enter with the category field empty
**When** validation runs (FR28)
**Then** the category field gets a Terracotta border (`#C07D5A`) with "Categorie requise" text below (FR29, UX10)
**And** focus moves to the category field (FR30)
**And** all other entered data is preserved (FR31)
**And** the error styling clears as soon as I interact with the invalid field

**Given** I press Enter with amount empty or negative
**When** validation runs
**Then** the amount field gets Terracotta error styling with "Montant requis" (FR29)
**And** focus moves to the amount field (FR30)

**Given** the DB save fails after optimistic insert
**When** the error response returns
**Then** the optimistic row is removed from the list (FR24, NFR5 <200ms)
**And** the add row is re-populated with the failed data (FR25)
**And** an error toast appears using the existing app toast pattern (FR26)

**Given** I enter a backdated date (e.g., yesterday)
**When** I submit
**Then** the transaction inserts at its correct chronological position in the list (UX13)
**And** the Sage fade highlights it at its sorted position

**Given** I press Escape in the add row
**When** the form has data
**Then** all fields reset to their defaults (FR21)

**Given** I have just added a transaction
**When** the form resets
**Then** the keyboard-only flow works end-to-end: Tab past date → type amount → Tab → select category → Tab past account → Tab → type description → Enter (NFR10)

**Technical Notes:**
- Create `/src/lib/components/expense/inline-add-row.svelte`
- Uses existing `createExpense()` from `src/lib/data/expenses.ts` (AR1)
- Uses existing Zod schema from `src/lib/schemas/expense.ts` (AR6)
- State managed with Svelte 5 Runes: `$state` for form fields and errors (AR3)
- Local `let isSubmitting = $state(false)` for loading state (AR8)
- Optimistic insert: push to local `transactions` array immediately, remove on failure
- `aria-live="polite"` region for "Transaction saved" announcements (UX8)
- `aria-invalid="true"` + `aria-describedby` on error fields (UX8)
- Delete `AddExpenseModal.svelte` after this story is complete
- Trigger `dashboardRefresh.trigger()` on success

---

## Epic 2: Inline Edit & Delete

**Goal:** User can click any transaction to edit it in-place, or delete it with a quick inline confirmation — completing the modal-free transaction experience.

### Story 2.1: Inline Edit — Click-to-Edit & Save

As a user,
I want to click any transaction row to edit it in-place with the same inline pattern as adding,
So that I can correct mistakes without leaving the list or opening a popup.

**Acceptance Criteria:**

**Given** I am viewing the transaction list
**When** I hover over a read-mode row
**Then** the row background shifts to Oat (`#F5F1EA`) with 150ms ease transition (FR34, UX7)
**And** the cursor changes to pointer
**And** a subtle edit pencil icon appears in the actions column

**Given** I click on a transaction row
**When** the row enters edit mode (FR10)
**Then** all text values become input fields simultaneously (FR11)
**And** the inputs use the exact same font-size (14px), font-weight, and line-height as the read-mode text (UX14)
**And** the inputs occupy the exact same position and dimensions as the text they replace (zero layout shift) (UX4)
**And** the row background shifts to Cotton (`#FDFBF8`) with 150ms ease transition (UX7)
**And** a Sage focus ring appears on the field closest to where I clicked (UX9)
**And** action buttons appear: checkmark (save), X (cancel), trash (delete) (FR33)
**And** the transition completes in < 100ms (NFR2)

**Given** I am in edit mode on a row
**When** I modify the amount from "15,00" to "13,50" and press Enter (FR12, FR20)
**Then** the row returns to read mode with updated values
**And** the update appears instantly (optimistic) (FR23)
**And** the Sage 8% background fade confirms the save over 400ms (FR35, UX5)
**And** the DB update happens in background (NFR4 <500ms)
**And** the dashboard refresh is triggered on success (FR27)

**Given** I am in edit mode
**When** I press Escape (FR13, FR21)
**Then** all fields revert to their original values instantly
**And** the row returns to read mode with no animation
**And** no data is changed

**Given** I am in edit mode on row A
**When** I click on row B (FR14)
**Then** row A's edit is cancelled (reverts to original values)
**And** row B enters edit mode
**And** only one row is ever in edit mode at a time

**Given** I change the date of a transaction to a different day
**When** I save
**Then** the row re-sorts to its correct chronological position in the list (UX13)
**And** the Sage fade highlights it at its new position

**Given** I press Enter with invalid data in edit mode (e.g., empty amount)
**When** validation runs
**Then** the invalid field gets Terracotta error styling with error text (FR29)
**And** focus moves to the first invalid field (FR30)
**And** all other edits are preserved (FR31)
**And** the row stays in edit mode

**Given** the DB update fails after optimistic update
**When** the error response returns
**Then** the row reverts to its previous values (FR24, NFR5 <200ms)
**And** the row re-enters edit mode with the failed data pre-populated (FR25)
**And** an error toast appears (FR26)

**Given** a screen reader is active
**When** I enter edit mode
**Then** an `aria-live="polite"` region announces "Editing transaction" (UX8)
**And** on save it announces "Transaction saved"

**Technical Notes:**
- Refactor `/src/lib/components/expense/ExpenseListItem.svelte` to dual-mode (read/edit)
- Props: `isEditing` boolean controlled by parent, `onEdit()`, `onSave(data)`, `onCancel()`, `onDelete()`, `confirmState`
- Parent (`/expenses/+page.svelte`) manages `editingRowId: string | null` via `$state` (AR3)
- Uses existing `updateExpense()` from `src/lib/data/expenses.ts` (AR1)
- Same Zod validation as add row (AR6)
- Reuses `InlineDropdown` from Story 1.2 for category/account editing

---

### Story 2.2: Inline Delete with Popover Confirmation

As a user,
I want to delete a transaction from edit mode with a quick inline confirmation,
So that I can remove duplicates or mistakes without a full-screen popup.

**Acceptance Criteria:**

**Given** I am in edit mode on a transaction row
**When** I click the trash icon (FR15)
**Then** a DeletePopover appears anchored to the row (UX6)
**And** the popover shows: "Supprimer cette transaction de 12,00 € ?" (FR16)
**And** the popover has two buttons: [Supprimer] and [Annuler] (FR17)
**And** the row content dims to opacity 0.4 during confirmation (UX6)

**Given** the delete popover is visible
**When** I click [Supprimer] (FR17)
**Then** the row fades out with 300ms opacity transition (FR18, UX6)
**And** the list re-adjusts smoothly
**And** the delete happens optimistically (row removed from local state)
**And** the DB delete happens in background (NFR4)
**And** the dashboard refresh is triggered on success (FR27)

**Given** the delete popover is visible
**When** I click [Annuler] (FR17)
**Then** the popover closes
**And** the row stays in edit mode
**And** nothing is changed

**Given** the delete popover is visible
**When** I press Escape
**Then** the popover closes (cancel behavior)
**And** the row stays in edit mode

**Given** the DB delete fails after optimistic removal
**When** the error response returns
**Then** the row reappears in the list at its position (FR24)
**And** an error toast appears (FR26)

**Given** I am NOT in edit mode
**When** I look at a read-mode row
**Then** there is no delete button visible (FR15 — delete only accessible from edit mode)

**Given** I am using only the keyboard
**When** I try to trigger delete
**Then** there is no keyboard shortcut for delete (UX12 — intentionally mouse-only for safety)

**Given** a screen reader is active
**When** I confirm deletion
**Then** an `aria-live="polite"` region announces "Transaction deleted" (UX8)

**Given** this story is complete
**When** all inline CRUD operations work
**Then** `EditExpenseModal.svelte` is deleted from the codebase

**Technical Notes:**
- Create `/src/lib/components/expense/delete-popover.svelte`
- Props: `amount` (for confirmation text), `onConfirm()`, `onCancel()`, `anchorEl`
- Popover positioned below/above the row (viewport-aware)
- White background, warm shadow (`rgba(45,37,32, 0.08)`), rounded corners
- [Supprimer] button in Terracotta, [Annuler] in Stone
- Tab between the two buttons within popover
- Optimistic delete: remove from local `transactions` array, re-insert on failure
- Delete `EditExpenseModal.svelte` after this story is complete
