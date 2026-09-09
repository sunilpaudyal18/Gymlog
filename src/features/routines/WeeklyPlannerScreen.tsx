import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Edit3,
  Plus,
  Play,
  Dumbbell,
  Coffee,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Flame,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { Routine, RoutineExercise } from '../../types';
import { DayEditorDrawer } from './components/DayEditorDrawer';
import { DAY_NAMES, getCurrentDayIndex, REST_DAY_INFO } from '../../utils/scheduler';

interface DayConfig {
  dayIndex: number; // 0 = Sunday ... 6 = Saturday
  name: string;
  isToday: boolean;
  routine: Routine | null;
  isRest: boolean;
}

export const WeeklyPlannerScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    routines,
    weeklySchedule,
    splitName,
    setSplitName,
    getScheduledRoutineForDay,
    setDaySchedule,
    resetToDefaults,
  } = useRoutineStore();

  const { startWorkoutFromRoutine } = useWorkoutStore();

  // Drawer Editor State
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeEditingDay, setActiveEditingDay] = useState<number>(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(splitName || 'My Routine Planner');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [justSavedNotification, setJustSavedNotification] = useState(false);

  const todayIndex = getCurrentDayIndex();

  // Map 7 days of week: Sunday (0) to Saturday (6)
  const days: DayConfig[] = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
      const routine = getScheduledRoutineForDay(dayIndex);
      return {
        dayIndex,
        name: DAY_NAMES[dayIndex],
        isToday: dayIndex === todayIndex,
        routine,
        isRest: routine === null,
      };
    });
  }, [getScheduledRoutineForDay, todayIndex, weeklySchedule, routines]);

  // Aggregate stats
  const stats = useMemo(() => {
    const trainingDaysCount = days.filter((d) => !d.isRest).length;
    const restDaysCount = days.length - trainingDaysCount;
    const totalExercises = days.reduce(
      (sum, d) => sum + (d.routine?.exercises?.length || 0),
      0
    );
    return { trainingDaysCount, restDaysCount, totalExercises };
  }, [days]);

  // Open Drawer for a specific day
  const handleOpenDayEditor = (dayIndex: number) => {
    setActiveEditingDay(dayIndex);
    setEditorOpen(true);
  };

  // One-tap launch workout mode
  const handleStartWorkout = (routine: Routine) => {
    startWorkoutFromRoutine(routine);
    navigate('/workout-mode');
  };

  // Commit split title
  const handleSaveTitle = () => {
    const trimmed = localTitle.trim();
    if (trimmed) {
      setSplitName(trimmed);
    }
    setIsEditingTitle(false);
    triggerSavedFeedback();
  };

  const triggerSavedFeedback = () => {
    setJustSavedNotification(true);
    setTimeout(() => setJustSavedNotification(false), 2000);
  };

  // Preset split templates quick-apply
  const applyPresetSplit = (type: 'ppl' | 'upper_lower' | 'full_body' | 'bro_split') => {
    if (type === 'ppl') {
      // Mon: Push, Tue: Pull, Wed: Legs, Thu: Rest, Fri: Push, Sat: Pull, Sun: Rest
      setDaySchedule(0, null);
      setDaySchedule(1, 'push-day-workout');
      setDaySchedule(2, 'pull-day-focus');
      setDaySchedule(3, 'leg-destroyer');
      setDaySchedule(4, null);
      setDaySchedule(5, 'push-day-workout');
      setDaySchedule(6, 'pull-day-focus');
      setSplitName('Routine Planner: Push / Pull / Legs Split');
    } else if (type === 'upper_lower') {
      // Mon: Upper, Tue: Lower, Wed: Rest, Thu: Upper, Fri: Lower, Sat & Sun: Rest
      setDaySchedule(0, null);
      setDaySchedule(1, 'chest-triceps-focus');
      setDaySchedule(2, 'leg-destroyer');
      setDaySchedule(3, null);
      setDaySchedule(4, 'pull-day-focus');
      setDaySchedule(5, 'leg-destroyer');
      setDaySchedule(6, null);
      setSplitName('Routine Planner: 4-Day Upper / Lower Split');
    } else if (type === 'full_body') {
      // Mon, Wed, Fri: Full Body; Sun, Tue, Thu, Sat: Rest
      setDaySchedule(0, null);
      setDaySchedule(1, 'chest-triceps-focus');
      setDaySchedule(2, null);
      setDaySchedule(3, 'pull-day-focus');
      setDaySchedule(4, null);
      setDaySchedule(5, 'leg-destroyer');
      setDaySchedule(6, null);
      setSplitName('Routine Planner: 3-Day Full Body Split');
    } else {
      resetToDefaults();
      setSplitName('My Routine Planner');
    }
    setTemplateModalOpen(false);
    triggerSavedFeedback();
  };

  return (
    <div className="flex flex-col space-y-6 select-none animate-fade-in pb-12">
      {/* 1. Header & Top Bar with Offline Persistence Badge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title & Editable Split Name */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A3A6] bg-[#00A3A6]/10 px-2.5 py-0.5 rounded-full border border-[#00A3A6]/20 inline-flex items-center gap-1.5">
              <Calendar size={11} className="stroke-[2.5]" />
              AETHERIC QUARTZ SYSTEM
            </span>

            {/* Quick Today indicator pill */}
            <span className="text-[10px] font-bold text-[#64748B] bg-white/80 px-2 py-0.5 rounded-full border border-[#CBD5E1]/60">
              Today: {DAY_NAMES[todayIndex]}
            </span>
          </div>

          {/* Editable Split Name */}
          <div className="flex items-center gap-2 group">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 w-full max-w-md">
                <input
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  autoFocus
                  className="w-full bg-white border border-[#00A3A6] text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight px-3 py-1 rounded-xl outline-none shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="px-3 py-1.5 bg-[#00A3A6] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#008B8E] cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-2.5 cursor-pointer py-0.5"
                title="Click to rename split"
              >
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight hover:text-[#00A3A6] transition-colors">
                  {splitName || 'My Routine Planner'}
                </h1>
                <Edit3
                  size={18}
                  className="text-[#94A3B8] group-hover:text-[#00A3A6] transition-colors stroke-[2]"
                />
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#475569] font-medium">
            Customize your 7-day training schedule with instant offline caching
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-start md:self-auto shrink-0">
          {/* New Routine Quick Add Button */}
          <button
            type="button"
            onClick={() => handleOpenDayEditor(todayIndex)}
            className="inline-flex items-center gap-2 bg-[#00A3A6] hover:bg-[#008B8E] active:bg-[#007A7C] text-white font-bold py-2 px-4 rounded-2xl shadow-sm transition-all cursor-pointer text-xs uppercase tracking-wider active:scale-95"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>+ New Routine</span>
          </button>
        </div>
      </div>

      {/* 2. Split Meta Metrics Ribbon */}
      <div
        className="rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 border"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderColor: 'rgba(255, 255, 255, 0.65)',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A3A6]" />
            <span className="font-bold text-[#0F172A]">
              {stats.trainingDaysCount} Training Days
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
            <span className="font-medium text-[#64748B]">
              {stats.restDaysCount} Rest Days
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <span className="font-medium text-[#64748B]">
              {stats.totalExercises} Total Exercises Scheduled
            </span>
          </div>
        </div>

        <div className="text-[11px] text-[#64748B] font-semibold flex items-center gap-1.5">
          <span>Tap any day card to edit movements or adjust sets</span>
          <ArrowRight size={12} className="text-[#00A3A6]" />
        </div>
      </div>

      {/* 3. 7-Day Modular Day Card Grid (Sunday through Saturday) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
        {days.map((day) => {
          const { dayIndex, name, isToday, routine, isRest } = day;

          return (
            <div
              key={dayIndex}
              className={`group relative rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 select-none overflow-hidden ${
                isToday ? 'ring-2 ring-[#00A3A6]' : ''
              }`}
              style={{
                background: isRest
                  ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(241, 245, 249, 0.75) 100%)'
                  : 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: isToday
                  ? '1.5px solid rgba(0, 163, 166, 0.6)'
                  : '1.5px solid rgba(255, 255, 255, 0.65)',
                boxShadow: isToday
                  ? '0 12px 30px rgba(0, 163, 166, 0.18)'
                  : '0 8px 24px -4px rgba(15, 23, 42, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 163, 166, 0.22)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = isToday
                  ? '0 12px 30px rgba(0, 163, 166, 0.18)'
                  : '0 8px 24px -4px rgba(15, 23, 42, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
            >
              {/* Specular linear highlight along top edge */}
              <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

              {/* Ambient diagonal glass sheen */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />

              {/* Day Card Top Bar */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-black tracking-wider uppercase ${
                        isToday ? 'text-[#00A3A6]' : 'text-[#0F172A]'
                      }`}
                    >
                      {name}
                    </span>

                    {isToday && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#00A3A6] text-white shadow-xs tracking-wider animate-pulse">
                        TODAY
                      </span>
                    )}
                  </div>

                  {isRest ? (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E2E8F0] text-[#64748B] border border-[#CBD5E1]/60 flex items-center gap-1">
                      <Coffee size={11} />
                      <span>Full Rest</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00A3A6]/10 text-[#00A3A6] border border-[#00A3A6]/20 flex items-center gap-1">
                      <Flame size={11} className="text-[#00A3A6]" />
                      <span>{routine?.estimatedDurationMin || 45} min</span>
                    </span>
                  )}
                </div>

                {/* Day Body Content */}
                {isRest || !routine ? (
                  /* Rest Day State */
                  <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-[#CBD5E1]/70 rounded-2xl bg-white/40">
                    <div className="w-10 h-10 rounded-full bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center border border-[#CBD5E1]/50">
                      <Coffee size={20} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#64748B]">
                        {REST_DAY_INFO[dayIndex]?.title || 'Rest & Recovery'}
                      </h3>
                      <p className="text-[11px] text-[#94A3B8] max-w-[200px] mt-0.5 leading-snug">
                        {REST_DAY_INFO[dayIndex]?.subtitle ||
                          'Sleep, hydration, and muscle tissue repair.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDayEditor(dayIndex)}
                      className="mt-2 text-[11px] font-bold text-[#00A3A6] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Assign Workout</span>
                    </button>
                  </div>
                ) : (
                  /* Active Training Day State */
                  <div className="space-y-3">
                    {/* Routine Name Heading */}
                    <div>
                      <h2 className="text-base font-bold text-[#0F172A] tracking-tight truncate">
                        {routine.name}
                      </h2>

                      {/* Target Muscle Focus Tags with signature electric teal accents */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {Array.from(
                          new Set(
                            (routine.targetMuscles || []).map((m) =>
                              m === 'glutes' || m === 'calves' ? 'legs' : m
                            )
                          )
                        ).map((muscle) => (
                          <span
                            key={muscle}
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#00A3A6]/12 text-[#00A3A6] border border-[#00A3A6]/25"
                          >
                            {muscle.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Scrollable list of assigned exercises with set/rep counters */}
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 no-scrollbar pt-1">
                      {routine.exercises.map((ex, idx) => (
                        <div
                          key={ex.id || idx}
                          className="bg-white/80 hover:bg-white border border-[#CBD5E1]/60 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-4 h-4 rounded-full bg-[#F1F5F9] text-[#64748B] text-[9px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-[#0F172A] truncate">
                              {ex.exerciseName}
                            </span>
                          </div>

                          <div className="text-[10px] font-bold text-[#00A3A6] shrink-0 bg-[#00A3A6]/10 px-1.5 py-0.5 rounded">
                            {ex.targetSets} × {ex.targetReps}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Day Card Footer Actions */}
              <div className="relative z-10 pt-4 mt-3 border-t border-[#CBD5E1]/60 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDayEditor(dayIndex)}
                  className="flex-1 py-2 px-3 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:border-[#00A3A6]/60 active:scale-95"
                >
                  <Edit3 size={13} className="text-[#00A3A6]" />
                  <span>Edit Day</span>
                </button>

                {!isRest && routine && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenDayEditor(dayIndex)}
                      className="p-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#00A3A6] transition-all cursor-pointer shadow-2xs hover:border-[#00A3A6] active:scale-95"
                      title="Add exercise to day"
                    >
                      <Plus size={14} className="stroke-[2.5]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartWorkout(routine)}
                      className="py-2 px-3 rounded-xl bg-[#00A3A6] hover:bg-[#008B8E] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                      title="Start this workout now"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Start</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Slide-Over Panel Editor (Right Side) */}
      <DayEditorDrawer
        isOpen={editorOpen}
        dayIndex={activeEditingDay}
        initialRoutine={getScheduledRoutineForDay(activeEditingDay)}
        onClose={() => setEditorOpen(false)}
        onSaved={triggerSavedFeedback}
      />

      {/* 5. Preset Split Templates Modal */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setTemplateModalOpen(false)}
          />

          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 border border-white/60 space-y-4 select-none animate-fade-in"
            style={{
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
                  Choose Split Template
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Instantly configure your 7-day schedule with proven bodybuilding splits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => applyPresetSplit('ppl')}
                className="w-full text-left p-3.5 rounded-2xl border border-[#CBD5E1] hover:border-[#00A3A6] bg-white hover:bg-[#00A3A6]/5 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#00A3A6]">
                    Push / Pull / Legs (5-Day Hypertrophy)
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Push • Pull • Legs • Rest • Push • Pull • Rest
                  </p>
                </div>
                <ChevronRight size={16} className="text-[#94A3B8] group-hover:text-[#00A3A6]" />
              </button>

              <button
                type="button"
                onClick={() => applyPresetSplit('upper_lower')}
                className="w-full text-left p-3.5 rounded-2xl border border-[#CBD5E1] hover:border-[#00A3A6] bg-white hover:bg-[#00A3A6]/5 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#00A3A6]">
                    4-Day Upper / Lower Split
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Upper • Lower • Rest • Upper • Lower • Rest • Rest
                  </p>
                </div>
                <ChevronRight size={16} className="text-[#94A3B8] group-hover:text-[#00A3A6]" />
              </button>

              <button
                type="button"
                onClick={() => applyPresetSplit('full_body')}
                className="w-full text-left p-3.5 rounded-2xl border border-[#CBD5E1] hover:border-[#00A3A6] bg-white hover:bg-[#00A3A6]/5 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#00A3A6]">
                    3-Day Full Body Classic
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Full Body • Rest • Full Body • Rest • Full Body • Rest • Rest
                  </p>
                </div>
                <ChevronRight size={16} className="text-[#94A3B8] group-hover:text-[#00A3A6]" />
              </button>

              <button
                type="button"
                onClick={() => applyPresetSplit('bro_split')}
                className="w-full text-left p-3.5 rounded-2xl border border-[#CBD5E1] hover:border-[#00A3A6] bg-white hover:bg-[#00A3A6]/5 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#00A3A6]">
                    Reset to Default Split (Chest, Push, Pull, Legs)
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Restore factory recommended weekly routine
                  </p>
                </div>
                <RotateCcw size={15} className="text-[#94A3B8] group-hover:text-[#00A3A6]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
