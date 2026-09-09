# Technical Execution Prompt & Architectural Guide: Hard-Refresh Persistence, Deep Reset Purge & Pristine Blank Slate

**Role:** Elite Principal UI/UX Frontend Architect  
**Design Engine:** Antigravity Design Engine  
**Target Platform:** GYM Offline-First PWA (React 18, TypeScript, Zustand, IndexedDB `gym_offline_db`, Tailwind CSS)  

---

## 1. Executive Summary & Root Cause Analysis

### 1.1 Asynchronous Store Rehydration vs. Synchronous Boot
In the original architecture, Zustand's persist middleware used an asynchronous storage adapter (`indexedDbStorage`) backed by IndexedDB `kv_store`. When a user performed a hard browser refresh (`Ctrl+F5` or mobile PWA pull-to-refresh), React mounted `<App />` and `<AppRouter />` before IndexedDB read queries completed. Consequently:
- Initial components rendered using the hardcoded in-memory state.
- `initSchemaMigration()` ran synchronously in `main.tsx` before store hydration, inspecting un-hydrated states and overwriting user modifications.
- Early lifecycle side-effects flushed default empty/preset routines back to IndexedDB and LocalStorage, overwriting user custom splits.

### 1.2 Incomplete "Reset All Workout Data" Purge
The previous reset handler only called `resetToDefaults()` on in-memory Zustand store instances:
- The 6 underlying IndexedDB object stores (`workouts`, `active_session`, `routines`, `exercises`, `snapshots`, `kv_store`) in `gym_offline_db` remained intact.
- LocalStorage keys (`user_saved_routines`, `user_custom_exercises`) were not cleared.
- Orphaned data was restored upon the next launch, rendering the reset ineffective.

### 1.3 Demo Data Pollution
The codebase shipped with pre-populated demo routines (`PRESET_ROUTINES`), pre-assigned 5-day schedules (`DEFAULT_WEEKLY_SCHEDULE`), and hardcoded workout histories. Fresh installs and reset instances were polluted with demo routines rather than offering a pristine blank slate.

---

## 2. Production Architecture Implementation

### 2.1 Storage Hydration Barrier (`hydrationManager.ts`)
A boot-time synchronization barrier blocks operational React route rendering until all persistent Zustand stores have confirmed hydration:
- Intercepts `onFinishHydration` for `useRoutineStore`, `useExerciseStore`, `useWorkoutStore`, `useHistoryStore`, and `useUserStore`.
- Only allows `<AppRouter />` to mount once in-memory state matches IndexedDB and LocalStorage mirrors.
- Runs schema version checks safely post-hydration.

### 2.2 Deep IndexedDB & LocalStorage Purge Engine (`resetManager.ts`)
A single transactional reset engine:
- Executes `tx.objectStore(store).clear()` across `[kv_store, active_session, workouts, routines, exercises, snapshots]`.
- Purges all LocalStorage mirror keys, backup keys, and cache entries.
- Directly invokes `setState()` on all active Zustand stores, instantly updating UI components without requiring a browser reload.

### 2.3 Pristine Blank-Slate Defaults
- `useRoutineStore`: Initializes with `routines: []`, `activeRoutineId: ''`, `weeklySchedule: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null }`, and `splitName: 'My Routine Planner'`.
- `useHistoryStore`: Initializes with `completedSessions: []` and `personalRecords: []`.
- `scheduler.ts`: Default weekly schedule defines all 7 days as `null` (Full Rest / Unassigned).
- `TodaySessionCard.tsx`: Displays an empty state with a direct CTA to create custom routines or plan the week.

---

## 3. Verification Protocol

1. **Hard Refresh Verification:**
   - Create a custom routine and assign it to Monday.
   - Trigger a hard refresh (`Ctrl+F5`).
   - Verify that Monday retains the custom routine and exercises without data loss.

2. **Deep Reset Verification:**
   - Log workout data and custom splits.
   - Navigate to Settings -> Click "RESET ALL WORKOUT DATA".
   - Open DevTools -> Application -> IndexedDB -> `gym_offline_db`: All object stores are confirmed empty (`0` records).
   - LocalStorage keys (`user_saved_routines`, `user_custom_exercises`) are confirmed removed.
   - Dashboard instantly flips to the blank rest/planner state with zero reload.

3. **Production Build Verification:**
   - Run `npm run build` to ensure clean TypeScript compilation with zero type errors.
