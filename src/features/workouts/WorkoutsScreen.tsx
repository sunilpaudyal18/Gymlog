import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder } from 'lucide-react';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { RoutineCard } from './components/RoutineCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Routine } from '../../types';

export const WorkoutsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { routines, duplicateRoutine, deleteRoutine } = useRoutineStore();
  const { startWorkoutFromRoutine } = useWorkoutStore();

  const handleStartRoutine = (routine: Routine) => {
    startWorkoutFromRoutine(routine);
    navigate('/workout-mode');
  };

  const handleEditRoutine = (routineId: string) => {
    navigate(`/routine-preview/${routineId}`);
  };

  return (
    <div className="flex flex-col px-4 pt-6 pb-8 space-y-5 animate-fade-in select-none">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">
          My Routines
        </h1>
        <p className="text-sm text-[#475569] mt-1 font-medium">
          Manage and perform your training templates
        </p>
      </div>

      {/* Routine Cards List */}
      {routines.length === 0 ? (
        <EmptyState
          icon={<Folder size={36} />}
          title="No routines yet"
          description="You haven't created a workout routine yet."
          actionLabel="CREATE ROUTINE"
          onAction={() => navigate('/create-routine')}
        />
      ) : (
        <div className="space-y-4">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onStart={handleStartRoutine}
              onEdit={handleEditRoutine}
              onDuplicate={(r) => duplicateRoutine(r)}
              onDelete={(id) => deleteRoutine(id)}
            />
          ))}
        </div>
      )}

      {/* Sticky Bottom + NEW ROUTINE button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => navigate('/create-routine')}
          className="w-full bg-[#008B8E] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00A3A6] active:bg-[#007A7C] shadow-md transition-all cursor-pointer tracking-wider text-base uppercase"
          aria-label="Create New Routine"
        >
          <Plus size={20} className="stroke-[2.5]" />
          <span>NEW ROUTINE</span>
        </button>
      </div>
    </div>
  );
};
