import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Timer, ListChecks, Dumbbell, Play, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { useRoutineStore } from '../../stores/useRoutineStore';

export const HistoryDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { completedSessions } = useHistoryStore();
  const { startWorkoutFromRoutine } = useWorkoutStore();
  const { routines } = useRoutineStore();

  const session =
    completedSessions.find((s) => s.id === sessionId) || completedSessions[0];

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 select-none">
        <p className="text-[#475569]">Workout session not found.</p>
        <button
          onClick={() => navigate('/history')}
          className="bg-[#008B8E] text-white font-bold px-4 py-2 rounded-xl shadow-sm"
        >
          Back to History
        </button>
      </div>
    );
  }

  const durationMin = Math.max(1, Math.round(session.durationSeconds / 60));
  const dateFormatted = format(
    new Date(session.completedAt || session.startedAt),
    'EEEE, dd MMMM yyyy • hh:mm a'
  );

  const handleRepeatWorkout = () => {
    const routine = routines.find((r) => r.id === session.routineId) || {
      id: session.routineId || 'routine-' + Date.now(),
      name: session.routineName,
      targetMuscles: session.exercises.map((e) => e.primaryMuscle),
      exercises: session.exercises.map((e, idx) => ({
        id: `re-${idx}`,
        exerciseId: e.exerciseId,
        exerciseName: e.exerciseName,
        muscleGroup: e.primaryMuscle,
        equipment: e.equipment,
        targetSets: e.sets.length,
        targetReps: '8-12',
        targetWeightKg: e.sets[0]?.weightKg || 30,
        restSeconds: e.restSeconds || 120,
        order: idx,
      })),
      estimatedDurationMin: durationMin,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    startWorkoutFromRoutine(routine, completedSessions);
    navigate('/workout-mode');
  };

  return (
    <div className="flex flex-col px-4 pt-4 pb-12 space-y-5 animate-fade-in select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>

        <h1 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider truncate max-w-[200px]">
          SESSION DETAILS
        </h1>

        <button
          type="button"
          onClick={handleRepeatWorkout}
          className="text-xs font-bold text-[#008B8E] uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Play size={12} className="fill-current" />
          <span>REPEAT</span>
        </button>
      </div>

      {/* Routine Title & Date */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight uppercase">
          {session.routineName}
        </h2>
        <p className="text-xs text-[#475569] mt-1 font-medium">{dateFormatted}</p>
      </div>

      {/* Metrics Card Summary */}
      <div className="grid grid-cols-3 gap-2 bg-white/80 border border-[#CBD5E1] rounded-2xl p-3.5 text-center shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center justify-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
            <Timer size={11} className="text-[#008B8E]" />
            <span>Duration</span>
          </div>
          <span className="text-sm font-mono-metric font-bold text-[#0F172A] mt-0.5 block">
            {durationMin} min
          </span>
        </div>

        <div className="border-x border-[#CBD5E1]">
          <div className="flex items-center justify-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
            <ListChecks size={11} className="text-[#008B8E]" />
            <span>Exercises</span>
          </div>
          <span className="text-sm font-mono-metric font-bold text-[#0F172A] mt-0.5 block">
            {session.exercises.length}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
            <Dumbbell size={11} className="text-[#008B8E]" />
            <span>Volume</span>
          </div>
          <span className="text-sm font-mono-metric font-bold text-[#0F172A] mt-0.5 block">
            {(session.totalVolumeKg || 0).toLocaleString()} kg
          </span>
        </div>
      </div>

      {/* Detailed Exercise Breakdown */}
      <div className="space-y-4 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
          EXERCISES & SET PERFORMANCE
        </span>

        <div className="space-y-3">
          {session.exercises.map((ex, exIdx) => (
            <div
              key={exIdx}
              className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4 space-y-3 shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                  {ex.exerciseName}
                </h3>
                <span className="text-xs text-[#475569] capitalize">
                  {ex.primaryMuscle}
                </span>
              </div>

              {/* Sets Table */}
              <div className="bg-[#F8FAFC] rounded-xl overflow-hidden border border-[#CBD5E1]">
                <div className="grid grid-cols-4 px-3 py-2 bg-[#F1F5F9] border-b border-[#CBD5E1] text-[10px] font-bold uppercase tracking-wider text-[#475569]">
                  <span>SET</span>
                  <span>WEIGHT</span>
                  <span>REPS</span>
                  <span className="text-right">STATUS</span>
                </div>

                <div className="divide-y divide-[#E2E8F0]">
                  {ex.sets.map((set) => (
                    <div
                      key={set.setNumber}
                      className="grid grid-cols-4 px-3 py-2.5 items-center text-xs"
                    >
                      <span className="font-mono-metric font-bold text-[#475569]">
                        {set.setNumber}
                      </span>
                      <span className="font-mono-metric font-bold text-[#0F172A]">
                        {set.weightKg} kg
                      </span>
                      <span className="font-mono-metric font-bold text-[#0F172A]">
                        {set.reps} reps
                      </span>
                      <div className="flex justify-end">
                        {set.completed ? (
                          <div className="w-5 h-5 rounded-full bg-[#008B8E]/15 text-[#008B8E] border border-[#008B8E]/30 flex items-center justify-center">
                            <Check size={12} className="stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#94A3B8]">Skipped</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
