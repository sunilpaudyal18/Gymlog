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
    <div className="flex flex-col space-y-6 animate-fade-in select-none">
      {/* Page Title & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            My Routines
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5 font-medium">
            Manage and perform your training templates
          </p>
        </div>

        {/* Desktop / Tablet Quick Action Button */}
        <button
          type="button"
          onClick={() => navigate('/create-routine')}
          className="hidden sm:inline-flex items-center gap-2 bg-[#008B8E] hover:bg-[#00A3A6] active:bg-[#007A7C] text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all cursor-pointer text-xs uppercase tracking-wider shrink-0"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>New Routine</span>
        </button>
      </div>

      {/* Routine Cards Grid */}
      {routines.length === 0 ? (
        <EmptyState
          icon={<Folder size={36} />}
          title="No routines yet"
          description="You haven't created a workout routine yet."
          actionLabel="CREATE ROUTINE"
          onAction={() => navigate('/create-routine')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

      {/* Mobile Sticky Bottom + NEW ROUTINE button */}
      <div className="pt-2 sm:hidden">
        <button
          type="button"
          onClick={() => navigate('/create-routine')}
          className="w-full bg-[#008B8E] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00A3A6] active:bg-[#007A7C] shadow-md transition-all cursor-pointer tracking-wider text-sm uppercase"
          aria-label="Create New Routine"
        >
          <Plus size={18} className="stroke-[2.5]" />
          <span>NEW ROUTINE</span>
        </button>
      </div>
    </div>
  );
};
