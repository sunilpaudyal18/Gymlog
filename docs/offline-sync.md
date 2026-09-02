# GYM — Offline & Synchronization Architecture

## 1. Overview & Core Principle

**"USER DATA > NETWORK RESPONSE"**

The GYM workout companion prioritizes local data durability over remote network synchronization. When a user logs a set, completes a routine, or modifies preferences:
1. The action executes immediately in local memory/state.
2. The transaction is durably committed to browser persistence (`localStorage` / IndexedDB via Zustand persist).
3. The mutation is queued into the centralized **Sync Outbox** (`useSyncManager`).
4. The UI reflects the change with zero perceptible latency.
5. When online, the Sync Manager processes pending mutations with idempotency keys and exponential backoff.

---

## 2. PWA & Service Worker Caching Strategy

### A. App Shell & Static Assets
- **Cache Name**: `gym-kinetic-cache-v1`
- **Cache-First Strategy**:
  - HTML, CSS, JavaScript chunks, fonts (Inter, JetBrains Mono), and SVG icons (`/icon-192.svg`, `/icon-512.svg`, `/manifest.json`).
  - Cache is populated upon `install` and purged on `activate` for smooth version upgrades.

### B. Navigation & Dynamic Routes
- **Network-First with Cache Fallback**:
  - When offline, navigation requests seamlessly fall back to `/index.html`, allowing full client-side routing across all screens (`/`, `/workouts`, `/exercises`, `/workout-mode`, `/history`, `/progress`, `/profile`, `/settings`).

---

## 3. Offline Outbox & Mutation Queue

Each offline mutation is tracked as an `OutboxItem`:
```typescript
interface OutboxItem {
  id: string;
  operationType: 'CREATE_SESSION' | 'UPDATE_ROUTINE' | 'DELETE_ROUTINE' | 'UPDATE_PREFERENCES';
  entityType: 'workout_session' | 'routine' | 'user_profile';
  entityId: string;
  payload: any;
  createdAt: number;
  updatedAt: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  idempotencyKey: string;
}
```

### Idempotency & Duplicate Prevention
- Mutations use deterministic `idempotencyKey` values (e.g. `CREATE_SESSION-${sessionId}`).
- Rapid repeated taps or multiple reconnections will not enqueue duplicate mutations.

---

## 4. Conflict Resolution Strategy
- **Client Wins on Workout Performance**: Actual workout logs and logged sets represent physical actions performed by the user and are never destructively overwritten.
- **Last-Write-Wins on Preferences**: Timestamp comparison reconciles configuration updates (e.g., Weight unit).

---

## 5. Summary of Supported Connectivity States
- `ONLINE`: Connected to the network; pending outbox is processed.
- `OFFLINE`: Disconnected; all actions persist locally and outbox mutations queue silently.
- `SYNCING`: Outbox is actively synchronizing with the cloud.
- `SYNCED`: All local records match cloud state.
