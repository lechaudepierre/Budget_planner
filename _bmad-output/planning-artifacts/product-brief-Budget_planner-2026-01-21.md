---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - '_bmad-output/analysis/brainstorming-session-2026-01-21.md'
date: 2026-01-21
author: Pierrelechaude
---

# Product Brief: Budget_planner

## Executive Summary

**Budget_planner** est une application de gestion budgétaire personnelle conçue pour offrir une vision globale et intuitive des finances personnelles. Née d'un besoin réel de mieux comprendre et contrôler ses dépenses réparties sur plusieurs comptes, cette application se distingue par son approche visuelle (jauges de budget), son système intelligent de savings goals, et sa philosophie d'apprentissage continu plutôt que de jugement.

**Le différenciateur clé n'est pas technique, mais émotionnel:** Budget_planner ne vend pas un tracker de budget froid - il offre un *sentiment de contrôle et de clarté*. L'app doit donner envie de faire attention à son budget grâce à un design motivationnel et une approche sans culpabilité.

Contrairement aux solutions existantes qui imposent des abonnements et des fonctionnalités génériques, Budget_planner est un outil personnel, gratuit, et évolutif - conçu pour s'adapter aux besoins spécifiques de son utilisateur au fil du temps.

---

## Core Vision

### Problem Statement

Les particuliers qui reçoivent un salaire mensuel et possèdent plusieurs comptes bancaires manquent de visibilité sur leurs finances. Sans outil adapté, ils ne savent pas précisément où va leur argent, ont du mal à épargner intentionnellement, et se retrouvent parfois face à des dépenses impulsives ou imprévues qu'ils n'avaient pas anticipées.

Les outils existants (comme Excel) sont fonctionnels mais froids, complexes, et n'incitent pas à l'engagement régulier.

### Problem Impact

- **Perte de contrôle** : Sentiment de ne pas maîtriser ses finances
- **Dépenses non optimisées** : Abonnements oubliés, achats impulsifs non détectés
- **Difficulté à épargner** : Pas de système pour allouer intentionnellement vers des objectifs
- **Stress financier** : Incertitude en fin de mois sur l'état réel des finances
- **Procrastination** : Les outils existants (tableurs) sont rebutants et mènent à l'abandon

### Why Existing Solutions Fall Short

