import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Timer,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { RestTimerModal } from './RestTimerModal';

export const WorkoutModeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { routineId } = useParams<{ routineId?: string }>();

  const {
    activeSession,
    currentExerciseIndex,
    activeSetIndex,
    isPaused,
    completeCurrentSet,
    updateSetWeightAndReps,
    setCurrentExerciseIndex,
    setActiveSetIndex,
    togglePauseWorkout,
    finishWorkout,
    showRestModal,
    loadActiveSessionFromRoutineId,
    updateRestCountdown,
  } = useWorkoutStore();

  const { routines } = useRoutineStore();
  const { completedSessions, addCompletedSession } = useHistoryStore();

  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    if (routineId) {
      loadActiveSessionFromRoutineId(routineId, routines, completedSessions);
    }
  }, [routineId, routines, completedSessions, loadActiveSessionFromRoutineId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      updateRestCountdown();
    }, 1000);
    return () => clearInterval(interval);
  }, [updateRestCountdown]);

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh] space-y-4 animate-fade-in select-none">
        <div className="w-16 h-16 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[#475569] shadow-sm">
          <Timer size={28} />
        </div>
        <h3 className="text-xl font-bold text-[#0F172A]">No active workout session</h3>
        <p className="text-sm text-[#475569] text-center max-w-xs">
          Select a routine to begin training and logging sets.
        </p>
        <button
          type="button"
          onClick={() => navigate('/workouts')}
          className="bg-[#008B8E] text-white font-bold px-6 py-3.5 rounded-xl uppercase tracking-wider text-sm shadow-md cursor-pointer hover:bg-[#00A3A6]"
        >
          GO TO MY ROUTINES
        </button>
      </div>
    );
  }

  const currentExercise = activeSession.exercises[currentExerciseIndex] || activeSession.exercises[0];
  const totalExercises = activeSession.exercises.length;
  const currentSet = currentExercise?.sets[activeSetIndex] || currentExercise?.sets[0];

  const isLastExercise = currentExerciseIndex === totalExercises - 1;
  const areAllSetsCompleted = activeSession.exercises.every((ex) =>
    ex.sets.every((s) => s.completed)
  );

  const formatRestSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCompleteOrFinish = () => {
    if (areAllSetsCompleted) {
      const completedSession = finishWorkout();
      if (completedSession) {
        addCompletedSession(completedSession);
      }
      navigate('/workout-complete');
    } else {
      completeCurrentSet();
    }
  };

  const handleAdjustWeight = (delta: number) => {
    if (!currentSet) return;
    const newWeight = Math.max(0, Number((currentSet.weightKg + delta).toFixed(1)));
    updateSetWeightAndReps(currentExerciseIndex, activeSetIndex, newWeight, currentSet.reps);
  };

  const handleAdjustReps = (delta: number) => {
    if (!currentSet) return;
    const newReps = Math.max(1, currentSet.reps + delta);
    updateSetWeightAndReps(currentExerciseIndex, activeSetIndex, currentSet.weightKg, newReps);
  };

  return (
    <div className="flex flex-col px-4 pt-3 pb-8 space-y-4 animate-fade-in relative min-h-full select-none">
      {/* Rest Timer Modal */}
      {showRestModal && <RestTimerModal />}

      {/* 1. Header Bar with Routine Name, Progress, Pause & Exit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer shadow-sm"
            aria-label="Exit Workout"
          >
            <X size={16} />
          </button>
          <div>
            <span className="text-xs font-bold text-[#008B8E] tracking-wider uppercase block">
              {activeSession.routineName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#475569]">
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </span>
          <button
            type="button"
            onClick={togglePauseWorkout}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              isPaused
                ? 'bg-[#008B8E] text-white'
                : 'bg-white border border-[#CBD5E1] text-[#475569] hover:text-[#0F172A]'
            }`}
            aria-label={isPaused ? 'Resume Workout' : 'Pause Workout'}
          >
            {isPaused ? <Play size={14} className="fill-current" /> : <Pause size={14} />}
          </button>
        </div>
      </div>

      {/* Paused Banner if active */}
      {isPaused && (
        <div className="bg-[#008B8E]/10 border border-[#008B8E] rounded-xl p-3 flex items-center justify-between text-xs text-[#008B8E] font-bold animate-pulse">
          <span>WORKOUT PAUSED</span>
          <button
            type="button"
            onClick={togglePauseWorkout}
            className="bg-[#008B8E] text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase"
          >
            Resume
          </button>
        </div>
      )}

      {/* 2. Active Exercise Hero Card */}
      <div className="bg-white/85 border border-[#CBD5E1] rounded-2xl p-5 shadow-sm space-y-4 backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {currentExercise?.exerciseName}
            </h2>
            <span className="text-xs font-bold text-[#008B8E] uppercase tracking-wider block mt-0.5">
              SET {activeSetIndex + 1} / {currentExercise?.sets.length || 3}
            </span>
          </div>

          {/* Last Time Performance Pill */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-right shadow-sm">
            <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wider block">
              LAST TIME
            </span>
            <span className="text-xs font-mono-metric font-bold text-[#0F172A] block">
              {currentExercise?.lastTimePerformance?.weightKg || 32.5} kg ×{' '}
              {currentExercise?.lastTimePerformance?.reps || 10}
            </span>
          </div>
        </div>

        {/* Target Load & Reps Display with quick adjusters */}
        <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-3.5 shadow-sm">
          <div>
            <div className="text-3xl font-bold font-mono-metric text-[#0F172A] tracking-tight">
              {currentSet?.weightKg || 32.5} kg × {currentSet?.reps || 10}
            </div>
            <span className="text-xs font-semibold text-[#475569] mt-0.5 block">
              Target Load & Reps
            </span>
          </div>

          {/* Quick steppers */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAdjustWeight(-2.5)}
                className="w-7 h-7 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] active:scale-90 transition-all cursor-pointer text-xs font-bold shadow-sm"
              >
                -
              </button>
              <span className="text-[10px] font-bold text-[#475569] w-7 text-center">WT</span>
              <button
                type="button"
                onClick={() => handleAdjustWeight(2.5)}
                className="w-7 h-7 rounded-lg bg-[#008B8E] text-white flex items-center justify-center hover:bg-[#00A3A6] active:scale-90 transition-all cursor-pointer text-xs font-bold shadow-sm"
              >
                +
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAdjustReps(-1)}
                className="w-7 h-7 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] active:scale-90 transition-all cursor-pointer text-xs font-bold shadow-sm"
              >
                -
              </button>
              <span className="text-[10px] font-bold text-[#475569] w-7 text-center">REP</span>
              <button
                type="button"
                onClick={() => handleAdjustReps(1)}
                className="w-7 h-7 rounded-lg bg-[#008B8E] text-white flex items-center justify-center hover:bg-[#00A3A6] active:scale-90 transition-all cursor-pointer text-xs font-bold shadow-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Target Rest row */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#008B8E] pt-1">
          <Timer size={16} className="text-[#008B8E]" />
          <span className="font-mono-metric tracking-wide uppercase">
            REST: {formatRestSeconds(currentExercise?.restSeconds || 120)}
          </span>
        </div>
      </div>

      {/* 3. SET LOG Table */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#475569] px-1">
          SET LOG
        </span>

        <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl overflow-hidden shadow-sm backdrop-blur-md">
          {/* Table Header */}
          <div className="grid grid-cols-4 px-4 py-3 bg-[#F1F5F9] border-b border-[#CBD5E1] text-[11px] font-bold uppercase tracking-wider text-[#475569]">
            <span>SET</span>
            <span>WEIGHT</span>
            <span>REPS</span>
            <span className="text-right">STATUS</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#E2E8F0]">
            {currentExercise?.sets.map((set, idx) => {
              const isActiveRow = idx === activeSetIndex && !set.completed;
              const isCompleted = set.completed;

              return (
                <div
                  key={set.setNumber}
                  onClick={() => setActiveSetIndex(idx)}
                  className={`grid grid-cols-4 px-4 py-3.5 items-center transition-all cursor-pointer ${
                    isActiveRow
                      ? 'bg-[#008B8E]/10 border-l-4 border-l-[#008B8E]'
                      : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  {/* Set number */}
                  <span
                    className={`font-mono-metric font-bold text-sm ${
                      isActiveRow ? 'text-[#008B8E]' : 'text-[#0F172A]'
                    }`}
                  >
                    {set.setNumber}
                  </span>

                  {/* Weight */}
                  <span className="font-mono-metric font-bold text-sm text-[#0F172A]">
                    {set.weightKg} kg
                  </span>

                  {/* Reps */}
                  <span className="font-mono-metric font-bold text-sm text-[#0F172A]">
                    {set.reps}
                  </span>

                  {/* Status Indicator */}
                  <div className="flex justify-end items-center">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-[#008B8E]/15 text-[#008B8E] border border-[#008B8E]/40 flex items-center justify-center shadow-sm">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                    ) : isActiveRow ? (
                      <div className="w-6 h-6 rounded-full border-2 border-[#008B8E] animate-pulse" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-[#CBD5E1] bg-[#F1F5F9]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exercise switcher navigation */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          disabled={currentExerciseIndex === 0}
          onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
          className="text-xs font-bold text-[#475569] hover:text-[#0F172A] disabled:opacity-25 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Prev Exercise</span>
        </button>

        <button
          type="button"
          disabled={isLastExercise}
          onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
          className="text-xs font-bold text-[#475569] hover:text-[#0F172A] disabled:opacity-25 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Next Exercise</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 4. Sticky Complete Set / Finish Workout CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCompleteOrFinish}
          className="w-full bg-[#008B8E] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00A3A6] active:bg-[#007A7C] shadow-md transition-all cursor-pointer tracking-wider text-base uppercase"
          aria-label={areAllSetsCompleted ? 'Finish Workout' : 'Complete Set'}
        >
          <CheckCircle2 size={20} className="stroke-[2.5]" />
          <span>{areAllSetsCompleted ? 'FINISH WORKOUT' : 'COMPLETE SET'}</span>
        </button>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 max-w-xs w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-[#D96B27]">
              <AlertTriangle size={20} />
              <h3 className="text-base font-bold text-[#0F172A]">Leave Workout?</h3>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Your logged sets will be safely saved in your local session. You can resume anytime.
            </p>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="bg-[#F1F5F9] border border-[#CBD5E1] hover:bg-[#E2E8F0] text-[#0F172A] font-bold py-2.5 px-3 rounded-xl text-xs uppercase"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  navigate('/workouts');
                }}
                className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 font-bold py-2.5 px-3 rounded-xl text-xs uppercase hover:bg-[#EF4444]/20"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
