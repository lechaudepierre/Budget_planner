# Story 7.3: Page Budgets - Sections séparées

Status: backlog

## Story

As a user,
I want to see my fixed and variable categories in separate sections on the Budgets page,
So that I can clearly see what I can and cannot adjust.

## Acceptance Criteria

1. **Given** I am on the Budgets page, **When** I have both fixed and variable categories, **Then** I see two distinct sections with headers and subtitles

2. **Given** I view the "Coûts fixes" section, **When** I have fixed categories, **Then** I see them listed with their allocated budget and total

3. **Given** I view the "Coûts variables" section, **When** I have variable categories, **Then** I see them with their allocated budget and total

4. **Given** I click "Ajouter une catégorie", **When** the modal opens, **Then** I can choose the type in the form and after saving it appears in the correct section

5. **Given** I click on a category to edit, **When** I change its type, **Then** it moves to the other section after saving

6. **Given** I have no categories in one section, **When** I view that section, **Then** I see an empty state with encouraging text

## Tasks / Subtasks

- [ ] **Task 1: Restructure Budgets page layout** (AC: 1, 2, 3)
  - [ ] Edit `src/routes/budgets/+page.svelte`
  - [ ] Group categories by type using `$derived`:
    ```typescript
    let fixedCategories = $derived(categories.filter(c => c.type === 'fixed'));
    let variableCategories = $derived(categories.filter(c => c.type === 'variable'));
    ```
  - [ ] Create two section containers with distinct styling

- [ ] **Task 2: Create section headers** (AC: 1)
  - [ ] Add "🔒 Coûts fixes" section header
    - Subtitle: "Dépenses récurrentes et incompressibles"
  - [ ] Add "📊 Coûts variables" section header
    - Subtitle: "Enveloppes budgétaires ajustables"
  - [ ] Style headers consistently with app design

- [ ] **Task 3: Add section totals** (AC: 2, 3)
  - [ ] Calculate and display total for fixed categories
  - [ ] Calculate and display total for variable categories
  - [ ] Format as "Total: X €"

- [ ] **Task 4: Handle empty states** (AC: 6)
  - [ ] Create empty state for fixed section:
    "Aucun coût fixe défini. Ajoutez vos dépenses récurrentes comme le loyer ou les abonnements."
  - [ ] Create empty state for variable section:
    "Aucune catégorie variable. Créez des enveloppes pour gérer vos dépenses courantes."

- [ ] **Task 5: Single "Add" button behavior** (AC: 4)
  - [ ] Keep single "Ajouter une catégorie" button at top of page
  - [ ] Form includes type selector (from Story 7.2)
  - [ ] After creation, category appears in correct section reactively

- [ ] **Task 6: Category type change handling** (AC: 5)
  - [ ] When editing a category, type change triggers re-render
  - [ ] Category moves to correct section after save
  - [ ] Smooth visual transition (optional)

## Dev Notes

### Page Layout

```
┌─────────────────────────────────────────────────────┐
│ Budgets                    [+ Ajouter une catégorie]│
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🔒 COÛTS FIXES                                      │
│ Dépenses récurrentes et incompressibles             │
│ ─────────────────────────────────────────────────── │
│ ┌───────────────┐ ┌───────────────┐                │
│ │ Loyer         │ │ Abonnements   │                │
│ │ 800 €         │ │ 70 €          │                │
│ │ [Modifier]    │ │ [Modifier]    │                │
│ └───────────────┘ └───────────────┘                │
│                          Total coûts fixes: 870 €   │
│                                                     │
│ ─────────────────────────────────────────────────── │
│                                                     │
│ 📊 COÛTS VARIABLES                                  │
│ Enveloppes budgétaires ajustables                   │
│ ─────────────────────────────────────────────────── │
│ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐│
│ │ Nourriture    │ │ Sorties       │ │ Transport   ││
│ │ 400 €         │ │ 200 €         │ │ 150 €       ││
│ │ [Modifier]    │ │ [Modifier]    │ │ [Modifier]  ││
│ └───────────────┘ └───────────────┘ └─────────────┘│
│                       Total coûts variables: 750 €  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Styling Notes

- Fixed section: slightly muted background (neutral gray tint)
- Variable section: warm background (current style)
- Both sections use consistent card components
- Section headers use larger font with emoji icons

### Architecture Compliance

- Use `$derived` for filtering (Svelte 5 runes)
- Reuse existing category card components
- Maintain existing edit/delete functionality
- Follow page layout patterns from `/patrimoine` and `/epargne`
