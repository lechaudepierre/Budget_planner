---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
status: 'complete'
completedAt: '2026-02-08'
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-Budget_planner-2026-01-21.md'
  - '_bmad-output/planning-artifacts/prd.md'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 1
workflowType: 'prd'
scope: 'targeted-feature'
parentPrd: '_bmad-output/planning-artifacts/prd.md'
classification:
  projectType: 'PWA (PC-first)'
  domain: 'Personal Finance'
  complexity: 'Low'
  projectContext: 'Brownfield - Feature Enhancement'
techStack:
  frontend: 'SvelteKit (Svelte 5)'
  ui: 'Tailwind CSS + DaisyUI'
  backend: 'Supabase (PostgreSQL)'
  auth: 'Google OAuth'
---

# Product Requirements Document - Inline Transaction UX

**Author:** Pierrelechaude
**Date:** 2026-02-08

## Executive Summary

### Vision

Remplacer le systeme modal/popup de gestion des transactions par une interface inline type tableur directement sur la page `/expenses`. L'objectif est de preserver le contexte (voir la liste pendant l'ajout), d'accelerer la saisie, et d'assurer une coherence UX entre l'ajout et l'edition.

### Scope

Ce PRD cible uniquement le **remplacement de l'UX des transactions** (ajout + edition + suppression). Aucun changement backend, aucun nouveau modele de donnees. Meme validation, meme API, nouveau pattern d'interaction.

### Components Affected

| Component | Action |
|-----------|--------|
| `/src/routes/expenses/+page.svelte` | Major refactor — replace modal triggers with inline table |
| `/src/lib/components/expense/AddExpenseModal.svelte` | DELETE |
| `/src/lib/components/expense/EditExpenseModal.svelte` | DELETE |
| `/src/lib/components/expense/ExpenseListItem.svelte` | Major refactor — add edit mode, click handlers |
| New: Inline add row component | CREATE |
| `/src/lib/data/expenses.ts` | No changes (same API) |
| `/src/lib/schemas/expense.ts` | No changes (same validation) |

## Success Criteria

### User Success

**The "Aha" Moment:**
> "I can see my transaction history while I'm adding a new one — no more blind popup."

| Criteria | Metric | Target |
|----------|--------|--------|
| **Context preservation** | User sees existing transactions while adding new ones | 100% — list always visible during add |
| **Entry speed** | Time to add a single transaction (from first click to saved) | < 15 seconds (vs ~25-30s with popup) |
| **Flow continuity** | No page overlay, no modal, no context switch | Zero modals in the transaction workflow |
| **Consistency** | Add and Edit use the same inline interaction pattern | Same UX pattern for both actions |
| **Intuitive editing** | User understands how to edit by clicking a row | No tutorial needed — discoverable on first use |

### Business Success

*Personal project — no traditional business metrics.*

| Criteria | Indicator |
|---------|-----------|
| **Satisfaction** | "This feels like MY tool, not a generic app" |
| **Habit reinforcement** | Inline UX doesn't break existing daily entry habit |
| **Design coherence** | New UX feels native to existing Budget_planner aesthetic |

### Technical Success

| Criteria | Target | Why |
|---------|--------|-----|
| **No backend changes** | Zero new API endpoints or DB schema changes | Same data model, different UI |
| **Save latency** | < 500ms (same as current) | No regression |
| **Keyboard navigation** | Tab between fields, Enter to submit | Spreadsheet-like efficiency |
| **Validation parity** | Same Zod validation as current popup | No regression on data integrity |

### Measurable Outcomes

**Immediate (day 1):**
- Inline add row visible and functional on `/expenses` page
- All popup modals removed from transaction workflow
- Edit via row click works seamlessly

**Short-term (1 week):**
- Daily entry habit maintained or improved
- No usability complaints or confusion

## Product Scope

### MVP — This PRD

