# GYM — 100% Local Offline Storage Architecture

## 1. Overview & Core Principle

**"USER DATA IS 100% DURABLE, LOCAL & PRIVATE"**

Gym Log is engineered as a backend-free, cloud-free, offline-first application. When a user creates a routine, assigns days in the weekly planner, logs workout sets, or achieves a personal record:
1. The action executes immediately in runtime state (Zustand).
2. The transaction is durably committed to browser IndexedDB (`gym_offline_db`).
3. The UI reflects changes with 0ms perceptible latency.
4. **Zero network calls are made. Zero external accounts are required.**

---

## 2. PWA & Service Worker Caching Strategy

### A. App Shell & Static Assets
- **Cache Name**: `gym-kinetic-cache-v3`
- **Cache-First Strategy**:
  - HTML, CSS, JavaScript chunks, bundled fonts (Inter, JetBrains Mono), and SVG icons.
  - Pre-cached upon install and claimed immediately on activation.

### B. Navigation & Dynamic Routes
- **Offline Navigation Fallback**:
  - All navigation requests fall back to cached `/index.html` when offline, allowing full React Router client-side execution across all application screens (`/`, `/workouts`, `/exercises`, `/workout-mode`, `/history`, `/progress`, `/profile`, `/settings`).

---

## 3. Durable Storage Architecture

```text
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

