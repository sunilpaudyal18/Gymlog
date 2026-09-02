import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Check, ChevronLeft, Trash2, Dumbbell, Sparkles, Layers } from 'lucide-react';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { useExerciseStore } from '../../stores/useExerciseStore';
import { MuscleGroup, RoutineExercise, Exercise } from '../../types';
import { calculateEstimatedDurationMin } from '../../utils/workoutCalc';

export const CreateRoutineScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { routines, addRoutine, updateRoutine } = useRoutineStore();
  const { exercises, addExercise } = useExerciseStore();

  const existingRoutine = id ? routines.find((r) => r.id === id) : undefined;

  const [routineName, setRoutineName] = useState(existingRoutine?.name || 'Chest + Triceps Focus');
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>(
    existingRoutine?.targetMuscles || ['chest', 'triceps']
  );
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>(
    existingRoutine?.exercises || []
  );
  const [nameError, setNameError] = useState('');

  // Local inline search filter for exercise catalog
  const [catalogSearch, setCatalogSearch] = useState('');
  const [activeCatalogMuscle, setActiveCatalogMuscle] = useState<MuscleGroup | 'all'>('all');

  // Inline Custom Exercise Creator State (Zero modals/popups)
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('chest');
  const [customEquipment, setCustomEquipment] = useState<'barbell' | 'dumbbells' | 'cables' | 'machine' | 'bodyweight'>('dumbbells');
  const [customSets, setCustomSets] = useState(3);
  const [customReps, setCustomReps] = useState('8-12');
  const [customWeight, setCustomWeight] = useState(25);
  const [customRest, setCustomRest] = useState(90);
  const [inlineCreateSuccess, setInlineCreateSuccess] = useState(false);

  useEffect(() => {
    if (existingRoutine) {
      setRoutineName(existingRoutine.name);
      setSelectedMuscles(existingRoutine.targetMuscles);
      setSelectedExercises(existingRoutine.exercises);
    }
  }, [existingRoutine]);

  const muscleOptions: { id: MuscleGroup; label: string }[] = [
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'legs', label: 'Legs' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'biceps', label: 'Biceps' },
    { id: 'triceps', label: 'Triceps' },
    { id: 'abs', label: 'Abs' },
    { id: 'forearms', label: 'Forearms' },
  ];

  const toggleMuscle = (muscle: MuscleGroup) => {
    if (selectedMuscles.includes(muscle)) {
      if (selectedMuscles.length > 1) {
        setSelectedMuscles(selectedMuscles.filter((m) => m !== muscle));
      }
    } else {
      setSelectedMuscles([...selectedMuscles, muscle]);
    }
  };

  const toggleAddExercise = (exerciseId: string) => {
    const existingIndex = selectedExercises.findIndex((e) => e.exerciseId === exerciseId);
    if (existingIndex !== -1) {
      setSelectedExercises(selectedExercises.filter((e) => e.exerciseId !== exerciseId));
    } else {
      const exerciseDef = exercises.find((e) => e.id === exerciseId);
      if (!exerciseDef) return;

      const newEx: RoutineExercise = {
        id: 're-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        exerciseId: exerciseDef.id,
        exerciseName: exerciseDef.name,
        muscleGroup: exerciseDef.primaryMuscle,
        equipment: exerciseDef.equipment,
        targetSets: exerciseDef.defaultSets || 3,
        targetReps: exerciseDef.defaultReps || '8-12',
        targetWeightKg: exerciseDef.defaultWeightKg || 30,
        restSeconds: exerciseDef.defaultRestSeconds || 90,
        order: selectedExercises.length + 1,
      };
      setSelectedExercises([...selectedExercises, newEx]);
    }
  };

  const removeSelectedExercise = (idToRemove: string) => {
    setSelectedExercises(selectedExercises.filter((e) => e.id !== idToRemove));
  };

  // Inline Custom Exercise Creator Handler (Direct 1-tap addition)
  const handleAddInlineCustom = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;

    const customId = 'custom-' + Date.now();

    // 1. Create Exercise definition in Exercise store
    const newExDef: Exercise = {
      id: customId,
      name: trimmed,
      primaryMuscle: customMuscle,
      equipment: customEquipment,
      category: 'isolation',
      defaultSets: customSets,
      defaultReps: customReps,
      defaultWeightKg: customWeight,
      defaultRestSeconds: customRest,
      isCustom: true,
    };
    addExercise(newExDef);

    // 2. Add directly into routine selected exercises
    const newRoutineEx: RoutineExercise = {
      id: 're-' + Date.now(),
      exerciseId: customId,
      exerciseName: trimmed,
      muscleGroup: customMuscle,
      equipment: customEquipment,
      targetSets: customSets,
      targetReps: customReps,
      targetWeightKg: customWeight,
      restSeconds: customRest,
      order: selectedExercises.length + 1,
    };

    setSelectedExercises([...selectedExercises, newRoutineEx]);

    // Reset inputs & flash success
    setCustomName('');
    setInlineCreateSuccess(true);
    setTimeout(() => setInlineCreateSuccess(false), 2000);
  };

  const handleSave = () => {
    const trimmed = routineName.trim();
    if (!trimmed) {
      setNameError('Routine name is required');
      return;
    }

    let finalExercises = selectedExercises;
    if (finalExercises.length === 0) {
      const defaultChest = exercises.filter((e) => e.primaryMuscle === 'chest').slice(0, 3);
      const defaultTriceps = exercises.filter((e) => e.primaryMuscle === 'triceps').slice(0, 2);
      finalExercises = [...defaultChest, ...defaultTriceps].map((ex, idx) => ({
        id: 're-' + Date.now() + '-' + idx,
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.primaryMuscle,
        equipment: ex.equipment,
        targetSets: ex.defaultSets || 3,
        targetReps: ex.defaultReps || '8-12',
        targetWeightKg: ex.defaultWeightKg || 32.5,
        restSeconds: ex.defaultRestSeconds || 90,
        order: idx + 1,
      }));
    }

    if (existingRoutine) {
      updateRoutine(existingRoutine.id, {
        name: trimmed,
        targetMuscles: selectedMuscles,
        exercises: finalExercises,
      });
      navigate(`/routine-preview/${existingRoutine.id}`);
    } else {
      const newRoutine = {
        id: 'routine-' + Date.now(),
        name: trimmed,
        targetMuscles: selectedMuscles,
        exercises: finalExercises,
        estimatedDurationMin: calculateEstimatedDurationMin(finalExercises),
        lastPerformed: 'Never',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      addRoutine(newRoutine);
      navigate(`/routine-preview/${newRoutine.id}`);
    }
  };

  // Filter exercises for catalog
  const filteredCatalog = exercises.filter((ex) => {
    const matchMuscle = activeCatalogMuscle === 'all' || ex.primaryMuscle === activeCatalogMuscle;
    if (!matchMuscle) return false;
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase().trim();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.primaryMuscle.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col px-4 pt-3 pb-24 space-y-5 animate-fade-in select-none max-w-[480px] w-full mx-auto box-border">
      {/* 1. Top Navigation Header with SAVE Action */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate(existingRoutine ? `/routine-preview/${existingRoutine.id}` : '/workouts')}
            className="w-9 h-9 rounded-full bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-sm active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight leading-none">
              {existingRoutine ? 'Edit Routine' : 'Create Routine'}
            </h1>
            <span className="text-[11px] font-semibold text-[#008B8E] uppercase tracking-wider">
              {selectedExercises.length} Movements Added
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="bg-[#008B8E] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#00A3A6] transition-all cursor-pointer shadow-sm active:scale-95"
        >
          SAVE
        </button>
      </div>

      {/* 2. Routine Name Input Card */}
      <div className="bg-white/85 border border-[#CBD5E1] rounded-2xl p-4 shadow-sm backdrop-blur-md space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
          ROUTINE NAME
        </label>
        <input
          type="text"
          value={routineName}
          onChange={(e) => {
            setRoutineName(e.target.value);
            if (nameError) setNameError('');
          }}
          placeholder="e.g. Chest + Triceps Focus"
          className={`w-full bg-white border ${
            nameError ? 'border-[#EF4444]' : 'border-[#CBD5E1]'
          } rounded-xl px-3.5 py-2.5 text-[#0F172A] font-bold text-sm focus:outline-none focus:border-[#008B8E] transition-colors placeholder-[#94A3B8] shadow-xs`}
        />
        {nameError && <p className="text-xs text-[#EF4444] font-medium">{nameError}</p>}
      </div>

      {/* 3. Target Muscles Selection */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#475569] px-1">
          TARGET MUSCLES
        </span>
        <div className="flex flex-wrap gap-2">
          {muscleOptions.map((m) => {
            const isSelected = selectedMuscles.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMuscle(m.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
                  isSelected
                    ? 'bg-[#008B8E] text-white border-[#008B8E] font-bold shadow-[0_2px_8px_rgba(0,139,142,0.25)]'
                    : 'bg-white/80 text-[#475569] border-[#CBD5E1] hover:bg-white hover:text-[#0F172A]'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Selected Exercises Tray (Summary of Added Items) */}
      {selectedExercises.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
              <Layers size={14} className="text-[#008B8E]" />
              <span>SELECTED MOVEMENTS ({selectedExercises.length})</span>
            </span>
            <span className="text-[11px] font-semibold text-[#008B8E]">
              ~{calculateEstimatedDurationMin(selectedExercises)} mins
            </span>
          </div>

          <div className="bg-white/85 border border-[#CBD5E1] rounded-2xl divide-y divide-[#E2E8F0] shadow-sm overflow-hidden backdrop-blur-md">
            {selectedExercises.map((ex, idx) => (
              <div
                key={ex.id}
                className="flex items-center justify-between p-3 hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="w-5 h-5 rounded-full bg-[#008B8E]/10 text-[#008B8E] text-[10px] font-bold font-mono-metric flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#0F172A] truncate">
                      {ex.exerciseName}
                    </h4>
                    <span className="text-[11px] text-[#008B8E] font-semibold block capitalize">
                      {ex.targetSets} sets × {ex.targetReps} reps • {ex.equipment}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeSelectedExercise(ex.id)}
                  className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Remove from routine"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Fluid Full-Height Exercise Selection List & Catalog */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
            EXERCISE SELECTION
          </span>
          <span className="text-[11px] font-semibold text-[#64748B]">
            Tap + to add or remove
          </span>
        </div>

        {/* Quick Muscle Selector Chips for Catalog */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full">
          <button
            type="button"
            onClick={() => setActiveCatalogMuscle('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 cursor-pointer border transition-all ${
              activeCatalogMuscle === 'all'
                ? 'bg-[#008B8E] text-white border-[#008B8E] font-bold'
                : 'bg-white/80 text-[#475569] border-[#CBD5E1]'
            }`}
          >
            All
          </button>
          {selectedMuscles.map((muscle) => (
            <button
              key={muscle}
              type="button"
              onClick={() => setActiveCatalogMuscle(muscle)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 cursor-pointer border transition-all capitalize ${
                activeCatalogMuscle === muscle
                  ? 'bg-[#008B8E] text-white border-[#008B8E] font-bold'
                  : 'bg-white/80 text-[#475569] border-[#CBD5E1]'
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>

        {/* Catalog Search Input */}
        <input
          type="text"
          value={catalogSearch}
          onChange={(e) => setCatalogSearch(e.target.value)}
          placeholder="Filter catalog by name or equipment..."
          className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#008B8E] shadow-xs"
        />

        {/* Full-Height Fluid Exercise Rows */}
        <div className="bg-white/85 border border-[#CBD5E1] rounded-2xl overflow-hidden divide-y divide-[#E2E8F0] shadow-sm backdrop-blur-md">
          {filteredCatalog.slice(0, 10).map((ex) => {
            const isAdded = selectedExercises.some((e) => e.exerciseId === ex.id);
            return (
              <div
                key={ex.id}
                className="flex items-center justify-between p-3.5 hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-sm font-bold text-[#0F172A] truncate">{ex.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#008B8E] bg-[#008B8E]/10 px-1.5 py-0.2 rounded border border-[#008B8E]/20">
                      {ex.primaryMuscle}
                    </span>
                    <span className="text-xs text-[#64748B] capitalize">
                      {ex.equipment} • {ex.defaultSets} sets × {ex.defaultReps} reps
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAddExercise(ex.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 ${
                    isAdded
                      ? 'bg-[#008B8E] text-white shadow-sm'
                      : 'bg-[#F1F5F9] text-[#008B8E] hover:bg-[#008B8E] hover:text-white border border-[#CBD5E1]'
                  }`}
                  aria-label={isAdded ? `Remove ${ex.name}` : `Add ${ex.name}`}
                >
                  {isAdded ? (
                    <Check size={18} className="stroke-[3]" />
                  ) : (
                    <Plus size={18} className="stroke-[2.5]" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Persistent Inline Custom Exercise Creator (Zero Modals) */}
      <div className="bg-white/90 border-2 border-dashed border-[#008B8E]/40 hover:border-[#008B8E] rounded-2xl p-4 shadow-sm space-y-3.5 transition-colors backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#008B8E]">
            <Sparkles size={15} />
            <span>INLINE CUSTOM EXERCISE CREATOR</span>
          </div>
          {inlineCreateSuccess && (
            <span className="text-[11px] font-bold text-[#10B981] animate-fade-in flex items-center gap-1">
              <Check size={13} /> Added to Routine!
            </span>
          )}
        </div>

        {/* Custom Exercise Name Input */}
        <div>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddInlineCustom();
              }
            }}
            placeholder="+ Type custom exercise name (e.g. Incline Cable Crossover)..."
            className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#008B8E] shadow-xs"
          />
        </div>

        {/* Muscle & Equipment Selectors */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
              Target Muscle
            </label>
            <select
              value={customMuscle}
              onChange={(e) => setCustomMuscle(e.target.value as MuscleGroup)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#008B8E]"
            >
              {muscleOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
              Equipment
            </label>
            <select
              value={customEquipment}
              onChange={(e) => setCustomEquipment(e.target.value as any)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#008B8E] capitalize"
            >
              <option value="dumbbells">Dumbbells</option>
              <option value="barbell">Barbell</option>
              <option value="cables">Cables</option>
              <option value="machine">Machine</option>
              <option value="bodyweight">Bodyweight</option>
            </select>
          </div>
        </div>

        {/* Set & Rep Inline Counter Steppers */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          {/* Sets */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-2 text-center">
            <span className="text-[9px] font-bold text-[#475569] uppercase block">Sets</span>
            <div className="flex items-center justify-between mt-1">
              <button
                type="button"
                onClick={() => setCustomSets(Math.max(1, customSets - 1))}
                className="w-5 h-5 rounded bg-white border border-[#CBD5E1] text-[#0F172A] font-bold text-xs flex items-center justify-center cursor-pointer active:scale-95"
              >
                -
              </button>
              <span className="font-mono-metric font-bold text-xs text-[#0F172A]">
                {customSets}
              </span>
              <button
                type="button"
                onClick={() => setCustomSets(customSets + 1)}
                className="w-5 h-5 rounded bg-white border border-[#CBD5E1] text-[#0F172A] font-bold text-xs flex items-center justify-center cursor-pointer active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Reps */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-2 text-center">
            <span className="text-[9px] font-bold text-[#475569] uppercase block">Reps</span>
            <div className="flex items-center justify-center mt-1.5">
              <input
                type="text"
                value={customReps}
                onChange={(e) => setCustomReps(e.target.value)}
                className="w-full text-center font-mono-metric font-bold text-xs text-[#0F172A] bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Weight */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-2 text-center">
            <span className="text-[9px] font-bold text-[#475569] uppercase block">Weight (kg)</span>
            <div className="flex items-center justify-between mt-1">
              <button
                type="button"
                onClick={() => setCustomWeight(Math.max(0, customWeight - 2.5))}
                className="w-5 h-5 rounded bg-white border border-[#CBD5E1] text-[#0F172A] font-bold text-xs flex items-center justify-center cursor-pointer active:scale-95"
              >
                -
              </button>
              <span className="font-mono-metric font-bold text-xs text-[#0F172A]">
                {customWeight}
              </span>
              <button
                type="button"
                onClick={() => setCustomWeight(customWeight + 2.5)}
                className="w-5 h-5 rounded bg-white border border-[#CBD5E1] text-[#0F172A] font-bold text-xs flex items-center justify-center cursor-pointer active:scale-95"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 1-Tap Add Custom Exercise Button */}
        <button
          type="button"
          onClick={handleAddInlineCustom}
          disabled={!customName.trim()}
          className="w-full bg-[#008B8E] disabled:bg-[#CBD5E1] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-[#00A3A6] transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Plus size={15} className="stroke-[3]" />
          <span>Add Custom Exercise to Routine</span>
        </button>
      </div>
    </div>
  );
};
