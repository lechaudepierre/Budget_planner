---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Personal Budget Planning & Financial Visibility'
session_goals: 'Gain control and clarity over spending patterns, unified multi-account view, interactive dashboard'
selected_approach: 'AI-Recommended Techniques'
techniques_used: ['Question Storming', 'Role Playing']
ideas_generated: 40
context_file: '_bmad/bmm/data/project-context-template.md'
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Pierrelechaude
**Date:** 2026-01-21
**Session Duration:** Complete exploration session

---

## Session Overview

**Topic:** Personal Budget Planning & Financial Visibility

**Core Problem:** Difficulty managing money spread across multiple accounts, lacking visibility into spending patterns, wanting to understand where money goes over time.

**Goals:**
- Gain control and clarity over money management
- Unified view of finances across multiple accounts
- Understand spending patterns by category
- Create an interactive, personalized budget dashboard
- Set and track monthly budgets by category

**Selected Approach:** AI-Recommended Techniques
- Question Storming (deep exploration of needs)
- Role Playing (scenario-based validation)

---

## Technique Execution Results

### Technique 1: Question Storming

**Focus:** Generate questions about budget needs before jumping to solutions

**Key Questions Discovered:**
- Combien ai-je déjà dépensé pour telle catégorie?
- Combien d'argent ai-je déjà dépensé au total ce mois-ci?
- Est-ce que je passe à côté de dépenses inutiles ou involontaires?
- Quelles sont mes dépenses par catégorie?
- Quelles sont les différentes catégories de dépenses que j'ai?
- Will I run out of budget before end of month?
- How much do I really have across all accounts?

**Breakthrough Insight:** User wants AWARENESS, not just data. The app should make spending feel visceral and immediate.

### Technique 2: Role Playing

**Scenarios Explored:**

1. **"Début de mois"** - Monthly setup session (~30 minutes)
   - Review last month's expenses in detail
   - Identify one-off expenses that could become budgeted
   - Transform surprises into predictions

2. **"Grosse dépense"** - Big purchase decision
   - Two models discovered: Buy now & repay vs. Accumulate first
   - Check savings goals progress before deciding

3. **"Dépense imprévue"** - Unexpected expense handling
   - Three-tier system for different types of unexpected expenses
   - Super-categories with internal flexibility

---

## Idea Organization by Theme

### THEME 1: Visibilité & Patrimoine Global
*Voir tout son argent en un coup d'œil*

| Feature | Description |
|---------|-------------|
| Multi-account aggregation | Vue unifiée de tous les comptes |
| Net worth tracking | Évolution du patrimoine dans le temps |
| Patrimoine total visible | Chiffre clé toujours accessible |
| Link savings to net worth | Voir la croissance liée aux économies |

---

### THEME 2: Budgets & Catégories
*Allouer et suivre les dépenses*

| Feature | Description |
|---------|-------------|
| Budget mensuel par catégorie | Setup en début de mois |
| Jauges visuelles | Se remplissent au fur et à mesure des dépenses |
| Jauges > 100% autorisées | Permet de calibrer les budgets futurs |
| Custom categories | Catégories de base + création personnalisée |
| Super-catégories flexibles | Ex: tous les budgets "plaisir" peuvent s'équilibrer |
| Phase de calibration | Premiers mois = découverte des vrais besoins |

---

### THEME 3: Dépenses Fixes & Récurrentes
*Prévoir ce qui est prévisible*

| Feature | Description |
|---------|-------------|
| Liste d'abonnements | Montant + jour du mois de prélèvement |
| Preview mensuel | "Ce mois-ci tu paieras X le jour Y" |
| Variable recurring | Factures qui varient en montant (électricité) |
| Anticipation | Savoir à l'avance les dépenses fixes à venir |

---

### THEME 4: Savings & Goals
*Construire son patrimoine intentionnellement*

| Feature | Description |
|---------|-------------|
| Savings goals | Objectifs d'épargne avec jauges qui MONTENT |
| Multiple buckets | Global, investissements, vacances, achats spécifiques |
| Deadlines sur goals | "Économiser X€ d'ici [date]" avec calcul mensuel |
| Salary split model | Salaire → Partie dépenses + Partie savings |
| Modèle A: Acheter maintenant | Achat immédiat, budgets futurs réduits pour "rembourser" |
| Modèle B: Accumuler d'abord | Budget mensuel s'accumule jusqu'à atteindre le montant |

**Salary Flow Model:**
```
SALAIRE
   │
   ├── DÉPENSES (Budgets par catégorie)
   │   └── Jauges qui se vident
   │
   └── SAVINGS (Multiple buckets)
       └── Jauges qui se remplissent
              │
              └── NET WORTH GROWS
```

---

### THEME 5: Intelligence & Alertes
*L'app qui aide à apprendre*

| Feature | Description |
|---------|-------------|
| Alertes visuelles | Seuils à 50%, 75%, 100% du budget |
| Dashboard alerts | Pas de push notifications, visuel sur l'app |
| Prédictions fin de mois | Argent restant vs jours restants |
| Smart budget suggestions | Propositions d'ajustement basées sur l'historique |
| Détection de gaspillage | Identifier dépenses inutiles ou involontaires |

