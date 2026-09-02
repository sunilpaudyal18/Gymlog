import React from 'react';
import { Heart, Plus, Check, ChevronRight } from 'lucide-react';
import { Exercise } from '../../../types';

export interface ExerciseCardProps {
  exercise: Exercise;
  isSelected?: boolean;
  isFavorite?: boolean;
  onSelect?: (exercise: Exercise) => void;
  onToggleFavorite?: (exerciseId: string) => void;
  onClick?: (exercise: Exercise) => void;
  showAddButton?: boolean;
  onAddClick?: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isSelected = false,
  isFavorite = false,
  onSelect,
  onToggleFavorite,
  onClick,
  showAddButton = true,
  onAddClick,
}) => {
  return (
    <div
      onClick={() => onClick && onClick(exercise)}
      className={`bg-white/85 border rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer group select-none shadow-sm backdrop-blur-md active:scale-[0.99] ${
        isSelected
          ? 'border-[#008B8E] bg-[#008B8E]/10 shadow-[0_4px_16px_rgba(0,139,142,0.15)]'
          : 'border-[#CBD5E1] hover:border-[#94A3B8] hover:bg-white'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
        {/* Selection Checkbox indicator if onSelect provided */}
        {onSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(exercise);
            }}
            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-[#008B8E] border-[#008B8E] text-white shadow-sm'
                : 'border-[#CBD5E1] bg-[#F1F5F9] text-transparent hover:border-[#94A3B8]'
            }`}
          >
            <Check size={14} className="stroke-[3]" />
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#008B8E] transition-colors truncate">
              {exercise.name}
            </h4>
            {exercise.category && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#008B8E] bg-[#008B8E]/10 px-1.5 py-0.2 rounded border border-[#008B8E]/20 shrink-0">
                {exercise.category}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5 capitalize truncate">
            {exercise.primaryMuscle} • {exercise.equipment.replace(/_/g, ' ')} • {exercise.defaultSets} sets × {exercise.defaultReps} reps
          </p>
        </div>
      </div>

      {/* Right Action Icons: Favorite & Add / Chevron */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(exercise.id);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer active:scale-95 ${
              isFavorite
                ? 'text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/25'
                : 'text-[#64748B] hover:text-[#0F172A] bg-[#F1F5F9] border border-[#CBD5E1]'
            }`}
            aria-label="Toggle Favorite"
          >
            <Heart size={15} className={isFavorite ? 'fill-current' : ''} />
          </button>
        )}

        {showAddButton && onAddClick ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddClick(exercise);
            }}
            className="w-8 h-8 rounded-full bg-[#008B8E]/10 text-[#008B8E] hover:bg-[#008B8E] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm border border-[#008B8E]/30 active:scale-95"
            aria-label="Add to Routine"
            title="Add to routine"
          >
            <Plus size={16} className="stroke-[3]" />
          </button>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] group-hover:bg-[#008B8E] group-hover:text-white flex items-center justify-center text-[#64748B] transition-colors">
            <ChevronRight size={16} />
          </div>
        )}
      </div>
    </div>
  );
};
