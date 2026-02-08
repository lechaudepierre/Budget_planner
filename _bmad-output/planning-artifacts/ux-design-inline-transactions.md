---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
status: 'complete'
completedAt: '2026-02-08'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd-inline-transactions.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/product-brief-Budget_planner-2026-01-21.md'
parentUxDesign: '_bmad-output/planning-artifacts/ux-design-specification.md'
parentPrd: '_bmad-output/planning-artifacts/prd-inline-transactions.md'
scope: 'targeted-feature'
date: '2026-02-08'
author: 'Pierrelechaude'
---

# UX Design Specification — Inline Transaction UX

**Author:** Pierrelechaude
**Date:** 2026-02-08

---

## Executive Summary

### Project Vision

Replace the modal-based transaction system with an inline, spreadsheet-like experience on `/expenses`. The user sees the full transaction list while adding, editing, or deleting entries — no context switch, no popups, no blind spots. The interaction pattern is Tab/Enter/Escape driven, optimized for rapid consecutive entry.

This is a UX-only change within the existing Budget_planner design system. Same backend, same validation, same data model — new interaction paradigm.

### Target Users

**Primary User: Pierrelechaude (power user of own tool)**
- Enters 3-5 transactions per day, typically in an evening batch
- Values speed and keyboard efficiency over mouse-driven UI
- Notices micro-interaction quality (animation timing, focus behavior, form reset speed)
- Expects inline editing patterns from spreadsheet familiarity (Google Sheets, Excel)
- Wants to see the list context while adding — prevents duplicates, maintains awareness

### Key Design Challenges

1. **Read/Edit mode visual distinction** — Table rows must clearly communicate their current state (static, editable, being-added) without visual clutter or inconsistency
2. **Persistent add row identity** — The always-visible add form must feel native to the table while being unmistakably "the place to type"
3. **Inline validation in tight spaces** — Error feedback must work within table cell constraints (no room for large error messages)
4. **Optimistic UI micro-interactions** — Instant insert, background save, potential rollback need carefully designed visual states
5. **Keyboard-first flow design** — Tab order, Enter submit, Escape cancel must be the primary (not secondary) interaction model

### Design Opportunities

1. **Rapid-fire entry flow** — Auto-reset + auto-focus creates a satisfying data-entry rhythm for batch transaction logging
2. **Contextual awareness** — Always-visible list prevents duplicate entries and maintains "where I am this month" context
3. **Single mental model** — Add, edit, and delete all use the same inline interaction pattern — learn once, use everywhere

## Core User Experience

### Defining Experience

**The Core Interaction:** Type a transaction into the persistent inline add row and press Enter. The row slides into the list at its chronological position. The form resets instantly. You're already typing the next one.

**The Rhythm:** Date (pre-filled) → Tab → Amount → Tab → Category (dropdown) → Tab → Account (pre-selected default) → Tab → Description (optional) → Enter. Three transactions in under a minute.

**User Description:** "I see my transaction list, I type in the row at the top, I hit Enter, it appears in the list. I do it again. No popups, no waiting, no context lost."

### Platform Strategy

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Primary platform** | Desktop (PC-first) | Keyboard-driven flow requires physical keyboard |
| **Input method** | Keyboard-first (Tab/Enter/Escape) | Spreadsheet muscle memory, batch efficiency |
| **Mouse support** | Click-to-edit on existing rows | Secondary interaction for corrections |
| **Responsive** | Desktop 1024px+ primary, tablet acceptable | Not a mobile feature |
| **Offline** | Not in scope | Same as current app behavior |

### Effortless Interactions

1. **Add transaction** — Tab through fields, Enter to submit. Form resets with auto-focus on amount. Next entry starts immediately.
2. **Edit transaction** — Click any row, fields become editable in-place. Same Tab/Enter pattern. Escape cancels cleanly.
3. **Account defaulting** — Compte courant pre-selected. Skip past it with Tab unless switching account. Zero friction for the 90% case.
4. **Date defaulting** — Today's date pre-filled. Tab past it for same-day entries, change it only when backdating.
5. **Delete** — Accessible from edit mode only. Inline confirmation, not a modal. Quick and contained.

### Field Order & Layout

**Column order (left to right):** Date | Amount | Category | Account | Description | Actions

| Field | Type | Default | Tab behavior |
|-------|------|---------|-------------|
| **Date** | Date picker | Today | Pre-filled, Tab skips to amount |
| **Amount** | Number input | Empty | Auto-focus target after reset |
| **Category** | Dropdown | Empty (required) | Select from list |
| **Account** | Dropdown | Compte courant | Pre-selected, Tab skips unless changed |
| **Description** | Text input | Empty (optional) | Free text, Enter submits from here |
| **Actions** | Buttons | — | Submit (Enter) / Cancel (Escape) |

**Rationale for date-first:** The left column anchors the chronological sort order visually. When scanning the list, the date is the first thing you see — matching your banking app's layout. When adding, it's pre-filled so you Tab past it instantly to amount.

### Sort & Insertion Behavior

**Sort order:** Chronological by date (most recent at top).

**Within same date:** Newest entry appears at top (reverse insertion order within the date group).

**Cross-date insertion:** If you add a transaction with an earlier date, it slides into its correct chronological position in the list.

**Visual:** New row appears with a brief highlight animation at its sorted position, confirming where it landed.

### Row Density & Visual Rhythm

**Target density:** 10-12 visible rows in viewport. Comfortable breathing room, consistent with Budget_planner's clean aesthetic.

**Row height:** ~48-52px — enough for readable text + inline input fields without feeling cramped.

**Spacing philosophy:** Whitespace is a feature. The table should feel like a designed surface, not a dense spreadsheet. Consistent with the existing Linen/Cotton/Sage design language.

### Critical Success Moments

| Moment | What happens | Success feeling |
|--------|-------------|-----------------|
| **First inline add** | Type, Enter, row appears in list | "Oh, that's fast. No popup." |
| **Third consecutive add** | Rhythm established — Tab-Tab-Enter flow | "I could do this all day" |
| **First inline edit** | Click row, change amount, Enter | "Wait, I can just click and fix it?" |
| **First Escape cancel** | Press Escape, row reverts cleanly | "Nothing lost, that's safe" |
| **Backdated entry sorts correctly** | Enter yesterday's expense, it lands in the right spot | "Smart. It knows where to put it." |

### Experience Principles

