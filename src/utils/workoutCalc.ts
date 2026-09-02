import { RoutineExercise } from '../types';

/**
 * Calculates estimated workout duration in minutes
 * Based on:
 * - Number of sets
 * - Estimated set performance time (~40 seconds per set)
 * - Rest interval between sets (in seconds)
 * - Transition between exercises (~60 seconds)
 */
export const calculateEstimatedDurationMin = (exercises: RoutineExercise[]): number => {
  if (!exercises || exercises.length === 0) return 0;

  let totalSeconds = 0;

  exercises.forEach((ex) => {
    const sets = ex.targetSets || 3;
    const restPerSet = ex.restSeconds || 90;
    const workTimePerSet = 45; // ~45s lifting time

    // (Work time + Rest time) * sets - last rest
    totalSeconds += sets * (workTimePerSet + restPerSet) - restPerSet;
    // Transition to next exercise
    totalSeconds += 60;
  });

  const minutes = Math.ceil(totalSeconds / 60);
  return Math.max(minutes, 15);
};
