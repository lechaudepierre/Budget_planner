---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
status: 'complete'
completedAt: '2026-01-22'
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-Budget_planner-2026-01-21.md'
  - '_bmad-output/analysis/brainstorming-session-2026-01-21.md'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
workflowType: 'prd'
classification:
  projectType: 'PWA (PC-first, mobile-ready)'
  domain: 'Personal Finance'
  complexity: 'Low-Medium'
  projectContext: 'Greenfield'
techStack:
  frontend: 'SvelteKit'
  ui: 'Tailwind CSS + DaisyUI'
  backend: 'Supabase (PostgreSQL + Auth + Realtime)'
  auth: 'Google OAuth'
  hosting: 'Vercel/Netlify (gratuit)'
  offline: 'LocalStorage buffer + sync'
mvpDecisions:
  gauges: 'Custom animées (MVP) - priorité design motivationnel'
  expenseEntry: 'Page dédiée simple'
  designPriority: 'Simple, beau, customisable, motivant'
---

# Product Requirements Document - Budget_planner

**Author:** Pierrelechaude
**Date:** 2026-01-22

## Executive Summary

### Vision

Budget_planner offre un **sentiment de contrôle et de clarté financière** - pas un tracker froid. L'app transforme la gestion de budget en jeu de précision motivant plutôt qu'en exercice culpabilisant.

### Product Differentiator

> "Jauges > 100% = Data, pas échec"

L'app ne juge pas les dépassements - elle les affiche comme des données d'apprentissage. Cette philosophie "sans culpabilité" est le coeur de l'expérience utilisateur.

### Target User

Jeune actif souhaitant prendre le contrôle de ses finances avant d'avoir un "vrai" salaire. Vérifie ses comptes ponctuellement sans méthode, veut passer à une gestion proactive.

### Tech Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | SvelteKit (PWA) |
| UI | Tailwind CSS + DaisyUI |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Auth | Google OAuth |
| Hosting | Vercel/Netlify (gratuit) |

### MVP Success Indicator

Usage régulier pendant 1 mois avec sentiment de clarté financière = succès.

## Success Criteria

### User Success

**Le "Aha Moment":**
> Le moment où les jauges de fin de mois correspondent à ce que tu avais prédit - la satisfaction d'avoir respecté tes propres budgets.

**Indicateurs de succès utilisateur:**

| Métrique | Indicateur de succès | Mesure |
|----------|---------------------|--------|
| **Précision de prédiction** | Jauges finales proches des budgets définis | Écart < 10-15% sur les catégories principales |
| **Adoption complète** | Toutes les dépenses trackées | 100% des transactions entrées |
| **Régularité** | Usage naturel intégré au quotidien | Entrée tous les 1-3 jours |
| **Sentiment de contrôle** | "Je sais où va mon argent" | Auto-évaluation positive |
| **Apprentissage** | Budgets de plus en plus réalistes | Amélioration mois après mois |

**Indicateur ultime:** *"Je suis content, ça fonctionne, et mes jauges reflètent ma réalité."*

### Business Success

*Note: Projet personnel, pas de métriques business traditionnelles.*

| Critère | Indicateur |
|---------|------------|
| **Valeur personnelle** | L'app fait partie de ta routine financière |
| **ROI temps** | 30min/mois de planning = clarté mentale toute l'année |
| **Évolution** | Envie d'ajouter des features = signe que ça marche |

### Technical Success

| Critère | Cible | Pourquoi |
|---------|-------|----------|
| **Temps de chargement** | < 2 secondes | App fluide, pas de frustration |
| **Réactivité UI** | Instantané (< 100ms) | Interactions agréables |
| **Sync fiable** | 0 perte de données | Confiance totale |
| **Disponibilité** | 99%+ uptime | Toujours accessible |

### Measurable Outcomes

**Court terme (1 mois) - MVP Success:**
- Usage quotidien/régulier établi
- 100% des dépenses entrées
- Au moins 1 savings goal actif
- Première session de planning mensuel complétée
- Sentiment: "Je vois où va mon argent"

**Moyen terme (3 mois):**
- Budgets calibrés de manière réaliste (écart < 15%)
- Patterns de dépenses identifiés
- Savings goals en progression visible
- Sentiment de contrôle installé