1. **Keyboard is king** — Every action completable via Tab/Enter/Escape. Mouse is optional, never required.
2. **Context never lost** — The list is always visible. You see where your new entry lands. No blind spots.
3. **Defaults eliminate friction** — Date = today, Account = default. Only type what matters: amount + category.
4. **One pattern, everywhere** — Add, edit, delete all use the same inline row paradigm. Learn once.
5. **Breathing room over density** — 10-12 rows with whitespace, not 25 cramped rows. Design coherence > data density.

## Desired Emotional Response

### Primary Emotional Goals

| Goal | Description | How it manifests |
|------|-------------|-----------------|
| **Flow** | The Tab-Enter rhythm becomes automatic — you think about expenses, not UI | After 2-3 entries, the interaction disappears; you're just logging data |
| **Trust** | You see the row land in the list. No question about persistence | Visual confirmation is the row itself existing in context |
| **Efficiency** | "Five transactions in a minute. That was nothing." | Speed comes from defaults + keyboard flow, not from rushing |
| **Safety** | Nothing is lost unless you explicitly confirm deletion | Escape always works, validation preserves data, cancel reverts cleanly |

### Emotional Journey Mapping

| Stage | Emotion | Design response |
|-------|---------|-----------------|
| **First field focus** | Readiness — "I know what to do" | Auto-focus on amount, clear add row identity |
| **Tabbing through fields** | Flow — "This is fast" | Smooth focus transitions, sensible defaults pre-filled |
| **Pressing Enter** | Micro-satisfaction — "Done" | Row appears at sorted position with soft Sage fade, form resets |
| **Seeing the row in the list** | Trust — "It's there, I see it" | New row settles into chronological position, contextually visible |
| **Starting the next entry** | Momentum — "Again" | Auto-focus on amount, empty form, zero friction |
| **Making a mistake** | Calm — "No big deal" | Inline validation, no data loss, clear error on the field itself |
| **Editing an old row** | Control — "I can fix anything" | Click, change, Enter. Same pattern. Escape to abort. |
| **Deleting a row** | Deliberate — "I meant to do that" | Inline confirmation, not a scary modal. Brief fade-out animation. |
| **DB failure (rare)** | Informed, not alarmed | Row reverts quietly, form re-populated, subtle error toast |

### Micro-Emotions

**Emotions We Cultivate:**
- **Confidence** — Always know the current state (read/edit/add), always know how to act (Tab/Enter/Escape)
- **Momentum** — The auto-reset loop invites "one more entry" naturally
- **Awareness** — Seeing the list while adding creates a passive sense of where you stand this month
- **Precision** — Inline edit feels like surgical correction, not a heavy operation

**Emotions We Actively Prevent:**
- **Doubt** — "Did it save?" → The row is visibly in the list with a soft Sage confirmation fade
- **Disorientation** — "Where did it go?" → Highlight at sorted position guides the eye
- **Anxiety** — "What if I break something?" → Escape is always safe, cancel always reverts
- **Frustration** — "I have to redo everything" → Validation failure preserves all entered data
- **Overwhelm** — "Too much going on" → Only one row in edit mode at a time, clean states

### Design Implications

| Emotional Goal | UX Design Approach |
|----------------|-------------------|
| **Flow** | Auto-focus, Tab order, Enter submit, form auto-reset — zero dead moments |
| **Trust** | Optimistic insert + soft Sage background fade (8% opacity → 0% over 400ms) on new row |
| **Safety** | Escape cancels edit mode cleanly, validation preserves data, delete requires confirmation |
| **Efficiency** | Defaults (date=today, account=default) skip 2 of 5 fields automatically |
| **Calm on error** | Inline field-level errors in Terracotta, focus redirected to problem field, no data lost |
| **Deliberate delete** | Inline confirmation popover (not modal), row fades out with 300ms opacity transition |

### Save Confirmation Pattern

**Philosophy:** The confirmation is *felt*, not *announced*.

**Mechanism:** When a transaction is saved (add or edit):
1. Row appears/updates at its sorted position
2. Soft Sage (`#639A88`) background tint at ~8% opacity
3. Fades to normal background (Cotton `#FDFBF8`) over 400ms ease-out
4. Form resets and auto-focuses (add mode) or row returns to read mode (edit mode)

No toast notification. No checkmark. No animation that demands attention. The row *settling into the list* is the confirmation. The form *resetting* is the signal to continue. Two implicit confirmations, zero visual noise.

**On failure (rare):** Subtle error toast at bottom-right (existing app pattern), row reverts, form re-populated. The asymmetry is intentional — success is silent, failure speaks up.

### Emotional Design Principles

1. **Success is silent, failure speaks** — Saved transactions settle quietly; errors surface clearly but calmly
2. **Motion confirms, not decorates** — The Sage fade and row insertion serve confirmation, not aesthetics
3. **Safety is ambient** — Escape/cancel/revert are always available without needing to think about them
4. **Rhythm over speed** — The goal isn't "fast data entry" but "comfortable flow" that happens to be fast
5. **One row, one focus** — Only one thing is editable at a time. Simplicity prevents cognitive overload

## UX Pattern Analysis & Inspiration

### Design Philosophy

**"Notion's silence, Airtable's intelligence"** — Cells activate without visual drama (no heavy border changes, no row "transformation"). But each field gets a purpose-built control: number inputs format currency, categories open a styled dropdown, dates show a picker. The table feels calm and minimal while being functionally rich.

### Inspiring Products Analysis

**Notion (Tables)**
- Cell-level activation: click a cell, it becomes editable. No row-level mode switch.
- Transition is near-invisible — the text just becomes an input. Background barely changes.
- Tab flow between cells is seamless.
- **What we take:** The quiet read-to-edit transition. No heavy visual state change. The cell "opens" subtly.
- **What we skip:** Notion rows can expand into full pages — we don't need that complexity.

**Airtable (Databases)**
- Typed fields: each column has a purpose-built editor (dropdown, number, date picker, long text).
- Visual hierarchy within the table: column headers typed, cells formatted per type.
- Inline dropdowns feel native, not like generic `<select>` elements.
- **What we take:** Typed field controls — amount gets a number input with € suffix, category gets a styled dropdown, date gets a compact picker.
- **What we skip:** Airtable's density and color coding can feel busy. We keep it cleaner.

**Linear (Issue Lists)**
- The overall aesthetic reference for Budget_planner.
- Inline property editing: click a status/priority badge, dropdown appears in-place.
- Rows are clean with generous spacing.
- Hover reveals subtle action affordances.
- **What we take:** The spacing, the hover affordance pattern (row highlights on hover to signal "clickable"), the dropdown-in-place feel.

**Google Sheets**
- Pure keyboard flow: Tab, Enter, Arrow keys. Zero ceremony.
- **What we take:** The Tab-Enter rhythm. The muscle memory of "type → Tab → type → Enter."
- **What we skip:** Everything visual. Sheets has no personality, no design, no delight.

