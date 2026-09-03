# GYM — Data Backup, Export & Restore Guide

## 1. Overview
Because GYM requires no accounts or third-party cloud locks, full user data ownership is supported through standardized JSON backup export and import.

---

## 2. Backup File Schema (`DATA_SCHEMA_VERSION = 1`)

Backups are exported in format `gym-backup-YYYY-MM-DD.json`:

```json
{
  "version": 1,
  "exportedAt": 1756816000000,
  "appName": "GYM",
  "profile": {
    "name": "Alex Johnson",
    "goal": "Hypertrophy",
    "avatarUrl": "data:image/jpeg;base64,..."
  },
  "preferences": {
    "weightUnit": "kg",
    "defaultRestSeconds": 90,
    "autoStartRest": true,
    "soundEnabled": true,
    "vibrationEnabled": true
  },
  "routines": [ ... ],
  "completedSessions": [ ... ],
  "personalRecords": [ ... ],
  "favorites": [ ... ],
  "customExercises": [ ... ]
}
```

---

## 3. Safe Import Validation Flow

1. **Format Validation**: File is parsed as valid JSON.
2. **Schema Verification**: `version >= 1` and critical arrays (`routines`, `completedSessions`) are present and typed.
3. **User Confirmation Dialog**: Displays summary (routine count, session count, PR count) and explicitly warns:
   > *"Importing this backup will replace your current local workout data."*
4. **Store Rehydration**: Atomically updates `useRoutineStore`, `useHistoryStore`, `useExerciseStore`, and `useUserStore`.