---

### THEME 6: Gestion des Imprévus
*Gérer la vraie vie avec ses surprises*

**Système à trois niveaux:**

| Type d'imprévu | Exemple | Gestion |
|----------------|---------|---------|
| Oubli budgétisable | Facture oubliée | → Ajouter au budget des prochains mois |
| Plaisir imprévu | Weekend avec amis | → Puiser dans super-catégorie "plaisir" |
| Vrai imprévu | Téléphone cassé | → Catégorie "Imprévu" + impact savings |

**Features associées:**
- Catégorie "Imprévu" dédiée
- Review annuel de tous les imprévus
- Possibilité de créer un "fonds imprévu" mensuel basé sur l'historique
- Super-catégories avec flexibilité interne

---

### THEME 7: Workflow Mensuel
*Le rituel de gestion financière*

| Feature | Description |
|---------|-------------|
| Monthly recap | Résumé avec explications des dépassements |
| Session ~30min | Moment calme pour review et setup du mois |
| Liste des ponctuels | Dépenses one-off à examiner |
| Notes sur dépenses | Ajouter contexte aux achats (surtout impulsifs) |
| Yearly overview | Recap annuel des 12 mois (nice-to-have) |

**Workflow type début de mois:**
1. Revoir les dépenses du mois précédent
2. Identifier les one-off qui pourraient devenir budgétés
3. Ajuster les budgets si nécessaire
4. Vérifier les abonnements/fixes à venir
5. Définir les objectifs savings du mois

---

### THEME 8: Plateforme & Données
*Choix techniques et UX*

| Décision | Choix |
|----------|-------|
| Plateforme principale | PC (vision globale prioritaire) |
| Mobile | Peut-être plus tard, selon faisabilité |
| Stockage données | Local ou cloud SI sécurisé |
| Sécurité | Requirement CORE non-négociable |
| Style UX | Calme, réfléchi, pas quick-entry |
| Entrée des dépenses | Manuelle, posée, le lendemain si besoin |

---

## Breakthrough Concepts

Les idées les plus innovantes de cette session:

### 1. Jauges > 100% = Data, pas échec
Les dépassements de budget ne sont pas des échecs mais des données pour calibrer les futurs budgets. Phase de "calibration" assumée.

### 2. Super-catégories flexibles
Les budgets d'une même famille (ex: "plaisir") peuvent s'équilibrer entre eux. Weekend imprévu? Puise dans le budget vêtements.

### 3. Transformer surprises en prévisions
L'imprévu d'un mois peut devenir le budget du mois suivant. L'app aide à apprendre de ses patterns.

### 4. Salary Split Model
Visualisation claire du flux: Salaire → Dépenses (jauges qui se vident) + Savings (jauges qui se remplissent) → Net Worth qui grandit.

### 5. Trois niveaux d'imprévus
Tous les imprévus ne sont pas égaux. Système intelligent de gestion selon le type.

### 6. Smart Budget Adaptation
L'app déclenche des réflexions: "Tu as dépassé/sous-utilisé ce budget - faut-il l'ajuster?"

---

## Features pour Plus Tard (v2+)

| Feature | Raison du délai |
|---------|-----------------|
| Tags (Impulse/Planned, Necessary/Pleasure) | Utile mais pas critique pour démarrer |
| Quick entry mode | PC-first, pas prioritaire |
| Yearly overview détaillée | Monthly view est le core |
| Predictions sophistiquées de pace | Catégories ponctuelles ne suivent pas de pattern |

---

## Session Summary

### Achievements
- **40+ ideas** générées et organisées
- **8 thèmes** clairement identifiés
- **6 breakthrough concepts** innovants
- **Mental model** complet du flux financier personnel
- **Décisions UX** claires (PC-first, calme, sécurisé)

### Key Insight
> L'app n'est pas un simple tracker - c'est un outil d'**awareness** et d'**apprentissage** qui aide l'utilisateur à comprendre et améliorer sa relation avec l'argent.

### User Creative Strengths
- Excellente capacité à prioriser et filtrer
- Pensée systémique (connections entre features)
- Pragmatisme (ce qui sert vraiment vs over-engineering)
- Vision claire de l'UX souhaitée

### Next Steps
1. **Product Brief** - Transformer ces insights en brief produit structuré
2. **PRD** - Définir les requirements détaillés
3. **Architecture** - Décisions techniques (stack, storage, etc.)
4. **MVP Scope** - Définir la v1 minimale viable

---

## Appendix: Raw Questions Generated

### Questions de base
- Combien ai-je déjà dépensé pour telle catégorie?
- Combien d'argent ai-je déjà dépensé au total ce mois-ci?
- Est-ce que je passe à côté de dépenses inutiles?
- Quelles sont mes dépenses par catégorie?

### Questions de prédiction
- Will I exceed my budget for [category]?
- What will my account balances look like on the 30th?
- Will I have enough left for rent/bills?
- Am I on pace to save what I wanted?

### Questions patrimoine
- How much do I really have across all accounts?
- How is my net worth evolving over time?

---

*Session completed: 2026-01-21*
*Facilitator: Mary (Business Analyst Agent)*
*Techniques: Question Storming + Role Playing*