### Transferable UX Patterns

**Interaction Patterns:**

| Pattern | Source | Application in Budget_planner |
|---------|--------|-------------------------------|
| **Silent cell activation** | Notion | Click a cell → it becomes editable with minimal visual change. No row "mode switch." |
| **Typed field controls** | Airtable | Amount = number input with € formatting. Category = styled dropdown. Date = compact date picker. |
| **Tab-Enter flow** | Google Sheets | Tab moves to next field, Enter submits the row. Muscle memory from spreadsheets. |
| **Hover row highlight** | Linear | Subtle background shift on hover (`Oat #F5F1EA`) signals "this row is interactive." |
| **Inline dropdown** | Linear/Airtable | Category and account dropdowns appear in-place, not as a separate overlay. Compact, styled, fast. |
| **Persistent input row** | Airtable | The add row is always visible at the top, visually distinct but part of the table structure. |

**Visual Patterns:**

| Pattern | Source | Application |
|---------|--------|-------------|
| **Minimal state transitions** | Notion | Read → edit transition uses only a subtle border/background shift, not a full row transformation |
| **Field-level focus ring** | Linear | Sage-tinted focus ring on the active field only, not the entire row |
| **Soft row separation** | Linear | `Sand #E2DCD2` bottom borders, not heavy grid lines. Table feels like a list, not a spreadsheet. |
| **Compact controls** | Airtable | Dropdowns and date pickers sized to fit within the row height (~48-52px) |

### Anti-Patterns to Avoid

| Anti-Pattern | Source of lesson | Why harmful for us |
|-------------|-----------------|-------------------|
| **Full row transformation on edit** | Many CRUD apps | Makes the table "jump" visually, breaks reading flow, feels heavy |
| **Generic `<select>` elements** | Default HTML | Looks cheap, inconsistent across browsers, doesn't match DaisyUI aesthetic |
| **Grid lines everywhere** | Google Sheets | Creates a spreadsheet look, conflicts with minimalist design language |
| **Row-level action buttons always visible** | Enterprise apps | Visual clutter. Actions should appear on hover or in edit mode only. |
| **Confirmation toast on every save** | Many SaaS apps | Noise. The Sage fade is enough. Success should be silent. |
| **Cell-by-cell edit without row context** | Pure spreadsheet pattern | We want row-level edit (all fields editable at once) for transaction coherence |

### Design Inspiration Strategy

**Adopt Directly:**
- Notion's quiet read-to-edit transition (minimal visual change)
- Linear's row hover highlight pattern
- Sheets' Tab-Enter keyboard flow
- Airtable's typed field controls philosophy

**Adapt for Budget_planner:**
- Airtable's typed controls → simplified with DaisyUI components, Sage/Linen palette
- Notion's cell activation → adapted to row-level activation (all fields in a row become editable together, maintaining transaction coherence)
- Linear's spacing → calibrated to our 48-52px row height target

**Explicitly Avoid:**
- Spreadsheet grid aesthetic (soft borders only, generous whitespace)
- Heavy row transformation animations (keep transitions under 150ms)
- Always-visible action buttons (reveal on hover/edit only)
- Toast notifications for success (Sage fade only)
- Generic browser-native form controls (styled DaisyUI throughout)

## Design System Foundation

### Design System Choice

**Tailwind CSS + DaisyUI + Custom Svelte Components** — inherited from the existing Budget_planner design system. No new dependencies. This feature builds on top of the established foundation.

### Component Strategy for Inline Table

| Component | Approach | Rationale |
|-----------|----------|-----------|
| **Inline table container** | Custom Svelte | No DaisyUI equivalent. Table structure with custom row states. |
| **Add row** | Custom Svelte | Unique component: persistent, visually distinct, form-integrated |
| **Read-mode row** | Custom Svelte | Static display with hover highlight, click-to-edit behavior |
| **Edit-mode row** | Custom Svelte | Same structure as add row, pre-populated with existing data |
| **Amount input** | DaisyUI `input` (themed) | Number type, € suffix, compact size within row height |
| **Description input** | DaisyUI `input` (themed) | Text type, placeholder "Description (optionnel)" |
| **Date picker** | DaisyUI `input` (date type, themed) | Compact, native date picker sufficient for desktop |
| **Category dropdown** | Custom Svelte dropdown | Styled dropdown menu (not native `<select>`). Supports budget preview on selection (P2). Triggered by cell click. |
| **Account dropdown** | Custom Svelte dropdown | Same pattern as category. Pre-selected default, compact. |
| **Delete confirmation** | Custom Svelte popover | Inline popover anchored to the row, not a modal. "Supprimer cette transaction ?" |
| **Validation errors** | DaisyUI tooltip / custom | Terracotta-tinted field border + compact error text below field |
| **Submit/Cancel actions** | DaisyUI `btn` (themed) | Compact icon buttons (checkmark / X) at row end. Keyboard primary. |

### Customization Requirements

**Theme tokens already defined (from parent UX spec):**
- Colors: Sage `#639A88`, Linen `#FAF7F2`, Cotton `#FDFBF8`, Sand `#E2DCD2`, Terracotta `#C07D5A`
- Shadows: Warm-tinted `rgba(45,37,32, 0.04-0.08)`
- Font: Inter Variable
- Spacing: 4px base grid

**New tokens specific to inline table:**

| Token | Value | Usage |
|-------|-------|-------|
| `row-height` | 48-52px | All row types (add, read, edit) |
| `row-hover-bg` | `#F5F1EA` (Oat) | Hover highlight on read rows |
| `row-edit-bg` | `#FDFBF8` (Cotton) | Active edit row background |
| `row-add-bg` | `#FAF7F2` (Linen) with subtle top border Sage | Persistent add row identity |
| `row-confirm-bg` | `rgba(99,154,136, 0.08)` (Sage 8%) | Save confirmation fade |
| `row-border` | `#E2DCD2` (Sand) | Soft bottom border between rows |
| `field-focus-ring` | `ring-2 ring-[#639A88]/30` | Sage-tinted focus on active field |
| `field-error-border` | `#C07D5A` (Terracotta) | Validation error field border |
| `transition-confirm` | 400ms ease-out | Sage fade duration |
| `transition-edit` | 150ms ease | Read-to-edit state change |
| `transition-delete` | 300ms ease-out | Row fade-out on deletion |

### Custom Dropdown Specification

**Category & Account dropdowns** — custom Svelte components replacing native `<select>`:

