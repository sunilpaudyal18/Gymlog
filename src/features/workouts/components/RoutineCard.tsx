import React from 'react';
import { Play, Edit2, Copy, Trash2, CheckCircle2 } from 'lucide-react';
import { Routine } from '../../../types';

export interface RoutineCardProps {
  routine: Routine;
  onStart: (routine: Routine) => void;
  onEdit: (routineId: string) => void;
  onDuplicate?: (routine: Routine) => void;
  onDelete?: (routineId: string) => void;
  variant?: 'default' | 'active' | 'completed';
}

export const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  onStart,
  onEdit,
  onDuplicate,
  onDelete,
  variant = routine.isActive ? 'active' : 'default',
}) => {
  const totalSets = routine.exercises.reduce(
    (acc, ex) => acc + (ex.targetSets || 3),
    0
  );

  const isCompleted = variant === 'completed';
  const isActive = variant === 'active' || routine.isActive;

  return (
    <div
      className={`bg-white/80 rounded-2xl p-5 border transition-all relative backdrop-blur-md shadow-sm ${
        isActive
          ? 'border-[#008B8E] shadow-[0_4px_20px_rgba(0,139,142,0.15)]'
          : isCompleted
          ? 'border-[#008B8E]/30'
          : 'border-[#CBD5E1] hover:border-[#94A3B8]'
      }`}
    >
      {/* Top row: Title and Status Tag */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
          {routine.name}
        </h3>
        {isActive && (
          <span className="bg-[#008B8E]/10 text-[#008B8E] border border-[#008B8E]/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            ACTIVE
          </span>
        )}
        {isCompleted && (
          <span className="bg-[#008B8E]/10 text-[#008B8E] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#008B8E]/30 flex items-center gap-1">
            <CheckCircle2 size={10} />
            <span>COMPLETED</span>
          </span>
        )}
      </div>

      {/* Subtitle: Last performed */}
      <p className="text-xs text-[#475569] mb-3 font-medium">
        Last: {routine.lastPerformed || 'Recently'}
      </p>

      {/* Metadata: Exercises & Sets */}
      <div className="flex items-center gap-4 text-xs font-semibold text-[#475569] mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
          <span>{routine.exercises.length} Exercises</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
          <span>{totalSets} Sets</span>
        </div>
      </div>

      {/* Action Buttons: START and EDIT */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onStart(routine)}
          className="bg-[#008B8E] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#00A3A6] active:bg-[#007A7C] shadow-md transition-all cursor-pointer text-sm uppercase tracking-wider"
          aria-label={`Start ${routine.name}`}
        >
          <Play size={16} className="fill-white stroke-white" />
          <span>START</span>
        </button>

        <button
          type="button"
          onClick={() => onEdit(routine.id)}
          className="bg-[#F1F5F9] text-[#0F172A] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#E2E8F0] active:bg-[#CBD5E1] border border-[#CBD5E1] transition-all cursor-pointer text-sm uppercase tracking-wider"
          aria-label={`Edit ${routine.name}`}
        >
          <Edit2 size={15} />
          <span>EDIT</span>
        </button>
      </div>

      {/* Secondary Quick Actions (Duplicate/Delete) */}
      {(onDuplicate || onDelete) && (
        <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-[#CBD5E1] text-[#64748B]">
          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(routine)}
              className="text-xs font-semibold hover:text-[#0F172A] flex items-center gap-1 transition-colors cursor-pointer"
              title="Duplicate routine"
            >
              <Copy size={13} />
              <span>Duplicate</span>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(routine.id)}
              className="text-xs font-semibold text-[#EF4444] hover:text-[#DC2626] flex items-center gap-1 transition-colors cursor-pointer"
              title="Delete routine"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
