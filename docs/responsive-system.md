# GYM — Responsive Design System & Cross-Device Layout Architecture

## 1. Overview & Architectural Philosophy

The **GYM (Kinetic Companion)** application follows a **Fluid Adaptive Architecture**:
- **Mobile (< 640px)**: Focused, distraction-free workout companion with bottom floating glass navigation bar.
- **Tablet (640px – 1023px)**: Spacious productivity layout with multi-column card grids and expanded metrics.
- **Desktop (≥ 1024px)**: Complete fitness application workspace featuring a fixed, ergonomic navigation sidebar, 2-column analytics dashboards, and wide-span exercise discovery grids.

---

## 2. Breakpoint Taxonomy

| Breakpoint | Viewport Range | Device Classes | Navigation Pattern | Layout Structure |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Extra-Small** | `320px – 374px` | iPhone SE, small Androids | Floating Quartz BottomNav | 1 Column, compact steppers, overflow-free |
| **Mobile Standard** | `375px – 430px` | iPhone 14/15 Pro, Pixel 7/8, Galaxy S23 | Floating Quartz BottomNav | 1 Column, full touch targets |
| **Tablet Portrait** | `640px – 820px` | iPad Mini, iPad 10th Gen, Galaxy Tab | Floating BottomNav | 2-Column responsive grids (`md:grid-cols-2`) |
| **Tablet Landscape / Small Desktop** | `1024px – 1279px` | iPad Pro 12.9", MacBook Air 13" | Desktop Kinetic Sidebar (256px) | 2-to-3 Column grids, 12-column dashboard splits |
| **Desktop Workspace** | `1280px – 1920px+` | External Displays, iMac, 1080p/4K Screens | Desktop Kinetic Sidebar (256px) | Multi-column grid (`xl:grid-cols-3`, `2xl:max-w-7xl`) |

---

## 3. Navigation Adaptations

### A. Desktop Navigation Sidebar (`DesktopSidebar.tsx`)
- **Breakpoint**: Rendered on `lg:flex` (≥ 1024px).
- **Positioning**: Sticky `top-0 h-screen w-64` with frosted glass backdrop (`bg-white/85 backdrop-blur-md`).
- **Elements**:
  - Kinetic Brand Crest (Volt & Teal badge with "GYM Kinetic Companion").
  - Primary navigation links with high-contrast active states.
  - Active Workout Banner: Real-time pulse indicator and 1-tap "Resume Session" CTA.
  - Local Storage Privacy badge ("100% Offline / Local Storage").

### B. Mobile Floating Bottom Navigation (`BottomNav.tsx`)
- **Breakpoint**: Visible on mobile/tablet `< 1024px` (`lg:hidden`).
- **Context-Aware Suppression**: Automatically hides when entering active workout mode (`/workout-mode`, `/workout-complete`) to maximize screen estate for timers and set logs.

---

## 4. Screen-by-Screen Layout Specifications

### 1. Dashboard (`/`)
- **Mobile**: Stacked single-column hierarchy (Header → Today's Hero Card → Weekly Progress → Quick Access Grid).
- **Tablet / Desktop**: 12-column responsive layout:
  - `lg:col-span-7`: Today's Session Hero Card + Weekly Consistency Progress Strip.
  - `lg:col-span-5`: Quick Access Grid + Performance highlights.

### 2. Workouts & Routines (`/workouts`)
- **Mobile**: Single vertical stack of routine cards with sticky bottom "+ NEW ROUTINE" CTA.
- **Tablet / Desktop**: Responsive multi-column grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`) with top-right header action button.

### 3. Exercise Library (`/exercises`)
- **Mobile**: 2-column 3:4 aspect-ratio visual legend cards (`grid-cols-2`).
- **Tablet / Desktop**: 4-column masterclass grid (`sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5`).
- **Search Mode**: 3-column responsive card grid (`md:grid-cols-2 lg:grid-cols-3 gap-3`).

### 4. Muscle Category Drill-Down (`/exercises/category/:muscle`)
- **Mobile**: Hero banner (224px) + Equipment pills + Single-column exercise card list.
- **Tablet / Desktop**: Cinematic Hero banner (288px) + Multi-column exercise grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3`).

### 5. History & Logs (`/history`)
- **Mobile**: Vertical card stack with weekly/monthly filter tabs.
- **Tablet / Desktop**: 2-to-3 column grid (`md:grid-cols-2 xl:grid-cols-3 gap-4`).

### 6. Progress & Analytics (`/progress`)
- **Mobile**: 2-column summary metrics + Stacked Consistency + Chart + PRs list.
- **Tablet / Desktop**: 4-column metric cards (`grid-cols-4`) + 12-column split (Chart on left, PR trophy hall on right).

### 7. Profile & Settings (`/profile`, `/settings`)
- **Mobile**: Stacked avatar, progress overview card, settings menu.
- **Tablet / Desktop**: 2-column workspace split (Biometrics & performance on left, systematic settings categories on right).

### 8. Create Routine & Edit Routine (`/create-routine`, `/edit-routine/:id`)
- **Mobile**: Progressive top-down creation stack.
- **Tablet / Desktop**: Split workspace (`lg:col-span-5` Routine Parameters & Added Exercises Tray; `lg:col-span-7` Catalog Search & Inline Custom Creator).

### 9. Routine Preview (`/routine-preview/:id`)
- **Mobile**: Summary card on top, sequential exercise breakdown below.
- **Tablet / Desktop**: 2-Column layout (`lg:col-span-5` Summary Card, Start Workout CTA, Add More Exercises; `lg:col-span-7` Grouped Exercise Breakdown).

### 10. Workout Mode (`/workout-mode`)
- **Universal Constraint**: Centered focused training column (`max-w-2xl mx-auto`) with high-contrast tactile buttons for optimal thumb reachability and gym usability.