- **Trigger:** Cell click opens a positioned dropdown menu below the field
- **Style:** DaisyUI `menu` component as base, themed with Sage accents
- **Items:** Category name (+ optional budget preview for category dropdown)
- **Keyboard:** Arrow keys navigate, Enter selects, Escape closes
- **Position:** Anchored to cell, opens downward, stays within viewport
- **Animation:** 100ms fade-in, no slide

### Implementation Approach

1. **Build the table shell first** — Container with column headers, scroll area, pagination integration
2. **Add row component** — Persistent form row with all typed field controls
3. **Read row component** — Static display with hover and click handlers
4. **Edit row component** — Reuses add row's field controls, pre-populated
5. **Custom dropdowns** — Category and account, shared pattern
6. **Keyboard handler** — Global event handler for Tab/Enter/Escape routing
7. **State management** — Single `editingRowId` state, optimistic insert/update logic
8. **Animations** — Sage confirmation fade, edit transition, delete fade-out

## Defining Experience

### The Core Interaction

**One-sentence pitch:** "I type into the table and the list updates itself."

No button to click before you start. No form to open. No modal to dismiss. The table IS the form. The list IS the result. They're the same surface.

### User Mental Model

**Mental model: Spreadsheet** — but a designed one.

| Aspect | User expectation | Our implementation |
|--------|-----------------|-------------------|
| **Adding data** | "I type in a row and press Enter" | Persistent add row at top, Tab/Enter flow |
| **Editing data** | "I click a cell and change it" | Click row → all fields become editable at once |
| **Deleting data** | "I select and delete" | Edit mode → delete action → inline confirmation |
| **Navigation** | "Tab moves between fields" | Tab order: Date → Amount → Category → Account → Description |
| **Saving** | "It just saves when I press Enter" | Optimistic save, no explicit "Save" step |
| **Cancelling** | "Escape gets me out" | Escape reverts to read mode, no changes persisted |

**What we're replacing:**

The modal pattern was a *document editing* mental model — "open a form, fill it, submit it, close it." The inline pattern is a *data entry* mental model — "type in the table." The second is what finance apps should feel like.

### Core Experience Success Criteria

| Criteria | Target | How we measure |
|---------|--------|---------------|
| **Simplicity** | Zero learning curve | User adds first transaction without instruction |
| **Speed** | < 10 seconds per transaction | Date (skip) → Amount → Category → Enter |
| **Cognitive load** | Minimal decisions | Only 2 required inputs: amount + category |
| **Visual feedback** | Implicit, not explicit | Row appears in list = confirmation. No toast. |
| **Error recovery** | Zero data loss | Validation failure preserves all entered fields |
| **Discoverability** | Edit via click is obvious | Hover cursor change + Oat highlight signals "clickable" |

### Novel UX Patterns

**Pattern classification: Familiar combination, novel execution.**

We're not inventing anything. Spreadsheet editing + Notion's quiet transitions + Airtable's typed fields — all established. The novelty is in the *execution quality* within Budget_planner's design language:

| Established pattern | Our twist |
|--------------------|-----------|
| Spreadsheet Tab/Enter | Within a designed, warm-toned table — not a cold grid |
| Click-to-edit | Entire row activates quietly — text becomes inputs with minimal visual shift |
| Inline form | The add row is a permanent part of the table, not a toggled element |
| Optimistic save | Sage fade confirmation — the row "settling in" as visual proof |

**The quiet edit transition — our signature pattern:**

When a row enters edit mode, the change is intentionally subtle:
- Text values become input fields with the same font, size, and position
- A thin Sage focus ring appears on the first field
- Row background shifts to Cotton (`#FDFBF8`) — barely perceptible
- No border explosion, no height change, no layout shift

The goal: the user doesn't feel like they "entered a mode." They feel like the row just... accepted their input.

### Experience Mechanics

**1. Add Transaction (Primary Flow)**

```
INITIATION
│ User sees persistent add row at top of table
│ Date field shows today's date (pre-filled, dimmed)
│ Amount field has placeholder "0,00 €"
│ Category shows "Catégorie..."
│ Account shows "Courant" (pre-selected)
│ Description shows "Description (optionnel)"
│
INTERACTION
│ Tab → Amount field receives focus (auto-skip date)
│ User types "12" → field shows "12,00 €"
│ Tab → Category dropdown opens
│ User selects "Resto" → dropdown closes
│ Tab → Account (already "Courant", skip)
│ Tab → Description field
│ User types "Déjeuner" (or skips)
│ Enter → Submit
│
FEEDBACK
│ Row instantly appears at chronological position in list
│ Soft Sage background fade (8% → 0%, 400ms)
│ Add row resets to empty state
│ Amount field receives auto-focus
│ Ready for next entry
│
COMPLETION
│ User sees the transaction in the list
│ Form is empty and ready
│ No confirmation needed — the row IS the confirmation
```

**2. Edit Transaction**

```
INITIATION
│ User hovers over a row → Oat background + pointer cursor
│ User clicks the row
│
INTERACTION
│ All fields in the row become editable simultaneously
│ Text values → input fields (same position, same font)
│ Background shifts to Cotton (subtle)
│ Sage focus ring on the field closest to click position
│ Row actions appear: ✓ (save) ✗ (cancel) 🗑 (delete)
│ User modifies desired field(s)
│ Enter → Save | Escape → Cancel
│
FEEDBACK (Save)
│ Fields revert to text display
│ Sage confirmation fade (400ms)
│ Row may re-sort if date was changed
│ Actions disappear
│
FEEDBACK (Cancel)
│ Fields revert to original text values
│ No visual confirmation needed — nothing changed
│ Instant, no animation
```

**3. Delete Transaction**

```
INITIATION
│ User is in edit mode on a row
│ User clicks 🗑 delete icon
│
INTERACTION
│ Inline popover appears anchored to the row:
│ "Supprimer cette transaction de 12,00 € ?"
│ [Supprimer] [Annuler]
│
FEEDBACK (Confirm)
│ Row fades out (300ms opacity transition)
│ List re-adjusts smoothly
│ Popover dismissed
│
FEEDBACK (Cancel)
│ Popover dismissed
│ Row stays in edit mode
│ Nothing changed
```

**4. Validation Failure**

```
TRIGGER
│ User presses Enter with missing required field
│
FEEDBACK
│ Invalid field gets Terracotta border (#C07D5A)
│ Compact error text appears below field: "Catégorie requise"
│ Focus moves to first invalid field
│ All other entered data preserved
│ User corrects → error styling clears on input
│ Enter → retry submission
```

## Visual Design Foundation

### Color System

**Inherited from parent UX design spec — no modifications.**