| Feature | Priority | Description |
|---------|----------|-------------|
| **Inline add row** | P0 — Must have | Persistent form row at top of transaction list with dropdowns, date picker, input fields |
| **Inline edit** | P0 — Must have | Click existing row → fields become editable in-place, same pattern as add |
| **Inline delete** | P0 — Must have | Delete action accessible from edit mode (with confirmation) |
| **Keyboard navigation** | P1 — Important | Tab between fields, Enter to submit, Escape to cancel edit |
| **Budget preview (subtle)** | P2 — Nice to have | Small indicator on category select — compact, non-intrusive |
| **Remove old modals** | P0 — Must have | Delete AddExpenseModal.svelte and EditExpenseModal.svelte |

### Growth Features (Post-MVP)

- Bulk actions (select multiple → delete/recategorize)
- Inline duplicate (one-click copy of a previous transaction)
- Quick filters combined with inline add for category-specific entry

### Vision (Future)

- Keyboard-only "power user" mode
- Smart suggestions based on recent transactions
- Auto-categorization from description text

## User Journeys

### Journey 1: Daily Entry — The Happy Path

**Opening Scene:**
Mardi soir, 21h. Pierrelechaude ouvre `/expenses` pour entrer ses 3-4 depenses du jour. La page affiche directement la liste de ses transactions recentes avec une **ligne de saisie vide en haut**, prete a etre remplie.

**Rising Action:**
1. Le curseur est deja dans le champ montant (auto-focus). Il tape `12`, Tab vers categorie, selectionne "Resto" dans le dropdown, Tab — la date est deja a aujourd'hui, Tab — il tape "Dejeuner" en description, Enter.
2. La transaction apparait instantanement dans la liste en dessous. La ligne de saisie se vide, prete pour la suivante.
3. Il enchaine : `2` → Transport → Enter. `8.50` → Courses → "Pain, lait" → Enter.
4. Trois transactions en ~45 secondes. Il voit la liste complete se mettre a jour en temps reel.

**Climax:**
Pas de popup ouvert-ferme-ouvert-ferme. Pas de perte de contexte. Il voit ses transactions du jour se construire sous ses yeux, intercalees avec celles des jours precedents.

**Resolution:**
"C'est fait." Il jette un oeil aux montants dans la liste, tout est la. Il retourne au dashboard.

### Journey 2: Correction d'erreur — Inline Edit

**Opening Scene:**
Pierrelechaude remarque dans sa liste qu'il a entre "15€" pour un dejeuner qui coutait en fait 13.50€.

