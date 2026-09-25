'use client';

import React from 'react';
import { X, RefreshCw, ArrowRight, ShieldCheck, Dumbbell } from 'lucide-react';
import { Exercise } from '../lib/types';
import { ALTERNATIVES_MAP } from '../lib/data-defaults';

interface ExerciseSubstitutionModalProps {
  currentExercise: Exercise;
  allExercises: Exercise[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAlternative: (newExerciseId: string) => void;
}

export default function ExerciseSubstitutionModal({
  currentExercise,
  allExercises,
  isOpen,
  onClose,
  onSelectAlternative,
}: ExerciseSubstitutionModalProps) {
  if (!isOpen) return null;

  const directAlts = ALTERNATIVES_MAP[currentExercise.id] || [];

  // Find same movement pattern exercises
  const patternAlts = allExercises.filter(
    (e) => e.id !== currentExercise.id && e.movement_pattern === currentExercise.movement_pattern
  );

  // Find same primary muscle group exercises
  const sameMuscleAlts = allExercises.filter(
    (e) =>
      e.id !== currentExercise.id &&
      e.primary_muscle_group === currentExercise.primary_muscle_group &&
      !patternAlts.some((p) => p.id === e.id)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#121622] border border-cyan-500/20 max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Sustituir Ejercicio</h3>
              <p className="text-xs text-slate-400">Actual: {currentExercise.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Direct Recommended Alternatives */}
          {directAlts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
                Alternativa Directa Recomendada
              </span>
              {directAlts.map((alt) => {
                const altEx = allExercises.find((e) => e.id === alt.altId);
                if (!altEx) return null;
                return (
                  <button
                    key={alt.altId}
                    onClick={() => {
                      onSelectAlternative(alt.altId);
                      onClose();
                    }}
                    className="w-full p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-between text-left group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {altEx.gif_url && (
                        <img
                          src={altEx.gif_url}
                          alt={altEx.name}
                          className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                            {altEx.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-400">
                            Tier {altEx.ranking_tier}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">{alt.reason}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Same Movement Pattern Options */}
          {patternAlts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Mismo Patrón de Movimiento ({currentExercise.movement_pattern.replace('_', ' ')})
              </span>
              {patternAlts.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    onSelectAlternative(ex.id);
                    onClose();
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left group transition-all"
                >
                  <div className="flex items-center gap-3">
                    {ex.gif_url && (
                      <img
                        src={ex.gif_url}
                        alt={ex.name}
                        className="w-11 h-11 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800"
                      />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">{ex.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {ex.difficulty} • {ex.equipment_id}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {/* Same Muscle Group Options */}
          {sameMuscleAlts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Otros para {currentExercise.primary_muscle_group}
              </span>
              {sameMuscleAlts.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    onSelectAlternative(ex.id);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between text-left group transition-all"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 group-hover:text-white">{ex.name}</h4>
                    <p className="text-[10px] text-slate-500">{ex.movement_pattern}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            Cancelar y mantener ejercicio actual
          </button>
        </div>
      </div>
    </div>
  );
}
