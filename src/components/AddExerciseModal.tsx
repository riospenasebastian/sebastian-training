'use client';

import React, { useState } from 'react';
import { X, Plus, Dumbbell, Sparkles, Search } from 'lucide-react';
import { Exercise } from '../lib/types';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  allExercises: Exercise[];
  existingExerciseIds: string[];
  onAddExercise: (exercise: Exercise) => void;
}

export default function AddExerciseModal({
  isOpen,
  onClose,
  allExercises,
  existingExerciseIds,
  onAddExercise,
}: AddExerciseModalProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const availableExercises = allExercises.filter(
    (ex) => !existingExerciseIds.includes(ex.id)
  );

  const filtered = availableExercises.filter((ex) => {
    const matchesMuscle =
      selectedMuscle === 'all' || ex.primary_muscle_group === selectedMuscle;
    const matchesSearch =
      searchQuery === '' ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.short_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  const muscleFilters = [
    { id: 'all', label: 'Todos' },
    { id: 'chest', label: 'Pecho' },
    { id: 'back', label: 'Espalda' },
    { id: 'shoulders', label: 'Hombros' },
    { id: 'arms', label: 'Brazos' },
    { id: 'legs', label: 'Piernas' },
    { id: 'core', label: 'Core' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#121622] border border-cyan-500/20 max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Añadir Ejercicio a la Sesión</h3>
              <p className="text-xs text-slate-400">Personaliza el volumen si tienes más tiempo hoy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Muscle Filters */}
        <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-950/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar ejercicio por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {muscleFilters.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMuscle(m.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedMuscle === m.id
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
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
            <div className="py-8 text-center text-slate-500 text-xs">
              No hay ejercicios disponibles con este filtro.
            </div>
          ) : (
            filtered.map((ex) => (
              <button
                key={ex.id}
                onClick={() => {
                  onAddExercise(ex);
                  onClose();
                }}
                className="w-full p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between text-left group transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {ex.gif_url && (
                    <img
                      src={ex.gif_url}
                      alt={ex.name}
                      className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                        {ex.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-400 shrink-0">
                        Tier {ex.ranking_tier}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {ex.primary_muscle_group} • {ex.movement_pattern.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0 ml-2">
                  <Plus className="w-4 h-4" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
