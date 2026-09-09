import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Check, Dumbbell, Sparkles, Target } from 'lucide-react';
import { MUSCLE_GROUPS_META } from '../../constants/exercises';
import { useExerciseStore } from '../../stores/useExerciseStore';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { ExerciseCard } from './components/ExerciseCard';
import { CreateCustomExerciseModal } from './components/CreateCustomExerciseModal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Exercise, MuscleGroup, RoutineExercise } from '../../types';

export const MuscleCategoryScreen: React.FC = () => {
  const { muscleId } = useParams<{ muscleId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const routineId = searchParams.get('routineId');
  const targetParam = searchParams.get('target') || 'all';

  const {
    exercises,
    favorites,
    toggleFavorite,
    isFavorite,
    multiSelectedIds,
    toggleMultiSelect,
    clearMultiSelect,
    deleteExercise,
  } = useExerciseStore();

  const { routines, addExerciseToRoutine } = useRoutineStore();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedSubTarget, setSelectedSubTarget] = useState<string>(targetParam);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const handleEditExercise = (ex: Exercise) => {
    setEditingExercise(ex);
  };

  const handleDeleteExercise = (ex: Exercise) => {
    if (window.confirm(`Are you sure you want to permanently delete custom exercise "${ex.name}"?`)) {
      deleteExercise(ex.id);
    }
  };

  // Sync state with URL params
  useEffect(() => {
    if (targetParam !== selectedSubTarget) {
      setSelectedSubTarget(targetParam);
    }
  }, [targetParam]);

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
        { id: 'glutes', label: 'Glutes & Hips' },
        { id: 'calves', label: 'Calves & Tibialis' },
        { id: 'adductors', label: 'Adductors & Abductors' },
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
        { id: 'brachioradialis', label: 'Brachioradialis & Reverse' },
        { id: 'grip_hangs', label: 'Grip & Hangs' },
        { id: 'carries', label: 'Loaded Carries' },
        { id: 'rotation', label: 'Pronation, Supination & Levers' },
      ];
    }
    if (groupMeta.id === 'biceps') {
      return [
        { id: 'all', label: 'All Biceps' },
        { id: 'long_head', label: 'Long Head (Peak)' },
        { id: 'short_head', label: 'Short Head (Inner)' },
        { id: 'brachialis', label: 'Brachialis & Forearms' },
        { id: 'compound', label: 'Compound Pulls' },
      ];
    }
    if (groupMeta.id === 'shoulders') {
      return [
        { id: 'all', label: 'All Shoulders' },
        { id: 'overhead_press', label: 'Overhead Press' },
        { id: 'side_delts', label: 'Lateral Delts' },
        { id: 'rear_delts', label: 'Rear Delts' },
        { id: 'front_delts', label: 'Front Delts' },
        { id: 'rotator_cuff', label: 'Rotator Cuff' },
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
          const isQuad = terms.includes('quads') || terms.includes('squat') || terms.includes('leg press') || terms.includes('hack squat') || terms.includes('leg extension') || name.includes('squat') || name.includes('leg press') || name.includes('extension') || name.includes('lunge') || name.includes('step-up') || name.includes('sissy') || name.includes('skater') || name.includes('pistol');
          if (!isQuad) return false;
        } else if (selectedSubTarget === 'hamstrings') {
          const isHam = terms.includes('hamstrings') || terms.includes('rdl') || terms.includes('leg curl') || terms.includes('nordic') || terms.includes('good morning') || name.includes('curl') || name.includes('rdl') || name.includes('deadlift') || name.includes('good morning') || name.includes('nordic');
          if (!isHam) return false;
        } else if (selectedSubTarget === 'glutes') {
          const isGlute = terms.includes('glutes') || terms.includes('hip thrust') || terms.includes('glute bridge') || terms.includes('kickback') || name.includes('hip thrust') || name.includes('glute') || name.includes('kickback') || name.includes('monster walk') || name.includes('clamshell') || name.includes('curtsy') || sec.includes('glutes');
          if (!isGlute) return false;
        } else if (selectedSubTarget === 'calves') {
          const isCalf = terms.includes('calves') || terms.includes('tibialis') || terms.includes('soleus') || terms.includes('gastrocnemius') || name.includes('calf') || name.includes('soleus') || name.includes('tibialis');
          if (!isCalf) return false;
        } else if (selectedSubTarget === 'adductors') {
          const isAdd = terms.includes('adductors') || terms.includes('abductors') || terms.includes('inner thigh') || terms.includes('outer thigh') || name.includes('adduction') || name.includes('abduction') || name.includes('sumo') || name.includes('cossack') || name.includes('lateral lunge');
          if (!isAdd) return false;
        } else if (selectedSubTarget === 'abductors') {
          const isAbd = terms.includes('abductors') || terms.includes('outer thigh') || name.includes('abduction');
          if (!isAbd) return false;
        } else if (selectedSubTarget === 'tibialis') {
          const isTib = terms.includes('tibialis') || terms.includes('shin') || name.includes('tibialis');
          if (!isTib) return false;
        } else if (selectedSubTarget === 'spinal_flexion') {
          const isFlex = terms.includes('spinal flexion') || terms.includes('flexion') || name.includes('crunch') || name.includes('sit-up') || name.includes('v-up') || name.includes('jackknife') || name.includes('toe touches') || name.includes('in-and-out') || name.includes('pike') || name.includes('tuck');
          if (!isFlex) return false;
        } else if (selectedSubTarget === 'leg_raises') {
          const isLegR = terms.includes('lower abs') || terms.includes('leg raise') || terms.includes('knee raise') || name.includes('raise') || name.includes('kick') || name.includes('climber') || name.includes('reverse crunch');
          if (!isLegR) return false;
        } else if (selectedSubTarget === 'anti_extension') {
          const isAntiExt = terms.includes('anti-extension') || terms.includes('anti extension') || name.includes('plank') || name.includes('rollout') || name.includes('dead bug') || name.includes('hollow') || name.includes('dragon flag');
          if (!isAntiExt) return false;
        } else if (selectedSubTarget === 'obliques') {
          const isObl = terms.includes('obliques') || terms.includes('rotation') || name.includes('woodchop') || name.includes('twist') || name.includes('wiper') || name.includes('side') || name.includes('bicycle') || name.includes('heel touch') || name.includes('spell caster') || name.includes('landmine');
          if (!isObl) return false;
        } else if (selectedSubTarget === 'anti_rotation') {
          const isAntiRot = terms.includes('anti rotation') || terms.includes('anti-rotation') || name.includes('pallof') || name.includes('bird-dog') || name.includes('halo');
          if (!isAntiRot) return false;
        } else if (selectedSubTarget === 'carries') {
          const isCarry = terms.includes('carry') || terms.includes('isometric') || name.includes('carry') || name.includes('walk') || name.includes('hold') || name.includes('l-sit') || name.includes('windmill') || name.includes('get-up');
          if (!isCarry) return false;
        } else if (selectedSubTarget === 'vacuum') {
          const isVac = terms.includes('vacuum') || name.includes('vacuum');
          if (!isVac) return false;
        } else if (selectedSubTarget === 'wrist_flexion') {
          const isFlex = terms.includes('forearm flexors') || terms.includes('wrist flexion') || (name.includes('wrist curl') && !name.includes('reverse')) || name.includes('radial deviation') || name.includes('ulnar deviation') || name.includes('wrist roller');
          if (!isFlex) return false;
        } else if (selectedSubTarget === 'wrist_extension') {
          const isExt = terms.includes('wrist extensors') || terms.includes('wrist extension') || name.includes('reverse wrist') || name.includes('extension') || name.includes('reverse wrist roller');
          if (!isExt) return false;
        } else if (selectedSubTarget === 'brachioradialis') {
          const isBrach = terms.includes('brachioradialis') || terms.includes('brachialis') || name.includes('reverse curl') || name.includes('reverse grip') || name.includes('hammer') || name.includes('zottman');
          if (!isBrach) return false;
        } else if (selectedSubTarget === 'grip_hangs') {
          const isGrip = terms.includes('grip strength') || terms.includes('pinch grip') || terms.includes('crush grip') || name.includes('hang') || name.includes('pinch') || name.includes('gripper') || name.includes('crusher') || name.includes('fat grip') || name.includes('axle') || name.includes('rice') || name.includes('towel') || name.includes('inverted row') || name.includes('flip');
          if (!isGrip) return false;
        } else if (selectedSubTarget === 'rotation') {
          const isRot = terms.includes('pronation') || terms.includes('supination') || name.includes('pronation') || name.includes('supination') || name.includes('rotation') || name.includes('lever') || name.includes('twist');
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
        } else if (selectedSubTarget === 'overhead_press') {
          const isPress = terms.includes('overhead press') || terms.includes('press') || name.includes('press') || name.includes('ohp') || name.includes('push-up');
          if (!isPress) return false;
        } else if (selectedSubTarget === 'side_delts') {
          const isSide = terms.includes('side delts') || terms.includes('lateral deltoid') || name.includes('lateral raise') || name.includes('upright row') || name.includes('lu raise');
          if (!isSide) return false;
        } else if (selectedSubTarget === 'rear_delts') {
          const isRear = terms.includes('rear delts') || terms.includes('posterior deltoid') || name.includes('rear delt') || name.includes('face pull');
          if (!isRear) return false;
        } else if (selectedSubTarget === 'front_delts') {
          const isFront = terms.includes('front delts') || terms.includes('anterior delt') || name.includes('front raise') || name.includes('plate raise') || name.includes('bus driver');
          if (!isFront) return false;
        } else if (selectedSubTarget === 'rotator_cuff') {
          const isRot = terms.includes('rotator cuff') || name.includes('external rotation') || name.includes('cuban') || name.includes('bottoms-up');
          if (!isRot) return false;
        } else if (selectedSubTarget === 'long_head') {
          const isLong = terms.includes('long head') || terms.includes('incline curl') || terms.includes('drag curl') || name.includes('incline') || name.includes('drag');
          if (!isLong) return false;
        } else if (selectedSubTarget === 'short_head') {
          const isShort = terms.includes('short head') || terms.includes('preacher') || terms.includes('spider') || terms.includes('concentration') || name.includes('preacher') || name.includes('spider') || name.includes('concentration') || name.includes('hercules') || name.includes('high cable');
          if (!isShort) return false;
        } else if (selectedSubTarget === 'brachialis') {
          const isBrach = terms.includes('brachialis') || terms.includes('hammer') || terms.includes('reverse') || terms.includes('zottman') || name.includes('hammer') || name.includes('reverse') || name.includes('zottman');
          if (!isBrach) return false;
        } else if (selectedSubTarget === 'compound') {
          const isComp = terms.includes('chin-up') || terms.includes('pulldown') || terms.includes('row') || name.includes('chin-up') || name.includes('pulldown') || name.includes('row');
          if (!isComp) return false;
        }
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
  }, [exercises, groupMeta.id, selectedSubTarget, localSearch]);

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
            placeholder={`Search ${groupMeta.name.toLowerCase()} by name or alias...`}
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

      {/* 4. Focused Exercise List */}
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
            description={`No ${groupMeta.name.toLowerCase()} exercises found matching your current search or sub-target criteria.`}
            actionLabel="Reset Filters"
            onAction={() => {
              setLocalSearch('');
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
                onEdit={handleEditExercise}
                onDelete={handleDeleteExercise}
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

      {/* Edit Custom Exercise Modal */}
      {editingExercise && (
        <CreateCustomExerciseModal
          isOpen={Boolean(editingExercise)}
          exerciseToEdit={editingExercise}
          onClose={() => setEditingExercise(null)}
        />
      )}
    </div>
  );
};
