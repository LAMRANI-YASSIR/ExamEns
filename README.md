# 🎓 ExamENS — Gestion des Examens & Notes

> Application Angular 21 de gestion des examens, notes et délibérations pour l'**École Normale Supérieure de Meknès**.

[![Angular](https://img.shields.io/badge/Angular-21-red?logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org)
[![JSON Server](https://img.shields.io/badge/JSON%20Server-API-green)](https://github.com/typicode/json-server)

---

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Lancer le projet](#-lancer-le-projet)
- [Comptes de démonstration](#-comptes-de-démonstration)
- [Structure du projet](#-structure-du-projet)
- [Architecture](#-architecture)
- [Bonus implémentés](#-bonus-implémentés)

---

## 👁 Aperçu

ExamENS est une plateforme web complète pour la gestion académique avec **3 rôles distincts** :

| Rôle | Accès |
|------|-------|
| 🔐 **Admin** | Dashboard, Sessions, Examens, Délibérations, Relevés, Planning |
| 👨‍🏫 **Enseignant** | Dashboard modules, Saisie des notes, Consultation notes |
| 👨‍🎓 **Étudiant** | Mes notes, Relevé de notes imprimable |

---

## ✅ Fonctionnalités

### T1 — Backend (JSON Server)
- Base de données `db.json` avec : users, étudiants, modules, sessions, examens, notes, délibérations
- 15 étudiants, 8 modules, 2 sessions, notes enrichies

### T2 — Authentification 3 rôles
- Login avec email/password via JSON Server
- Guards `authGuard` + `roleGuard` sur chaque route
- Redirection automatique selon le rôle
- Persistence via `localStorage`

### T3 — Gestion des Sessions d'Examen
- CRUD complet (créer, modifier, supprimer)
- Workflow de statut : `planifiée → en cours → terminée → délibérée`

### T4 — Gestion des Examens
- CRUD complet avec filtre par session
- Lien module ↔ session ↔ salle ↔ durée

### T5 — Saisie des Notes avec FormArray
- Grille par étudiant avec CC + Examen
- Calcul automatique de la note finale (CC×30% + Exam×70%)
- Gestion des absences
- Stats en temps réel (moyenne, taux de réussite)

### T6 — Calcul des Délibérations
- Calcul pondéré par coefficient de module
- Décision automatique : Validé / Rattrapage / Ajourné
- Mentions : Passable / Assez Bien / Bien / Très Bien
- Classement par rang

### T7 — Vue Étudiant
- Tableau de toutes ses notes avec statut
- Bannière de délibération (décision, mention, rang)
- Lien vers le relevé imprimable

### T8 — Dashboard Admin
- 4 KPIs : étudiants, modules, taux de réussite, moyenne générale
- 3 graphiques Chart.js : doughnut décisions, barres modules, distribution
- Top 3 / Flop 3 étudiants

### T9 — Dashboard Enseignant
- Stats par module : moyenne classe, taux réussite, nb étudiants
- Graphique double axe (moyenne + taux)

### T10 — Relevé de Notes Imprimable
- **Admin** : sélecteur étudiant + session, mise en page officielle ENS
- **Étudiant** : son propre relevé avec CSS `@media print`

### T11 — Notes par Module
- Tableau récapitulatif avec filtre module/examen
- Stats : moyenne, taux de réussite, nb validés

### T12 — Pipes personnalisées
- `NoteFormatPipe` — formate une note en `XX.XX/20`
- `DecisionLabelPipe` — traduit les décisions en français avec émojis
- `DecisionColorPipe` — retourne la couleur selon la décision
- `MentionPipe` — traduit les mentions en français

### T13 — CSS & Responsive
- Thème violet/indigo avec variables CSS
- Sidebar responsive (barre top sur mobile)
- Grilles adaptatives (breakpoints 768px / 480px)

---

## 🎁 Bonus implémentés

| Bonus | Description |
|-------|-------------|
| **+1 Export PDF** | Export jsPDF du relevé avec mise en page ENS Meknès (header coloré, tableau, résultats) |
| **+1 Planning visuel** | Calendrier semaine/grille des examens avec chips colorés par module |
| **+1 Comparaison sessions** | 3 graphiques : barres groupées, radar, barres empilées — normale vs rattrapage |
| **+0.5 Mode sombre** | Toggle dans la sidebar, persist localStorage, CSS variables dark complet |

---

## 🛠 Technologies

| Technologie | Version | Usage |
|-------------|---------|-------|
| Angular | 21.2 | Framework frontend |
| TypeScript | 5.9 | Langage |
| Angular Signals | built-in | State management réactif |
| Chart.js | 4.5 | Graphiques dashboard |
| jsPDF | 2.5 (CDN) | Export PDF |
| JSON Server | 1.0 beta | API REST simulée |
| SCSS | — | Styles |
| Vitest | 4.0 | Tests unitaires |

---

## ⚙️ Installation

```bash
# Cloner le dépôt
git clone https://github.com/LAMRANI-YASSIR/ExamEns.git
cd ExamEns

# Installer les dépendances
npm install
```

---

## 🚀 Lancer le projet

```bash
# Lancer Angular + JSON Server simultanément
npm run dev
```

Ou séparément :

```bash
# Terminal 1 — API JSON Server (port 3000)
npm run server

# Terminal 2 — Application Angular (port 4200)
npm start
```

Ouvrir : [http://localhost:4200](http://localhost:4200)

---

## 🔑 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| 🔐 Admin | `admin@ens.ma` | `admin123` |
| 👨‍🏫 Enseignant | `m.alaoui@ens.ma` | `prof123` |
| 👨‍🎓 Étudiant | `youssef.idrissi@ens.ma` | `etud123` |

> Les boutons de raccourci sur la page de login remplissent automatiquement les champs.

---

## 📁 Structure du projet

```
src/
├── app/
│   ├── admin/
│   │   ├── dashboard/           # KPIs + 3 graphiques Chart.js
│   │   ├── sessions/            # CRUD sessions d'examen
│   │   ├── examens/             # CRUD examens
│   │   ├── deliberations/       # Calcul & affichage délibérations
│   │   ├── releve/              # Relevé imprimable + export PDF
│   │   ├── planning/            # Calendrier visuel des examens
│   │   └── comparaison-sessions/# Comparaison normale vs rattrapage
│   ├── enseignant/
│   │   ├── dashboard/           # Stats modules enseignant
│   │   ├── saisie-notes/        # FormArray saisie notes
│   │   └── notes-module/        # Consultation notes par module
│   ├── etudiant/
│   │   ├── mes-notes/           # Tableau notes + délibération
│   │   └── releve-notes/        # Relevé imprimable CSS print
│   ├── auth/login/              # Page de connexion
│   ├── core/
│   │   ├── guards/              # authGuard, roleGuard
│   │   ├── interceptors/        # authInterceptor
│   │   └── services/            # auth, note, examen, session, module...
│   ├── layout/
│   │   ├── shell/               # Layout principal avec sidebar
│   │   └── sidebar/             # Navigation + dark mode toggle
│   ├── models/                  # Interfaces TypeScript
│   └── pipes/                   # NoteFormat, DecisionLabel, Mention...
└── styles.scss                  # Thème global + dark mode
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────┐
│              Angular SPA                │
│  ┌──────────┐  ┌─────────────────────┐  │
│  │ Sidebar  │  │   Router Outlet     │  │
│  │ (Shell)  │  │                     │  │
│  └──────────┘  │  Admin / Enseignant │  │
│                │  / Etudiant views   │  │
│                └─────────────────────┘  │
└───────────────────┬─────────────────────┘
                    │ HttpClient
                    ▼
         ┌──────────────────┐
         │   JSON Server    │
         │  localhost:3000  │
         │                  │
         │  /users          │
         │  /etudiants      │
         │  /modules        │
         │  /sessions       │
         │  /examens        │
         │  /notes          │
         │  /deliberations  │
         └──────────────────┘
```

---

## 👨‍💻 Auteur

**LAMRANI Yassir**
TP N6 — Gestion des Examens
ENS Meknès — Dev. Web — Pr. ABDELLAOUI
[text](https://github.com/LAMRANI-YASSIR/ExamEns.git)
---

*Projet réalisé dans le cadre du module Développement Web — ENS Meknès*