All inline table colors derive from the established Budget_planner palette:

| Role | Color | Hex | Table usage |
|------|-------|-----|-------------|
| **Page background** | Linen | `#FAF7F2` | Table container background |
| **Row background** | Cotton | `#FDFBF8` | Read-mode rows, edit-mode rows |
| **Row hover** | Oat | `#F5F1EA` | Hover highlight on clickable rows |
| **Row border** | Sand | `#E2DCD2` | Soft horizontal dividers between rows |
| **Confirmation** | Sage 8% | `rgba(99,154,136, 0.08)` | Save confirmation fade |
| **Focus ring** | Sage 30% | `rgba(99,154,136, 0.30)` | Active field focus indicator |
| **Error** | Terracotta | `#C07D5A` | Validation error borders |
| **Text primary** | Coffee-900 | `#2D2520` | Row data text |
| **Text secondary** | Stone-500 | `#8A827A` | Placeholders, dates, secondary info |
| **Primary action** | Sage | `#639A88` | Submit button, active states |

### Typography System

**Inherited from parent UX design spec — no modifications.**

| Element | Size | Weight | Table usage |
|---------|------|--------|-------------|
| **Column headers** | 12px | Medium (500) | Date, Montant, Catégorie, Compte, Description |
| **Row data** | 14px | Regular (400) | All cell content in read mode |
| **Input fields** | 14px | Regular (400) | All editable fields — same as read mode for seamless transition |
| **Amount** | 14px | Medium (500) | Slightly heavier weight for financial data |
| **Placeholder text** | 14px | Regular (400) | Stone-500 color, same size as data |
| **Error text** | 12px | Regular (400) | Terracotta, below invalid field |

**Critical detail:** Input fields use the exact same font-size, font-weight, and line-height as the read-mode text they replace. This is what makes the edit transition feel invisible.

### Spacing & Layout Foundation

**Base unit: 4px (Tailwind-compatible), inherited.**

| Element | Spacing | Rationale |
|---------|---------|-----------|
| **Row height** | 48-52px | Comfortable for both text display and input fields |
| **Cell horizontal padding** | 12-16px | Breathing room within cells |
| **Column gap** | 0 (padding handles it) | Clean cell boundaries via padding |
| **Table header/body gap** | 8px | Subtle separation |
| **Add row bottom margin** | 8px | Visual separation from data rows |
| **Error text margin-top** | 4px | Compact below field |

**Table column widths:**

| Column | Width | Rationale |
|--------|-------|-----------|
| **Date** | 120px fixed | Consistent date format width |
| **Amount** | 100px fixed | Numbers don't need flex |
| **Category** | 150px fixed | Dropdown needs comfortable width |
| **Account** | 130px fixed | Dropdown, slightly narrower than category |
| **Description** | Flex (fill remaining) | Variable text, takes available space |
| **Actions** | 80px fixed | Icon buttons, compact |

### Accessibility Considerations

| Criterion | Implementation | Status |
|-----------|---------------|--------|
| **Text contrast** | Coffee-900 on Cotton/Linen = 12:1+ ratio | Compliant (WCAG AAA) |
| **Placeholder contrast** | Stone-500 on Cotton = 3.5:1+ ratio | Compliant (WCAG AA for large text) |
| **Focus visibility** | Sage ring-2 on active fields | Visible, meets WCAG 2.4.7 |
| **Error identification** | Terracotta border + text label (not color-only) | Compliant (WCAG 1.4.1) |
| **Keyboard operation** | Full Tab/Enter/Escape support | Compliant (WCAG 2.1.1) |
| **Touch targets** | 48px row height, buttons 32px+ | Meets minimum (WCAG 2.5.8) |
| **No layout shift** | Edit mode same dimensions as read mode | No unexpected movement |

## Design Direction Decision

### Design Direction Explored

Single unified direction — no competing alternatives needed. This feature operates within the existing Budget_planner design system, so the visual direction is inherited. The exploration focused on **how the inline table pattern manifests** within that system.

**Mockup reference:** `ux-inline-transactions-mockup.html`

### Chosen Direction

**"Quiet Table"** — A minimalist inline table where state changes are felt more than seen.

**Key visual characteristics:**
- Linen page background, Cotton row backgrounds, Sand soft borders
- Add row distinguished by Linen background + subtle Sage bottom border
- Edit mode: text becomes inputs with identical sizing — near-invisible transition
- Category badges with colored dots for visual scanning
- Action buttons appear contextually (add/edit mode only)
- Hover state uses Oat background to signal clickability
- Save confirmation: Sage 8% background fade over 400ms
- Delete confirmation: inline popover anchored to row, not a modal

### Design Rationale

| Decision | Why |
|----------|-----|
| **Minimal state transitions** | Notion-inspired quiet activation — premium feel through restraint |
| **Category badges with dots** | Visual scanning aid without color overload — compact and informative |
| **Contextual action buttons** | No visual clutter in read mode — actions appear when relevant |
| **Inline popover for delete** | Contained, contextual, no full-screen modal for a simple confirmation |
| **Sage confirmation fade** | Success is felt, not announced — coherent with "inform don't alarm" philosophy |
| **Same dimensions read/edit** | Zero layout shift — the table doesn't "jump" when entering edit mode |

### Implementation Notes

- HTML mockup at `ux-inline-transactions-mockup.html` serves as visual reference
- All colors, fonts, and spacing are from existing design tokens
- Custom Svelte components needed: InlineTable, AddRow, ReadRow, EditRow, CategoryDropdown, AccountDropdown, DeletePopover
- DaisyUI used for: input fields, base button styles, focus ring utilities

## User Journey Flows

### Flow 1: Daily Entry (Batch Add)

**Trigger:** User opens `/expenses` in the evening to log the day's transactions.
**Goal:** Add 3-5 transactions quickly without losing context.

```
┌─────────────────────────────────────────────────────────────┐
│  /expenses page loads                                       │
│  Transaction list visible with existing entries             │
│  Add row at top — date pre-filled (today), amount focused   │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  TRANSACTION 1                                              │
│  Tab past date → type "12" → Tab → select "Resto" →        │
│  Tab past Courant → Tab → type "Déjeuner" → Enter          │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Row appears in list at chronological position              │
│  Sage fade confirmation (400ms)                             │
│  Add row resets — amount auto-focused                       │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  TRANSACTION 2                                              │
│  "2" → Tab → "Transport" → Enter                           │
│  (Skipped description — optional)                           │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  TRANSACTION 3                                              │
│  "8,50" → Tab → "Courses" → Tab → Tab → "Pain, lait" →    │
│  Enter                                                      │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Done. 3 transactions in ~45 seconds.                       │
│  List updated in real-time. User sees full context.         │
│  Navigate to dashboard or close app.                        │
└─────────────────────────────────────────────────────────────┘
```

