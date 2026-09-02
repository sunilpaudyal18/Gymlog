import React, { useState } from 'react';
import { Plus, Dumbbell, BookOpen } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { useExerciseStore } from '../../../stores/useExerciseStore';
import { Exercise, MuscleGroup, Equipment } from '../../../types';

export interface CreateCustomExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (exercise: Exercise) => void;
}

export const CreateCustomExerciseModal: React.FC<CreateCustomExerciseModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { addExercise } = useExerciseStore();

  const [name, setName] = useState('');
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup>('chest');
  const [equipment, setEquipment] = useState<Equipment>('dumbbells');
  const [category, setCategory] = useState<'compound' | 'isolation'>('compound');
  const [defaultSets, setDefaultSets] = useState(3);
  const [defaultReps, setDefaultReps] = useState('8-12');
  const [defaultWeightKg, setDefaultWeightKg] = useState(30);
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(90);
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');

  const muscles: MuscleGroup[] = [
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'legs',
    'glutes',
    'abs',
    'calves',
    'forearms',
  ];

  const equipments: Equipment[] = [
    'dumbbells',
    'barbell',
    'cables',
    'machine',
    'bodyweight',
    'kettlebell',
  ];

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter an exercise name');
      return;
    }

    const id = 'custom-' + trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const newExercise: Exercise = {
      id,
      name: trimmed,
      primaryMuscle,
      equipment,
      category,
      defaultSets,
      defaultReps,
      defaultWeightKg,
      defaultRestSeconds,
      instructions: instructions.trim()
        ? instructions.split('\n').filter((l) => l.trim().length > 0)
        : ['Perform movement with controlled cadence and full range of motion.'],
      imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
    };

    addExercise(newExercise);
    if (onCreated) {
      onCreated(newExercise);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Custom Exercise" type="sheet">
      <div className="space-y-4 select-none pt-1">
        {/* Name Input */}
        <div>
          <label className="text-xs font-bold text-[#475569] uppercase block mb-1">
            Exercise Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Incline Smith Machine Press"
            className={`w-full bg-white border ${
              error ? 'border-[#EF4444]' : 'border-[#CBD5E1]'
            } rounded-xl px-4 py-3 text-[#0F172A] font-semibold text-sm focus:outline-none focus:border-[#008B8E] shadow-sm`}
          />
          {error && <p className="text-xs text-[#EF4444] mt-1">{error}</p>}
        </div>

        {/* Primary Muscle Selector */}
        <div>
          <label className="text-xs font-bold text-[#475569] uppercase block mb-1">
            Primary Target Muscle
          </label>
          <div className="flex flex-wrap gap-1.5">
            {muscles.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPrimaryMuscle(m)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all cursor-pointer ${
                  primaryMuscle === m
                    ? 'bg-[#008B8E] text-white border-[#008B8E] font-bold shadow-sm'
                    : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1] hover:text-[#0F172A]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Selector */}
        <div>
          <label className="text-xs font-bold text-[#475569] uppercase block mb-1">
            Equipment
          </label>
          <div className="flex flex-wrap gap-1.5">
            {equipments.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => setEquipment(eq)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all cursor-pointer ${
                  equipment === eq
                    ? 'bg-[#008B8E] text-white border-[#008B8E] font-bold shadow-sm'
                    : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1] hover:text-[#0F172A]'
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {/* Category: Compound / Isolation */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-[#475569] uppercase block mb-1">
              Category
            </label>
            <div className="grid grid-cols-2 gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#CBD5E1]">
              <button
                type="button"
                onClick={() => setCategory('compound')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  category === 'compound'
                    ? 'bg-[#008B8E] text-white shadow-sm'
                    : 'text-[#475569]'
                }`}
              >
                Compound
              </button>
              <button
                type="button"
                onClick={() => setCategory('isolation')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  category === 'isolation'
                    ? 'bg-[#008B8E] text-white shadow-sm'
                    : 'text-[#475569]'
                }`}
              >
                Isolation
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#475569] uppercase block mb-1">
              Default Sets
            </label>
            <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#CBD5E1] justify-around">
              {[2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDefaultSets(s)}
                  className={`w-7 h-7 text-xs font-bold rounded-lg transition-all ${
                    defaultSets === s
                      ? 'bg-[#008B8E] text-white shadow-sm'
                      : 'text-[#475569]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Default Reps & Target Weight Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-[#475569] uppercase block mb-1">
              Target Reps
            </label>
            <input
              type="text"
              value={defaultReps}
              onChange={(e) => setDefaultReps(e.target.value)}
              placeholder="e.g. 8-12"
              className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-[#0F172A] text-xs font-semibold focus:outline-none focus:border-[#008B8E]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#475569] uppercase block mb-1">
              Target Weight (kg)
            </label>
            <input
              type="number"
              value={defaultWeightKg}
              onChange={(e) => setDefaultWeightKg(Number(e.target.value))}
              placeholder="30"
              className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-[#0F172A] text-xs font-semibold focus:outline-none focus:border-[#008B8E]"
            />
          </div>
        </div>

        {/* Instructions Input */}
        <div>
          <label className="text-xs font-bold text-[#475569] uppercase block mb-1">
            Form Execution Tips (Optional)
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            placeholder="Key form cue, elbow angle, or setup instruction..."
            className="w-full bg-white border border-[#CBD5E1] rounded-xl p-3 text-[#0F172A] text-xs focus:outline-none focus:border-[#008B8E] shadow-sm resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCreate}
            className="w-full bg-[#008B8E] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00A3A6] shadow-sm uppercase tracking-wider text-xs cursor-pointer transition-all"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>SAVE TO EXERCISE LIBRARY</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
