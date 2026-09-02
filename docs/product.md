# GYM — Product Vision & Specification

## Product Philosophy
> **LESS TYPING. LESS THINKING. MORE TRAINING.**

The application makes workout tracking friction-free, instantaneous, and highly visual. A lifter should spend their gym session lifting weights and recovering—not tapping complex sub-menus or typing routine names over and over.

---

## Core User Flow
```
OPEN APP
  ↓
SEE TODAY'S WORKOUT (Active Routine)
  ↓
START WORKOUT (One Tap)
  ↓
PERFORM EXERCISE
  ↓
LOG SET (Weight × Reps auto-populated or quick stepper)
  ↓
REST TIMER STARTS AUTOMATICALLY
  ↓
REST (+30s / Skip / Sound feedback)
  ↓
NEXT SET / NEXT EXERCISE
  ↓
COMPLETE WORKOUT
  ↓
SEE CELEBRATORY SUMMARY & STATS (Volume, PRs, Duration)
  ↓
TRACK LONG-TERM PROGRESS & HISTORY
```

---

## Feature Scope & Specifications

### 1. Home Dashboard
- **Header**: Personalized greeting (`Good morning, Alex 👋`), user avatar badge, status tagline (`Ready to crush your goals today?`).
- **Today's Session Hero Card**: Highlighted active workout (e.g. `Chest + Triceps Focus`, 6 exercises, 20 sets, ~55 min) with high-contrast primary CTA `▶ START WORKOUT`.
- **Weekly Progress Strip**: Days of current week (M T W T F S S) with completion check indicators and a link to `Details`.
- **Quick Access Grid**: Fast jump buttons to *My Routines*, *Exercises*, *Progress*, *History*.
- **Bottom Navigation**: Sticky bar with icons for Home, Workouts, Exercises, Progress, Profile.

### 2. Workouts & Routines
- **My Routines List**: Overview of routines (e.g. `Push Day Workout`, `Pull Day Focus`, `Leg Destroyer`, `Chest + Triceps Focus`) with meta (last performed, exercise count, total sets) and quick action buttons `START` and `EDIT`.
- **Create Routine**:
  - Routine Name input.
  - Target Muscle Pills selection (`Chest`, `Back`, `Shoulders`, `Biceps`, `Triceps`, `Legs`, `Abs`).
  - Recommended Exercise List categorized by muscle focus with `+` quick-add buttons.
  - Save button.
- **Routine Preview / Editor**:
  - Reorderable exercise list with drag handles, set/rep counters, edit, and delete icons.
  - Exercise count, total sets, estimated duration.
  - `EDIT SCHEDULING` & `SAVE ROUTINE` / `START WORKOUT` CTAs.

### 3. Exercise Library
- **Search Bar**: Instant keyword filter across all exercises.
- **Browse by Muscle Group**: Interactive muscle category cards (`Chest`, `Back`, `Shoulders`, `Biceps`, `Triceps`, `Legs`, `Glutes`, `Abs`, `Calves`, `Forearms`) showing exercise counts.
- **Add / Configure Exercise Modal / Screen**:
  - Exercise hero image / banner.
  - Exercise details: Primary muscle, equipment tags.
  - Workout variable configuration: Target Sets (stepper), Target Reps (stepper), Rest duration & Target weight.
  - Optional training focus notes.
  - `ADD EXERCISE` CTA.

### 4. Live Workout Mode & Rest Timer
- **Live Header**: Current workout routine name, exercise index progress (`Exercise 2 of 6`).
- **Current Exercise Card**:
  - Exercise title, current set indicator (`SET 3 / 3`).
  - Huge legible target load display (`32.5 kg × 10`).
  - Target vs Last Time comparison (`LAST TIME: 32.5 kg × 10`).
  - Target rest duration badge (`⏱ REST: 02:00`).
- **Set Log Table**: Interactive table with columns `SET`, `WEIGHT`, `REPS`, `STATUS`. Active set is highlighted in neon green surface. Completed sets receive checkmark status.
- **Sticky CTA**: Huge `✓ COMPLETE SET` button.
- **Rest Timer Modal / Screen**:
  - Giant circular countdown ring with remaining time (`01:43`).
  - Target time indicator (`Target: 02:00`).
  - Quick adjustment pills: `+ +30 SEC`, `⏭ SKIP REST`, `TAP TO SKIP`.
  - Next exercise preview banner (`UP NEXT: Cable Fly • 3 sets • 12-15 reps`).

### 5. Workout Completion
- **Celebration Hero**: Animated check badge, `WORKOUT COMPLETE 🎉`, routine title, congratulatory quote.
- **Session Metrics Card**:
  - Duration (e.g., `54 min`)
  - Exercises completed (e.g., `6 Completed`)
  - Total Sets (e.g., `20 logged`)
  - Volume Lifted (e.g., `12,450 kg`)
  - New PRs (e.g., `2 Achieved`)
- **Actions**: `DONE` (Return to Home) & `VIEW DETAILED SUMMARY`.

### 6. Progress & Analytics
- **Summary Metrics**: Frequency (`4/wk`), Weekly Volume (`12,540 kg`), Total Workouts (`48 Total`).
- **Strength Progress Chart**: Interactive trend chart with exercise switcher pill (e.g., `BENCH PRESS`) and monthly timeline points.
- **Personal Records List**: Cards displaying exercise name, date achieved, and max weight × reps achieved (`85 kg × 8 reps`).

### 7. Workout History
- **Chronological List**: Grouped by date (e.g., `AUGUST 28`, `AUGUST 26`).
- **Workout Cards**: Routine title, status badge (`LAST WEEK`), exercise count, sets, duration, and actions (`View Details`, `Repeat Workout`).

### 8. Profile & Settings
- **User Header**: Avatar, name (`Alex Johnson`), active goal badge (`GOAL: MUSCLE GAIN`).
- **Body Metric Snapshot**: Weight (`65.5 kg`), Height (`5'7"`), BMI (`22.4`).
- **Menu Settings**: Body Measurements, Training Preferences, Timer Settings, Notifications, Sound & Vibration, App Preferences, Settings, Help & Support.

### 9. Offline & Sync States
- **Offline Banner**: Sticky top amber notification (`≥ OFFLINE MODE: Data will sync when connected`).
- **Sync Status**: Real-time cloud sync indicators (`Connected [ONLINE]`, `Syncing... [PENDING]`, `All data synced [SUCCESS]`, `Sync failed [ERROR] - TAP TO RETRY`).
- **Empty States**: Custom illustrations and action triggers for Empty Routines, Empty History, and Empty Progress.