**Rising Action:**
1. Il clique sur la ligne de la transaction erronee.
2. La ligne se transforme : les textes statiques deviennent des champs editables (meme pattern que la ligne d'ajout). Le montant, la categorie, la date, la description — tout est modifiable.
3. Il corrige le montant : `13.50`, Enter.
4. La ligne repasse en mode lecture, mise a jour instantanement.

**Climax:**
Zero popup. Zero navigation. Le changement est fait *la ou il regarde*, dans le contexte de la liste.

**Resolution:**
Il continue a scroller sa liste, confiant que tout est correct.

### Journey 3: Suppression — Edge Case

**Opening Scene:**
Pierrelechaude a entre une transaction en double par erreur.

**Rising Action:**
1. Il clique sur la ligne dupliquee → elle passe en mode edition.
2. Un bouton/icone "Supprimer" est visible (discret mais accessible).
3. Il clique → une confirmation inline ou un petit popover apparait : "Supprimer cette transaction de 12€ ?"
4. Il confirme → la ligne disparait avec une animation subtile.

**Climax:**
Suppression sans quitter la page, sans popup plein ecran. Juste une confirmation rapide et c'est fait.

**Resolution:**
La liste se reajuste. Le doublon a disparu.

### Journey 4: Echec de validation — Error Recovery

**Opening Scene:**
Pierrelechaude oublie de selectionner une categorie en remplissant la ligne d'ajout.

**Rising Action:**
1. Il tape un montant, laisse la categorie vide, appuie sur Enter.
2. Le champ categorie se met en rouge avec un message discret : "Categorie requise".
3. Il selectionne la categorie dans le dropdown, Enter.
4. La transaction est sauvegardee.

**Climax:**
La validation est inline — pas de popup d'erreur, pas de formulaire qui se ferme et perd les donnees. Le focus est redirige vers le champ problematique.

**Resolution:**
Correction rapide, zero frustration, zero perte de donnees saisies.

### Journey Requirements Summary

| Journey | Capabilities revelees |
|---------|----------------------|
| **Daily Entry** | Inline add row, auto-focus, Tab navigation, Enter to submit, auto-reset, real-time list update |
| **Inline Edit** | Row click → edit mode, same field pattern as add, Enter to save, Escape to cancel |
| **Suppression** | Delete action in edit mode, inline confirmation, animated removal |
| **Error Recovery** | Inline field validation, error highlighting, focus redirect, no data loss |

## Web App (PWA) Specific Requirements

### Project-Type Overview

This feature operates within the existing Budget_planner PWA architecture. No changes to the overall web app configuration — same SvelteKit SPA, same browser support, same hosting.

### Technical Architecture Considerations

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Rendering** | SPA — no page refresh on add/edit/delete | Inline UX requires seamless DOM updates |
| **State update** | Optimistic UI | Transaction appears instantly in list, syncs to Supabase in background |
| **Error rollback** | Auto-revert on failure | If DB save fails, row reverts to previous state + error toast |
| **Browser support** | Chrome/Firefox/Safari/Edge 90+ | Unchanged from existing app |
| **SEO** | N/A | Authenticated personal app |
| **Accessibility** | Standard personnel | Keyboard navigation (Tab/Enter/Escape), visible focus states |

### Optimistic UI Pattern

1. User submits inline row → transaction immediately inserted into local list state
2. Async call to `createExpense()` / `updateExpense()` fires in background
3. **On success:** row confirmed, `dashboardRefresh.trigger()` called
4. **On failure:** row removed/reverted from list, error toast displayed, form re-populated with the failed data so user can retry without re-typing

### Performance Targets

*Note: Authoritative performance targets are defined in the Non-Functional Requirements section (NFR1-NFR6).*

| Metric | Target | Context |
|--------|--------|---------|
| **Perceived save time** | < 50ms (optimistic) | Row appears instantly |
| **Actual DB save** | < 500ms | Same as current modal |
| **List re-render** | < 16ms (single frame) | Svelte 5 reactive updates |
| **Edit mode transition** | < 100ms | Click → editable fields |

### Responsive Design

| Breakpoint | Approach |
|------------|----------|
| Desktop (1024px+) | Full inline table with all columns visible — primary target |
| Tablet (768-1023px) | Same layout, slightly compressed columns |
| Mobile (< 768px) | Not a concern for this feature — desktop-first |

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Optimistic UI desync** | Low | Medium | Rollback pattern with error toast + form re-population |
| **Inline edit click conflicts with row selection** | Medium | Low | Clear visual distinction between read/edit modes, cursor change on hover |
| **Keyboard trap in inline fields** | Low | Low | Escape always cancels and returns to read mode |
| **Budget preview takes too much space** | Low | Low | Implement as tiny tooltip/badge, easy to remove if cluttered |
| **Loss of budget preview detail** | Low | Low | Dashboard gauges remain the primary budget tracking — inline preview is supplementary |

## Functional Requirements

### Inline Transaction Entry

- **FR1:** User can add a new transaction directly from a persistent inline form row at the top of the transaction list
- **FR2:** User can enter transaction amount via an inline input field
- **FR3:** User can select a transaction category via an inline dropdown
- **FR4:** User can select a source account via an inline dropdown
- **FR5:** User can set the transaction date via an inline date picker (defaults to today)
- **FR6:** User can enter an optional description via an inline text field
- **FR7:** User can submit the inline form by pressing Enter
- **FR8:** System resets the inline add row to empty state after successful submission
- **FR9:** System auto-focuses the amount field after form reset for rapid consecutive entry

### Inline Transaction Editing

- **FR10:** User can enter edit mode on any existing transaction by clicking its row
- **FR11:** User can modify any field of a transaction in edit mode (amount, category, account, date, description)
- **FR12:** User can save edits by pressing Enter
- **FR13:** User can cancel edits by pressing Escape, reverting to original values
- **FR14:** System displays only one row in edit mode at a time (clicking another row cancels the current edit)

### Inline Transaction Deletion

- **FR15:** User can access a delete action from a transaction in edit mode
- **FR16:** System displays an inline confirmation before deleting a transaction
- **FR17:** User can confirm or cancel the deletion
- **FR18:** System removes the deleted transaction from the list with a visual transition

### Keyboard Navigation

- **FR19:** User can navigate between inline form fields using Tab (forward) and Shift+Tab (backward)
- **FR20:** User can submit a form with Enter in any field
- **FR21:** User can cancel an edit with Escape from any field

### Optimistic UI & Data Sync

- **FR22:** System inserts new transactions into the list immediately on submission (before DB confirmation)
- **FR23:** System updates edited transactions in the list immediately on save (before DB confirmation)
- **FR24:** System reverts a transaction to its previous state if the DB operation fails
- **FR25:** System re-populates the form with failed data so user can retry without re-typing
- **FR26:** System displays an error toast when a DB operation fails
- **FR27:** System triggers a dashboard refresh after successful transaction operations

### Inline Validation

- **FR28:** System validates all fields inline before submission (same rules as current: amount required & positive, category required, date required)
- **FR29:** System highlights invalid fields with error styling and a concise error message
- **FR30:** System redirects focus to the first invalid field on validation failure
- **FR31:** System preserves all entered data when validation fails (no data loss)

### Visual States & Feedback

- **FR32:** System visually distinguishes the add row from existing transaction rows
- **FR33:** System visually distinguishes a row in edit mode from rows in read mode
- **FR34:** System provides hover feedback on clickable transaction rows (cursor change, highlight)
- **FR35:** System provides visual confirmation when a transaction is saved (brief row highlight or animation)

### Existing Functionality Preservation

- **FR36:** User can filter transactions by category (unchanged)
- **FR37:** User can filter transactions by date range (unchanged)
- **FR38:** User can load more transactions via pagination (unchanged)
- **FR39:** System displays transaction count and total spent summary (unchanged)

## Non-Functional Requirements

### Performance

| ID | Requirement | Target | Justification |
|----|-------------|--------|---------------|
| **NFR1** | Optimistic insert appears in list | < 50ms after Enter | Instant feel — user must not perceive any delay |
| **NFR2** | Row transition to edit mode on click | < 100ms | Edit mode must feel like a direct manipulation, not a loading state |
| **NFR3** | Form reset after successful submit | < 50ms | Ready for next entry immediately |
| **NFR4** | DB save completes in background | < 500ms | No regression from current modal performance |
| **NFR5** | Rollback on DB failure | < 200ms after failure detected | User sees revert quickly, not stuck in limbo |
| **NFR6** | List re-render after add/edit/delete | < 16ms (single frame at 60fps) | Svelte 5 reactive updates, no visible jank |

### Usability

| ID | Requirement | Target | Justification |
|----|-------------|--------|---------------|
| **NFR7** | Visual distinction between add row, read rows, and edit rows | Immediately obvious without instructions | No ambiguity about what state a row is in |
| **NFR8** | Error states visible without scrolling | Error shown on the field itself | Inline validation, no popup or distant error summary |
| **NFR9** | Consistent with existing Budget_planner design language | Uses same DaisyUI components, color palette (terracotta accents), and spacing | New feature must feel native, not bolted on |
| **NFR10** | Keyboard-only operation possible for add flow | Tab + Enter workflow completes full transaction entry | Power user efficiency |
