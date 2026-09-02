# GYM — Local-First Data Architecture & Privacy Model

## 1. Product Philosophy
> *"Less typing. Less thinking. More training."*

GYM is completely **account-free, offline-first, free, and private**. Athletes can open the app on any device, start logging workouts immediately without a login barrier, and rely on 100% local persistence.

---

## 2. Storage Layers & Topology

```
User Action (Set Log / Routine Edit / Preference Change)
       │
       ▼
Zustand Reactive State Stores
 (useRoutineStore, useHistoryStore, useExerciseStore, useUserStore)
       │
       ▼
Local Persistence Engine (Zustand Persist / localStorage / IndexedDB)
 ├── gym_routines_store_v2
 ├── gym_history_store_v2
 ├── gym_exercises_store
 ├── gym_user_store
 └── gym_outbox_queue
```

---

## 3. Offline Resilience & Network Independence
- **Immediate Startup**: Zero dependency on external backend APIs or cloud databases for initialization.
- **Background & Sleep Resilience**: Rest timers and active workout state calculate real-time elapsed timestamps rather than relying on active `setInterval` ticks.
- **Zero Data Loss**: Device sleep, network drops, airplane mode, or browser crashes never destroy logged sets or completed workouts.
