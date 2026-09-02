import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { useRoutineStore } from '../../../stores/useRoutineStore';
import { Exercise, RoutineExercise } from '../../../types';

export interface AddToRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
}

export const AddToRoutineModal: React.FC<AddToRoutineModalProps> = ({
  isOpen,
  onClose,
  exercise,
}) => {
  const navigate = useNavigate();
  const { routines, addExerciseToRoutine } = useRoutineStore();

  const handleSelectRoutine = (routineId: string) => {
    const newRoutineEx: RoutineExercise = {
      id: 're-' + Date.now(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.primaryMuscle,
      equipment: exercise.equipment,
      targetSets: exercise.defaultSets || 3,
      targetReps: exercise.defaultReps || '8-12',
      targetWeightKg: exercise.defaultWeightKg || 30,
      restSeconds: exercise.defaultRestSeconds || 90,
      order: 99,
    };

    addExerciseToRoutine(routineId, newRoutineEx);
    onClose();
    navigate(`/routine-preview/${routineId}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Routine" type="sheet">
      <div className="space-y-4 select-none">
        <p className="text-xs text-[#475569]">
          Select the routine you want to add <span className="text-[#0F172A] font-bold">{exercise.name}</span> to:
        </p>

        {/* Existing Routines List */}
        <div className="space-y-2">
          {routines.map((routine) => {
            const alreadyHasExercise = routine.exercises.some(
              (e) => e.exerciseId === exercise.id
            );

            return (
              <button
                key={routine.id}
                type="button"
                onClick={() => handleSelectRoutine(routine.id)}
                className="w-full bg-white border border-[#CBD5E1] hover:border-[#008B8E] rounded-2xl p-4 flex items-center justify-between text-left transition-all cursor-pointer group shadow-sm"
              >
                <div>
                  <h4 className="text-base font-bold text-[#0F172A] group-hover:text-[#008B8E] transition-colors">
                    {routine.name}
                  </h4>
                  <p className="text-xs text-[#475569] mt-0.5">
                    {routine.exercises.length} Exercises • ~{routine.estimatedDurationMin || 50} min
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] group-hover:bg-[#008B8E] group-hover:text-white flex items-center justify-center text-[#64748B] transition-colors">
                  {alreadyHasExercise ? (
                    <Check size={16} className="text-[#008B8E] group-hover:text-white stroke-[3]" />
                  ) : (
                    <Plus size={16} className="stroke-[3]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Create New Routine Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/create-routine');
            }}
            className="w-full bg-white hover:bg-[#F8FAFC] text-[#008B8E] border border-[#008B8E]/30 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-sm"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>CREATE NEW ROUTINE</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
