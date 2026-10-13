'use client';

import React, { useState } from 'react';
import { X, Plus, Dumbbell, Sparkles, Search, Camera, Video, Trash2 } from 'lucide-react';
import { Exercise } from '../lib/types';
import CustomExerciseModal from './CustomExerciseModal';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  allExercises: Exercise[];
  existingExerciseIds: string[];
  onAddExercise: (exercise: Exercise) => void;
  onSaveNewExercise?: (exercise: Exercise) => void;
  onDeleteExercise?: (exerciseId: string) => void;
}

export default function AddExerciseModal({
  isOpen,
  onClose,
  allExercises,
  existingExerciseIds,
  onAddExercise,
  onSaveNewExercise,
  onDeleteExercise,
}: AddExerciseModalProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  if (!isOpen) return null;

  const availableExercises = allExercises.filter(
    (ex) => !existingExerciseIds.includes(ex.id)
  );

  const filtered = availableExercises.filter((ex) => {
    const matchesMuscle =
      selectedMuscle === 'all'
        ? true
        : selectedMuscle === 'custom'
        ? ex.is_custom
        : ex.primary_muscle_group === selectedMuscle;
    const matchesSearch =
      searchQuery === '' ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.short_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  const muscleFilters = [
    { id: 'all', label: 'Todos' },
    { id: 'custom', label: '⭐ Mis Videos' },
    { id: 'chest', label: 'Pecho' },
    { id: 'back', label: 'Espalda' },
    { id: 'shoulders', label: 'Hombros' },
    { id: 'arms', label: 'Brazos' },
    { id: 'legs', label: 'Piernas' },
    { id: 'core', label: 'Core' },
  ];

  const handleCreatedCustom = (newEx: Exercise) => {
    onSaveNewExercise?.(newEx);
    onAddExercise(newEx);
    setIsCustomModalOpen(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#0E1016] border border-zinc-800 max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#CCFF00]" />
              <div>
                <h3 className="text-base font-bold text-white">Añadir Ejercicio a la Sesión</h3>
                <p className="text-xs text-zinc-400">Busca en tu biblioteca o crea uno nuevo con video</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Create Custom Exercise Banner */}
          <div className="p-3 bg-zinc-950 border-b border-zinc-850">
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-[#CCFF00]/40 text-zinc-200 hover:text-[#CCFF00] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Camera className="w-4 h-4 text-[#CCFF00]" />
              <span>¿No está en la lista? Grabar o Crear con Video</span>
            </button>
          </div>

          {/* Search & Muscle Filters */}
          <div className="p-3 border-b border-zinc-800 space-y-2 bg-[#090A0D]">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar ejercicio por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {muscleFilters.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMuscle(m.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedMuscle === m.id
                      ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises List */}
          <div className="p-4 overflow-y-auto space-y-2 flex-1">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs space-y-2">
                <p>No hay ejercicios disponibles con este filtro.</p>
                <button
                  onClick={() => setIsCustomModalOpen(true)}
                  className="text-[#CCFF00] font-bold underline hover:text-white"
                >
                  Crear este ejercicio ahora mismo
                </button>
              </div>
            ) : (
              filtered.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => {
                    onAddExercise(ex);
                    onClose();
                  }}
                  className="w-full p-3 rounded-2xl bg-zinc-900/60 border border-zinc-850 hover:border-[#CCFF00]/40 flex items-center justify-between text-left group transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {ex.gif_url ? (
                      <img
                        src={ex.gif_url}
                        alt={ex.name}
                        className="w-12 h-12 rounded-xl object-contain bg-black p-1 border border-zinc-800 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-[#CCFF00] shrink-0">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-bold text-white group-hover:text-[#CCFF00] truncate">
                          {ex.name}
                        </span>
                        {ex.is_custom ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-500/20 text-purple-300 shrink-0 border border-purple-500/30">
                            Personalizado
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#CCFF00]/15 text-[#CCFF00] shrink-0 border border-[#CCFF00]/30">
                            Tier {ex.ranking_tier}
                          </span>
                        )}
                        {(ex.video_storage_key || ex.video_url) && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-zinc-800 text-zinc-300 font-bold shrink-0 flex items-center gap-0.5">
                            <Video className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 capitalize">
                        {ex.primary_muscle_group} • {ex.equipment_id?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {ex.is_custom && onDeleteExercise && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿Eliminar el ejercicio personalizado "${ex.name}"?`)) {
                            onDeleteExercise(ex.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Eliminar ejercicio personalizado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-900/80 text-center">
            <button
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-white font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <CustomExerciseModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSaveExercise={handleCreatedCustom}
        initialMuscleGroup={selectedMuscle !== 'all' && selectedMuscle !== 'custom' ? selectedMuscle : 'arms'}
      />
    </>
  );
}

