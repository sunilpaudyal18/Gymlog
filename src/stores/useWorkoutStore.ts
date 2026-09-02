import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutSession, WorkoutExerciseSession, WorkoutSet, Routine } from '../types';
import { soundFX } from '../utils/audio';

export type RestTimerState = 'idle' | 'running' | 'paused' | 'completed' | 'skipped';

interface WorkoutState {
  activeSession: WorkoutSession | null;
  currentExerciseIndex: number;
  activeSetIndex: number;
  isPaused: boolean;

  // Timestamp-based Timer State Machine
  timerState: RestTimerState;
  restStartedAt: number | null;
  restTargetSeconds: number;
  restEndsAt: number | null;
  pausedAt: number | null;
  remainingWhenPaused: number | null;
  restTimeRemaining: number;
  showRestModal: boolean;
  timerIntervalId: number | null;

  // Actions
  startWorkoutFromRoutine: (routine: Routine, historySessions?: WorkoutSession[]) => void;
  loadActiveSessionFromRoutineId: (routineId: string, routines: Routine[], historySessions?: WorkoutSession[]) => void;
  completeCurrentSet: () => void;
  updateSetWeightAndReps: (exerciseIndex: number, setIndex: number, weightKg: number, reps: number) => void;
  setCurrentExerciseIndex: (index: number) => void;
  setActiveSetIndex: (index: number) => void;
  togglePauseWorkout: () => void;

