import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Edit2, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { calculateEstimatedDurationMin } from '../../utils/workoutCalc';

export const RoutinePreviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { routines, removeExerciseFromRoutine, reorderRoutineExercises } = useRoutineStore();
  const { startWorkoutFromRoutine } = useWorkoutStore();

  const routine = routines.find((r) => r.id === id) || routines[0];

  if (!routine) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 select-none">
        <p className="text-[#475569]">Routine not found.</p>
        <button
          onClick={() => navigate('/workouts')}
          className="bg-[#008B8E] text-white font-bold px-4 py-2 rounded-xl shadow-sm"
        >
          Back to Routines
        </button>
      </div>
    );
  }

  const chestExercises = routine.exercises.filter((e) => e.muscleGroup === 'chest');
  const tricepsExercises = routine.exercises.filter((e) => e.muscleGroup === 'triceps');
  const otherExercises = routine.exercises.filter(
    (e) => e.muscleGroup !== 'chest' && e.muscleGroup !== 'triceps'
  );

  const totalSets = routine.exercises.reduce((acc, ex) => acc + (ex.targetSets || 3), 0);
  const estimatedMin = calculateEstimatedDurationMin(routine.exercises);

  const handleStartWorkout = () => {
    startWorkoutFromRoutine(routine);
    navigate('/workout-mode');
  };

  const handleMoveUp = (exerciseId: string) => {
    const idx = routine.exercises.findIndex((e) => e.id === exerciseId);
    if (idx > 0) {
      reorderRoutineExercises(routine.id, idx, idx - 1);
    }
  };

  const handleMoveDown = (exerciseId: string) => {
    const idx = routine.exercises.findIndex((e) => e.id === exerciseId);
    if (idx < routine.exercises.length - 1) {
      reorderRoutineExercises(routine.id, idx, idx + 1);
    }
  };

  const renderExerciseRow = (ex: typeof routine.exercises[0], isFirst: boolean, isLast: boolean) => (
    <div
      key={ex.id}
      className="bg-white/80 border border-[#CBD5E1] hover:border-[#94A3B8] rounded-2xl p-4 flex items-center justify-between transition-colors shadow-sm backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        {/* Accessible Reorder Controls */}
        <div className="flex flex-col gap-1 text-[#64748B]">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => handleMoveUp(ex.id)}
            className="hover:text-[#0F172A] disabled:opacity-20 transition-colors cursor-pointer"
            aria-label="Move Up"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => handleMoveDown(ex.id)}
            className="hover:text-[#0F172A] disabled:opacity-20 transition-colors cursor-pointer"
            aria-label="Move Down"
          >
            <ArrowDown size={13} />
          </button>
        </div>

        <div>
          <h4 className="text-base font-bold text-[#0F172A] tracking-tight">
            {ex.exerciseName}
          </h4>
          <p className="text-xs text-[#475569] font-medium mt-0.5">
            {ex.targetSets} sets × {ex.targetReps} reps • {ex.targetWeightKg || 30} kg
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[#64748B]">
        <button
          type="button"
          onClick={() => navigate(`/edit-exercise/${ex.exerciseId}?routineId=${routine.id}`)}
          className="hover:text-[#008B8E] transition-colors cursor-pointer p-1"
          aria-label={`Edit ${ex.exerciseName}`}
        >
          <Edit2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => removeExerciseFromRoutine(routine.id, ex.id)}
          className="text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer p-1"
          aria-label={`Delete ${ex.exerciseName}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col px-4 pt-4 pb-8 space-y-5 animate-fade-in select-none">
      {/* Top Header with Back and EDIT ROUTINE */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/workouts')}
          className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => navigate(`/edit-routine/${routine.id}`)}
          className="text-xs font-bold text-[#008B8E] uppercase tracking-wider hover:text-[#00A3A6] transition-colors cursor-pointer flex items-center gap-1"
        >
          <Edit2 size={13} />
          <span>EDIT ROUTINE</span>
        </button>
      </div>

      {/* Routine Title & Details */}
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight uppercase">
          ROUTINE PREVIEW
        </h1>
        <h2 className="text-sm font-bold text-[#008B8E] tracking-wider uppercase mt-0.5">
          {routine.name}
        </h2>
        <p className="text-xs text-[#475569] mt-1 font-medium">
          {routine.exercises.length} Exercises • {totalSets} Sets • ~{estimatedMin} min
        </p>
      </div>

      {/* Exercises Breakdown */}
      <div className="space-y-5">
        {/* CHEST EXERCISES */}
        {chestExercises.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              CHEST EXERCISES
            </span>
            <div className="space-y-2">
              {chestExercises.map((ex, idx) =>
                renderExerciseRow(ex, idx === 0, idx === chestExercises.length - 1)
              )}
            </div>
          </div>
        )}

        {/* TRICEPS EXERCISES */}
        {tricepsExercises.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              TRICEPS EXERCISES
            </span>
            <div className="space-y-2">
              {tricepsExercises.map((ex, idx) =>
                renderExerciseRow(ex, idx === 0, idx === tricepsExercises.length - 1)
              )}
            </div>
          </div>
        )}

        {/* OTHER EXERCISES */}
        {otherExercises.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              OTHER EXERCISES
            </span>
            <div className="space-y-2">
              {otherExercises.map((ex, idx) =>
                renderExerciseRow(ex, idx === 0, idx === otherExercises.length - 1)
              )}
            </div>
          </div>
        )}

        {/* Add More Exercise Button */}
        <button
          type="button"
          onClick={() => navigate('/exercises')}
          className="w-full py-3 px-4 rounded-xl border border-dashed border-[#008B8E]/40 text-[#008B8E] hover:bg-[#008B8E]/5 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Add More Exercises from Library</span>
        </button>
      </div>

      {/* START WORKOUT CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleStartWorkout}
          className="w-full bg-[#008B8E] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00A3A6] active:bg-[#007A7C] shadow-md transition-all cursor-pointer tracking-wider text-base uppercase"
        >
          START WORKOUT
        </button>
      </div>
    </div>
  );
};