**Variant — Backdated entry:**
User changes the date field before tabbing to amount. The transaction inserts at its correct chronological position in the list (not at top). Sage fade highlights the row at its sorted location so the user sees where it landed.

**Variant — Account switching:**
User tabs to the Account dropdown (normally pre-selected "Courant") and selects "Livret A" instead. Tab continues to Description. No other flow change.

**Key UX decisions:**
- Date is always pre-filled (today) — only change it for backdated entries
- Account is always pre-selected (Courant) — only change it for non-default accounts
- Description is optional — Enter submits from any field
- Auto-focus on amount after each reset maintains the rhythm

---

### Flow 2: Inline Edit (Correction)

**Trigger:** User spots an incorrect amount in the transaction list.
**Goal:** Fix the value without leaving the page or losing context.

```
┌─────────────────────────────────────────────────────────────┐
│  User scanning the transaction list                         │
│  Notices "15,00 €" should be "13,50 €"                     │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  HOVER: Row highlights (Oat background + pointer cursor)    │
│  Subtle edit icon appears in actions column                 │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  CLICK: Entire row enters edit mode simultaneously          │
│  Text → input fields (same font, same position)             │
│  Background shifts to Cotton (barely perceptible)           │
│  Sage focus ring on field closest to click position         │
│  Action buttons appear: ✓ ✕ 🗑                              │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  User clicks into amount field, changes "15,00" → "13,50"  │
│  Press Enter (or click ✓)                                   │
└──────────────────┬──────────────────┬───────────────────────┘
                   ▼                  ▼
          ┌──────────────┐   ┌──────────────────┐
          │  SUCCESS     │   │  CANCEL (Escape)  │
          │  Row returns │   │  Row reverts to   │
          │  to read mode│   │  original values  │
          │  Sage fade   │   │  Instant, no      │
          │  confirmation│   │  animation        │
          └──────────────┘   └──────────────────┘
```

**Key UX decisions:**
- Click anywhere on the row to enter edit mode (not just a button)
- All fields become editable at once (row-level, not cell-level)
- Focus goes to the field closest to where the user clicked
- Only one row in edit mode at a time — clicking another row cancels current edit
- Escape is always safe — instant revert, no data loss

---

### Flow 3: Inline Delete

**Trigger:** User sees a duplicate transaction and wants to remove it.
**Goal:** Delete quickly with a safety net against accidental deletion.

```
┌─────────────────────────────────────────────────────────────┐
│  User identifies duplicate row in the list                  │
│  Clicks the row → enters edit mode                          │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Row in edit mode — action buttons visible: ✓ ✕ 🗑          │
│  User clicks 🗑 (delete icon)                               │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  INLINE POPOVER appears anchored to row:                    │
│  "Supprimer cette transaction de 12,00 € ?"                │
│  [Supprimer]  [Annuler]                                     │
│  Row content dims (opacity 0.4)                             │
└──────────────────┬──────────────────┬───────────────────────┘
                   ▼                  ▼
          ┌──────────────┐   ┌──────────────────┐
          │  CONFIRM     │   │  CANCEL           │
          │  Row fades   │   │  Popover closes   │
          │  out (300ms) │   │  Row stays in     │
          │  List adjusts│   │  edit mode        │
          │  smoothly    │   │  Nothing changed  │
          └──────────────┘   └──────────────────┘
```

**Key UX decisions:**
- Delete is only accessible from edit mode (click row first, then delete) — prevents accidental deletion
- Inline popover confirmation, not a modal — contextual and lightweight
- Row content dims during confirmation to signal "this is about to go"
- Fade-out animation (300ms) provides visual closure
- Keyboard: no keyboard shortcut for delete — intentionally mouse-only to prevent accidents

---

### Flow 4: Validation Error & Recovery

**Trigger:** User presses Enter with a missing required field.
**Goal:** Correct the error without losing any entered data.

```
┌─────────────────────────────────────────────────────────────┐
│  User fills add row:                                        │
│  Amount: "24,00 €" | Category: (empty) | Desc: "Pharmacie" │
│  Presses Enter                                              │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  VALIDATION FAILS                                           │
│  Category field: Terracotta border + "Catégorie requise"    │
│  Focus moves to category field automatically                │
│  All other data preserved (amount, description intact)      │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  User selects "Santé" from category dropdown                │
│  Error styling clears immediately on input                  │
│  Presses Enter                                              │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  SUCCESS — transaction saved                                │
│  Row appears in list with Sage fade                         │
│  Form resets, amount auto-focused                           │
└─────────────────────────────────────────────────────────────┘
```

**Key UX decisions:**
- Validation is inline, per-field — no popup error summary
- Error styling clears as soon as the user interacts with the invalid field
- All valid data is preserved — zero data loss on validation failure
- Focus auto-redirects to the first invalid field
- Same behavior in edit mode: Enter with invalid data highlights errors, preserves changes

---

### Journey Patterns

**Patterns consistent across all flows:**

| Pattern | Implementation | Used in |
|---------|---------------|---------|
| **Enter to submit** | From any field in the row | Add, Edit |
| **Escape to cancel** | Reverts to previous state, no data loss | Edit, Validation |
| **Sage fade confirmation** | 8% opacity → 0% over 400ms on save | Add, Edit |
| **Oat hover highlight** | Background shift on row hover | All read rows |
| **Single edit mode** | Only one row editable at a time | Edit, Delete |
| **Inline error display** | Terracotta border + text on invalid field | Add, Edit |
| **Auto-focus after action** | Amount field after add reset, first invalid field after error | Add, Validation |

### Flow Optimization Principles

1. **Minimum steps to value** — Add: 2 required inputs (amount + category), 1 keypress to submit. Edit: 1 click to enter, 1 keypress to save.
2. **Progressive commitment** — Delete requires 2 actions (enter edit mode + click delete + confirm). Higher friction for destructive actions.
3. **Zero data loss guarantee** — Validation failure, cancel, and even DB failure never lose entered data.
4. **Contextual feedback only** — Errors appear on the field, confirmations appear on the row. No distant notifications for inline actions.
5. **Consistent exit paths** — Enter saves, Escape cancels. Always. In every flow.

## Component Strategy

### Existing Components (What Changes)

