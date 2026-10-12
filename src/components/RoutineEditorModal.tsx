'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Flame,
  Dumbbell,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Camera,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Video,
  Info
} from 'lucide-react';
import {
  WorkoutTemplate,
  WorkoutTemplateExercise,
  WorkoutWarmupExercise,
  Exercise
} from '../lib/types';
import CustomExerciseModal from './CustomExerciseModal';

interface RoutineEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRoutine: (template: WorkoutTemplate) => void;
  initialTemplate?: WorkoutTemplate | null;
  allExercises: Exercise[];
  onAddNewCustomExercise: (exercise: Exercise) => void;
}

const AVAILABLE_MUSCLE_GROUPS = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Bíceps',
  'Tríceps',
  'Cuádriceps',
  'Isquiosurales',
  'Glúteos',
  'Gemelos',
  'Core / Abdomen',
];

export default function RoutineEditorModal({
  isOpen,
  onClose,
  onSaveRoutine,
  initialTemplate,
  allExercises,
  onAddNewCustomExercise,
}: RoutineEditorModalProps) {
  // Routine Info
  const [name, setName] = useState(initialTemplate?.name || '');
  const [targetFocus, setTargetFocus] = useState(initialTemplate?.target_focus || '');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(
    initialTemplate?.target_muscle_groups || []
  );
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [estimatedDuration, setEstimatedDuration] = useState(initialTemplate?.estimated_duration_min || 60);
  const [warmupCardioMin, setWarmupCardioMin] = useState(initialTemplate?.warmup_cardio_min || 5);

  // Warmup Exercises List
  const [warmupExercises, setWarmupExercises] = useState<WorkoutWarmupExercise[]>(
    initialTemplate?.warmup_exercises || []
  );

  // Main Routine Exercises List
  const [mainExercises, setMainExercises] = useState<WorkoutTemplateExercise[]>(
    initialTemplate?.exercises || []
  );

  // Modals for adding exercises
  const [exercisePickerMode, setExercisePickerMode] = useState<'main' | 'warmup' | null>(null);
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');
  const [pickerMuscleFilter, setPickerMuscleFilter] = useState('all');

  // New Custom Exercise Modal
  const [isCustomExModalOpen, setIsCustomExModalOpen] = useState(false);
  const [customExTargetSection, setCustomExTargetSection] = useState<'main' | 'warmup'>('main');

  if (!isOpen) return null;

  // Add exercise from library
  const handleSelectExerciseFromPicker = (exercise: Exercise) => {
    if (exercisePickerMode === 'warmup') {
      const newWarmup: WorkoutWarmupExercise = {
        id: crypto.randomUUID(),
        exercise_id: exercise.id,
        name: exercise.name,
        sets: 2,
        reps_or_time: '15 reps',
        notes: exercise.cues || 'Calentamiento y movilidad para preparar articulaciones',
        video_url: exercise.video_url,
        gif_url: exercise.gif_url,
        video_storage_key: exercise.video_storage_key,
        exercise,
      };
      setWarmupExercises((prev) => [...prev, newWarmup]);
    } else if (exercisePickerMode === 'main') {
      const newMain: WorkoutTemplateExercise = {
        id: crypto.randomUUID(),
        template_id: initialTemplate?.id || '',
        exercise_id: exercise.id,
        order_index: mainExercises.length + 1,
        target_sets: exercise.default_sets || 3,
        target_reps_min: exercise.rep_range_min || 8,
        target_reps_max: exercise.rep_range_max || 12,
        target_rir: exercise.default_rir || 2,
        target_rest_sec: exercise.default_rest_sec || 90,
        priority: 'high',
        warmup_feeder_sets: 1,
        special_notes: exercise.cues || '',
        exercise,
      };
      setMainExercises((prev) => [...prev, newMain]);
    }
    setExercisePickerMode(null);
    setPickerSearchQuery('');
  };

  // Add freshly created custom exercise
  const handleCreatedCustomExercise = (newEx: Exercise) => {
    onAddNewCustomExercise(newEx);
    if (customExTargetSection === 'warmup') {
      const newWarmup: WorkoutWarmupExercise = {
        id: crypto.randomUUID(),
        exercise_id: newEx.id,
        name: newEx.name,
        sets: 2,
        reps_or_time: '15 reps',
        notes: newEx.cues || '',
        video_url: newEx.video_url,
        video_storage_key: newEx.video_storage_key,
        exercise: newEx,
      };
      setWarmupExercises((prev) => [...prev, newWarmup]);
    } else {
      const newMain: WorkoutTemplateExercise = {
        id: crypto.randomUUID(),
        template_id: initialTemplate?.id || '',
        exercise_id: newEx.id,
        order_index: mainExercises.length + 1,
        target_sets: newEx.default_sets || 3,
        target_reps_min: newEx.rep_range_min || 8,
        target_reps_max: newEx.rep_range_max || 12,
        target_rir: 2,
        target_rest_sec: newEx.default_rest_sec || 90,
        priority: 'high',
        warmup_feeder_sets: 1,
        special_notes: newEx.cues || '',
        exercise: newEx,
      };
      setMainExercises((prev) => [...prev, newMain]);
    }
  };

  // Move exercise up/down
  const moveMainExercise = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= mainExercises.length) return;
    const updated = [...mainExercises];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setMainExercises(updated.map((ex, i) => ({ ...ex, order_index: i + 1 })));
  };

  const removeMainExercise = (index: number) => {
    setMainExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const removeWarmupExercise = (index: number) => {
    setWarmupExercises((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit routine
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la rutina');
      return;
    }

    const templateId = initialTemplate?.id || `custom_routine_${Date.now()}`;
    const code = initialTemplate?.code || `custom_${name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20)}`;

    const savedTemplate: WorkoutTemplate = {
      id: templateId,
      name: name.trim(),
      code,
      sequence_order: initialTemplate?.sequence_order || 99,
      target_focus: targetFocus.trim() || name.trim(),
      target_muscle_groups: selectedMuscles.length > 0 ? selectedMuscles : [targetFocus || name],
      estimated_duration_min: estimatedDuration,
      description: description.trim() || 'Rutina personalizada adaptada del gimnasio',
      warmup_cardio_min: warmupCardioMin,
      warmup_mobility: warmupExercises.map((w) => w.name).join(', ') || 'Movilidad dinámica y activación articular',
      warmup_exercises: warmupExercises,
      exercises: mainExercises.map((te, idx) => ({
        ...te,
        template_id: templateId,
        order_index: idx + 1,
      })),
      is_custom: true,
      created_at: initialTemplate?.created_at || new Date().toISOString(),
    };

    onSaveRoutine(savedTemplate);
    onClose();
  };

  const filteredPickerExercises = allExercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(pickerSearchQuery.toLowerCase()) ||
      ex.short_name.toLowerCase().includes(pickerSearchQuery.toLowerCase());
    const matchesMuscle =
      pickerMuscleFilter === 'all' || ex.primary_muscle_group === pickerMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl bg-[#121622] border border-cyan-500/20 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialTemplate ? 'Editar Rutina' : 'Nueva Rutina Personalizada'}
              </h3>
              <p className="text-xs text-slate-400">Configura los grupos musculares, calentamiento y ejercicios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-4 overflow-y-auto space-y-5 flex-1">
          {/* General Routine Info & Muscle Groups */}
          <div className="space-y-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">
                Nombre de la Rutina <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Pecho & Bíceps, Pierna Completa, Hombros..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Muscle Groups Selection Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Grupos Musculares de esta Rutina:
                </label>
                <span className="text-[10px] text-cyan-400 font-semibold">
                  {selectedMuscles.length > 0 ? `${selectedMuscles.length} seleccionados` : 'Toca para elegir'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_MUSCLE_GROUPS.map((m) => {
                  const isSel = selectedMuscles.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        const next = isSel
                          ? selectedMuscles.filter((item) => item !== m)
                          : [...selectedMuscles, m];
                        setSelectedMuscles(next);
                        if (!name.trim()) {
                          setName(next.join(' & '));
                        }
                        if (!targetFocus.trim()) {
                          setTargetFocus(next.join(', '));
                        }
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                        isSel
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {isSel ? `✓ ${m}` : `+ ${m}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Enfoque / Detalle
                </label>
                <input
                  type="text"
                  placeholder="Ej: Foco pectoral superior, bíceps pesado"
                  value={targetFocus}
                  onChange={(e) => setTargetFocus(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Duración aprox. (min)
                </label>
                <input
                  type="number"
                  min={15}
                  max={180}
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 60)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Observaciones generales de la rutina
              </label>
              <input
                type="text"
                placeholder="Ej: Descansar bien entre series pesadas, cuidar la técnica"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* SECTION 1: CALENTAMIENTO DEL PROFE */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    1. Calentamiento & Activación ({warmupExercises.length})
                  </h4>
                  <p className="text-[10px] text-slate-400">Ejercicios con barra vacía, movilidad o máquinas</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={warmupCardioMin}
                  onChange={(e) => setWarmupCardioMin(parseInt(e.target.value) || 0)}
                  className="w-8 text-center bg-transparent font-bold text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">min cardio</span>
              </div>
            </div>

            {/* Warmup List */}
            <div className="space-y-2">
              {warmupExercises.length === 0 ? (
                <div className="py-4 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  Aún no has agregado ejercicios de calentamiento específicos.
                </div>
              ) : (
                warmupExercises.map((w, idx) => (
                  <div
                    key={w.id || idx}
                    className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={w.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWarmupExercises((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                            );
                          }}
                          className="bg-transparent font-bold text-xs text-white focus:outline-none focus:underline truncate"
                        />
                        {(w.video_storage_key || w.video_url) && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-400 font-bold shrink-0 flex items-center gap-0.5">
                            <Video className="w-2.5 h-2.5" /> Video
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeWarmupExercise(idx)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                        <span className="text-slate-400">Series:</span>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={w.sets || 2}
                          onChange={(e) => {
                            const sets = parseInt(e.target.value) || 1;
                            setWarmupExercises((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, sets } : item))
                            );
                          }}
                          className="w-8 text-center bg-transparent font-bold text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                        <span className="text-slate-400">Reps/Tiempo:</span>
                        <input
                          type="text"
                          value={w.reps_or_time || '15 reps'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWarmupExercises((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, reps_or_time: val } : item))
                            );
                          }}
                          className="w-20 bg-transparent font-bold text-white focus:outline-none text-right"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <input
                          type="text"
                          placeholder="Nota (ej: barra vacía)"
                          value={w.notes || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWarmupExercises((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, notes: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 bg-slate-900 rounded-lg border border-slate-800 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Warmup action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setExercisePickerMode('warmup')}
                className="py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>De Biblioteca</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomExTargetSection('warmup');
                  setIsCustomExModalOpen(true);
                }}
                className="py-2 px-3 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Grabar con Video</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: EJERCICIOS PRINCIPALES */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    2. Ejercicios Principales ({mainExercises.length})
                  </h4>
                  <p className="text-[10px] text-slate-400">Series efectivas, pesos, repeticiones y descansos</p>
                </div>
              </div>
            </div>

            {/* Main Exercises List */}
            <div className="space-y-2">
              {mainExercises.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  Aún no has agregado ejercicios a esta rutina.
                </div>
              ) : (
                mainExercises.map((te, idx) => {
                  const ex = te.exercise || allExercises.find((e) => e.id === te.exercise_id);
                  return (
                    <div
                      key={te.id || idx}
                      className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5"
                    >
                      {/* Title & reorder row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-white truncate">
                            {ex?.name || te.exercise_id}
                          </span>
                          {ex?.is_custom && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 font-bold shrink-0">
                              Personalizado
                            </span>
                          )}
                          {(ex?.video_storage_key || ex?.video_url) && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-400 font-bold shrink-0 flex items-center gap-0.5">
                              <Video className="w-2.5 h-2.5" /> Video
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveMainExercise(idx, 'up')}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === mainExercises.length - 1}
                            onClick={() => moveMainExercise(idx, 'down')}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMainExercise(idx)}
                            className="p-1 text-slate-500 hover:text-red-400 ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Sets, Reps, Rest inputs */}
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-center">
                          <span className="text-slate-400 block text-[9px]">Series</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={te.target_sets}
                            onChange={(e) => {
                              const sets = parseInt(e.target.value) || 1;
                              setMainExercises((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, target_sets: sets } : item))
                              );
                            }}
                            className="w-full text-center bg-transparent font-bold text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-center">
                          <span className="text-slate-400 block text-[9px]">Rango Reps</span>
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={te.target_reps_min}
                              onChange={(e) => {
                                const min = parseInt(e.target.value) || 1;
                                setMainExercises((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, target_reps_min: min } : item))
                                );
                              }}
                              className="w-6 text-center bg-transparent font-bold text-xs text-white focus:outline-none"
                            />
                            <span className="text-slate-600">-</span>
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={te.target_reps_max}
                              onChange={(e) => {
                                const max = parseInt(e.target.value) || 1;
                                setMainExercises((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, target_reps_max: max } : item))
                                );
                              }}
                              className="w-6 text-center bg-transparent font-bold text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-center">
                          <span className="text-slate-400 block text-[9px]">Descanso</span>
                          <div className="flex items-center justify-center gap-0.5">
                            <input
                              type="number"
                              min={15}
                              step={15}
                              max={300}
                              value={te.target_rest_sec}
                              onChange={(e) => {
                                const rest = parseInt(e.target.value) || 60;
                                setMainExercises((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, target_rest_sec: rest } : item))
                                );
                              }}
                              className="w-8 text-center bg-transparent font-bold text-xs text-white focus:outline-none"
                            />
                            <span className="text-slate-500 text-[10px]">s</span>
                          </div>
                        </div>
                      </div>

                      {/* Coach Notes */}
                      <div>
                        <input
                          type="text"
                          placeholder="Indicaciones del profe (ej: 7 reps parciales abajo, 7 arriba, 7 completas)"
                          value={te.special_notes || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMainExercises((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, special_notes: val } : item))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Main exercises action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setExercisePickerMode('main')}
                className="py-2.5 px-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>De Biblioteca</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomExTargetSection('main');
                  setIsCustomExModalOpen(true);
                }}
                className="py-2.5 px-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Crear con Video</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Guardar Rutina Completa</span>
            </button>
          </div>
        </form>

        {/* SUBMODAL: EXERCISE PICKER FROM LIBRARY */}
        {exercisePickerMode && (
          <div className="absolute inset-0 z-50 bg-[#121622] flex flex-col animate-in fade-in">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">
                  {exercisePickerMode === 'warmup'
                    ? 'Seleccionar para Calentamiento'
                    : 'Seleccionar Ejercicio Principal'}
                </h4>
              </div>
              <button
                onClick={() => setExercisePickerMode(null)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Muscle Filters */}
            <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-950/60">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar ejercicio..."
                  value={pickerSearchQuery}
                  onChange={(e) => setPickerSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'chest', label: 'Pecho' },
                  { id: 'back', label: 'Espalda' },
                  { id: 'shoulders', label: 'Hombros' },
                  { id: 'arms', label: 'Brazos' },
                  { id: 'legs', label: 'Piernas' },
                  { id: 'core', label: 'Core' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPickerMuscleFilter(m.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      pickerMuscleFilter === m.id
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {filteredPickerExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleSelectExerciseFromPicker(ex)}
                  className="w-full p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between text-left group transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {ex.gif_url ? (
                      <img
                        src={ex.gif_url}
                        alt={ex.name}
                        className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                          {ex.name}
                        </span>
                        {ex.is_custom && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 font-bold shrink-0">
                            Personalizado
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {ex.primary_muscle_group} • {ex.equipment_id.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0 ml-2">
                    <Plus className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SUBMODAL: CREATE CUSTOM EXERCISE WITH VIDEO */}
        <CustomExerciseModal
          isOpen={isCustomExModalOpen}
          onClose={() => setIsCustomExModalOpen(false)}
          onSaveExercise={handleCreatedCustomExercise}
          initialMuscleGroup="arms"
        />
      </div>
    </div>
  );
}