**Long terme (6-12 mois):**
- Transformation comportementale mesurable
- Patrimoine en croissance
- L'app = routine naturelle
- Capacité à prédire ses fins de mois avec précision

## Product Scope

### MVP - Minimum Viable Product

**Core Features (must have):**
1. Vision patrimoine global (tous les comptes)
2. Budgets par catégorie avec jauges custom animées
3. Entrée manuelle des dépenses (page dédiée)
4. Catégories personnalisables
5. Savings goals avec jauges animées qui montent
6. Monthly recap (comparaison budget vs réel)
7. Dépenses fixes / abonnements
8. Projections d'épargne simples
9. Auth Google + Sync cross-device (Supabase)

**Design Requirement:**
> Les jauges doivent être *belles et motivantes* - animations fluides, couleurs qui évoluent avec le remplissage, micro-feedback visuel aux seuils clés.

### Growth Features (Post-MVP)

- Quick-add modal pour entrée rapide
- Alertes visuelles aux seuils (50%, 75%, 100%)
- Notes sur les dépenses
- Gestion intelligente des imprévus (3 niveaux)
- Full offline mode

### Vision (Future)

- Super-catégories flexibles
- Tracking valeur des actifs (compte-titres)
- Yearly overview et analytics avancés
- Version mobile optimisée (si PWA insuffisante)

## User Journeys

### Journey 1: Premier Contact (Onboarding = Setup Mensuel)

**Contexte:** Pierrelechaude ouvre Budget_planner pour la première fois.

**Opening Scene:**
L'écran affiche un dashboard vide mais accueillant - les jauges sont à zéro, prêtes à être remplies. Pas de tutorial intrusif, juste l'app qui attend d'être configurée.

**Rising Action:**

1. **PATRIMOINE**
   - Ajoute ses comptes (Courant: 1200€, Épargne: 3000€, Titres: 500€)
   - Voit son patrimoine total apparaître: 4700€
   - Premier sentiment de clarté

2. **REVENUS DU MOIS**
   - Entre son argent de poche/salaire mensuel: 800€
   - C'est le montant qu'il va répartir

3. **CATÉGORIES & BUDGETS**
   - Crée/ajuste ses catégories (Courses, Resto, Sorties, Transport, Vêtements...)
   - Alloue des montants à chaque jauge
   - Les jauges s'initialisent à 0% - prêtes à être remplies

4. **SAVINGS GOALS**
   - Définit au moins un objectif (ex: "Vacances été" - 500€)
   - Alloue une partie du revenu vers l'épargne
   - La jauge savings commence à monter

**Climax:**
Le dashboard prend vie - toutes les jauges sont configurées, le patrimoine est visible, les budgets sont définis. Pour la première fois, Pierrelechaude voit exactement combien il peut dépenser dans chaque catégorie ce mois-ci.

**Resolution:**
"Ok, j'ai 150€ pour les sorties ce mois. Je sais où j'en suis." Setup terminé en ~20-30 min. L'app est prête pour le tracking quotidien.

**Différence Mois 1 vs Mois N:**

| Aspect | Mois 1 | Mois suivants |
|--------|--------|---------------|
| Données passées | Aucune | Recap du mois précédent visible |
| Budgets | Estimation "au feeling" | Ajustement basé sur le réel |
| Durée setup | ~30 min | ~15-20 min |
| Confiance | "On verra bien" | "Je sais que X€ suffit pour Y" |

### Journey 2: Routine Quotidienne (Entrée des dépenses)

**Contexte:** Mardi soir, 21h. Pierrelechaude rentre chez lui après une journée normale.

**Opening Scene:**
Il ouvre l'app pour entrer ses dépenses de la journée.

**Rising Action:**

1. Ouvre l'app → Dashboard apparaît immédiatement
   - Voit ses jauges actuelles en un coup d'œil
   - "Resto est à 60%, ça va"

2. Va sur la page d'entrée de dépenses
   - Entre: "Déjeuner" - 12€ - Catégorie: Resto
   - Entre: "Métro" - 2€ - Catégorie: Transport

3. Retour au dashboard
   - Les jauges se sont mises à jour
   - Animation fluide du remplissage
   - Resto passe de 60% à 68%

**Climax:**
En 2 minutes, c'est fait. Les jauges reflètent sa réalité. Il sait exactement où il en est.