| Component | Current | After refactor |
|-----------|---------|---------------|
| `ExpenseListItem.svelte` | Read-only row, click triggers modal | Read/Edit dual-mode row. Click → edit mode. Enter → save. Escape → cancel. |
| `AddExpenseModal.svelte` | Modal form for new expense | **DELETE** — replaced by inline add row |
| `EditExpenseModal.svelte` | Modal form for editing expense | **DELETE** — replaced by edit mode in ExpenseListItem |
| `/expenses/+page.svelte` | Lists expenses, opens modals | Hosts inline table with persistent add row, manages `editingRowId` state |

### New Components

#### `InlineAddRow.svelte`

**Purpose:** Persistent form row at the top of the transaction table for adding new transactions.

**Props:**
- `categories` — list of available categories
- `accounts` — list of available accounts (with default marked)
- `onSubmit(data)` — callback when Enter pressed with valid data
- `disabled` — boolean, true while a save is in progress

**Internal state:**
- `date` — defaults to today
- `amount` — empty string
- `categoryId` — null (required)
- `accountId` — default account ID
- `description` — empty string
- `errors` — object per field, null when valid

**States:**

| State | Visual | Trigger |
|-------|--------|---------|
| **Empty (default)** | Linen background, placeholders visible, amount auto-focused | Page load, after successful submit |
| **Filling** | Fields populated, Sage focus ring on active field | User types/selects |
| **Validation error** | Terracotta border on invalid field(s), error text below | Enter with missing required field |
| **Submitting** | Brief disabled state (~50ms, barely visible) | Enter with valid data |

**Keyboard:**
- Tab: next field
- Shift+Tab: previous field
- Enter (from any field): validate + submit
- Escape: reset form to empty

---

#### `InlineDropdown.svelte`

**Purpose:** Custom styled dropdown replacing native `<select>` for category and account fields.

**Props:**
- `items` — array of `{ id, name, color?, icon? }`
- `selected` — currently selected item ID (or null)
- `placeholder` — placeholder text when nothing selected
- `onSelect(item)` — callback on selection
- `error` — boolean for error state styling
- `budgetPreview?` — optional budget info for category dropdown (P2)

**States:**

| State | Visual | Trigger |
|-------|--------|---------|
| **Closed (default)** | Shows selected item name or placeholder, chevron icon | — |
| **Closed (focused)** | Sage focus ring | Tab into field |
| **Open** | Dropdown menu below field, items listed | Click or Enter/Space on focused |
| **Open (navigating)** | Active item highlighted with Oat background | Arrow keys |
| **Error** | Terracotta border, no dropdown | Validation failure |

**Keyboard:**
- Enter/Space: open dropdown
- Arrow Up/Down: navigate items
- Enter: select highlighted item + close
- Escape: close without selecting
- Type character: jump to matching item

---

#### `DeletePopover.svelte`

**Purpose:** Inline confirmation popover for transaction deletion.

**Props:**
- `amount` — transaction amount for confirmation text
- `onConfirm()` — callback on delete confirmation
- `onCancel()` — callback on cancel
- `anchorEl` — element to anchor the popover to

**States:**

| State | Visual | Trigger |
|-------|--------|---------|
| **Visible** | White popover with shadow, "Supprimer cette transaction de X € ?", two buttons | Click delete icon in edit mode |
| **Confirming** | Supprimer button briefly disabled | Click Supprimer |

**Keyboard:**
- Escape: cancel (close popover)
- Tab between Supprimer/Annuler buttons

---

### Refactored Components

#### `ExpenseListItem.svelte` (refactored)

**Current:** Read-only display row that triggers a modal on click.
**After:** Dual-mode component — read mode (default) and edit mode (on click).

**Props:**
- `expense` — transaction data object
- `categories` — list of available categories
- `accounts` — list of available accounts
- `isEditing` — boolean, controlled by parent
- `onEdit()` — callback to enter edit mode
- `onSave(data)` — callback with updated data
- `onCancel()` — callback to exit edit mode
- `onDelete()` — callback to trigger delete flow
- `confirmState` — `'idle' | 'saving' | 'confirmed'` for Sage fade

**States:**

| State | Visual | Trigger |
|-------|--------|---------|
| **Read (default)** | Static text, Cotton background | — |
| **Read (hover)** | Oat background, pointer cursor, edit pencil icon | Mouse hover |
| **Edit** | Input fields replace text (same position/font), ✓ ✕ 🗑 actions | Click on row |
| **Edit (error)** | Terracotta border on invalid field(s) | Enter with invalid data |
| **Delete confirming** | Row dimmed (opacity 0.4), DeletePopover visible | Click 🗑 |
| **Saving** | Brief disabled state | Enter in edit mode |
| **Confirmed** | Sage 8% background fade → Cotton over 400ms | Successful save |
| **Deleting** | Row fades out (opacity 0 over 300ms) | Delete confirmed |

**Critical implementation detail:** In read mode, text elements must occupy the exact same position and dimensions as the input fields in edit mode. This ensures zero layout shift during the transition.

---

#### `/expenses/+page.svelte` (refactored)

**New responsibilities:**
- Render `InlineAddRow` at top of table
- Render `ExpenseListItem` for each transaction
- Manage `editingRowId` state (only one row editable at a time)
- Handle optimistic insert/update/delete
- Handle rollback on DB failure
- Trigger `dashboardRefresh` on successful operations

**State management:**

```
editingRowId: string | null  — ID of row in edit mode (null = none)
transactions: Transaction[]  — local list (optimistic updates applied here)
pendingOps: Map<string, 'saving' | 'deleting'>  — tracks in-flight operations
```

### Component Implementation Roadmap

**Phase 1 — Core (MVP):**
1. `InlineAddRow.svelte` — the primary interaction
2. `ExpenseListItem.svelte` refactor — read/edit dual mode
3. `InlineDropdown.svelte` — for category and account
4. `/expenses/+page.svelte` refactor — state management + optimistic UI
5. Delete `AddExpenseModal.svelte` and `EditExpenseModal.svelte`

**Phase 2 — Polish:**
6. `DeletePopover.svelte` — inline delete confirmation
7. Sage fade animation on save confirmation
8. Delete fade-out animation
9. Keyboard flow refinement (Tab order, Enter/Escape)

**Phase 3 — Enhancement (P2):**
10. Budget preview in category dropdown
11. Row re-sort animation when date changes

## UX Consistency Patterns

### Action Hierarchy

| Action type | Pattern | Keyboard | Visual |
|------------|---------|----------|--------|
| **Primary (save/submit)** | Enter key from any field | Enter | Sage ✓ icon button |
| **Secondary (cancel)** | Escape key | Escape | Stone ✕ icon button |
| **Destructive (delete)** | Mouse-only, requires confirmation | — | Terracotta 🗑 icon button |
| **Navigation (edit)** | Click row | — | Oat hover highlight + pencil icon |

