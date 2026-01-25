# Story 7.5: Dashboard - Section Coûts variables avec jauges

Status: done

## Story

As a user,
I want to see my variable costs with circular gauges on the dashboard,
So that I can track my adjustable spending with the visual style I love.

## Acceptance Criteria

1. **Given** I am on the dashboard, **When** I have variable categories, **Then** I see a "📊 Coûts variables" section with header showing remaining budget

2. **Given** I view a variable category gauge, **When** I look at it, **Then** I see the same circular gauge design with percentage, category name, amounts, colors, and animations

3. **Given** I have no variable categories, **When** I view the dashboard, **Then** the "Coûts variables" section shows an empty state

4. **Given** the dashboard loads, **When** I have both fixed and variable categories, **Then** the fixed section appears first (compact list) and variable section appears below (circular gauges)

## Tasks / Subtasks

- [ ] **Task 1: Create VariableCostsSection wrapper** (AC: 1, 3)
  - [ ] Create `src/lib/components/dashboard/VariableCostsSection.svelte`
  - [ ] Accept categories array as prop (pre-filtered to type='variable')
  - [ ] Display section header: "📊 Coûts variables"
  - [ ] Display subtitle: "Budget ajustable"
  - [ ] Calculate and display remaining: "X € restant"
  - [ ] Handle empty state: "Aucune catégorie variable définie"

- [ ] **Task 2: Refactor dashboard to use sections** (AC: 4)
  - [ ] Edit `src/routes/+page.svelte`
  - [ ] Separate categories by type:
    ```typescript
    let fixedCategories = $derived(categories.filter(c => c.type === 'fixed'));
    let variableCategories = $derived(categories.filter(c => c.type === 'variable'));
    ```
  - [ ] Render FixedCostsSection first (if any fixed categories)
  - [ ] Render VariableCostsSection below (with existing gauge grid)

- [ ] **Task 3: Preserve existing gauge behavior** (AC: 2)
  - [ ] Keep existing `BudgetGauge.svelte` component unchanged
  - [ ] Keep existing grid layout for gauges
  - [ ] Keep all animations and color progressions
  - [ ] Keep click-to-see-expenses functionality

- [ ] **Task 4: Adjust visual hierarchy** (AC: 4)
  - [ ] Add clear visual separation between sections
  - [ ] Fixed section: muted/neutral background
  - [ ] Variable section: warm background (existing style)
  - [ ] Consistent spacing between sections

## Dev Notes

### Dashboard Layout After Changes

```
┌─────────────────────────────────────────────────────┐
│ [PatrimoineCard]         │  [Budget du mois Card]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🔒 COÛTS FIXES                           870€/mois │
│    Dépenses incompressibles                        │
│ ─────────────────────────────────────────────────── │
│  Loyer .......................... ✓ 800€           │
│  Abonnements .................... 45€/70€          │
│  Payé: 845€ / 870€                                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📊 COÛTS VARIABLES                       580€ dispo│
│    Budget ajustable                                │
│ ─────────────────────────────────────────────────── │
│                                                     │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │  72%   │  │  35%   │  │  28%   │  │  15%   │   │
│  │ Nourr. │  │Sorties │  │Transp. │  │Courses │   │
│  └────────┘  └────────┘  └────────┘  └────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [SavingsCard]            │  [ExpenseBreakdown]      │
└─────────────────────────────────────────────────────┘
```

### Key Points

- **Do NOT modify BudgetGauge.svelte** - it works perfectly for variable categories
- Only reorganize the dashboard layout to separate sections
- The circular gauges remain exactly as they are
- Fixed costs get their own compact list display (Story 7.4)

### Backward Compatibility

- If a user has no categories with type set (during migration), default to showing all as variable
- Empty fixed section = don't show the section at all
- Preserve all existing dashboard functionality

### Architecture Compliance

- Use `$derived` for filtering
- Maintain existing component composition
- Keep dashboard refresh logic working
- Preserve all existing event handlers and subscriptions
