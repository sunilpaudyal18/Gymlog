import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Check, Dumbbell, Filter, Sparkles, Target } from 'lucide-react';
import { MUSCLE_GROUPS_META } from '../../constants/exercises';
import { useExerciseStore } from '../../stores/useExerciseStore';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { ExerciseCard } from './components/ExerciseCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Exercise, MuscleGroup, RoutineExercise } from '../../types';

export const MuscleCategoryScreen: React.FC = () => {
  const { muscleId } = useParams<{ muscleId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const routineId = searchParams.get('routineId');
  const equipmentParam = searchParams.get('equipment') || 'all';
  const targetParam = searchParams.get('target') || 'all';

  const {
    exercises,
    favorites,
    toggleFavorite,
    isFavorite,
    multiSelectedIds,
    toggleMultiSelect,
    clearMultiSelect,
    getEquipmentCategoriesForMuscle,
  } = useExerciseStore();

  const { routines, addExerciseToRoutine } = useRoutineStore();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>(equipmentParam);
  const [selectedSubTarget, setSelectedSubTarget] = useState<string>(targetParam);

  // Sync state with URL params
  useEffect(() => {
    if (equipmentParam !== selectedEquipment) {
      setSelectedEquipment(equipmentParam);
    }
    if (targetParam !== selectedSubTarget) {
      setSelectedSubTarget(targetParam);
    }
  }, [equipmentParam, targetParam]);

  const handleEquipmentChange = (newEquip: string) => {
    setSelectedEquipment(newEquip);
    const newParams = new URLSearchParams(searchParams);
    if (newEquip === 'all') {
      newParams.delete('equipment');
    } else {
      newParams.set('equipment', newEquip);
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSubTargetChange = (newTarget: string) => {
    setSelectedSubTarget(newTarget);
    const newParams = new URLSearchParams(searchParams);
    if (newTarget === 'all') {
      newParams.delete('target');
    } else {
      newParams.set('target', newTarget);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Find meta for current muscle category
  const groupMeta = useMemo(() => {
    return (
      MUSCLE_GROUPS_META.find((m) => m.id === muscleId) || {
        id: (muscleId as MuscleGroup) || 'chest',
        name: muscleId ? muscleId.charAt(0).toUpperCase() + muscleId.slice(1) : 'Exercises',
        count: 0,
        moniker: 'Masterclass',
        legend: 'Gym Legend',
        imageUrl: '/images/legends/arnold-chest.jpg',
      }
    );
  }, [muscleId]);

  // Sub-target options
  const subTargetOptions = useMemo(() => {
    if (groupMeta.id === 'back') {
      return [
        { id: 'all', label: 'All Back' },
        { id: 'lats', label: 'Lats' },
        { id: 'upper_back', label: 'Upper Back' },
        { id: 'mid_back', label: 'Mid Back' },
        { id: 'traps', label: 'Traps' },
        { id: 'lower_back', label: 'Lower Back / Erectors' },
      ];
    }
    if (groupMeta.id === 'legs') {
      return [
        { id: 'all', label: 'All Legs' },
        { id: 'quads', label: 'Quadriceps' },
        { id: 'hamstrings', label: 'Hamstrings' },
        { id: 'glutes', label: 'Glutes' },
        { id: 'calves', label: 'Calves' },
        { id: 'adductors', label: 'Adductors' },
        { id: 'abductors', label: 'Abductors' },
        { id: 'tibialis', label: 'Tibialis / Shin' },
      ];
    }
    if (groupMeta.id === 'abs') {
      return [
        { id: 'all', label: 'All Core' },
        { id: 'spinal_flexion', label: 'Spinal Flexion' },
        { id: 'leg_raises', label: 'Leg Raises / Lower' },
        { id: 'anti_extension', label: 'Anti-Extension' },
        { id: 'obliques', label: 'Obliques / Rotation' },
        { id: 'anti_rotation', label: 'Anti-Rotation' },
        { id: 'carries', label: 'Carries & Holds' },
        { id: 'vacuum', label: 'Vacuum' },
      ];
    }
    if (groupMeta.id === 'forearms') {
      return [
        { id: 'all', label: 'All Forearms' },
        { id: 'wrist_flexion', label: 'Wrist Flexion' },
        { id: 'wrist_extension', label: 'Wrist Extension' },
        { id: 'brachioradialis', label: 'Brachioradialis' },
        { id: 'grip_hangs', label: 'Grip & Hangs' },
        { id: 'carries', label: 'Carries' },
        { id: 'rotation', label: 'Pronation / Supination' },
      ];
    }
    if (groupMeta.id === 'chest') {
      return [
        { id: 'all', label: 'All Chest' },
        { id: 'upper_chest', label: 'Upper Chest' },
        { id: 'mid_chest', label: 'Mid Chest' },
        { id: 'lower_chest', label: 'Lower Chest' },
      ];
    }
    return [];
  }, [groupMeta.id]);

  // Dynamically generate available equipment categories with live exercise counts
  const dynamicEquipmentOptions = useMemo(() => {
    return getEquipmentCategoriesForMuscle(groupMeta.id);
  }, [groupMeta.id, getEquipmentCategoriesForMuscle, exercises]);

  // Filter exercises belonging to this muscle category
  const categoryExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchCategory =
        groupMeta.id === 'legs'
          ? ex.primaryMuscle === 'legs' ||
            ex.primaryMuscle === 'glutes' ||
            ex.primaryMuscle === 'calves'
          : ex.primaryMuscle === groupMeta.id;

      if (!matchCategory) return false;

      // Sub-target filter
      if (selectedSubTarget !== 'all') {
        const terms = (ex.searchableTerms || []).map((t) => t.toLowerCase());
        const name = ex.name.toLowerCase();
        const aliases = (ex.aliases || []).map((a) => a.toLowerCase());
        const sec = (ex.secondaryMuscles || []).map((s) => s.toLowerCase());

        if (selectedSubTarget === 'lats') {
          const isLat = terms.includes('lats') || terms.includes('lat width') || name.includes('lat') || name.includes('pullup') || name.includes('pulldown') || name.includes('pullover');
          if (!isLat) return false;
        } else if (selectedSubTarget === 'traps') {
          const isTrap = terms.includes('traps') || terms.includes('trapezius') || name.includes('shrug') || sec.includes('traps');
          if (!isTrap) return false;
        } else if (selectedSubTarget === 'upper_back') {
          const isUpper = terms.includes('upper back') || terms.includes('rhomboids') || terms.includes('rear delt') || name.includes('face pull') || name.includes('rear delt') || name.includes('pull apart') || name.includes('high pull');
          if (!isUpper) return false;
        } else if (selectedSubTarget === 'mid_back') {
          const isMid = terms.includes('mid back') || terms.includes('back thickness') || name.includes('row') || name.includes('t-bar') || name.includes('seated row');
          if (!isMid) return false;
        } else if (selectedSubTarget === 'lower_back') {
          const isLower = terms.includes('lower back') || terms.includes('erectors') || terms.includes('deadlift') || terms.includes('hinge') || terms.includes('hyperextension') || name.includes('deadlift') || name.includes('good morning') || name.includes('hyperextension') || name.includes('back extension');
          if (!isLower) return false;
        } else if (selectedSubTarget === 'quads') {
          const isQuad = terms.includes('quads') || terms.includes('squat') || terms.includes('leg press') || terms.includes('hack squat') || terms.includes('leg extension') || name.includes('squat') || name.includes('leg press') || name.includes('extension') || name.includes('lunge') || name.includes('sissy');
          if (!isQuad) return false;
        } else if (selectedSubTarget === 'hamstrings') {
          const isHam = terms.includes('hamstrings') || terms.includes('rdl') || terms.includes('leg curl') || terms.includes('nordic') || name.includes('curl') || name.includes('rdl') || name.includes('deadlift') || name.includes('nordic');
          if (!isHam) return false;
        } else if (selectedSubTarget === 'glutes') {
          const isGlute = ex.primaryMuscle === 'glutes' || terms.includes('glutes') || terms.includes('hip thrust') || terms.includes('kickback') || name.includes('thrust') || name.includes('bridge') || name.includes('kickback') || name.includes('abduction');
          if (!isGlute) return false;
        } else if (selectedSubTarget === 'calves') {
          const isCalf = ex.primaryMuscle === 'calves' || terms.includes('calves') || terms.includes('calf') || name.includes('calf');
          if (!isCalf) return false;
        } else if (selectedSubTarget === 'adductors') {
          const isAdd = terms.includes('adductors') || terms.includes('inner thigh') || terms.includes('copenhagen') || name.includes('adduction') || name.includes('copenhagen') || name.includes('sumo');
          if (!isAdd) return false;
        } else if (selectedSubTarget === 'abductors') {
          const isAbd = terms.includes('abductors') || terms.includes('outer thigh') || name.includes('abduction');
          if (!isAbd) return false;
        } else if (selectedSubTarget === 'tibialis') {
          const isTib = terms.includes('tibialis') || terms.includes('shin') || name.includes('tibialis');
          if (!isTib) return false;
        } else if (selectedSubTarget === 'spinal_flexion') {
          const isFlex = terms.includes('spinal flexion') || name.includes('crunch') || name.includes('sit-up') || name.includes('v-up');
          if (!isFlex) return false;
        } else if (selectedSubTarget === 'leg_raises') {
          const isLegR = terms.includes('lower abs') || terms.includes('hanging leg raise') || name.includes('raise') || name.includes('reverse crunch');
          if (!isLegR) return false;
        } else if (selectedSubTarget === 'anti_extension') {
          const isAntiExt = terms.includes('anti-extension') || terms.includes('anti extension') || name.includes('plank') || name.includes('rollout') || name.includes('dead bug') || name.includes('hollow');
          if (!isAntiExt) return false;
        } else if (selectedSubTarget === 'obliques') {
          const isObl = terms.includes('obliques') || terms.includes('rotation') || name.includes('woodchop') || name.includes('twist') || name.includes('bicycle') || name.includes('side plank');
          if (!isObl) return false;
        } else if (selectedSubTarget === 'anti_rotation') {
          const isAntiRot = terms.includes('anti rotation') || terms.includes('anti-rotation') || name.includes('pallof');
          if (!isAntiRot) return false;
        } else if (selectedSubTarget === 'carries') {
          const isCarry = terms.includes('carry') || name.includes('carry') || name.includes('walk') || name.includes('farmers');
          if (!isCarry) return false;
        } else if (selectedSubTarget === 'vacuum') {
          const isVac = terms.includes('vacuum') || name.includes('vacuum');
          if (!isVac) return false;
        } else if (selectedSubTarget === 'wrist_flexion') {
          const isFlex = terms.includes('forearm flexors') || (name.includes('wrist curl') && !name.includes('reverse'));
          if (!isFlex) return false;
        } else if (selectedSubTarget === 'wrist_extension') {
          const isExt = terms.includes('wrist extensors') || name.includes('reverse wrist');
          if (!isExt) return false;
        } else if (selectedSubTarget === 'brachioradialis') {
          const isBrach = terms.includes('brachioradialis') || terms.includes('brachialis') || name.includes('reverse curl') || name.includes('hammer');
          if (!isBrach) return false;
        } else if (selectedSubTarget === 'grip_hangs') {
          const isGrip = terms.includes('grip strength') || terms.includes('pinch grip') || name.includes('hang') || name.includes('pinch') || name.includes('gripper');
          if (!isGrip) return false;
        } else if (selectedSubTarget === 'rotation') {
          const isRot = terms.includes('pronation') || terms.includes('supination') || name.includes('pronation') || name.includes('rotation');
          if (!isRot) return false;
        } else if (selectedSubTarget === 'upper_chest') {
          const isUpper = terms.includes('upper chest') || terms.includes('clavicular') || name.includes('incline');
          if (!isUpper) return false;
        } else if (selectedSubTarget === 'lower_chest') {
          const isLower = terms.includes('lower chest') || terms.includes('sub-pectoral') || name.includes('decline') || name.includes('dip');
          if (!isLower) return false;
        } else if (selectedSubTarget === 'mid_chest') {
          const isMid = terms.includes('flat') || terms.includes('mid-chest') || name.includes('flat') || name.includes('bench press');
          if (!isMid) return false;
        }
      }

      // Equipment filter
      if (selectedEquipment !== 'all' && ex.equipment !== selectedEquipment) {
        return false;
      }

      // Local search query
      if (localSearch.trim()) {
        const query = localSearch.toLowerCase().trim();
        const nameMatch = ex.name.toLowerCase().includes(query);
        const aliasMatch = ex.aliases?.some((a) => a.toLowerCase().includes(query));
        const equipMatch = ex.equipment.toLowerCase().includes(query);
        const termsMatch = ex.searchableTerms?.some((t) => t.toLowerCase().includes(query));
        const secMatch = ex.secondaryMuscles?.some((m) => m.toLowerCase().includes(query));
        return nameMatch || aliasMatch || equipMatch || termsMatch || secMatch;
      }

      return true;
    });
  }, [exercises, groupMeta.id, selectedEquipment, selectedSubTarget, localSearch]);

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
      const ex = categoryExercises.find((e) => e.id === exId);
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
    <div className="flex flex-col space-y-4 animate-fade-in relative select-none w-full box-border">
      {/* 1. Level 2: Cinematic Hero Header Banner */}
      <div className="relative w-full h-56 sm:h-64 lg:h-72 rounded-[26px] overflow-hidden border-[1.5px] border-white/70 shadow-lg isolate">
        {/* Full-bleed Full-Color Legend Photo */}
        <img
          src={groupMeta.imageUrl}
          alt={`${groupMeta.name} - ${groupMeta.legend}`}
          className="absolute inset-0 w-full h-full object-cover select-none"
          style={{
            objectPosition:
              groupMeta.id === 'abs' || groupMeta.id === 'forearms'
                ? 'center 20%'
                : 'center 15%',
            filter: 'none',
            mixBlendMode: 'normal',
          }}
        />

        {/* Multi-Stage Dark Gradient Overlay for Color Preservation */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(15, 23, 42, 0.9) 100%)',
          }}
        />

        {/* Top Refractive Border Rim */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] z-[2] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

        {/* Foreground Banner Content */}
        <div className="relative z-[3] w-full h-full flex flex-col justify-between p-4 box-border">
          {/* Top Bar: Back Button & Moniker Tag */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/exercises')}
              className="bg-black/50 hover:bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft size={14} className="stroke-[2.5]" />
              <span>Exercises</span>
            </button>

            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
              {groupMeta.moniker}
            </span>
          </div>

          {/* Bottom Title & Targeted Badge */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#00A3A6] bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/25">
                {groupMeta.legend}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {categoryExercises.length} Movements
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {groupMeta.name} Masterclass
            </h1>
          </div>
        </div>
      </div>

      {/* 2. Dedicated Localized Search Bar */}
      <div className="relative w-full">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-[#94A3B8]" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={`Search ${groupMeta.name.toLowerCase()} by name, alias, equipment...`}
            className="w-full bg-white border border-[#CBD5E1] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#008B8E] shadow-sm font-medium"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="absolute right-3 text-xs font-bold text-[#94A3B8] hover:text-[#0F172A]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Sub-Target Anatomical Filter Chips (e.g. Lats, Traps, Upper Back, Mid Back, Lower Back) */}
      {subTargetOptions.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1">
              <Target size={12} className="text-[#008B8E]" />
              <span>ANATOMICAL TARGET</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full">
            {subTargetOptions.map((opt) => {
              const isSelected = selectedSubTarget === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSubTargetChange(opt.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer border shadow-xs ${
                    isSelected
                      ? 'bg-[#008B8E] text-white border-[#008B8E] font-bold'
                      : 'bg-white/80 text-[#475569] border-[#CBD5E1] hover:bg-white hover:text-[#0F172A]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Level 2 & 3: Dynamic Equipment Category Cards / Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1">
            <Filter size={12} className="text-[#008B8E]" />
            <span>EQUIPMENT CATEGORY</span>
          </span>
          {selectedEquipment !== 'all' && (
            <button
              type="button"
              onClick={() => handleEquipmentChange('all')}
              className="text-[11px] font-bold text-[#008B8E] hover:underline cursor-pointer"
            >
              Show All
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
          {dynamicEquipmentOptions.map((equip) => {
            const isSelected = selectedEquipment === equip.id;
            return (
              <button
                key={equip.id}
                type="button"
                onClick={() => handleEquipmentChange(equip.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border shadow-sm flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-[#008B8E] text-white border-[#008B8E] font-bold shadow-[0_2px_8px_rgba(0,139,142,0.25)]'
                    : 'bg-white/85 text-[#475569] border-[#CBD5E1] hover:bg-white hover:text-[#0F172A]'
                }`}
              >
                <span>{equip.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#008B8E] font-bold'
                  }`}
                >
                  {equip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Level 3: Focused Exercise List */}
      <div className="space-y-3 pt-1 w-full">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
            {categoryExercises.length} {categoryExercises.length === 1 ? 'Exercise' : 'Exercises'} Available
          </span>

          {multiSelectedIds.length > 0 && (
            <button
              type="button"
              onClick={clearMultiSelect}
              className="text-xs font-bold text-[#EF4444] hover:underline cursor-pointer"
            >
              Clear ({multiSelectedIds.length})
            </button>
          )}
        </div>

        {categoryExercises.length === 0 ? (
          <EmptyState
            icon={<Search size={36} />}
            title="No exercises match your filter"
            description={`No ${groupMeta.name.toLowerCase()} exercises found matching your current search, equipment, or sub-target criteria.`}
            actionLabel="Reset Filters"
            onAction={() => {
              setLocalSearch('');
              handleEquipmentChange('all');
              handleSubTargetChange('all');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full">
            {categoryExercises.map((ex) => (
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

      {/* Floating Multi-Select Bottom Bar */}
      {multiSelectedIds.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 px-4 max-w-md mx-auto animate-slide-up">
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
    </div>
  );
};