**Rule:** Primary and secondary actions are always keyboard-accessible. Destructive actions are intentionally mouse-only to prevent accidents.

### Feedback Patterns

| Event | Feedback | Timing | Visual |
|-------|----------|--------|--------|
| **Save success** | Sage background fade on row | 400ms ease-out | `rgba(99,154,136, 0.08)` → transparent |
| **Form reset** | Fields clear, amount auto-focused | < 50ms | Instant — the reset IS the feedback |
| **Edit mode enter** | Text → inputs, focus ring appears | 150ms ease | Barely perceptible transition |
| **Edit mode cancel** | Inputs → text, instant revert | Instant | No animation — cancel is immediate |
| **Delete confirm** | Row fades out, list adjusts | 300ms ease-out | Opacity 1 → 0 |
| **Validation error** | Terracotta field border + error text | Instant | Focus redirects to first invalid field |
| **DB failure** | Existing app toast pattern (bottom-right) | Standard toast duration | Row reverts to previous state, form re-populated |
| **Row hover** | Oat background highlight | 150ms ease | Pointer cursor + edit pencil in actions column |

**Rule:** Success is silent (implicit in the UI change). Failure speaks (toast + revert). Validation is inline (per-field).

### Form Patterns

**Inline form rules (add row + edit mode):**

| Pattern | Rule |
|---------|------|
| **Required fields** | Amount, Category. Validated on Enter. |
| **Optional fields** | Description. Never blocks submission. |
| **Default values** | Date = today, Account = default account. Pre-filled, skippable. |
| **Validation timing** | On submit only (Enter). Not on blur, not on change. |
| **Error clearing** | Error styling clears as soon as user interacts with the invalid field. |
| **Data preservation** | Validation failure never clears any entered data. |
| **Focus management** | After submit: auto-focus amount (add) or exit edit mode (edit). After error: focus first invalid field. |
| **Tab order** | Date → Amount → Category → Account → Description → Actions. Linear, no skipping. |

### State Management Patterns

| Pattern | Rule |
|---------|------|
| **Single edit mode** | Only one row editable at a time. Clicking another row cancels current edit (no save prompt). |
| **Optimistic updates** | Transaction appears/updates in list immediately. DB sync happens in background. |
| **Rollback on failure** | If DB operation fails: revert row to previous state, show error toast, re-populate form with failed data. |
| **Sort on insert** | New/edited transactions sort into correct chronological position. Within same date: newest at top. |
| **Dashboard sync** | `dashboardRefresh.trigger()` called after successful add/edit/delete. |

### Animation Token Reference

| Animation | Duration | Easing | CSS |
|-----------|----------|--------|-----|
| **Save confirmation fade** | 400ms | ease-out | `background: sage-8 → transparent` |
| **Edit mode transition** | 150ms | ease | `all` properties |
| **Delete fade-out** | 300ms | ease-out | `opacity: 1 → 0` |
| **Row hover** | 150ms | ease | `background-color` |
| **Dropdown open** | 100ms | ease | `opacity: 0 → 1` |
| **Button press** | 100ms | ease | `scale(0.98)` |
| **Error highlight** | Instant | — | Border + text appear immediately |

**Rule:** All animations serve a functional purpose (confirmation, state transition, or feedback). No decorative motion.

## Responsive Design & Accessibility

### Responsive Strategy

**Desktop-only feature.** The inline transaction table is designed exclusively for desktop (1024px+) with a physical keyboard. This is consistent with the existing Budget_planner approach — the app has minimal responsive adaptations (only `sm:` breakpoints on filter layout).

| Breakpoint | Approach |
|------------|----------|
| **Desktop (1024px+)** | Full inline table — primary and only target |
| **Tablet (768-1023px)** | Table renders normally but keyboard flow degrades without physical keyboard. Not optimized. Acceptable. |
| **Mobile (< 768px)** | Out of scope. The existing `/expenses` page has no mobile-specific layout and this feature doesn't change that. |

**Rationale:** The core interaction (Tab/Enter/Escape keyboard flow) requires a physical keyboard. Designing touch-friendly inline editing would be a fundamentally different UX pattern and is not in scope for this feature.

### Breakpoint Implementation

**No new breakpoints needed.** The inline table uses fixed column widths that total ~710px (Date 120 + Amount 100 + Category 150 + Account 130 + Description flex + Actions 80). This fits comfortably at 1024px+ with the 240px sidebar.

| Column | Width | Behavior at 768px |
|--------|-------|-------------------|
| Date | 120px fixed | Same |
| Amount | 100px fixed | Same |
| Category | 150px fixed | Slightly compressed if needed |
| Account | 130px fixed | Same |
| Description | Flex | Absorbs compression |
| Actions | 80px fixed | Same |

### Accessibility Compliance

**Target: WCAG AA** — consistent with existing app standards documented in the parent UX spec.

**Already covered in Visual Foundation (Step 8):**
- Text contrast: Coffee-900 on Cotton/Linen = WCAG AAA compliant
- Focus visibility: Sage ring-2 on all interactive elements
- Error identification: Terracotta border + text (not color-only)
- Touch targets: 48px row height, 32px+ buttons

**Additional inline table accessibility:**

| Requirement | Implementation |
|-------------|---------------|
| **Keyboard-only operation** | Full Tab/Enter/Escape support for all actions. No mouse-only features except delete (intentional safety choice). |
| **Focus management** | Auto-focus on amount after add. Focus redirect to first invalid field on error. Focus trap within edit row. |
| **Screen reader** | `role="grid"` on table, `role="row"` on rows, `aria-label` on action buttons, `aria-invalid` on error fields |
| **Edit mode announcement** | `aria-live="polite"` region announces "Editing transaction" / "Transaction saved" / "Transaction deleted" |
| **Error announcement** | `aria-live="assertive"` for validation errors, `aria-describedby` linking error text to field |
| **Dropdown accessibility** | `role="listbox"` on dropdown, `role="option"` on items, `aria-expanded`, `aria-activedescendant` for keyboard navigation |

### Testing Approach

**For this feature (inline table only):**

| Test type | Scope |
|-----------|-------|
| **Keyboard flow** | Tab order through add row, Enter submit, Escape cancel, edit mode entry/exit |
| **Screen reader** | VoiceOver (macOS) — verify announcements for save, edit, delete, errors |
| **Contrast** | Already verified in Step 8 — all ratios compliant |
| **Browser** | Chrome + Firefox + Safari on macOS (primary use case) |
