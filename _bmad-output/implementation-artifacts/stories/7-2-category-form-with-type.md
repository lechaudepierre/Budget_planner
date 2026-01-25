# Story 7.2: Formulaire de création de catégorie avec type

Status: done

## Story

As a user,
I want to choose the type (fixed or variable) when creating a category,
So that I can organize my budget by cost type.

## Acceptance Criteria

1. **Given** I am on the Budgets page, **When** I click "Ajouter une catégorie", **Then** a form modal opens with Name, Budget amount, and Type selector fields

2. **Given** I select "Coût fixe", **When** I see the form, **Then** I see helper text: "Dépenses récurrentes et incompressibles (loyer, assurances, abonnements...)"

3. **Given** I select "Coût variable", **When** I see the form, **Then** I see helper text: "Enveloppe budgétaire ajustable selon vos besoins"

4. **Given** I fill the form with valid data, **When** I click "Ajouter", **Then** the category is created with the selected type and a success toast appears

5. **Given** I don't explicitly select a type, **When** I submit the form, **Then** the category defaults to "variable"

## Tasks / Subtasks

- [ ] **Task 1: Add type selector to CategoryForm** (AC: 1, 2, 3)
  - [ ] Edit `src/lib/components/forms/CategoryForm.svelte`
  - [ ] Add radio button group or toggle for type selection:
    - Option 1: "🔒 Coût fixe" 
    - Option 2: "📊 Coût variable" (default selected)
  - [ ] Add reactive helper text based on selection
  - [ ] Style radio buttons to match DaisyUI theme

- [ ] **Task 2: Update form state and validation** (AC: 4, 5)
  - [ ] Add `type` to form state with default 'variable'
  - [ ] Include type in Zod validation
  - [ ] Pass type to `createCategory()` on submit
  - [ ] Handle validation errors for type field

- [ ] **Task 3: Update form submission** (AC: 4)
  - [ ] Ensure type is included in the payload to `createCategory()`
  - [ ] Show success toast with category type mentioned
  - [ ] Reset form including type to default after successful creation

## Dev Notes

### UI Design

```
┌─────────────────────────────────────────────┐
│ Nouvelle catégorie                          │
├─────────────────────────────────────────────┤
│                                             │
│ Nom de la catégorie                         │
│ ┌─────────────────────────────────────────┐ │
│ │ ex: Nourriture, Loyer, Abonnements     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Budget mensuel                              │
│ ┌─────────────────────────────────────────┐ │
│ │ 0 €                                     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Type de catégorie                           │
│ ○ 🔒 Coût fixe                              │
│   Dépenses récurrentes et incompressibles   │
│   (loyer, assurances, abonnements...)       │
│                                             │
│ ● 📊 Coût variable                          │
│   Enveloppe budgétaire ajustable            │
│   selon vos besoins                         │
│                                             │
│         [Annuler]  [Ajouter]                │
└─────────────────────────────────────────────┘
```

### Helper Text Strings

```typescript
const helperTexts = {
  fixed: "Dépenses récurrentes et incompressibles (loyer, assurances, abonnements...)",
  variable: "Enveloppe budgétaire ajustable selon vos besoins"
};
```

### Architecture Compliance

- Follow existing form patterns in `GoalForm.svelte`, `AccountForm.svelte`
- Use Svelte 5 runes (`$state`, `$derived`)
- DaisyUI radio button styling
- Zod validation integration
