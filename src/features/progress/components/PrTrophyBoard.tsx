import React, { useState } from 'react';
import { Award, Trophy, Sparkles, X, Calendar, ChevronRight, Dumbbell, Zap } from 'lucide-react';
import { PersonalRecordItem, ExerciseProgressMetric } from '../../../utils/analyticsCalc';

interface PrTrophyBoardProps {
  personalRecords: PersonalRecordItem[];
  metrics: ExerciseProgressMetric[];
}

export const PrTrophyBoard: React.FC<PrTrophyBoardProps> = ({ personalRecords, metrics }) => {
  const [inspectPr, setInspectPr] = useState<PersonalRecordItem | null>(null);

  // Find metric details for the selected inspection PR
  const inspectMetric = inspectPr
    ? metrics.find((m) => m.exerciseId === inspectPr.exerciseId)
    : null;

  const now = Date.now();
  const fourteenDaysMs = 14 * 86400000;

  return (
    <>
      <div
        className="relative rounded-2xl p-5 bg-white/85 border border-[#CBD5E1]/70 shadow-sm backdrop-blur-md space-y-3.5 select-none"
        style={{
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              PR TROPHY BOARD & MILESTONES
            </span>
            <span className="text-[10px] font-bold text-[#D96B27] bg-[#D96B27]/10 px-2 py-0.5 rounded-full border border-[#D96B27]/20">
              {personalRecords.length} Records
            </span>
          </div>
          <span className="text-[11px] text-[#64748B] font-medium hidden sm:inline-block">
            Tap to inspect
          </span>
        </div>

        {/* PR Record Cards List */}
        <div className="space-y-2.5">
          {personalRecords.map((pr, index) => {
            const isRecent = pr.date && now - pr.date <= fourteenDaysMs;
            const rankStyle =
              index === 0
                ? {
                    badgeBg: 'bg-[#B4FF39]/20 text-[#0F172A] border-[#B4FF39]',
                    iconColor: 'text-[#008B8E]',
                    border: 'border-[#CBD5E1]/80 hover:border-[#008B8E]',
                  }
                : index === 1
                ? {
                    badgeBg: 'bg-[#D96B27]/10 text-[#D96B27] border-[#D96B27]/30',
                    iconColor: 'text-[#D96B27]',
                    border: 'border-[#CBD5E1]/80 hover:border-[#D96B27]',
                  }
                : {
                    badgeBg: 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]',
                    iconColor: 'text-[#64748B]',
                    border: 'border-[#CBD5E1]/80 hover:border-[#94A3B8]',
                  };

            return (
              <div
                key={pr.id}
                onClick={() => setInspectPr(pr)}
                className={`group relative p-3.5 rounded-2xl bg-white border ${rankStyle.border} flex items-center justify-between transition-all duration-150 cursor-pointer shadow-xs hover:shadow hover:-translate-y-[1px]`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Energy Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${rankStyle.badgeBg}`}
                  >
                    {index === 0 ? (
                      <Trophy size={18} className="fill-[#B4FF39] text-[#008B8E]" />
                    ) : (
                      <Award size={18} className={rankStyle.iconColor} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-[#0F172A] tracking-tight truncate group-hover:text-[#008B8E] transition-colors">
                        {pr.exerciseName}
                      </h4>
                      {isRecent && (
                        <span className="relative inline-flex items-center gap-1 text-[9px] font-extrabold text-[#D96B27] bg-[#D96B27]/15 px-1.5 py-0.5 rounded-md border border-[#D96B27]/30 uppercase overflow-hidden">
                          <span className="w-1 h-1 rounded-full bg-[#D96B27] animate-ping" />
                          New PR
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5 flex items-center gap-2">
                      <span>{pr.weightKg} kg × {pr.reps} reps</span>
                      <span>•</span>
                      <span>
                        {new Date(pr.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right Value & Inspect Chevron */}
                <div className="flex items-center gap-2.5 shrink-0 text-right">
                  <div>
                    <span className="text-base font-mono-metric font-bold text-[#0F172A] block group-hover:text-[#008B8E] transition-colors">
                      {pr.value}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-medium block">
                      Top Lift
                    </span>
                  </div>
                  <ChevronRight size={15} className="text-[#94A3B8] group-hover:text-[#008B8E] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tap-to-Inspect Modal Dialog */}
      {inspectPr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#CBD5E1] space-y-5 select-none animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#CBD5E1]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#008B8E]/10 text-[#008B8E] flex items-center justify-center border border-[#008B8E]/20">
                  <Trophy size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    {inspectPr.exerciseName}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Personal Record Telemetry</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectPr(null)}
                className="p-1.5 rounded-full hover:bg-[#F1F5F9] text-[#64748B] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Top Stat Highlights */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#F8FAFC] border border-[#CBD5E1]/60 rounded-2xl p-3 text-center">
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Top Weight</span>
                <span className="text-lg font-mono-metric font-bold text-[#0F172A] mt-0.5 block">
                  {inspectPr.weightKg} kg
                </span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#CBD5E1]/60 rounded-2xl p-3 text-center">
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Reps</span>
                <span className="text-lg font-mono-metric font-bold text-[#008B8E] mt-0.5 block">
                  {inspectPr.reps} reps
                </span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#CBD5E1]/60 rounded-2xl p-3 text-center">
                <span className="text-[10px] text-[#64748B] uppercase font-bold block">Est. 1RM</span>
                <span className="text-lg font-mono-metric font-bold text-[#D96B27] mt-0.5 block">
                  {inspectMetric?.estimated1RMKg || Math.round(inspectPr.weightKg * 1.2)} kg
                </span>
              </div>
            </div>

            {/* Progression History Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
                Progression History
              </span>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {inspectMetric?.historyPoints && inspectMetric.historyPoints.length > 0 ? (
                  inspectMetric.historyPoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-[#CBD5E1]/70 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-[#64748B]" />
                        <span className="font-semibold text-[#0F172A]">
                          {new Date(pt.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#0F172A] font-mono-metric">
                          {pt.weightKg} kg × {pt.reps}
                        </span>
                        <span className="text-[10px] text-[#008B8E] block font-mono-metric">
                          Est 1RM: {pt.estimated1RM} kg
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-[#CBD5E1] text-center text-xs text-[#64748B]">
                    <span>Current benchmark record: {inspectPr.weightKg} kg × {inspectPr.reps} reps.</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInspectPr(null)}
              className="w-full py-3 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
