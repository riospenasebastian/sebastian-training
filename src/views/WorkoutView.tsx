'use client';

import React, { useState, useEffect } from 'react';
import {
  WorkoutTemplate,
  WorkoutSession,
  WorkoutExerciseRecord,
  WorkoutSetRecord,
  Exercise,
  PersonalRecord,
  WorkoutTemplateExercise,
} from '../lib/types';
import {
  Play,
  CheckCircle2,
  Clock,
  Video,
  RefreshCw,
  Plus,
  Minus,
  Sparkles,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Flame,
  X,
  Target
} from 'lucide-react';
import MuscleMap from '../components/MuscleMap';
import RestTimer from '../components/RestTimer';
import ExerciseVideoModal from '../components/ExerciseVideoModal';
import ExerciseFeedbackModal from '../components/ExerciseFeedbackModal';
import { ALTERNATIVES_MAP, DEFAULT_EXERCISES } from '../lib/data-defaults';
import confetti from 'canvas-confetti';

interface WorkoutViewProps {
  template: WorkoutTemplate;
  timeMode: 'normal' | '45min' | '30min';
  allExercises: Exercise[];
  pastSessions: WorkoutSession[];
  onFinishWorkout: (session: WorkoutSession, newPRs: PersonalRecord[]) => void;
  onCancelWorkout: () => void;
  beginnerMode?: boolean;
}

