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
  | 'forearms'
  | 'full_body';

export type Equipment =
  | 'barbell'
  | 'dumbbells'
  | 'cables'
  | 'machine'
  | 'bodyweight'
  | 'smith_machine'
  | 'resistance_band'
  | 'kettlebell'
  | 'landmine'
  | 'plate_loaded'
  | 'ez_bar'
  | 'trap_bar'
  | 'other';

export type MovementPattern =
  | 'horizontal_push'
  | 'vertical_push'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'carry'
  | 'flexion'
  | 'extension'
  | 'rotation'
  | 'isolation';

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
  defaultReps: string; // e.g. "8-12" or "10"
  defaultRestSeconds: number; // e.g. 120
  defaultWeightKg?: number;
  isCompound?: boolean;
  isUnilateral?: boolean;
  isBodyweight?: boolean;
  isTimed?: boolean;
  searchableTerms?: string[];
  variations?: string[];
  isCustom?: boolean;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  targetSets: number;
  targetReps: string; // e.g. "8-10"
  targetWeightKg?: number;
  restSeconds: number;
  notes?: string;
  order: number;
}

export interface Routine {
  id: string;
  name: string; // e.g. "Chest + Triceps Focus"
  targetMuscles: MuscleGroup[];
  exercises: RoutineExercise[];
  estimatedDurationMin: number;
  lastPerformed?: string; // e.g. "Today (active)", "Yesterday", "3 days ago"
  isActive?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WorkoutSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  targetWeightKg?: number;
  targetReps?: number;
  completed: boolean;
  isPR?: boolean;
  completedAt?: number;
}

export interface WorkoutExerciseSession {
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

export interface WorkoutSession {
  id: string;
  routineId?: string;
  routineName: string;
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

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  estimated1RM: number;
  achievedAt: number;
  formattedDate: string; // e.g. "Aug 24, 2025"
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  goal: string;
  weightKg: number;
  heightFormatted: string;
  bmi: number;
  unitPreference: 'kg' | 'lb' | 'lbs';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultRestSeconds: number;
}

export interface SyncStatus {
  isOnline: boolean;
  syncState: 'connected' | 'syncing' | 'synced' | 'error';
  lastSyncedAt?: number;
  pendingChangesCount: number;
  errorMessage?: string;
}
