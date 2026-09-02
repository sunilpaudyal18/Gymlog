# GYM — Data Model Specification

## Core Data Entities

### 1. User
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  goal: 'MUSCLE GAIN' | 'FAT LOSS' | 'STRENGTH' | 'ENDURANCE';
  weightKg: number;
  heightCm: number;
  heightFormatted: string; // e.g. "5'7\""
  bmi: number;
  unitPreference: 'kg' | 'lbs';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultRestSeconds: number; // e.g. 120
  createdAt: number;
}
```

### 2. MuscleGroup & Exercise
```typescript
export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'abs'
  | 'calves'
  | 'forearms';

export type Equipment = 
  | 'barbell'
  | 'dumbbells'
  | 'cables'
  | 'machine'
  | 'bodyweight'
  | 'smith_machine'
  | 'kettlebell'
  | 'resistance_band'
  | 'landmine'
  | 'trap_bar'
  | 'plate_loaded'
  | 'other';

export type MovementPattern =
  | 'horizontal_push'
  | 'vertical_push'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'isolation'
  | 'carry'
  | 'flexion'
  | 'extension'
  | 'rotation';

export interface Exercise {
  id: string;
  name: string;
  aliases?: string[];
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  category: 'compound' | 'isolation';
  movementPattern?: MovementPattern;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  videoUrl?: string;
  instructions?: string[];
  formTips?: string[];
  commonMistakes?: string[];
  defaultSets: number;
  defaultReps: string; // e.g. "8-12"
  defaultRestSeconds: number;
  defaultWeightKg?: number;
  isCompound?: boolean;
  isUnilateral?: boolean;
  isBodyweight?: boolean;
  isTimed?: boolean;
  searchableTerms?: string[];
  variations?: string[];
}
```

### 3. Routine & RoutineExercise
```typescript
interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  targetSets: number;
  targetReps: string; // e.g. "8-10" or "10"
  targetWeightKg?: number;
  restSeconds: number;
  notes?: string;
  order: number;
}

interface Routine {
  id: string;
  userId?: string;
  name: string; // e.g. "Chest + Triceps Focus", "Push Day Workout"
  targetMuscles: MuscleGroup[];
  exercises: RoutineExercise[];
  estimatedDurationMin: number;
  lastPerformed?: string; // e.g. "Today (active)", "Yesterday", "3 days ago"
  isActive?: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### 4. WorkoutSession & WorkoutSet (Live & History)
```typescript
interface WorkoutSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  targetWeightKg?: number;
  targetReps?: number;
  completed: boolean;
  isPR?: boolean;
  completedAt?: number;
}

interface WorkoutExerciseSession {
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: MuscleGroup;
  equipment: Equipment;
  restSeconds: number;
  notes?: string;
  sets: WorkoutSet[];
  lastTimePerformance?: {
    weightKg: number;
    reps: number;
  };
}

interface WorkoutSession {
  id: string;
  routineId?: string;
  routineName: string; // e.g. "Chest + Triceps Focus"
  startedAt: number;
  completedAt?: number;
  durationSeconds: number;
  exercises: WorkoutExerciseSession[];
  status: 'in_progress' | 'completed' | 'abandoned';
  totalVolumeKg: number;
  totalSetsCompleted: number;
  newPRsCount: number;
  synced: boolean;
}
```

### 5. PersonalRecord & ProgressRecord
```typescript
interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  estimated1RM: number;
  achievedAt: number;
  formattedDate: string; // e.g. "Aug 24, 2025"
}

interface StrengthProgressPoint {
  date: string; // e.g. "May", "Jun", "Jul", "Aug"
  timestamp: number;
  weightKg: number;
  reps: number;
  exerciseId: string;
}
```

### 6. SyncState
```typescript
interface SyncStatus {
  isOnline: boolean;
  syncState: 'connected' | 'syncing' | 'synced' | 'error';
  lastSyncedAt?: number;
  pendingChangesCount: number;
  errorMessage?: string;
}
```
