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
  originalExerciseId?: string;
  activeExerciseIdsInSession?: string[];
}

export default function ExerciseSubstitutionModal({
  currentExercise,
  allExercises,
  isOpen,
  onClose,
  onSelectAlternative,
  originalExerciseId,
  activeExerciseIdsInSession = [],
}: ExerciseSubstitutionModalProps) {
  if (!isOpen) return null;

  // Check if current exercise is a substitution from the template original
  const isSubstituted = originalExerciseId && originalExerciseId !== currentExercise.id;
  const originalEx = isSubstituted ? allExercises.find((e) => e.id === originalExerciseId) : null;

  // Filter helper: never offer an exercise that is ALREADY in another slot of this workout
  const isConflict = (id: string) => {
    // If it's the original template exercise, allow restoring it
    if (id === originalExerciseId) return false;
    return activeExerciseIdsInSession.includes(id) && id !== currentExercise.id;
  };

  // STRICT RULE: All candidate alternatives MUST target the SAME muscle group or anatomical region!
  // A leg exercise must NEVER be recommended for arms, chest, or back, and vice-versa.
  const isSameTargetMuscleGroup = (e: Exercise) => {
    // 1. Major anatomical body region MUST strictly match
    // ('chest' !== 'legs', 'arms' !== 'legs', 'back' !== 'legs', etc.)
    if (e.primary_muscle_group !== currentExercise.primary_muscle_group) {
      return false;
    }

    // 2. For arms: Biceps/Brachialis must NEVER mix with Triceps!
    const isBicepsLike = (ex: Exercise) => {
      const all = [ex.id, ex.primary_muscle_id, ...(ex.primary_muscles || [])].join(' ').toLowerCase();
      return all.includes('bicep') || all.includes('braquial') || all.includes('martillo');
    };
    const isTricepsLike = (ex: Exercise) => {
      const all = [ex.id, ex.primary_muscle_id, ...(ex.primary_muscles || [])].join(' ').toLowerCase();
      return all.includes('tricep');
    };

    if (currentExercise.primary_muscle_group === 'arms') {
      if (isBicepsLike(currentExercise) && !isBicepsLike(e)) return false;
      if (isTricepsLike(currentExercise) && !isTricepsLike(e)) return false;
    }

    // 3. For legs: Calves (gemelos) must NEVER mix with quads / hamstrings / glutes
    const isCalf = (ex: Exercise) => {
      const all = [ex.id, ex.primary_muscle_id, ...(ex.primary_muscles || [])].join(' ').toLowerCase();
      return all.includes('gemelo') || all.includes('pantorrilla');
    };

    if (isCalf(currentExercise) !== isCalf(e)) {
      return false;
    }

    // 4. For isolation leg exercises: Quads isolation (leg extension) shouldn't mix with hamstring isolation (leg curl)
    if (currentExercise.primary_muscle_group === 'legs' && currentExercise.movement_pattern === 'isolation') {
      if (currentExercise.primary_muscle_id && e.primary_muscle_id && currentExercise.primary_muscle_id !== e.primary_muscle_id) {
        return false;
      }
    }

    return true;
  };

  const rawDirectAlts = ALTERNATIVES_MAP[currentExercise.id] || [];
  const directAlts = rawDirectAlts
    .filter((alt) => !isConflict(alt.altId))
    .filter((alt) => {
      const altEx = allExercises.find((e) => e.id === alt.altId);
      return altEx && isSameTargetMuscleGroup(altEx);
    });

  // Find same movement pattern exercises ONLY within the same target muscle group!
  const patternAlts = allExercises.filter(
    (e) =>
      e.id !== currentExercise.id &&
      isSameTargetMuscleGroup(e) &&
      e.movement_pattern === currentExercise.movement_pattern &&
      !directAlts.some((d) => d.altId === e.id) &&
      !isConflict(e.id)
  );

  // Other exercises strictly for the same muscle group
  const sameMuscleAlts = allExercises.filter(
    (e) =>
      e.id !== currentExercise.id &&
      isSameTargetMuscleGroup(e) &&
      !patternAlts.some((p) => p.id === e.id) &&
      !directAlts.some((d) => d.altId === e.id) &&
      !isConflict(e.id)
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
          {/* RESTORE ORIGINAL EXERCISE CARD (If currently substituted) */}
          {originalEx && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/40 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                {originalEx.gif_url && (
                  <img
                    src={originalEx.gif_url}
                    alt={originalEx.name}
                    className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1 border border-cyan-500/30 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block">
                    Ejercicio Original de la Rutina
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{originalEx.name}</h4>
                  <span className="text-[10px] text-slate-400">Toca para volver a la rutina base</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onSelectAlternative(originalEx.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs active:scale-95 transition-all shadow-md shrink-0 ml-2"
              >
                Restaurar
              </button>
            </div>
          )}

          {/* Direct Recommended Alternatives */}
          {directAlts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
                Alternativas Directas Recomendadas
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
                    <div className="flex items-center gap-3 min-w-0">
                      {altEx.gif_url && (
                        <img
                          src={altEx.gif_url}
                          alt={altEx.name}
                          className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                            {altEx.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-400 shrink-0">
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
                  <div className="flex items-center gap-3 min-w-0">
                    {ex.gif_url && (
                      <img
                        src={ex.gif_url}
                        alt={ex.name}
                        className="w-11 h-11 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">{ex.name}</h4>
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
                Otras Opciones para {currentExercise.primary_muscle_group}
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
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-300 group-hover:text-white truncate">{ex.name}</h4>
                    <p className="text-[10px] text-slate-500 capitalize">{ex.movement_pattern.replace('_', ' ')}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {/* Empty State when no alternatives match the muscle group */}
          {directAlts.length === 0 && patternAlts.length === 0 && sameMuscleAlts.length === 0 && (
            <div className="py-8 px-4 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <p className="text-xs text-cyan-300 font-bold">
                No hay más ejercicios alternativos para {currentExercise.name} en esta sesión.
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Hemos filtrado los demás ejercicios (piernas, pecho, etc.) para que tu entrenamiento trabaje exactamente el músculo correspondiente sin desequilibrar la rutina.
              </p>
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
