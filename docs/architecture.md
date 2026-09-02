# GYM — Architecture Document

## High-Level Architecture Overview

The GYM app is engineered as an offline-first, mobile-first Progressive Web Application (PWA) with responsive desktop & tablet adaptations.

```
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite                      │
├────────────────────────────────────────────────────────┤
│        Routing: React Router v6 (Nested Routes)        │
├──────────────────────────┬─────────────────────────────┤
│   State: Zustand Store   │   Forms: React Hook Form    │
│   (Persistent LocalDB)   │   Validation: Zod           │
├──────────────────────────┴─────────────────────────────┤
│       UI Layer: TailwindCSS + Design System Tokens      │
│            Lucide Icons + Custom Components            │
├────────────────────────────────────────────────────────┤
│       Service Layer (Sync Engine / Offline Cache)       │
├──────────────────────────┬─────────────────────────────┤
│ IndexedDB (Local Store)  │  Firebase Firestore & Auth  │
└──────────────────────────┴─────────────────────────────┘
```

---

## Directory Structure
```
GYM/
├── design/                        # Visual references (untouched)
├── public/                        # Manifest, PWA icons, assets
│   ├── icons/
│   ├── favicon.ico
│   └── manifest.json
├── docs/                          # Architecture, UI, data model, progress
├── src/
│   ├── app/                       # App bootstrap, router, providers
│   │   ├── router/
│   │   ├── providers/
│   │   └── config/
│   ├── components/                # Reusable design system UI
│   │   ├── ui/                    # Button, Input, Card, Badge, Modal, Stepper
│   │   ├── layout/                # AppLayout, MobileContainer, ResponsiveWrapper
│   │   ├── navigation/            # BottomNav, TopHeader, SegmentedTabs
│   │   └── feedback/              # OfflineBanner, Toast, EmptyState, Loading
│   ├── features/                  # Feature slices
│   │   ├── auth/                  # Login, Signup, AuthGuard
│   │   ├── dashboard/             # TodaySessionCard, WeeklyProgress, QuickAccess
│   │   ├── workouts/              # RoutineList, RoutineCard, RoutineDetails
│   │   ├── routines/              # CreateRoutine, RoutinePreview, MuscleFilter
│   │   ├── exercises/             # ExerciseLibrary, ExerciseDetailModal, MuscleGrid
│   │   ├── workout-mode/          # LiveWorkoutScreen, SetLogger, RestTimerRing, WorkoutComplete
│   │   ├── progress/              # StrengthChart, MetricsOverview, PRList
│   │   ├── history/               # HistoryList, HistoryCard, WorkoutSessionDetail
│   │   └── profile/               # UserProfile, MetricGrid, SettingsMenu
│   ├── hooks/                     # Custom hooks (useTimer, useAudioFeedback, useOffline)
│   ├── stores/                    # Zustand stores (workoutStore, routineStore, exerciseStore, uiStore)
│   ├── services/                  # Data access and sync services
│   │   ├── firebase/              # Firebase initialization, config, auth, firestore
│   │   ├── local/                 # IndexedDB/localStorage offline storage engine
│   │   └── sync/                  # Background sync queue & conflict resolver
│   ├── types/                     # TypeScript interfaces and entity types
│   ├── utils/                     # Formatting, math, sound, haptics
│   ├── constants/                 # Exercise database seeds, initial routines
│   └── styles/                    # Global Tailwind CSS and custom tokens
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## State Management Architecture
- **`workoutSessionStore`**: Holds the active in-progress workout session, active set index, timer status, rest remaining, sound triggers, and auto-saves to LocalStorage/IndexedDB after each set so progress is never lost even if the browser closes.
- **`routineStore`**: Handles CRUD for routines, active routine selection, and default templates.
- **`exerciseStore`**: Full searchable catalogue of 100+ exercises across all major muscle groups with metadata, instructions, and equipment tags.
- **`historyStore`**: Completed workout sessions, calculated volume, duration, and PR tracking.
- **`userStore`**: User profile, biometric stats, timer preferences, vibration & sound settings.
- **`syncStore`**: Online/Offline status listener, pending sync queue, and sync status state.

---

## Offline-First Sync Strategy
1. All mutations write directly to local memory & IndexedDB first (zero network lag).
2. If online, changes asynchronously replicate to Cloud Firestore.
3. If offline, mutations are queued in a persistent Sync Queue.
4. When online connectivity is restored, the Sync Engine batches updates and synchronizes with Firebase without duplicating workouts or sets.
