# GYM — High-Performance Local-First Workout Tracker & Telemetry System

<div align="center">

![Kinetic G Barbell](public/kinetic-mark-master.png)

### **The Private, Account-Free, 60fps Offline Workout Engine**

[![Built by Sunil Paudyal](https://img.shields.io/badge/Author-Sunil%20Paudyal-008B8E?style=for-the-badge&logo=react&logoColor=white)](https://sunilpaudyal.com.np)
[![License: MIT](https://img.shields.io/badge/License-MIT-0F172A?style=for-the-badge)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20%26%20Offline-B4FF39?style=for-the-badge&labelColor=0F172A)](https://github.com/sunilpaudyal18/Gymlog)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-008B8E?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## Overview

**GYM** is an ultra-responsive, local-first progressive web application (PWA) designed for serious lifters, bodybuilders, and athletes. Built from the ground up to eliminate forced account logins, paywalls, and bloated server latency, **GYM** stores 100% of your training volume, routines, and telemetry directly in your client browser.

Whether lifting in a basement with zero cellular reception or flying across timezones, your routines, exercise library, rest timers, and personal records function flawlessly offline at a steady 60 frames per second.

---

## Visual Tour & Interface

<div align="center">

### Desktop Athlete Command Center
*Dynamic Day-of-the-Week Schedule, Rest Day Recovery Metrics & Quick Access*
![Desktop Dashboard](docs/screenshots/desktop-dashboard.png)

---

### Muscle Library & Golden Era Categorization
*Curated canonical movements across 8 muscle groups with legendary athlete masterclasses*
![Exercise Library](docs/screenshots/exercise-library.png)

---

### Masterclass Anatomical & Equipment Filtering
*Targeted sub-muscle isolation (Upper/Mid/Lower) and multi-equipment filtering*
![Exercise Masterclass](docs/screenshots/exercise-masterclass.png)

---

### Mobile-First Workout Execution
*Tactile card layouts, live session resume pills, and quick routine hot-swapping*
<br/>
<img src="docs/screenshots/mobile-dashboard.png" width="380" alt="Mobile Dashboard" />

</div>

---

## Core System Features

### 1. 100% Local-First, Backend-Free & Offline-Only
* **Zero Account & Zero Cloud**: Start tracking immediately. No login, no backend server, no cloud database, no third-party telemetry, and no fake sync indicators.
* **IndexedDB Durable Source of Truth**: User routines, weekly planner splits, custom movements, completed workouts, and personal records reside durably in on-device IndexedDB (`gym_offline_db`).
* **Offline Service Worker (PWA)**: Full cache-first offline service worker ensures instantaneous cold startups on iOS Safari, Android Chrome, and Desktop browsers even in airplane mode.
* **Hard Refresh & Restart Resilience**: Safe hydration barrier blocks UI rendering until IndexedDB is connected, guaranteeing that hard refreshes (`Ctrl + F5`), browser restarts, or PWA updates never erase user records.
* **Local JSON Backup & Restore**: Export your complete routine database into a clean JSON file at any time, or import previous backups with automatic pre-restore safety snapshots.

---

### 2. Dynamic Day-of-the-Week Split Scheduler
* **Calendar Engine**: Automatically calculates the athlete's current day of the week (Sunday through Saturday) using client local timezone time.
* **Pristine Blank Slate for New Users**: Brand new users start with an unassigned, clean weekly schedule (Sunday–Saturday unassigned), empowering you to build your custom routine split completely from scratch.
* **Interactive Hot-Swap Modal**:
  * Switch any day's routine on the fly or mark today as a Rest Day.
  * Layered at `z-[100]` with a mobile drag handle and safe-area padding to eliminate navigation bar clipping.
  * Active split highlighted with an Electric Teal accent bar (`border-l-[4px] border-l-[#008B8E]`).
  * Live workout protection prompt: If a session is in progress with completed sets, the engine requests confirmation before discarding ongoing lifts.

---

### 3. Unified Session State & Live Navigation Sync
* **Single Source of Truth (`useTodaySession`)**: All components across the application consume a unified reactive state (`status`, `isRestDay`, `activeSession`, `routineName`, `todayRoutine`).
* **Synchronized Indicators**:
  * Desktop sidebar dynamically switches between `WORKOUT IN PROGRESS (Resume Session)` and `TODAY'S TARGET (Start Workout / Choose Routine)`.
  * Mobile header displays a pulsing `Resume` button only when an active workout is underway.
  * Bottom navigation pings the Workout tab when lifting and cleanly dismisses all live badges on Rest Days.

---

### 4. Canonical Exercise Library & Legendary Masterclasses
* **8 Curated Muscle Groups with 200+ Canonical Exercises**:
  * **Chest**: Arnold Schwarzenegger (*The Austrian Oak*) — Flat, incline, decline barbell & dumbbell presses, cable crossovers, dips, floor presses
  * **Back**: Ronnie Coleman (*The King*) — Deadlifts, barbell bent-over rows, Pendlay rows, lat pulldowns, T-bar rows, chest-supported rows
  * **Shoulders**: Franco Columbu (*3D Capped Delts*) — Overhead presses, push presses, Arnold presses, lateral raises, face pulls, rear delt flyes
  * **Biceps**: Larry Scott (*The Golden Arm*) — Barbell curls, EZ preacher curls, incline dumbbell curls, hammer curls, spider curls, concentration curls
  * **Triceps**: Dorian Yates (*Horseshoe Triceps*) — Skull crushers, close-grip bench presses, rope pushdowns, overhead extensions, JM presses
  * **Legs**: Tom Platz (*The Golden Eagle*) — Barbell back squats, front squats, Romanian deadlifts, Bulgarian split squats, leg presses, hack squats
  * **Abs**: Frank Zane (*The Aesthetic King*) — Hanging leg raises, ab wheel rollouts, cable woodchoppers, dragon flags, planks
  * **Forearms**: Lee Priest (*Iron Grip*) — Wrist curls, reverse curls, farmer's carries, dead hangs, plate pinch holds
* **Anatomical Target Filters**: Instant sub-muscle filtering across all major isolation zones.
* **Equipment Categories**: Multi-select filtering across Barbell, Dumbbells, Machine, Cables, Bodyweight, Smith Machine, Plate Loaded, and Landmine.
* **Custom Movement Creation**: Add custom exercises with target sets, rep ranges, and movement type classifications (Compound vs. Isolation) that persist directly in IndexedDB.

---

### 5. Progress & Analytics Telemetry Dashboard (`/progress`)
* **Key Metric KPI Strip**:
  * **60fps Count-Up Number Tickers**: Animated telemetry numbers mounted via `requestAnimationFrame`.
  * **Dynamic Micro Sparklines**: Inline SVG volume curves in Performance Teal (`#008B8E`).
  * **Radial Weekly Completion Ring**: Circular SVG meter tracking weekly workouts against your frequency target (e.g. 80% Target).
* **Interactive Weekly Consistency Heatmap**:
  * 7-day Monday–Sunday activity matrix.
  * Today highlighted with an **Electric Volt (`#B4FF39`) pulse ring** and neon under-glow.
  * Interactive hover/touch popovers displaying session routine, total tonnage, sets, and training duration.
* **Strength Telemetry SVG Chart**:
  * Area line graph with gradient fill and peak volt markers.
  * Filter by exercise (Bench Press, Squat, Deadlift, Overhead Press).
  * Hover crosshair inspection tracking absolute load and estimated 1RM.
  * **Ghost Projection Empty State**: Dashed projections encouraging consistency when data points are sparse.
* **Personal Record (PR) Trophy Board**:
  * Tiered energy badges for Gold, Amber, and Slate milestones.
  * **"New PR" Flash Badge**: Shimmering energy pill on records broken within the last 14 days.
  * **Tap-to-Inspect Progression Modal**: Displays complete historical timeline of all attempts with calculated 1RM estimations.

---

### 6. Splash Screen / Boot Loader
* **Hardware-Accelerated Launch**: Fullscreen AMOLED/Deep Slate overlay (`fixed inset-0 z-[9999] bg-[#0F172A]`).
* **Kinetic Floating Mark**: Floating "Kinetic G Barbell" glyph with vertical float (`translateY(-6px)` to `translateY(6px)` over 2.2s `ease-in-out`).
* **Pulsing Ambient Glow**: Dual radial glow in Electric Volt (`#B4FF39`, opacity: 0.18) and Performance Teal (`#008B8E`).
* **Traveling Energy Line**: Linear progress track with traveling Electric Volt streak.
* **Stepping Telemetry Messages**: Sequential status indicators in JetBrains Mono (`INITIALIZING TELEMETRY...` → `SYNCHRONIZING SPLIT...` → `CALIBRATING SENSORS...` → `SYSTEM READY`).
* **Seamless Opacity Exit**: 400ms cubic-bezier fade-out and complete DOM unmount with zero residual layout shift.

---

## Design System & Brand Palette

The user interface follows the **"Kinetic G Barbell"** design tokens:

| Token | Hex Code | Role | Description |
| :--- | :--- | :--- | :--- |
| **Performance Teal** | `#008B8E` | Primary Brand | Primary buttons, active tabs, volume charts, and focus highlights |
| **Electric Volt** | `#B4FF39` | Kinetic Accent | Active day pulse rings, peak markers, and energy indicators |
| **Burnt Amber** | `#D96B27` | Energy Accent | Workload metrics, calories, PR trophies, and swap badges |
| **Deep Slate** | `#0F172A` | Dark Neutral | Dark typography, dark CTA buttons, and splash screen canvas |
| **Light Quartz** | `#F4F6F9` | Light Base | Background canvas, crisp glass card backdrops, and subtle borders |

---

## Tech Stack & Storage Architecture

```text
GYM LOG STORAGE ARCHITECTURE

Primary durable storage:
IndexedDB (gym_offline_db)

Runtime state:
Zustand

Small metadata/preferences:
localStorage only where necessary

Offline application resources:
Service Worker Cache Storage (gym-kinetic-cache-v3)

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

* **Framework**: React 18 + TypeScript (Strict Mode)
* **Bundler & Tooling**: Vite 6
* **Styling**: Vanilla CSS + Tailwind CSS (Utility tokens and CSS keyframes)
* **Durable Database**: IndexedDB (`gym_offline_db` v2) with transactional repositories
* **Runtime State**: Zustand (In-memory reactive UI state only)
* **Icons**: Lucide React (Locally bundled SVGs)
* **Typography**: `@fontsource/inter` (UI & Headings) + `@fontsource/jetbrains-mono` (Telemetry & Metrics) — 100% self-hosted
* **PWA & Offline**: Custom Service Worker + Web App Manifest (`gym-kinetic-cache-v3`)

---

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* `npm` or `pnpm` or `yarn`

### Installation

```bash
# Clone the repository
git clone https://github.com/sunilpaudyal18/Gymlog.git

# Navigate into project directory
cd Gymlog

# Install dependencies
npm install

# Launch local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Creator & Attribution

Designed, engineered, and maintained with obsession by **Sunil Paudyal**:

* **Portfolio**: [sunilpaudyal.com.np](https://sunilpaudyal.com.np)
* **GitHub**: [@sunilpaudyal18](https://github.com/sunilpaudyal18)

---

## License

This project is licensed under the [MIT License](LICENSE). Feel free to fork, customize, and build upon it!