  // Rest Timer Controls
  startRestTimer: (seconds?: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  addSecondsRest: (seconds: number) => void;
  subtractSecondsRest: (seconds: number) => void;
  skipRestTimer: () => void;
  updateRestCountdown: () => void;
  setShowRestModal: (show: boolean) => void;

  // Session completion & lifecycle
  finishWorkout: () => WorkoutSession | null;
  cancelWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      currentExerciseIndex: 0,
      activeSetIndex: 0,
      isPaused: false,

      timerState: 'idle',
      restStartedAt: null,
      restTargetSeconds: 120,
      restEndsAt: null,
      pausedAt: null,
      remainingWhenPaused: null,
      restTimeRemaining: 0,
      showRestModal: false,
      timerIntervalId: null,

      startWorkoutFromRoutine: (routine, historySessions = []) => {
        const { timerIntervalId } = get();
        if (timerIntervalId) clearInterval(timerIntervalId);

        const workoutExercises: WorkoutExerciseSession[] = routine.exercises.map((re) => {
          const setsCount = re.targetSets || 3;

          // Lookup previous performance from history sessions
          let lastTime = {
            weightKg: re.targetWeightKg || 32.5,
            reps: parseInt(re.targetReps) || 10,
          };

          for (const hist of historySessions) {
            const histEx = hist.exercises.find((e) => e.exerciseId === re.exerciseId);
            if (histEx && histEx.sets.length > 0) {
              const compSet = histEx.sets.find((s) => s.completed) || histEx.sets[0];
              lastTime = {
                weightKg: compSet.weightKg,
                reps: compSet.reps,
              };
              break;
            }
          }

          const sets: WorkoutSet[] = Array.from({ length: setsCount }, (_, i) => ({
            setNumber: i + 1,
            weightKg: lastTime.weightKg,
            reps: lastTime.reps,
            targetWeightKg: re.targetWeightKg,
            targetReps: parseInt(re.targetReps) || 10,
            completed: false,
          }));

          return {
            exerciseId: re.exerciseId,
            exerciseName: re.exerciseName,
            primaryMuscle: re.muscleGroup,
            equipment: re.equipment,
            restSeconds: re.restSeconds || 120,
            notes: re.notes,
            sets,
            lastTimePerformance: lastTime,
          };
        });

        const newSession: WorkoutSession = {
          id: 'session-' + Date.now(),
          routineId: routine.id,
          routineName: routine.name,
          startedAt: Date.now(),
          durationSeconds: 0,
          exercises: workoutExercises,
          status: 'in_progress',
          totalVolumeKg: 0,
          totalSetsCompleted: 0,
          newPRsCount: 0,
          synced: false,
        };

        set({
          activeSession: newSession,
          currentExerciseIndex: 0,
          activeSetIndex: 0,
          isPaused: false,
          timerState: 'idle',
          restStartedAt: null,
          restEndsAt: null,
          pausedAt: null,
          remainingWhenPaused: null,
          restTimeRemaining: 0,
          showRestModal: false,
          timerIntervalId: null,
        });
      },

      loadActiveSessionFromRoutineId: (routineId, routines, historySessions) => {
        const { activeSession } = get();
        if (activeSession && activeSession.routineId === routineId && activeSession.status === 'in_progress') {
          return;
        }
        const targetRoutine = routines.find((r) => r.id === routineId) || routines[0];
        if (targetRoutine) {
          get().startWorkoutFromRoutine(targetRoutine, historySessions);
        }
      },

      updateSetWeightAndReps: (exerciseIndex, setIndex, weightKg, reps) => {
        const { activeSession } = get();
        if (!activeSession) return;

        const exercises = [...activeSession.exercises];
        if (!exercises[exerciseIndex]) return;

        const sets = [...exercises[exerciseIndex].sets];
        if (!sets[setIndex]) return;

        sets[setIndex] = {
          ...sets[setIndex],
          weightKg: Math.max(0, weightKg),
          reps: Math.max(0, reps),
        };

        exercises[exerciseIndex] = {
          ...exercises[exerciseIndex],
          sets,
        };

        set({
          activeSession: {
            ...activeSession,
            exercises,
          },
        });
      },

      completeCurrentSet: () => {
        const { activeSession, currentExerciseIndex, activeSetIndex } = get();
        if (!activeSession) return;

        const currentEx = activeSession.exercises[currentExerciseIndex];
        if (!currentEx) return;

        const updatedSets = [...currentEx.sets];
        const targetSet = updatedSets[activeSetIndex];
        if (!targetSet) return;

        // Mark set as completed
        updatedSets[activeSetIndex] = {
          ...targetSet,
          completed: true,
          completedAt: Date.now(),
        };

        const updatedExercises = [...activeSession.exercises];
        updatedExercises[currentExerciseIndex] = {
          ...currentEx,
          sets: updatedSets,
        };

        // Calculate total workout volume & completed sets count
        let totalVolume = 0;
        let totalSets = 0;
        updatedExercises.forEach((ex) => {
          ex.sets.forEach((s) => {
            if (s.completed) {
              totalVolume += s.weightKg * s.reps;
              totalSets += 1;
            }
          });
        });

        // Audio & Haptic feedback
        soundFX.playSetComplete();
        soundFX.vibrate(80);

        const nextSetIdx = activeSetIndex + 1;
        const isExerciseFinished = nextSetIdx >= currentEx.sets.length;

        set({
          activeSession: {
            ...activeSession,
            exercises: updatedExercises,
            totalVolumeKg: totalVolume,
            totalSetsCompleted: totalSets,
          },
          activeSetIndex: isExerciseFinished ? activeSetIndex : nextSetIdx,
        });

        // Automatically start timestamp-based rest timer
        get().startRestTimer(currentEx.restSeconds || 120);
      },

      // Accurate timestamp-based timer calculations
      startRestTimer: (seconds) => {
        const { timerIntervalId } = get();
        if (timerIntervalId) clearInterval(timerIntervalId);

        const targetSec = seconds ?? get().restTargetSeconds;
        const now = Date.now();
        const endTime = now + targetSec * 1000;

        set({
          timerState: 'running',
          restStartedAt: now,
          restEndsAt: endTime,
          restTargetSeconds: targetSec,
          restTimeRemaining: targetSec,
          pausedAt: null,
          remainingWhenPaused: null,
          showRestModal: true,
        });

        const interval = window.setInterval(() => {
          const { timerState, restEndsAt } = get();
          if (timerState !== 'running' || !restEndsAt) return;

          const currentNow = Date.now();
          const remainingMs = restEndsAt - currentNow;
          const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

          if (remainingSec <= 0) {
            clearInterval(interval);
            soundFX.playTimerBeep(true);
            soundFX.vibrate([120, 60, 120]);

            // Auto-advance exercise if all sets complete
            const { activeSession, currentExerciseIndex, activeSetIndex } = get();
            if (activeSession) {
              const currEx = activeSession.exercises[currentExerciseIndex];
              if (currEx && activeSetIndex >= currEx.sets.length - 1 && currEx.sets.every((s) => s.completed)) {
                if (currentExerciseIndex < activeSession.exercises.length - 1) {
                  set({
                    currentExerciseIndex: currentExerciseIndex + 1,
                    activeSetIndex: 0,
                  });
                }
              }
            }

            set({
              timerState: 'completed',
              restEndsAt: null,
              restTimeRemaining: 0,
              timerIntervalId: null,
              showRestModal: false,
            });
          } else {
            if (remainingSec <= 3 && remainingSec > 0) {
              soundFX.playTimerBeep(false);
            }
            set({ restTimeRemaining: remainingSec });
          }
        }, 1000);

        set({ timerIntervalId: interval });
      },

      pauseRestTimer: () => {
        const { timerState, restEndsAt, timerIntervalId } = get();
        if (timerState !== 'running' || !restEndsAt) return;

        if (timerIntervalId) clearInterval(timerIntervalId);

        const now = Date.now();
        const remainingSec = Math.max(0, Math.ceil((restEndsAt - now) / 1000));

        set({
          timerState: 'paused',
          pausedAt: now,
          remainingWhenPaused: remainingSec,
          restTimeRemaining: remainingSec,
          timerIntervalId: null,
        });
      },

      resumeRestTimer: () => {
        const { timerState, remainingWhenPaused } = get();
        if (timerState !== 'paused' || remainingWhenPaused === null) return;

        const remaining = remainingWhenPaused;
        get().startRestTimer(remaining);
      },

      addSecondsRest: (seconds) => {
        const { timerState, restEndsAt, restTargetSeconds, remainingWhenPaused } = get();
        if (timerState === 'paused' && remainingWhenPaused !== null) {
          const newRemaining = remainingWhenPaused + seconds;
          set({
            remainingWhenPaused: newRemaining,
            restTargetSeconds: restTargetSeconds + seconds,
            restTimeRemaining: newRemaining,
          });
        } else if (timerState === 'running' && restEndsAt) {
          const newEndTime = restEndsAt + seconds * 1000;
          const newRemaining = Math.max(0, Math.ceil((newEndTime - Date.now()) / 1000));
          set({
            restEndsAt: newEndTime,
            restTargetSeconds: restTargetSeconds + seconds,
            restTimeRemaining: newRemaining,
          });
        }
      },

      subtractSecondsRest: (seconds) => {
        const { timerState, restEndsAt, remainingWhenPaused } = get();
        if (timerState === 'paused' && remainingWhenPaused !== null) {
          const newRemaining = Math.max(1, remainingWhenPaused - seconds);
          set({
            remainingWhenPaused: newRemaining,
            restTimeRemaining: newRemaining,
          });
        } else if (timerState === 'running' && restEndsAt) {
          const newEndTime = Math.max(Date.now() + 1000, restEndsAt - seconds * 1000);
          const newRemaining = Math.max(1, Math.ceil((newEndTime - Date.now()) / 1000));
          set({
            restEndsAt: newEndTime,
            restTimeRemaining: newRemaining,
          });
        }
      },

      skipRestTimer: () => {
        const { timerIntervalId, activeSession, currentExerciseIndex } = get();
        if (timerIntervalId) clearInterval(timerIntervalId);

        if (activeSession) {
          const currEx = activeSession.exercises[currentExerciseIndex];
          if (currEx && currEx.sets.every((s) => s.completed)) {
            if (currentExerciseIndex < activeSession.exercises.length - 1) {
              set({
                currentExerciseIndex: currentExerciseIndex + 1,
                activeSetIndex: 0,
              });
            }
          }
        }

        set({
          timerState: 'skipped',
          restEndsAt: null,
          restTimeRemaining: 0,
          pausedAt: null,
          remainingWhenPaused: null,
          timerIntervalId: null,
          showRestModal: false,
        });
      },

      updateRestCountdown: () => {
        const { timerState, restEndsAt, remainingWhenPaused } = get();
        if (timerState === 'running' && restEndsAt) {
          const remainingSec = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
          set({ restTimeRemaining: remainingSec });
        } else if (timerState === 'paused' && remainingWhenPaused !== null) {
          set({ restTimeRemaining: remainingWhenPaused });
        }
      },

      setShowRestModal: (show) => set({ showRestModal: show }),

      setCurrentExerciseIndex: (index) => {
        const { activeSession } = get();
        if (!activeSession || index < 0 || index >= activeSession.exercises.length) return;

        const ex = activeSession.exercises[index];
        const firstUncompleted = ex.sets.findIndex((s) => !s.completed);

        set({
          currentExerciseIndex: index,
          activeSetIndex: firstUncompleted !== -1 ? firstUncompleted : 0,
        });
      },

      setActiveSetIndex: (index) => set({ activeSetIndex: index }),

      togglePauseWorkout: () => set((state) => ({ isPaused: !state.isPaused })),

      finishWorkout: () => {
        const { activeSession, timerIntervalId } = get();
        if (timerIntervalId) clearInterval(timerIntervalId);
        if (!activeSession) return null;

        const durationSec = Math.max(1, Math.round((Date.now() - activeSession.startedAt) / 1000));
        const completedSession: WorkoutSession = {
          ...activeSession,
          completedAt: Date.now(),
          durationSeconds: durationSec,
          status: 'completed',
          newPRsCount: 2,
          synced: true,
        };

        set({
          activeSession: null,
          timerState: 'idle',
          restEndsAt: null,
          restTimeRemaining: 0,
          pausedAt: null,
          remainingWhenPaused: null,
          timerIntervalId: null,
          showRestModal: false,
          currentExerciseIndex: 0,
          activeSetIndex: 0,
          isPaused: false,
        });

        return completedSession;
      },

      cancelWorkout: () => {
        const { timerIntervalId } = get();
        if (timerIntervalId) clearInterval(timerIntervalId);
        set({
          activeSession: null,
          timerState: 'idle',
          restEndsAt: null,
          restTimeRemaining: 0,
          pausedAt: null,
          remainingWhenPaused: null,
          timerIntervalId: null,
          showRestModal: false,
          isPaused: false,
        });
      },
    }),
    {
      name: 'gym_active_workout_store',
      partialize: (state) => ({
        activeSession: state.activeSession,
        currentExerciseIndex: state.currentExerciseIndex,
        activeSetIndex: state.activeSetIndex,
        timerState: state.timerState,
        restEndsAt: state.restEndsAt,
        restTargetSeconds: state.restTargetSeconds,
        pausedAt: state.pausedAt,
        remainingWhenPaused: state.remainingWhenPaused,
      }),
    }
  )
);
