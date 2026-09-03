import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  CheckCircle2,
  Plus,
  Timer,
  Flame,
  Dumbbell,
  Moon,
  ArrowLeftRight,
  ChevronDown,
  X,
  Droplets,
  HeartPulse,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Routine } from '../../../types';
import { useRoutineStore } from '../../../stores/useRoutineStore';
import { useTodaySession } from '../../../hooks/useTodaySession';
import {
  DAY_NAMES,
  getCurrentDayIndex,
  REST_DAY_INFO,
  DEFAULT_WEEKLY_SCHEDULE,
} from '../../../utils/scheduler';

export interface TodaySessionCardProps {
  routine?: Routine | null;
  isCompletedToday?: boolean;
}

export const TodaySessionCard: React.FC<TodaySessionCardProps> = ({
  routine: propRoutine,
  isCompletedToday: propIsCompletedToday,
}) => {
  const navigate = useNavigate();
  const {
    todayRoutine: storeRoutine,
    activeSession,
    status,
    isCompletedToday: storeIsCompleted,
    swapToRoutine,
    startWorkout,
    resumeWorkout,
  } = useTodaySession();

  const { routines, weeklySchedule } = useRoutineStore();
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSwapId, setPendingSwapId] = useState<string | null | undefined>(undefined);

  // Unified routine & completion state
  const routine = propRoutine !== undefined ? propRoutine : storeRoutine;
  const isCompletedToday = propIsCompletedToday !== undefined ? propIsCompletedToday : storeIsCompleted;

  const todayIndex = getCurrentDayIndex();
  const todayName = DAY_NAMES[todayIndex] || 'Today';
  const defaultRoutineId = DEFAULT_WEEKLY_SCHEDULE[todayIndex];

  // Check if today's routine has been customized/swapped
  const currentScheduledId = weeklySchedule ? weeklySchedule[todayIndex] : defaultRoutineId;
  const isSwappedForToday = Boolean(
    weeklySchedule &&
    defaultRoutineId !== undefined &&
    currentScheduledId !== defaultRoutineId &&
    currentScheduledId !== null
  );

  const restInfo = REST_DAY_INFO[todayIndex] || {
    title: 'Active Recovery & Rest',
    subtitle: 'Prioritize muscle repair, hydration, and central nervous system restoration.',
    tag: 'RECOVERY DAY',
  };

  const handleSelectSwap = (selectedId: string | null) => {
    const success = swapToRoutine(selectedId, false);
    if (!success) {
      setPendingSwapId(selectedId);
      setShowConfirmModal(true);
    } else {
      setShowSwapModal(false);
    }
  };

  const handleResetToDefault = () => {
    const defaultId = defaultRoutineId ?? null;
    const success = swapToRoutine(defaultId, false);
    if (!success) {
      setPendingSwapId(defaultId);
      setShowConfirmModal(true);
    } else {
      setShowSwapModal(false);
    }
  };

  const handleConfirmDiscardAndSwitch = () => {
    if (pendingSwapId !== undefined) {
      swapToRoutine(pendingSwapId, true);
    }
    setShowConfirmModal(false);
    setPendingSwapId(undefined);
    setShowSwapModal(false);
  };

  // Reusable Swap Modal Component
  const renderSwapModal = () => {
    if (!showSwapModal && !showConfirmModal) return null;

    return (
      <>
        {showSwapModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowSwapModal(false);
            }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-fade-in"
          >
            <div className="w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/80 space-y-4 max-h-[85vh] sm:max-h-[80vh] flex flex-col animate-scale-up pb-8 sm:pb-6">
              {/* Mobile Grabber Handle */}
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-1 mb-1 sm:hidden shrink-0" />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0F172A]">Swap Today's Routine</h3>
                    {isSwappedForToday && (
                      <span className="text-[10px] font-bold text-[#D96B27] bg-[#D96B27]/10 px-2 py-0.5 rounded-full border border-[#D96B27]/25">
                        Swapped
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Choose a training split or recovery day for {todayName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Routine Selection List with Scroll */}
              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[50vh] sm:max-h-[55vh]">
                {routines.map((r) => {
                  const isCurrent = routine?.id === r.id;
                  const isDefaultScheduled = defaultRoutineId === r.id;

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectSwap(r.id)}
                      className={`w-full p-3.5 text-left rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                        isCurrent
                          ? 'border-[#008B8E] border-l-[4px] border-l-[#008B8E] bg-[#008B8E]/6 shadow-xs'
                          : 'border-slate-200/80 hover:border-[#008B8E]/40 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isCurrent
                              ? 'bg-[#008B8E] text-white'
                              : 'bg-slate-100 text-slate-500 group-hover:text-[#008B8E] group-hover:bg-[#008B8E]/10'
                          }`}
                        >
                          <Dumbbell size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#0F172A] group-hover:text-[#008B8E] transition-colors block truncate">
                              {r.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-[#008B8E] bg-[#008B8E]/10 px-2 py-0.5 rounded-full border border-[#008B8E]/30 shrink-0">
                                {isSwappedForToday ? 'Swapped for today' : 'Active for today'}
                              </span>
                            )}
                            {isDefaultScheduled && !isCurrent && (
                              <span className="text-[10px] font-medium text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                                Default Split
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#64748B] mt-0.5 block">
                            {r.exercises.length} exercises • ~{r.estimatedDurationMin || 50} min
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-xl bg-[#008B8E] text-white shadow-2xs">
                            <Check size={12} className="stroke-[3]" />
                            <span>Selected</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-[#008B8E] group-hover:bg-[#008B8E]/10 px-2.5 py-1 rounded-xl transition-colors">
                            Select
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Rest Day Option */}
                <button
                  type="button"
                  onClick={() => handleSelectSwap(null)}
                  className={`w-full p-3.5 text-left rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                    !routine
                      ? 'border-[#008B8E] border-l-[4px] border-l-[#008B8E] bg-[#008B8E]/6 shadow-xs'
                      : 'border-slate-200/80 hover:border-[#008B8E]/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        !routine
                          ? 'bg-[#008B8E] text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:text-[#008B8E] group-hover:bg-[#008B8E]/10'
                      }`}
                    >
                      <Moon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F172A] group-hover:text-[#008B8E] transition-colors block">
                          Mark as Rest Day
                        </span>
                        {!routine && (
                          <span className="text-[10px] font-bold text-[#008B8E] bg-[#008B8E]/10 px-2 py-0.5 rounded-full border border-[#008B8E]/30 shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#64748B] mt-0.5 block">
                        Mobility, hydration & CNS restoration (No active session)
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {!routine ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-xl bg-[#008B8E] text-white shadow-2xs">
                        <Check size={12} className="stroke-[3]" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#64748B] group-hover:text-[#008B8E] px-2.5 py-1 rounded-xl transition-colors">
                        Select
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Reset to Default Button (if swapped) */}
              {isSwappedForToday && (
                <div className="pt-2 shrink-0 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="w-full py-2.5 text-xs font-bold text-[#475569] hover:text-[#0F172A] bg-slate-100 hover:bg-slate-200/80 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Reset to Default Split</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Modal for Ongoing Workout Discard */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
              <div className="w-12 h-12 rounded-2xl bg-[#D96B27]/15 text-[#D96B27] flex items-center justify-center mx-auto">
                <RotateCcw size={24} />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Discard Ongoing Workout?
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  You have an ongoing workout{' '}
                  <span className="font-bold text-[#0F172A]">
                    ({activeSession?.routineName || 'Current Session'})
                  </span>
                  . Discard current progress to switch to{' '}
                  <span className="font-bold text-[#008B8E]">
                    {pendingSwapId === null
                      ? 'Rest Day'
                      : routines.find((r) => r.id === pendingSwapId)?.name || 'New Routine'}
                  </span>
                  ?
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmDiscardAndSwitch}
                  className="w-full py-3 bg-[#D96B27] hover:bg-[#C25B1E] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer uppercase tracking-wider"
                >
                  Discard & Switch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setPendingSwapId(undefined);
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-[#475569] hover:text-[#0F172A] text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Keep Current Workout
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // 1. REST / RECOVERY DAY (No routine scheduled for today)
  if (!routine) {
    return (
      <>
        <div
          className="relative rounded-3xl p-5 shadow-sm space-y-4 overflow-hidden border border-[#CBD5E1]/60 select-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(248, 250, 252, 0.75) 50%, rgba(241, 245, 249, 0.9) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            boxShadow:
              '0 12px 32px -4px rgba(15, 23, 42, 0.06), 0 0 20px -2px rgba(0, 139, 142, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
          }}
        >
          {/* Top specular highlight stroke */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          {/* Header Row: Centered Tag & Polished Swap Pill */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 bg-[#008B8E]/10 text-[#008B8E] border border-[#008B8E]/30 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase">
              <Moon size={12} className="text-[#008B8E]" />
              <span>{todayName.toUpperCase()} • {restInfo.tag}</span>
            </div>

            {/* Sleek Swap Action Pill */}
            <button
              type="button"
              onClick={() => setShowSwapModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#F1F5F9]/80 hover:bg-[#008B8E]/10 border border-[#CBD5E1]/60 hover:border-[#008B8E]/30 text-xs font-semibold text-[#475569] hover:text-[#008B8E] px-2.5 py-1 sm:px-2.5 sm:py-1 p-1.5 rounded-full transition-all duration-150 cursor-pointer shadow-2xs group"
              title="Swap Routine"
            >
              <ArrowLeftRight size={13} className="text-[#64748B] group-hover:text-[#008B8E] transition-colors shrink-0" />
              <span className="hidden sm:inline">Swap Routine</span>
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight leading-snug">
              {restInfo.title}
            </h2>
            <p className="text-xs text-[#475569] mt-1 font-medium">
              {restInfo.subtitle}
            </p>
          </div>

          {/* Recovery Metric Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <div className="bg-white/75 border border-[#CBD5E1]/50 rounded-2xl p-2.5 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
                <Timer size={11} className="text-[#008B8E]" />
                <span>Mobility</span>
              </div>
              <span className="text-xs font-mono-metric font-bold text-[#0F172A] mt-0.5 block">
                15-20 min
              </span>
            </div>

            <div className="bg-white/75 border border-[#008B8E]/25 rounded-2xl p-2.5 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
                <Droplets size={11} className="text-[#008B8E]" />
                <span>Hydration</span>
              </div>
              <span className="text-xs font-mono-metric font-bold text-[#008B8E] mt-0.5 block">
                3.0 L
              </span>
            </div>

            <div className="bg-white/75 border border-[#D96B27]/30 rounded-2xl p-2.5 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
                <HeartPulse size={11} className="text-[#D96B27]" />
                <span>Recovery</span>
              </div>
              <span className="text-xs font-mono-metric font-bold text-[#D96B27] mt-0.5 block">
                Optimal
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowSwapModal(true)}
              className="flex-1 rounded-full bg-[#008B8E] hover:bg-[#00A3A6] text-white font-bold py-3.5 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-sm"
            >
              <Plus size={15} className="stroke-[2.5]" />
              <span>CHOOSE ROUTINE</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/workouts')}
              className="rounded-full bg-white/90 hover:bg-white text-[#475569] hover:text-[#0F172A] border border-[#CBD5E1] font-bold py-3.5 px-4 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs tracking-wider"
            >
              <span>ALL ROUTINES</span>
            </button>
          </div>
        </div>

        {renderSwapModal()}
      </>
    );
  }

  // Derived metrics from scheduled routine
  const totalExercises = routine.exercises.length || 6;
  const totalSets =
    routine.exercises.reduce((acc, ex) => acc + (ex.targetSets || 3), 0) || 19;
  const durationMin = routine.estimatedDurationMin || 55;
  const estimatedCalories = Math.round(durationMin * 5.8);

  // 2. COMPLETED TODAY STATE
  if (isCompletedToday) {
    return (
      <>
        <div
          className="relative rounded-3xl p-5 shadow-sm space-y-4 overflow-hidden border border-[#CBD5E1]/60"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.7) 50%, rgba(241, 245, 249, 0.88) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
          }}
        >
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.05)_35%,transparent_60%)] pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="inline-block bg-[#008B8E]/10 text-[#008B8E] border border-[#008B8E]/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              COMPLETED TODAY
            </div>
            <span className="text-xs font-bold text-[#64748B]">{todayName}</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {routine.name}
            </h2>
            <p className="text-xs text-[#475569] mt-1 font-medium">
              {totalExercises} Exercises • {totalSets} Sets • ~{durationMin} min
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/history')}
            className="w-full relative rounded-full bg-[#008B8E]/10 text-[#008B8E] border border-[#008B8E]/40 font-bold py-3.5 px-6 flex items-center justify-center gap-2 hover:bg-[#008B8E] hover:text-white transition-all cursor-pointer text-sm uppercase tracking-wider shadow-sm"
          >
            <CheckCircle2 size={18} className="stroke-[2.5]" />
            <span>VIEW SUMMARY IN HISTORY</span>
          </button>
        </div>

        {renderSwapModal()}
      </>
    );
  }

  // 3. NORMAL ACTIVE SCHEDULED ROUTINE STATE
  return (
    <>
      <div
        className="relative rounded-3xl p-5 shadow-sm space-y-4 overflow-hidden border border-[#CBD5E1]/60 select-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.7) 50%, rgba(241, 245, 249, 0.88) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow:
            '0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 0 20px -2px rgba(0, 139, 142, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.08)_35%,transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        {/* Header Row: Vertically Centered Tag & Polished Swap Pill */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 bg-[#008B8E]/10 text-[#008B8E] border border-[#008B8E]/30 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#008B8E] animate-pulse" />
            <span>TODAY'S SESSION • {todayName.toUpperCase()}</span>
          </div>

          {/* Sleek Swap Action Pill (Responsive: Icon-only on mobile < 640px, full pill on desktop) */}
          <button
            type="button"
            onClick={() => setShowSwapModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#F1F5F9]/80 hover:bg-[#008B8E]/10 border border-[#CBD5E1]/60 hover:border-[#008B8E]/30 text-xs font-semibold text-[#475569] hover:text-[#008B8E] px-2.5 py-1 sm:px-2.5 sm:py-1 p-1.5 rounded-full transition-all duration-150 cursor-pointer shadow-2xs group"
            title="Swap Routine"
          >
            <ArrowLeftRight size={13} className="text-[#64748B] group-hover:text-[#008B8E] transition-colors shrink-0" />
            <span className="hidden sm:inline">Swap Routine</span>
          </button>
        </div>

        {/* Main Workout Title & Subtitle (Interactive Title with Chevron Selector) */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowSwapModal(true)}
              className="group text-left inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-all"
              title="Click to swap routine"
            >
              <h2 className="text-2xl font-bold text-[#0F172A] group-hover:text-[#008B8E] tracking-tight leading-snug transition-colors">
                {routine.name}
              </h2>
              <ChevronDown size={18} className="text-[#64748B] group-hover:text-[#008B8E] transition-all group-hover:translate-y-0.5 shrink-0" />
            </button>

            {isSwappedForToday && (
              <span className="inline-flex items-center text-[10px] font-bold text-[#D96B27] bg-[#D96B27]/10 px-2.5 py-0.5 rounded-full border border-[#D96B27]/30">
                Swapped for today
              </span>
            )}
          </div>

          <p className="text-xs text-[#475569] mt-1 font-medium">
            {totalExercises} Exercises • {totalSets} Sets • ~{durationMin} min
          </p>
        </div>

        {/* Key Metrics Inline Glass Row */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          {/* Duration */}
          <div className="bg-white/75 border border-[#CBD5E1]/50 rounded-2xl p-2.5 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
              <Timer size={11} className="text-[#008B8E]" />
              <span>Duration</span>
            </div>
            <span className="text-xs font-mono-metric font-bold text-[#0F172A] mt-0.5 block">
              ~{durationMin} min
            </span>
          </div>

          {/* Est. Burn */}
          <div
            className="bg-white/75 border border-[#D96B27]/30 rounded-2xl p-2.5 text-center shadow-sm"
            style={{
              boxShadow: '0 2px 8px rgba(217, 107, 39, 0.08)',
            }}
          >
            <div className="flex items-center justify-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
              <Flame size={11} className="text-[#D96B27]" />
              <span>Est. Burn</span>
            </div>
            <span className="text-xs font-mono-metric font-bold text-[#D96B27] mt-0.5 block">
              {estimatedCalories} kcal
            </span>
          </div>

          {/* Total Sets */}
          <div className="bg-white/75 border border-[#CBD5E1]/50 rounded-2xl p-2.5 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
              <Dumbbell size={11} className="text-[#008B8E]" />
              <span>Total Sets</span>
            </div>
            <span className="text-xs font-mono-metric font-bold text-[#0F172A] mt-0.5 block">
              {totalSets} Sets
            </span>
          </div>
        </div>

        {/* Primary Call-To-Action (Start / Resume Workout Button) */}
        <div className="pt-2 pb-1 relative flex flex-col items-center">
          <button
            type="button"
            onClick={() => {
              if (status === 'in_progress' && activeSession) {
                resumeWorkout();
              } else {
                startWorkout();
              }
            }}
            className="w-full relative rounded-full py-3.5 px-6 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-sm font-bold tracking-wider uppercase text-white shadow-md hover:bg-[#00A3A6] active:scale-[0.99] group bg-[#008B8E]"
          >
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
            <Play
              size={16}
              className={`fill-white stroke-white group-hover:scale-110 transition-transform ${
                status === 'in_progress' ? 'animate-pulse' : ''
              }`}
            />
            <span>{status === 'in_progress' ? 'RESUME WORKOUT' : 'START WORKOUT'}</span>
          </button>

          {/* Electric Cyan Under-Light Strip */}
          <div
            className="w-28 h-[3px] rounded-full bg-[#008B8E] -mt-[1px] relative z-10"
            style={{
              boxShadow:
                '0 0 8px #008B8E, 0 0 16px rgba(0, 139, 142, 0.6), 0 3px 6px rgba(0, 139, 142, 0.4)',
            }}
          />
          <div className="w-36 h-3 bg-[#008B8E]/25 blur-[6px] rounded-full -mt-0.5 pointer-events-none" />
        </div>
      </div>

      {renderSwapModal()}
    </>
  );
};
