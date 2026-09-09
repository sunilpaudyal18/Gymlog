# GYM — Architecture Document

## High-Level Architecture Overview

GYM is engineered as a **100% local, backend-free, cloud-free, offline-first** Progressive Web Application (PWA) with responsive desktop & tablet adaptations.

```text
                    GYM LOG
                       │
                       ▼
                React 18 / Zustand
                       │
                       ▼
               Local Data Layer
                       │
                       ▼
                   IndexedDB (gym_offline_db)
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Exercises     Routines     Workouts
          │            │            │
          ▼            ▼            ▼
       Schedule     Sessions      History
          │
          ▼
      Analytics / PRs
```

---

## Authoritative Storage Architecture

```text
GYM LOG STORAGE ARCHITECTURE

Primary durable storage:
IndexedDB (gym_offline_db)

Runtime state:
Zustand

Small metadata/preferences:
localStorage only where necessary

Offline application resources:
Service Worker Cache Storage

Backend:
None

Cloud:
None

Authentication:
None

Cloud synchronization:
None

Internet requirement:
None for application functionality
```

---

## Durable Storage Invariants

1. **IndexedDB is Single Source of Truth**: All user routines, weekly planner splits, custom exercises, completed workouts, active session recovery state, and personal records reside durably in IndexedDB.
2. **Zero Network Dependency**: The application executes with 100% functionality with network disabled. No external APIs, cloud services, or authentication endpoints exist.
3. **Hard Refresh & Restart Resilience**: Reloading (`Ctrl + F5`), restarting the browser, or launching an installed PWA while offline never causes data loss.
4. **Clean First-Time State**: New users start with 0 routines, an empty weekly schedule (Sunday–Saturday unassigned), 0 workout history records, and 0 custom exercises.
5. **Separation of Preset Library vs User Data**: The built-in exercise catalog is bundled as immutable application code/assets. Custom exercises are saved in IndexedDB and can be modified or deleted without affecting presets.
6. **Complete Data Reset**: Reset All Workout Data completely removes user routines, schedules, history, and custom exercises from IndexedDB and memory while retaining core application code and the built-in exercise catalog.
7. **Local Backup & Restore**: Backup files are exported directly to local JSON files and restored locally into IndexedDB with automatic safety snapshots. Zero cloud upload.