**Resolution:**
Pierrelechaude ferme l'app avec un sentiment de contrôle. Pas de stress, pas d'incertitude. Il sait qu'il lui reste ~50€ de budget resto pour les 2 prochaines semaines.

### Journey 3: Dépassement de Budget (Edge Case)

**Contexte:** Vendredi soir, invitation surprise pour un anniversaire au restaurant.

**Opening Scene:**
Pierrelechaude sait que son budget "Sorties" est déjà à 85%.

**Rising Action:**

1. Check rapide avant de sortir
   - Ouvre l'app, regarde la jauge Sorties: 85%
   - Budget restant: 22€
   - Le resto va coûter ~35€

2. Décision consciente
   - Il y va quand même (c'est un anniv!)
   - Rentre la dépense le lendemain: 38€

3. La jauge dépasse 100%
   - Sorties: 112%
   - Jauge devient orange/rouge (feedback visuel)
   - MAIS pas de message culpabilisant

**Climax:**
La jauge à 112% n'est pas un échec - c'est une donnée. L'app ne juge pas, elle informe. Pierrelechaude voit clairement l'impact de sa décision.

**Resolution:**
"Ok, j'ai dépassé de 18€ sur Sorties. Le mois prochain, soit j'augmente ce budget, soit je fais plus attention." C'est de l'apprentissage, pas de la culpabilité.

### Journey 4: Fin de Mois Réussie (Le "Aha Moment")

**Contexte:** 30 du mois, soir. Session de review mensuelle.

**Opening Scene:**
Pierrelechaude ouvre l'app pour sa session de review mensuelle.

**Rising Action:**

1. Vue du Monthly Recap
   - Toutes les jauges affichées avec leur % final
   - Courses: 94% ✓
   - Resto: 102% (léger dépassement)
   - Sorties: 112% (le fameux anniv)
   - Transport: 78% ✓
   - Vêtements: 45% (sous-utilisé)

2. Analyse des patterns
   - "Ah, j'ai moins dépensé en vêtements que prévu"
   - "Resto et Sorties, c'est tight"

3. Savings Goal Progress
   - Vacances été: 85€ ajoutés ce mois
   - Jauge: 17% → 34%
   - Projection: "À ce rythme, objectif atteint en juillet"

**Climax (Le Aha Moment):**
Les jauges correspondent à peu près à ce qu'il avait prédit. Il a respecté la majorité de ses budgets. Le système fonctionne.

**Resolution:**
"Je sais exactement où est allé mon argent ce mois-ci. Et je vois mon épargne grandir." Sentiment de contrôle et de clarté - exactement ce que l'app promettait.

### Journey Requirements Summary

| Journey | Capabilities révélées |
|---------|----------------------|
| **Onboarding/Setup** | Gestion comptes, Config budgets, Allocation revenus, Savings goals |
| **Routine quotidienne** | Dashboard rapide, Entrée dépenses, Jauges temps réel |
| **Dépassement budget** | Feedback visuel >100%, Pas de jugement, Données apprentissage |
| **Fin de mois** | Monthly recap, Comparaison budget/réel, Progression savings, Projections |

## Web App (PWA) Specific Requirements

### Project-Type Overview

Budget_planner est une **Progressive Web App (PWA)** conçue pour:
- Fonctionner comme une app native sur PC et mobile
- Être installable sur l'écran d'accueil
- Offrir une expérience fluide et moderne
- Synchroniser en temps réel entre appareils

### Technical Architecture

**Stack confirmé:**

| Couche | Technologie |
|--------|-------------|
| Frontend | SvelteKit (PWA) |
| UI | Tailwind CSS + DaisyUI |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Auth | Google OAuth |
| Hosting | Vercel ou Netlify (gratuit) |
| Offline | LocalStorage buffer + sync |

### Browser Support

| Browser | Version minimum | Support |
|---------|-----------------|---------|
| Chrome | 90+ | Complet |
| Firefox | 90+ | Complet |
| Safari | 14+ | Complet |
| Edge | 90+ | Complet |
| IE | Toutes | Non supporté |

**Note:** Navigateurs modernes uniquement. Pas de polyfills ni de fallbacks pour vieux navigateurs.

### Responsive Design

| Breakpoint | Cible | Priorité |
|------------|-------|----------|
| Desktop (1024px+) | PC - usage principal | Primary |
| Tablet (768-1023px) | iPad, tablettes | Secondary |
| Mobile (< 768px) | Téléphone | Secondary (v1.1) |

**Approche:** PC-first design, responsive pour mobile mais pas optimisé mobile-first.

### Performance Targets

| Métrique | Cible | Justification |
|----------|-------|---------------|
| First Contentful Paint | < 1.5s | Dashboard rapide |
| Time to Interactive | < 2s | Entrée dépenses immédiate |
| Lighthouse Performance | > 90 | App fluide |
| Bundle size | < 200KB gzipped | Chargement rapide |

### SEO Strategy

**Non applicable** - Application personnelle, pas indexée par les moteurs de recherche.

### Accessibility Level

**Niveau: Standard personnel**

- Contraste suffisant pour lecture confortable
- Navigation clavier basique
- Focus sur design clair, précis, stylé et motivant
- Pas de compliance WCAG stricte requise

### PWA Features

| Feature | MVP | Futur |
|---------|-----|-------|
| Installable | Oui | - |
| Offline read | Oui | - |
| Offline write | LocalStorage + sync au retour online | Background sync (app fermée) |
| Push notifications | Non | Peut-être v2 |

### Data Persistence

**Flux de sauvegarde:**
1. Écriture dans localStorage (instantané, jamais perdu)
2. Sync vers Supabase (PostgreSQL) immédiatement si online
3. Si offline, sync automatique au retour de la connexion
4. Données disponibles sur tous les appareils connectés

**Garantie:** Aucune perte de données - toujours sauvegardé localement en premier.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP

L'objectif n'est pas juste de "tracker des dépenses" - c'est de livrer le **sentiment de contrôle et de clarté** dès le premier mois d'utilisation.

**Resource Requirements:** Solo developer avec assistance AI

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Onboarding / Setup mensuel
- Routine quotidienne (entrée dépenses)
- Dépassement de budget (feedback visuel)
- Fin de mois (recap et analyse)

**Must-Have Capabilities (par priorité):**

| Priorité | Feature | Effort estimé |
|----------|---------|---------------|
| P0 - Core | Dashboard avec jauges custom animées | Élevé |
| P0 - Core | Page d'entrée des dépenses | Moyen |
| P0 - Core | Catégories personnalisables | Faible |
| P1 - Essential | Gestion des comptes (patrimoine) | Moyen |
| P1 - Essential | Savings goals avec jauges | Moyen |
| P1 - Essential | Monthly recap | Moyen |
| P2 - Important | Auth Google OAuth | Faible (Supabase) |
| P2 - Important | Sync cross-device | Faible (Supabase) |
| P2 - Important | Projections d'épargne | Faible |
| P3 - Si temps | Dépenses fixes / Abonnements | Faible |

### Post-MVP Features

**Phase 2 (Growth - après 1-2 mois d'usage):**
- Quick-add modal pour entrée rapide
- Alertes visuelles aux seuils (50%, 75%, 100%)
- Notes sur les dépenses
- Gestion intelligente des imprévus (3 niveaux)
- Full offline mode avec background sync

**Phase 3 (Vision - après 6+ mois):**
- Super-catégories flexibles
- Tracking valeur des actifs (compte-titres)
- Yearly overview et analytics avancés
- Optimisation mobile (si PWA insuffisante)

### Risk Mitigation Strategy

| Risque | Mitigation |
|--------|------------|
| **Jauges animées complexes** | Commencer avec version simple, itérer sur le design |
| **Temps de dev sous-estimé** | P3 features sont cuttables |
| **Supabase learning curve** | Docs excellentes, communauté active |
| **Design pas assez "motivant"** | Itérer basé sur usage réel |

## Functional Requirements

### Account & Patrimoine Management

- **FR1:** User can add a bank account with name, type, and current balance
- **FR2:** User can edit an existing account's details
- **FR3:** User can delete an account
- **FR4:** User can view total patrimoine (sum of all accounts) on dashboard
- **FR5:** User can update account balances manually

### Budget Management

- **FR6:** User can create budget categories with custom names
- **FR7:** User can edit category names
- **FR8:** User can delete categories (with confirmation)
- **FR9:** User can allocate a monthly budget amount to each category
- **FR10:** User can adjust budget allocations (intended for monthly setup, not mid-month changes)
- **FR10b:** System does not prompt or encourage budget changes during the month
- **FR11:** User can enter monthly income amount

**Philosophy:** Les budgets sont définis en début de mois. Si dépassement en cours de mois → on observe, on apprend, on ajuste le mois suivant.

### Expense Tracking

- **FR12:** User can add an expense with amount, category, and date
- **FR13:** User can add an optional description to an expense
- **FR14:** User can edit an existing expense
- **FR15:** User can delete an expense
- **FR16:** User can view expense history filtered by category
- **FR17:** User can view expense history filtered by date range

### Visual Dashboard & Gauges

- **FR18:** User can view all budget categories as visual gauges on dashboard
- **FR19:** User can see each gauge's current percentage (spent/budget)
- **FR20:** User can see gauges that exceed 100% (overspent) with distinct visual feedback
- **FR21:** User can see remaining amount for each category
- **FR22:** User can see gauges animate when values change
- **FR23:** User can see color changes as gauges fill (progression visuelle)

### Savings Goals

- **FR24:** User can create a savings goal with name and target amount
- **FR25:** User can optionally set a target date for a savings goal
- **FR26:** User can allocate monthly amount toward a savings goal
- **FR27:** User can view savings progress as a gauge that fills up
- **FR28:** User can edit a savings goal's details
- **FR29:** User can delete a savings goal
- **FR30:** User can view projected completion date based on current pace

### Monthly Planning & Review

- **FR31:** User can view monthly recap showing all categories with final percentages
- **FR32:** User can compare budget vs actual for each category
- **FR33:** User can identify over-budget and under-budget categories
- **FR34:** User can view savings progress for the month
- **FR35:** User can view simple savings projections ("If X/month, Y in Z months")

### Fixed Expenses / Subscriptions (P3 - Si temps)

- **FR36:** User can add a recurring expense with name, amount, and day of month
- **FR37:** User can edit a recurring expense
- **FR38:** User can delete a recurring expense
- **FR39:** User can view total fixed expenses for current month

### User Authentication

- **FR40:** User can sign in using Google account
- **FR41:** User can sign out
- **FR42:** User can remain signed in across sessions (persistent login)

### Data Synchronization

- **FR43:** User's data is automatically saved after each change
- **FR44:** User's data syncs across devices when online
- **FR45:** User's data is preserved locally if offline, then synced when reconnected

## Non-Functional Requirements

### Performance

| ID | Requirement | Justification |
|----|-------------|---------------|
| NFR1 | Dashboard loads in < 2 seconds | Accès rapide aux informations |
| NFR2 | Expense entry saves in < 500ms | Feedback immédiat |
| NFR3 | Gauge animations run at 60fps | Fluidité visuelle |
| NFR4 | App remains responsive during data sync | Pas de freeze |
| NFR5 | Lighthouse Performance score > 90 | Standard moderne |

### Security

| ID | Requirement | Justification |
|----|-------------|---------------|
| NFR6 | All data transmitted over HTTPS | Chiffrement en transit |
| NFR7 | Authentication via Google OAuth only | Sécurité déléguée à Google |
| NFR8 | User can only access their own data (Row Level Security) | Isolation des données |
| NFR9 | No sensitive data stored in localStorage (only sync buffer) | Protection locale |
| NFR10 | Session expires after 30 days of inactivity | Sécurité raisonnable |

### Reliability & Data Integrity

| ID | Requirement | Justification |
|----|-------------|---------------|
| NFR11 | Zero data loss - all entries persisted locally before sync | Confiance totale |
| NFR12 | Offline entries sync automatically when connection restored | Seamless experience |
| NFR13 | Data conflicts resolved with "last write wins" strategy | Simplicité |
| NFR14 | Application available 99%+ of time (Supabase + Vercel SLA) | Toujours accessible |

### Usability (Design Quality)

| ID | Requirement | Justification |
|----|-------------|---------------|
| NFR15 | UI consistent with DaisyUI design system | Cohérence visuelle |
| NFR16 | All interactive elements have visible feedback | Clarté d'interaction |
| NFR17 | Error messages are clear and actionable | Pas de frustration |
| NFR18 | App works without page refresh (SPA behavior) | Expérience fluide |
