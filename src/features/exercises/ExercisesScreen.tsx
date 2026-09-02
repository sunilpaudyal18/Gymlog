import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Check } from 'lucide-react';
import { SearchInput } from '../../components/ui/SearchInput';
import { useExerciseStore } from '../../stores/useExerciseStore';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { MUSCLE_GROUPS_META } from '../../constants/exercises';
import { ExerciseCard } from './components/ExerciseCard';
import { CreateCustomExerciseModal } from './components/CreateCustomExerciseModal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Exercise, MuscleGroup, RoutineExercise } from '../../types';

export const ExercisesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get('routineId');

  const {
    searchQuery,
    setSearchQuery,
    getFilteredExercises,
    favorites,
    toggleFavorite,
    isFavorite,
    multiSelectedIds,
    toggleMultiSelect,
    clearMultiSelect,
  } = useExerciseStore();

  const { routines, addExerciseToRoutine } = useRoutineStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredExercises = getFilteredExercises();

  // Navigate to isolated drill-down category view
  const handleCategoryClick = (muscle: MuscleGroup) => {
    navigate(`/exercises/category/${muscle}${routineId ? `?routineId=${routineId}` : ''}`);
  };

  const handleExerciseClick = (ex: Exercise) => {
    navigate(`/exercises/${ex.id}${routineId ? `?routineId=${routineId}` : ''}`);
  };

  const handleAddSingleToRoutine = (ex: Exercise) => {
    const targetRoutineId = routineId || routines[0]?.id;
    if (targetRoutineId) {
      const newEx: RoutineExercise = {
        id: 're-' + Date.now(),
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.primaryMuscle,
        equipment: ex.equipment,
        targetSets: ex.defaultSets || 3,
        targetReps: ex.defaultReps || '8-12',
        targetWeightKg: ex.defaultWeightKg || 30,
        restSeconds: ex.defaultRestSeconds || 90,
        order: 99,
      };
      addExerciseToRoutine(targetRoutineId, newEx);
      navigate(`/routine-preview/${targetRoutineId}`);
    } else {
      navigate(`/exercises/${ex.id}`);
    }
  };

  const handleAddMultiToRoutine = () => {
    const targetRoutineId = routineId || routines[0]?.id;
    if (!targetRoutineId || multiSelectedIds.length === 0) return;

    multiSelectedIds.forEach((exId, idx) => {
      const ex = filteredExercises.find((e) => e.id === exId);
      if (ex) {
        const newEx: RoutineExercise = {
          id: 're-' + Date.now() + '-' + idx,
          exerciseId: ex.id,
          exerciseName: ex.name,
          muscleGroup: ex.primaryMuscle,
          equipment: ex.equipment,
          targetSets: ex.defaultSets || 3,
          targetReps: ex.defaultReps || '8-12',
          targetWeightKg: ex.defaultWeightKg || 30,
          restSeconds: ex.defaultRestSeconds || 90,
          order: 90 + idx,
        };
        addExerciseToRoutine(targetRoutineId, newEx);
      }
    });

    clearMultiSelect();
    navigate(`/routine-preview/${targetRoutineId}`);
  };

  return (
    <div className="flex flex-col space-y-5 animate-fade-in relative select-none w-full box-border">
      {/* 1. Top Header: Title & Create Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Exercises
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5 font-medium">
            Explore canonical movements and target muscle groups
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="bg-[#008B8E] hover:bg-[#00A3A6] active:bg-[#007A7C] text-white font-bold py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer text-xs uppercase tracking-wider shrink-0"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>New Custom</span>
        </button>
      </div>

      {/* 2. Search Input */}
      <div className="sticky top-0 z-20 bg-[#F4F6F9]/90 backdrop-blur-md py-1">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, muscle, equipment..."
        />
      </div>

      {/* 3. Dynamic Rendering: Search Results vs Muscle Category Grid */}
      {searchQuery.trim() ? (
        <div className="space-y-3 pb-8">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-[#475569]">
            <span>Search Results ({filteredExercises.length})</span>
            {multiSelectedIds.length > 0 && (
              <span className="text-[#008B8E]">{multiSelectedIds.length} Selected</span>
            )}
          </div>

          {filteredExercises.length === 0 ? (
            <EmptyState
              icon={<Search size={36} />}
              title="No exercises found"
              description={`No exercises matching "${searchQuery}".`}
              actionLabel="CREATE CUSTOM EXERCISE"
              onAction={() => setShowCreateModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredExercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  isFavorite={isFavorite(ex.id)}
                  onToggleFavorite={toggleFavorite}
                  onClick={handleExerciseClick}
                  onAddClick={handleAddSingleToRoutine}
                  isSelected={multiSelectedIds.includes(ex.id)}
                  onSelect={() => toggleMultiSelect(ex.id)}
                  showAddButton={true}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] px-1">
              BROWSE BY TARGET MUSCLE
            </span>
            <span className="text-xs text-[#008B8E] font-bold">
              {MUSCLE_GROUPS_META.length} Muscle Groups
            </span>
          </div>

          {/* Responsive Muscle Categories Grid: 2-col mobile, 3-col tablet, 4-col desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 w-full box-border">
            {MUSCLE_GROUPS_META.map((group) => {
              const focalPosition =
                group.id === 'abs' || group.id === 'forearms'
                  ? 'center 20%'
                  : 'center 15%';

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleCategoryClick(group.id)}
                  className="relative overflow-hidden rounded-[22px] aspect-[3/4] min-h-[235px] w-full isolate border-[1.5px] border-white/70 shadow-md group transition-all duration-300 cursor-pointer active:scale-[0.98] hover:scale-[1.02] hover:shadow-[0_16px_32px_rgba(0,163,166,0.22)] text-left focus:outline-none bg-slate-900"
                  style={{
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                  }}
                >
                  {/* Layer 1: Legend Cover Photo with Strict Object Position */}
                  <img
                    src={group.imageUrl}
                    alt={`${group.name} - ${group.legend}`}
                    className="absolute inset-0 w-full h-full object-cover z-[1] select-none group-hover:scale-105 transition-transform duration-500"
                    style={{
                      objectPosition: focalPosition,
                      filter: 'none',
                      mixBlendMode: 'normal',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Layer 2: Deep Dual-Stage Dark Gradient Overlay */}
                  <div
                    className="absolute inset-0 z-[2] pointer-events-none transition-opacity duration-300"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.5) 60%, rgba(15, 23, 42, 0.94) 100%)',
                    }}
                  />

                  {/* Specular Refraction Top Border Rim */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] z-[2] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

                  {/* Layer 3: Foreground Typography & Badges */}
                  <div className="relative z-[3] w-full h-full flex flex-col justify-between p-3.5 box-border">
                    {/* Top-Right Signature Moniker Tag */}
                    <div className="flex justify-end">
                      <span
                        className="text-[9px] font-bold text-slate-100 uppercase tracking-widest bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 shadow-xs"
                        title={group.legend}
                      >
                        {group.moniker}
                      </span>
                    </div>

                    {/* Bottom: Muscle Title & Exercise Micro-Badge */}
                    <div className="space-y-1.5 mt-auto">
                      <h3
                        className="text-[20px] font-bold text-white tracking-[-0.01em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-tight truncate"
                        style={{ color: '#FFFFFF', fontWeight: 700 }}
                      >
                        {group.name}
                      </h3>

                      <div className="flex items-center justify-between gap-1">
                        <div
                          className="px-2.5 py-0.5 rounded-full border border-white/25 shadow-xs backdrop-blur-md"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          }}
                        >
                          <span
                            className="text-[10.5px] font-bold tracking-normal"
                            style={{ color: '#00A3A6' }}
                          >
                            {group.count} Exercises
                          </span>
                        </div>

                        <span className="text-[9px] font-medium text-slate-200 truncate max-w-[70px] drop-shadow-sm">
                          {group.legend.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Live Global Search Results List */}
      {searchQuery && (
        <div className="space-y-3 pt-1 w-full">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              {filteredExercises.length} {filteredExercises.length === 1 ? 'Exercise' : 'Exercises'} Found
            </span>

            {multiSelectedIds.length > 0 && (
              <button
                type="button"
                onClick={clearMultiSelect}
                className="text-xs font-bold text-[#EF4444] hover:underline cursor-pointer"
              >
                Clear Selection ({multiSelectedIds.length})
              </button>
            )}
          </div>

          {filteredExercises.length === 0 ? (
            <EmptyState
              icon={<Search size={36} />}
              title="No exercises found"
              description="Try searching for another exercise name, muscle group, or equipment."
            />
          ) : (
            <div className="space-y-2 w-full">
              {filteredExercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  isSelected={multiSelectedIds.includes(ex.id)}
                  isFavorite={isFavorite(ex.id)}
                  onSelect={() => toggleMultiSelect(ex.id)}
                  onToggleFavorite={toggleFavorite}
                  onClick={handleExerciseClick}
                  onAddClick={handleAddSingleToRoutine}
                  showAddButton={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Multi-Select Bottom Bar */}
      {multiSelectedIds.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 px-4 max-w-[480px] mx-auto animate-slide-up">
          <button
            type="button"
            onClick={handleAddMultiToRoutine}
            className="w-full bg-[#008B8E] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer text-sm uppercase tracking-wider hover:bg-[#00A3A6] active:bg-[#007A7C]"
          >
            <Check size={18} className="stroke-[3]" />
            <span>ADD {multiSelectedIds.length} TO ROUTINE</span>
          </button>
        </div>
      )}

      {/* Create Custom Exercise Modal */}
      {showCreateModal && (
        <CreateCustomExerciseModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={(newEx) => {
            if (routineId) {
              handleAddSingleToRoutine(newEx);
            } else {
              navigate(`/exercises/${newEx.id}`);
            }
          }}
        />
      )}
    </div>
  );
};