| Solution | Limitation |
|----------|------------|
| **Apps payantes** (Bankin', YNAB, Mint) | Abonnements coûteux, features génériques, pas de contrôle total |
| **Excel / Tableurs** | Froid, complexe, pas motivant, expérience utilisateur pauvre |
| **Ne rien faire** | Stress, perte de contrôle, épargne impossible |

### Proposed Solution

Un dashboard interactif personnel (PC-first, stockage local) offrant :

- **Vision globale du patrimoine** : Tous les comptes agrégés en un coup d'œil
- **Budgets par catégorie avec jauges visuelles** : Feedback immédiat, beau et intuitif
- **Savings goals avec jauges qui montent** : Motivation visuelle pour épargner
- **Design motivationnel** : Une app qui donne ENVIE d'être utilisée
- **Approche sans culpabilité** : Les dépassements sont des données d'apprentissage, pas des échecs
- **Gestion intelligente des imprévus** : Entrées ET sorties imprévues trackées
- **Monthly workflow** : Session calme de ~30min pour review et setup

### Key Differentiators

1. **Émotionnel avant technique** : Tu vends un sentiment de contrôle et de clarté, pas un tracker
2. **Design motivationnel** : Beau, simple, donne envie de revenir
3. **Sans culpabilité** : Jauges > 100% = apprentissage, pas échec
4. **Ownership total** : C'est TON app, tes données, ton contrôle
5. **Gratuit et évolutif** : Ajout de features selon tes besoins réels
6. **Simplicité architecturale** : Desktop + stockage local, pas de complexité inutile

### Target Positioning

> **"Budget_planner: Reprendre le contrôle de son argent avec clarté et sans culpabilité."**

Pas un tracker froid, mais un compagnon visuel qui aide à comprendre et améliorer sa relation avec l'argent.

---

## Target Users

### Primary User: Le Jeune Actif Soucieux de son Avenir

**Persona: Pierrelechaude**

**Contexte:**
- Étudiant en transition vers la vie active (premier salaire à venir)
- Reçoit un revenu mensuel régulier (actuellement argent de poche, bientôt salaire)
- Possède 2-3 comptes bancaires : compte courant, comptes épargne, compte-titres
- Conscient de l'importance de bien gérer son argent mais manque d'outils adaptés

**Situation actuelle:**
- Vérifie ses comptes ponctuellement, sans méthode
- Aucune vision globale des catégories de dépenses
- Pas de planification budgétaire structurée
- Investit (compte-titres) mais ne suit pas l'évolution globale du patrimoine

**Motivations:**
- Prendre le contrôle de ses finances AVANT d'avoir un "vrai" salaire
- Développer de bonnes habitudes financières dès maintenant
- Comprendre où va son argent pour mieux épargner
- Voir son patrimoine grandir de manière visuelle et motivante

**Frustrations avec les solutions actuelles:**
- Excel est trop froid et complexe
- Les apps payantes ne valent pas l'investissement
- Pas d'outil qui correspond exactement à SES besoins

**Ce qui ferait son succès:**
- Vision claire et globale de toutes ses finances
- Sentiment de contrôle et de progression
- Habitude durable de gestion budgétaire

### Secondary Users

**Amis proches (potentiels):**
- Profil similaire (jeunes actifs ou étudiants)
- Pourraient utiliser l'app si partagée
- Pas de fonctionnalités spécifiques à prévoir pour eux

### User Journey

**Workflow Mensuel:**

| Moment | Durée | Action |
|--------|-------|--------|
| **Début de mois** | ~30 min | Session de planification : review du mois précédent, ajustement des budgets, définition des objectifs du mois |
| **Quotidien** | ~10 min | Entrée des dépenses de la veille, catégorisation, suivi des jauges |
| **Ponctuel** | 2 min | Vérification rapide avant une dépense importante |
| **Fin de mois** | Inclus dans début du mois suivant | Recap, analyse, apprentissage |

**Moments clés:**

1. **Discovery:** L'utilisateur réalise qu'il a besoin de mieux gérer son argent avant/pendant sa transition vers la vie active
2. **Onboarding:** Première session de 30min pour configurer comptes, catégories, et budgets initiaux
3. **Aha Moment:** Première fois qu'il voit ses jauges et comprend instantanément où il en est
4. **Valeur long-terme:** Après 2-3 mois, voit les patterns émerger et ses savings grandir visuellement

### Additional Feature Discovered

**Variation de valeur d'actifs:**
- Compte-titres dont la valeur fluctue avec le marché
- Pas une entrée/sortie d'argent, mais une réévaluation du patrimoine
- Doit être trackable pour avoir une vision précise du net worth total

---

## Success Metrics

### Définition du Succès

Pour un projet personnel comme Budget_planner, le succès se mesure en **transformation comportementale** et **satisfaction personnelle**, pas en métriques business traditionnelles.

> **Vision du succès:** Passer d'un comportement "dépensier sans vision" à un comportement "épargnant conscient et motivé".

### Métriques de Succès Utilisateur

| Métrique | Indicateur de succès | Mesure |
|----------|---------------------|--------|
| **Adoption complète** | Toutes les dépenses sont entrées dans l'app | 100% des transactions trackées |
| **Régularité** | Usage quotidien ou tous les 2-3 jours | Fréquence d'entrée des dépenses |
| **Sentiment de contrôle** | "Je sais exactement où va mon argent" | Auto-évaluation |
| **Réduction du stress** | Plus d'incertitude en fin de mois | Auto-évaluation |
| **Motivation** | L'app crée une envie d'économiser | Engagement avec les savings goals |

### Métriques d'Engagement

| Comportement | Fréquence cible |
|--------------|-----------------|
| Entrée des dépenses | Quotidien ou tous les 2-3 jours |
| Session de planification mensuelle | 1x par mois (~30 min) |
| Consultation des jauges | Plusieurs fois par semaine |
| Utilisation continue | 6+ mois d'usage régulier = victoire |

### Résultats Concrets Attendus

**Court terme (1-3 mois):**
- Habitude d'entrée des dépenses établie
- Vision claire des catégories de dépenses
- Premiers budgets calibrés de manière réaliste

**Moyen terme (3-6 mois):**
- Patterns de dépenses identifiés et compris
- Savings goals actifs et en progression
- Sentiment de contrôle installé

**Long terme (6-12 mois):**
- Transformation comportementale visible (moins dépensier)
- Patrimoine en croissance mesurable
- L'app fait partie de la routine financière

### Indicateur Ultime de Succès

> **"Je suis content et je vois que ça fonctionne, ça m'aide vraiment."**

Ce sentiment subjectif de satisfaction et de contrôle est le vrai KPI de Budget_planner.

### Feature de Motivation: Projections d'Épargne

Pour maintenir la motivation, l'app devrait inclure:
- "Si tu économises X€/mois, tu auras Y€ dans 6 mois / 1 an"
- Visualisation de la croissance projetée du patrimoine
- Célébration des milestones atteints

---

## MVP Scope

### Core Features (v1)

**1. Vision Patrimoine Global**
- Affichage du total de tous les comptes en un coup d'œil
- Support de 2-3 comptes (courant + épargne)
- Mise à jour manuelle des soldes

**2. Budgets par Catégorie avec Jauges Visuelles**
- Création de budgets mensuels par catégorie
- Jauges qui se remplissent visuellement
- Possibilité de dépasser 100% (phase de calibration)
- Feedback visuel immédiat et intuitif

**3. Entrée Manuelle des Dépenses**
- Ajout de dépenses avec montant et catégorie
- Interface simple et rapide
- Historique des dépenses consultable

**4. Catégories Personnalisables**
- Catégories de base prédéfinies (courses, restaurants, vêtements, culture, etc.)
- Possibilité de créer ses propres catégories
- Gestion (ajout/modification/suppression) des catégories

**5. Savings Goals avec Jauges**
- Création d'objectifs d'épargne
- Jauges qui montent (motivation visuelle)
- Multiple buckets (global, investissements, objectifs spécifiques)
- Suivi de la progression

**6. Monthly Recap**
- Résumé du mois écoulé
- Comparaison budget vs réel par catégorie
- Identification des dépassements et sous-utilisations
- Base pour ajuster les budgets du mois suivant

**7. Dépenses Fixes / Abonnements**
- Liste des dépenses récurrentes (loyer, Netflix, Spotify, etc.)
- Montant + jour du mois de prélèvement
- Preview mensuel des charges fixes à venir

**8. Projections d'Épargne**
- Calcul "Si j'économise X€/mois, j'aurai Y€ dans Z mois"
- Visualisation de la croissance projetée
- Motivation par les perspectives long-terme

### Out of Scope for MVP

Les features suivantes sont volontairement exclues du MVP pour livrer plus rapidement une version utilisable:

| Feature | Raison du report | Priorité v2 |
|---------|------------------|-------------|
| Alertes visuelles (seuils) | Les jauges suffisent pour le MVP | Haute |
| Gestion imprévus (3 niveaux) | Complexité supplémentaire | Moyenne |
| Super-catégories flexibles | Raffinement UX | Moyenne |
| Notes sur dépenses | Nice-to-have | Basse |
| Variation valeur actifs | Complexité (compte-titres) | Moyenne |
| Yearly overview | Le monthly recap suffit pour commencer | Basse |

### MVP Success Criteria

Le MVP sera considéré comme réussi si:

1. **Adoption:** Utilisation quotidienne ou tous les 2-3 jours pendant 1 mois
2. **Complétude:** 100% des dépenses entrées dans l'app
3. **Valeur perçue:** Sentiment de "je sais où va mon argent"
4. **Habitude:** Session de planning mensuel réalisée au moins 1 fois
5. **Motivation:** Au moins 1 savings goal actif et suivi

### Future Vision (v2+)

**Court terme (v2 - après 1-2 mois d'usage):**
- Alertes visuelles aux seuils de budget
- Notes sur les dépenses pour contexte
- Gestion intelligente des imprévus

**Moyen terme (v3+):**
- Super-catégories avec flexibilité interne
- Tracking de la valeur des actifs (compte-titres)
- Yearly overview et analytics avancés
- Potentiellement: version mobile simplifiée