export default function WorkoutView({
  template,
  timeMode,
  allExercises,
  pastSessions,
  onFinishWorkout,
  onCancelWorkout,
  beginnerMode = true,
}: WorkoutViewProps) {
  // Filter template exercises based on time mode
  const templateExercises = (template.exercises || []).filter((te) => {
    if (timeMode === '30min') return te.priority === 'high';
    if (timeMode === '45min') return te.priority === 'high' || te.priority === 'medium';
    return true; // normal mode has all
  });

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [exercisesList, setExercisesList] = useState<
    {
      templateExercise: WorkoutTemplateExercise;
      exercise: Exercise;
      sets: WorkoutSetRecord[];
      feeling?: 'very_easy' | 'good' | 'very_heavy' | 'pain';
      notes?: string;
    }[]
  >([]);

  // Rest Timer State
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(120);

  // Video modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Feedback modal
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // New PR notifications
  const [unlockedPRs, setUnlockedPRs] = useState<PersonalRecord[]>([]);

  // Elapsed workout time
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Initialize exercises and sets
  useEffect(() => {
    const list = templateExercises.map((te) => {
      const ex =
        allExercises.find((e) => e.id === te.exercise_id) ||
        DEFAULT_EXERCISES.find((e) => e.id === te.exercise_id) ||
        DEFAULT_EXERCISES[0];

      // Find previous session data for this exercise to prefill weights
      const previousSets = getPreviousSessionSets(ex.id);
      const defaultWeight = previousSets.length > 0 ? previousSets[0].weight_kg : 15;

      const initialSets: WorkoutSetRecord[] = Array.from({ length: te.target_sets }).map(
        (_, i) => ({
          id: crypto.randomUUID(),
          workout_exercise_id: '',
          set_number: i + 1,
          is_warmup: false,
          weight_kg: previousSets[i]?.weight_kg || defaultWeight,
          reps: previousSets[i]?.reps || te.target_reps_min,
          rir: te.target_rir,
          completed: false,
        })
      );

      return {
        templateExercise: te,
        exercise: ex,
        sets: initialSets,
      };
    });

    setExercisesList(list);
  }, [template, timeMode]);

  // Workout duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function getPreviousSessionSets(exerciseId: string) {
    for (const session of pastSessions) {
      if (session.exercises) {
        const found = session.exercises.find((we) => we.exercise_id === exerciseId);
        if (found && found.sets && found.sets.length > 0) {
          return found.sets;
        }
      }
    }
    return [];
  }

  const currentItem = exercisesList[currentExIndex];

  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm text-slate-300">Cargando rutina...</p>
      </div>
    );
  }

  const currentEx = currentItem.exercise;
  const currentTE = currentItem.templateExercise;
  const previousSets = getPreviousSessionSets(currentEx.id);

  // Double Progression Advice Calculation
  const totalPrevReps = previousSets.reduce((sum, s) => sum + s.reps, 0);
  const prevMaxWeight = previousSets.reduce((max, s) => Math.max(max, s.weight_kg), 0);
  const isTopReached =
    previousSets.length > 0 &&
    previousSets.every((s) => s.reps >= currentTE.target_reps_max);

  const handleUpdateSet = (
    setIndex: number,
    field: 'weight_kg' | 'reps' | 'rir',
    value: number
  ) => {
    setExercisesList((prev) => {
      const next = [...prev];
      const exItem = next[currentExIndex];
      const nextSets = [...exItem.sets];
      nextSets[setIndex] = { ...nextSets[setIndex], [field]: value };
      exItem.sets = nextSets;
      return next;
    });
  };

  const handleCompleteSet = (setIndex: number) => {
    const currentSet = currentItem.sets[setIndex];
    const willBeCompleted = !currentSet.completed;

    setExercisesList((prev) => {
      const next = [...prev];
      const exItem = next[currentExIndex];
      const nextSets = [...exItem.sets];
      nextSets[setIndex] = { ...nextSets[setIndex], completed: willBeCompleted };
      exItem.sets = nextSets;
      return next;
    });

    if (willBeCompleted) {
      // Check PR potential
      const e1rm = Math.round(currentSet.weight_kg * (1 + currentSet.reps / 30) * 10) / 10;
      if (currentSet.weight_kg > prevMaxWeight && prevMaxWeight > 0) {
        try {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
        } catch {}
      }

      // Auto start rest timer
      setRestTimerSeconds(currentTE.target_rest_sec || 120);
      setIsRestTimerOpen(true);
    }
  };

  const handleSubstituteExercise = (altId: string) => {
    const newEx =
      allExercises.find((e) => e.id === altId) ||
      DEFAULT_EXERCISES.find((e) => e.id === altId);
    if (!newEx) return;

    setExercisesList((prev) => {
      const next = [...prev];
      next[currentExIndex] = {
        ...next[currentExIndex],
        exercise: newEx,
      };
      return next;
    });
  };

  const handleNextExercise = () => {
    // Open feedback modal before advancing
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = (
    feeling: 'very_easy' | 'good' | 'very_heavy' | 'pain',
    notes?: string
  ) => {
    setExercisesList((prev) => {
      const next = [...prev];
      next[currentExIndex].feeling = feeling;
      next[currentExIndex].notes = notes;
      return next;
    });

    if (currentExIndex < exercisesList.length - 1) {
      setCurrentExIndex((prev) => prev + 1);
    }
  };

  const handleFinishWorkout = () => {
    const completedSession: WorkoutSession = {
      id: crypto.randomUUID(),
      template_id: template.id,
      name: template.name,
      started_at: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      completed_at: new Date().toISOString(),
      duration_sec: elapsedSeconds,
      time_mode: timeMode,
      status: 'completed',
      exercises: exercisesList.map((item, idx) => ({
        id: crypto.randomUUID(),
        session_id: '',
        exercise_id: item.exercise.id,
        order_index: idx + 1,
        feeling: item.feeling,
        notes: item.notes,
        sets: item.sets,
      })),
    };

    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch {}

    onFinishWorkout(completedSession, unlockedPRs);
  };

  const formatElapsed = () => {
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const completedSetsCount = exercisesList.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSetsCount = exercisesList.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <div className="flex flex-col min-h-screen pb-28 max-w-md mx-auto px-4 pt-safe">
      {/* Top Bar: Progress and Timer */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-3">
        <button
          onClick={onCancelWorkout}
          className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          <span>Cancelar</span>
        </button>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-mono text-xs font-bold text-white tracking-wider">
            {formatElapsed()}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Progreso</span>
          <span className="text-xs font-black text-cyan-400 font-mono">
            {completedSetsCount}/{totalSetsCount} series
          </span>
        </div>
      </div>

      {/* Exercise Navigation Tabs / Stepper */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {exercisesList.map((item, idx) => {
          const isCurrent = idx === currentExIndex;
          const isDone = item.sets.every((s) => s.completed);
          return (
            <button
              key={idx}
              onClick={() => setCurrentExIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isCurrent
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : isDone
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800'
              }`}
            >
              <span>{idx + 1}.</span>
              <span className="line-clamp-1 max-w-[80px]">{item.exercise.short_name}</span>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Current Exercise Header Card */}
      <div className="glass-panel-elevated rounded-3xl p-4 space-y-3 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Tier {currentEx.ranking_tier}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Ejercicio {currentExIndex + 1} de {exercisesList.length}
              </span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight leading-tight">
              {currentEx.name}
            </h2>
            <p className="text-xs text-slate-400 capitalize mt-0.5">
              {currentEx.movement_pattern.replace('_', ' ')} • Descanso {currentTE.target_rest_sec}s
            </p>
          </div>

          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 flex flex-col items-center gap-1 active:scale-95 transition-all"
          >
            <Video className="w-5 h-5" />
            <span className="text-[9px] font-bold">Ver Técnica</span>
          </button>
        </div>

        {/* Double Progression Goal Helper */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-[#121828] border border-cyan-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              Objetivo: {currentTE.target_sets} × {currentTE.target_reps_min}-{currentTE.target_reps_max} reps
            </span>
            <span className="text-[11px] text-slate-400">
              RIR sugerido: {currentTE.target_rir}
            </span>
          </div>

          {previousSets.length > 0 ? (
            <p className="text-[11px] text-slate-300 leading-snug">
              <strong>Última sesión:</strong> {prevMaxWeight} kg (
              {previousSets.map((s) => s.reps).join(' / ')} reps).{' '}
              {isTopReached ? (
                <span className="text-emerald-400 font-bold">
                  🎯 ¡Llegaste al tope de reps! Te sugerimos subir peso hoy (+1 a 2.5 kg).
                </span>
              ) : (
                <span className="text-cyan-300">
                  🎯 Mantén el peso e intenta superar {totalPrevReps} reps totales hoy.
                </span>
              )}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 italic">
              Primera vez con este ejercicio. Comienza con una carga moderada y apunta a ~2 RIR.
            </p>
          )}
        </div>

        {/* Beginner Tip */}
        {beginnerMode && (
          <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Recordatorio:</strong> {currentEx.cues}
            </span>
          </div>
        )}
      </div>

      {/* Set Logger Rows */}
      <div className="space-y-2.5 my-4">
        {currentItem.sets.map((set, sIdx) => {
          const prevSet = previousSets[sIdx];
          return (
            <div
              key={set.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                set.completed
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black font-mono ${
                      set.completed
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-cyan-400'
                    }`}
                  >
                    {sIdx + 1}
                  </span>
                  <span className="text-xs font-bold text-white">
                    Serie {sIdx + 1} de {currentItem.sets.length}
                  </span>
                </div>

                {prevSet && (
                  <span className="text-[10px] text-slate-400">
                    Anterior: {prevSet.weight_kg}kg × {prevSet.reps}
                  </span>
                )}
              </div>

              {/* Weight & Reps inputs */}
              <div className="grid grid-cols-2 gap-3 mb-2.5">
                {/* Weight Input */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">Carga (kg)</label>
                  <div className="flex items-center gap-1 bg-slate-950 rounded-xl border border-slate-800 p-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateSet(
                          sIdx,
                          'weight_kg',
                          Math.max(1, set.weight_kg - (set.weight_kg > 20 ? 2.5 : 1))
                        )
                      }
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      value={set.weight_kg}
                      onChange={(e) =>
                        handleUpdateSet(sIdx, 'weight_kg', parseFloat(e.target.value) || 0)
                      }
                      className="w-full text-center bg-transparent text-white font-mono font-black text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateSet(
                          sIdx,
                          'weight_kg',
                          set.weight_kg + (set.weight_kg >= 20 ? 2.5 : 1)
                        )
                      }
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Reps Input */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">Repeticiones</label>
                  <div className="flex items-center gap-1 bg-slate-950 rounded-xl border border-slate-800 p-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateSet(sIdx, 'reps', Math.max(1, set.reps - 1))
                      }
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) =>
                        handleUpdateSet(sIdx, 'reps', parseInt(e.target.value) || 0)
                      }
                      className="w-full text-center bg-transparent text-white font-mono font-black text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateSet(sIdx, 'reps', set.reps + 1)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Beginner RIR Picker: "¿Cuántas más crees que podrías haber hecho?" */}
              <div className="space-y-1 mb-3">
                <span className="text-[10px] text-slate-400 block">
                  {beginnerMode
                    ? '¿Cuántas más crees que podrías haber hecho con buena técnica?'
                    : 'RIR (Repeticiones en reserva):'}
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { val: 0, label: '0 (Fallo)' },
                    { val: 1, label: '1 (Apenas)' },
                    { val: 2, label: '2 (Ideal)' },
                    { val: 3, label: '3' },
                    { val: 4, label: '4+' },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => handleUpdateSet(sIdx, 'rir', r.val)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        set.rir === r.val
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Complete Button */}
              <button
                type="button"
                onClick={() => handleCompleteSet(sIdx)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                  set.completed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{set.completed ? 'Serie Completada ✓ (Editar)' : 'TERMINÉ LA SERIE'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation & Actions */}
      <div className="space-y-2 mt-auto pt-2">
        <div className="flex gap-2">
          {/* Substitute Exercise button */}
          <button
            type="button"
            onClick={() => {
              const alts = ALTERNATIVES_MAP[currentEx.id] || [];
              if (alts.length > 0) {
                handleSubstituteExercise(alts[0].altId);
              } else {
                alert('No hay alternativas directas registradas para este ejercicio.');
              }
            }}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-cyan-400 flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sustituir Ejercicio</span>
          </button>

          {/* Trigger rest timer manually */}
          <button
            type="button"
            onClick={() => {
              setRestTimerSeconds(currentTE.target_rest_sec);
              setIsRestTimerOpen(true);
            }}
            className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 hover:bg-slate-800 flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Descanso</span>
          </button>
        </div>

        {/* Step next / finish button */}
        {currentExIndex < exercisesList.length - 1 ? (
          <button
            type="button"
            onClick={handleNextExercise}
            className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all"
          >
            <span>Siguiente Ejercicio</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinishWorkout}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-98 transition-all"
          >
            <Trophy className="w-5 h-5 fill-slate-950 stroke-none" />
            <span>TERMINAR ENTRENAMIENTO</span>
          </button>
        )}
      </div>

      {/* Modals */}
      <RestTimer
        seconds={restTimerSeconds}
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
        exerciseName={currentEx.name}
      />

      <ExerciseVideoModal
        exercise={currentEx}
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        beginnerMode={beginnerMode}
      />

      <ExerciseFeedbackModal
        exerciseId={currentEx.id}
        exerciseName={currentEx.name}
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
        onSelectAlternative={handleSubstituteExercise}
      />
    </div>
  );
}
