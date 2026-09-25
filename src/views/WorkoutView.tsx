'use client';

import React, { useState, useEffect } from 'react';
import {
  WorkoutTemplate,
  WorkoutSession,
  WorkoutSetRecord,
  Exercise,
  PersonalRecord,
  WorkoutTemplateExercise,
} from '../lib/types';
import {
  Play,
  Pause,
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
  Target,
  Minimize2,
  Maximize2,
  Film,
  Info
} from 'lucide-react';
import MuscleMap from '../components/MuscleMap';
import RestTimer from '../components/RestTimer';
import ExerciseVideoModal from '../components/ExerciseVideoModal';
import ExerciseFeedbackModal from '../components/ExerciseFeedbackModal';
import ExerciseSubstitutionModal from '../components/ExerciseSubstitutionModal';
import AddExerciseModal from '../components/AddExerciseModal';
import WarmupModal from '../components/WarmupModal';
import { ALTERNATIVES_MAP, DEFAULT_EXERCISES } from '../lib/data-defaults';
import { getVisualStepsForExercise } from '../lib/exercise-steps';
import confetti from 'canvas-confetti';

const EXERCISE_VARIANTS_MAP: Record<
  string,
  { id: string; label: string; gif_url: string; subtitle?: string }[]
> = {
  elevaciones_laterales_polea: [
    {
      id: 'polea',
      label: '⚡ En Polea',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0178.gif',
      subtitle: 'Tensión constante durante todo el recorrido'
    },
    {
      id: 'mancuernas',
      label: '🏋️ Con Mancuernas',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0334.gif',
      subtitle: 'Variante clásica de pie con mancuernas'
    }
  ],
  pullover_polea_alta: [
    {
      id: 'cuerda',
      label: '🧵 Con Cuerda',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0199.gif',
      subtitle: 'Mayor rango de movimiento hacia las caderas'
    },
    {
      id: 'barra',
      label: '📏 Con Barra Recta',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0237.gif',
      subtitle: 'Agarre rígido para sobrecarga del dorsal ancho'
    }
  ],
  press_frances_barra: [
    {
      id: 'barra_z',
      label: '🏋️ Con Barra Z',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0060.gif',
      subtitle: 'Agarre angulado que protege muñecas y codos'
    },
    {
      id: 'mancuernas',
      label: '⚡ Con Mancuernas',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0340.gif',
      subtitle: 'Extensión tumbado con mancuernas individuales neutras'
    }
  ],
  aperturas_cruces_polea: [
    {
      id: 'poleas',
      label: '⚡ En Poleas Cruzadas',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0171.gif',
      subtitle: 'Tensión continua y cruce en el centro'
    },
    {
      id: 'mancuernas',
      label: '🏋️ Mancuernas en Banco',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0308.gif',
      subtitle: 'Aperturas en banco plano o inclinado con mancuernas'
    },
    {
      id: 'peck_deck',
      label: '🏢 Máquina Peck Deck',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0293.gif',
      subtitle: 'Aperturas guiadas si las poleas están ocupadas'
    }
  ],
  press_banca_plano_barra: [
    {
      id: 'barra',
      label: '🏋️ Barra Olímpica',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0025.gif',
      subtitle: 'Fuerza base y sobrecarga máxima con barra'
    },
    {
      id: 'mancuernas',
      label: '⚡ Con Mancuernas',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0289.gif',
      subtitle: 'Mayor convergencia y estiramiento con mancuernas'
    }
  ],
  curl_biceps_barra: [
    {
      id: 'barra',
      label: '🏋️ Barra Z o Recta',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0031.gif',
      subtitle: 'Constructor de masa pesada para bíceps'
    },
    {
      id: 'mancuernas',
      label: '⚡ Con Mancuernas',
      gif_url: 'https://cdn.jsdelivr.net/gh/omercotkd/exercises-gifs@main/assets/0313.gif',
      subtitle: 'Curl de pie con mancuernas'
    }
  ]
};

interface WorkoutViewProps {
  template: WorkoutTemplate;
  timeMode: 'normal' | '45min' | '30min';
  allExercises: Exercise[];
  pastSessions: WorkoutSession[];
  onFinishWorkout: (session: WorkoutSession, newPRs: PersonalRecord[]) => void;
  onCancelWorkout: () => void;
  onMinimizeWorkout: () => void;
  beginnerMode?: boolean;
  savedState?: {
    currentExIndex: number;
    elapsedSeconds: number;
    isPaused: boolean;
    exercisesList: any[];
  } | null;
  onSaveState?: (state: any) => void;
}

export default function WorkoutView({
  template,
  timeMode,
  allExercises,
  pastSessions,
  onFinishWorkout,
  onCancelWorkout,
  onMinimizeWorkout,
  beginnerMode = true,
  savedState,
  onSaveState,
}: WorkoutViewProps) {
  // Filter template exercises based on time mode
  const templateExercises = (template.exercises || []).filter((te) => {
    if (timeMode === '30min') return te.priority === 'high';
    if (timeMode === '45min') return te.priority === 'high' || te.priority === 'medium';
    return true; // normal mode has all
  });

  const [currentExIndex, setCurrentExIndex] = useState(savedState?.currentExIndex || 0);
  const [exercisesList, setExercisesList] = useState<
    {
      templateExercise: WorkoutTemplateExercise;
      exercise: Exercise;
      sets: WorkoutSetRecord[];
      feeling?: 'very_easy' | 'good' | 'very_heavy' | 'pain';
      notes?: string;
    }[]
  >(savedState?.exercisesList || []);

  // Pause / Resume state
  const [isPaused, setIsPaused] = useState(savedState?.isPaused || false);

  // Rest Timer State
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(120);

  // Modals
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWarmupOpen, setIsWarmupOpen] = useState(false);
  const [showVisualGuide, setShowVisualGuide] = useState(true);
  const [exerciseVariantMap, setExerciseVariantMap] = useState<Record<string, string>>({});

  // New PR notifications
  const [unlockedPRs, setUnlockedPRs] = useState<PersonalRecord[]>([]);

  // Elapsed workout time
  const [elapsedSeconds, setElapsedSeconds] = useState(savedState?.elapsedSeconds || 0);

  // Initialize exercises and sets if not already loaded from savedState
  useEffect(() => {
    if (exercisesList.length > 0) return;

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

  // Workout duration timer (only runs when NOT paused)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        onSaveState?.({
          currentExIndex,
          elapsedSeconds: next,
          isPaused,
          exercisesList,
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, currentExIndex, exercisesList]);

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
      onSaveState?.({
        currentExIndex,
        elapsedSeconds,
        isPaused,
        exercisesList: next,
      });
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
      onSaveState?.({
        currentExIndex,
        elapsedSeconds,
        isPaused,
        exercisesList: next,
      });
      return next;
    });

    if (willBeCompleted) {
      // Check PR potential
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
      onSaveState?.({
        currentExIndex,
        elapsedSeconds,
        isPaused,
        exercisesList: next,
      });
      return next;
    });
  };

  const handleAddExerciseToSession = (exercise: Exercise) => {
    const newTe: WorkoutTemplateExercise = {
      id: `custom_${crypto.randomUUID()}`,
      template_id: template.id,
      exercise_id: exercise.id,
      order_index: exercisesList.length + 1,
      target_sets: 3,
      target_reps_min: exercise.rep_range_min || 8,
      target_reps_max: exercise.rep_range_max || 12,
      target_rir: exercise.default_rir || 2,
      target_rest_sec: exercise.default_rest_sec || 90,
      priority: 'medium',
      warmup_feeder_sets: 0,
    };

    const previousSets = getPreviousSessionSets(exercise.id);
    const defaultWeight = previousSets.length > 0 ? previousSets[0].weight_kg : 15;

    const initialSets: WorkoutSetRecord[] = Array.from({ length: 3 }).map((_, i) => ({
      id: crypto.randomUUID(),
      workout_exercise_id: '',
      set_number: i + 1,
      is_warmup: false,
      weight_kg: previousSets[i]?.weight_kg || defaultWeight,
      reps: previousSets[i]?.reps || exercise.rep_range_min || 10,
      rir: exercise.default_rir || 2,
      completed: false,
    }));

    const newItem = {
      templateExercise: newTe,
      exercise: exercise,
      sets: initialSets,
    };

    setExercisesList((prev) => {
      const next = [...prev, newItem];
      onSaveState?.({
        currentExIndex: next.length - 1,
        elapsedSeconds,
        isPaused,
        exercisesList: next,
      });
      return next;
    });

    setCurrentExIndex(exercisesList.length);
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
      {/* Top Bar: Controls, Timer and Background Minimizer */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-3 bg-[#090A0F]/80 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center gap-2">
          {/* Minimize / Return to Home without cancelling */}
          <button
            onClick={onMinimizeWorkout}
            title="Minimizar y ver otras pantallas"
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </button>

          <button
            onClick={onCancelWorkout}
            className="text-xs text-slate-500 hover:text-red-400"
          >
            Cancelar
          </button>
        </div>

        {/* Stopwatch & Pause / Resume Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1 rounded-full text-slate-950 transition-colors ${
              isPaused ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
            title={isPaused ? 'Reanudar tiempo' : 'Pausar tiempo'}
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
          </button>

          <span className="font-mono text-xs font-bold text-white tracking-wider">
            {formatElapsed()}
          </span>

          {isPaused && (
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider animate-pulse ml-0.5">
              Pausa
            </span>
          )}
        </div>

        {/* Progress indicator */}
        <div className="text-right">
          <span className="text-xs font-black text-cyan-400 font-mono">
            {completedSetsCount}/{totalSetsCount}
          </span>
          <span className="text-[9px] text-slate-500 block">series</span>
        </div>
      </div>

      {/* WARMUP & MOBILITY MODAL TRIGGER */}
      <button
        type="button"
        onClick={() => setIsWarmupOpen(true)}
        className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-slate-900 border border-orange-500/30 text-orange-300 hover:text-white flex items-center justify-between transition-all mb-3 text-xs font-bold shadow-md active:scale-98"
      >
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400 shrink-0 animate-pulse" />
          <span>🔥 Calentamiento Visual (Ver GIFs y Series de Aproximación)</span>
        </div>
        <ChevronRight className="w-4 h-4 text-orange-400 shrink-0" />
      </button>

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

        {/* Add exercise button in stepper */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 active:scale-95 transition-all shadow-sm"
          title="Añadir ejercicio extra si tienes más tiempo hoy"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Ejercicio</span>
        </button>
      </div>

      {/* ULTRA-VISUAL Exercise Header Card */}
      <div className="glass-panel-elevated rounded-3xl p-4 space-y-3 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Tier {currentEx.ranking_tier}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Ejercicio {currentExIndex + 1} de {exercisesList.length}
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight leading-tight">
              {currentEx.name}
            </h2>
            <p className="text-xs text-slate-400 capitalize mt-0.5">
              {currentEx.movement_pattern.replace('_', ' ')} • Descanso {currentTE.target_rest_sec}s
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsSubModalOpen(true)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-semibold active:scale-95 transition-all shadow-sm"
              title="Cambiar por otro ejercicio equivalente"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>Sustituir</span>
            </button>
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="py-1.5 px-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 flex items-center gap-1 text-[11px] font-bold active:scale-95 transition-all shadow-sm"
              title="Ver biomecánica detallada y músculos"
            >
              <Video className="w-3 h-3" />
              <span>Detalles</span>
            </button>
          </div>
        </div>

        {/* PROMINENT DIRECT VISUAL GUIDE & 1-2-3-4 STEP BREAKDOWN */}
        {showVisualGuide ? (
          <div className="rounded-2xl border border-cyan-500/30 bg-[#090d16] p-3 space-y-3 shadow-inner">
            {/* Guide Header with Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-[11px] font-black text-cyan-300 tracking-wider uppercase">
                  Animación y Técnica en Vivo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="text-[10px] font-bold text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Ampliar</span>
                </button>
                <button
                  onClick={() => setShowVisualGuide(false)}
                  className="text-[10px] font-bold text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 transition-colors"
                  title="Ocultar para compactar"
                >
                  Minimizar
                </button>
              </div>
            </div>

            {/* Universal Variant Selector (Cable, Dumbbells, Barbell, Rope, etc.) */}
            {(() => {
              const currentVariants = EXERCISE_VARIANTS_MAP[currentEx.id];
              if (!currentVariants) return null;
              const activeVarId = exerciseVariantMap[currentEx.id] || currentVariants[0].id;
              const activeVar = currentVariants.find((v) => v.id === activeVarId) || currentVariants[0];

              return (
                <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Variante disponible según tu gimnasio:</span>
                    {activeVar?.subtitle && (
                      <span className="text-[10px] text-cyan-300 font-medium italic truncate max-w-[200px]">
                        {activeVar.subtitle}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {currentVariants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          setExerciseVariantMap((prev) => ({ ...prev, [currentEx.id]: v.id }))
                        }
                        className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all text-center ${
                          activeVarId === v.id
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 bg-slate-950/60 hover:text-white border border-slate-800'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Prominent Looping GIF Display */}
            {(() => {
              const currentVariants = EXERCISE_VARIANTS_MAP[currentEx.id];
              const activeVarId = currentVariants ? exerciseVariantMap[currentEx.id] || currentVariants[0].id : null;
              const activeVar = currentVariants ? currentVariants.find((v) => v.id === activeVarId) : null;
              const displayGif = activeVar?.gif_url || currentEx.gif_url;

              if (!displayGif) return null;

              return (
                <div
                  onClick={() => setIsVideoModalOpen(true)}
                  className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/20 flex items-center justify-center cursor-pointer group"
                  title="Toca para ver en pantalla completa"
                >
                  <img
                    src={displayGif}
                    alt={activeVar?.label || currentEx.name}
                    className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-cyan-500/40 text-[9px] font-bold text-cyan-300 flex items-center gap-1 pointer-events-none">
                    <Film className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                    <span>{activeVar ? activeVar.label : 'Loop continuo'}</span>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-sm border border-slate-700 text-[10px] font-semibold text-slate-300 group-hover:text-cyan-300 flex items-center gap-1 transition-colors">
                    <Video className="w-3 h-3 text-cyan-400" />
                    <span>Toca para expandir</span>
                  </div>
                </div>
              );
            })()}

            {/* 1 - 2 - 3 - 4 Visual Steps Breakdown */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pasos de Ejecución Visual:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {getVisualStepsForExercise(
                  currentEx.id === 'elevaciones_laterales_polea' && exerciseVariantMap['elevaciones_laterales_polea'] === 'mancuernas'
                    ? 'elevaciones_laterales_mancuernas'
                    : currentEx.id,
                  {
                    setup: currentEx.setup,
                    execution: currentEx.execution,
                    cues: currentEx.cues
                  }
                ).map((step) => (
                  <div
                    key={step.step}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-start gap-2 shadow-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {step.step}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-white block leading-tight">
                        {step.title}
                      </span>
                      <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                        {step.instruction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Cue Highlight */}
            {currentEx.cues && (
              <div className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Clave mental:</strong> {currentEx.cues}
                </span>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowVisualGuide(true)}
            className="w-full py-2 px-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
          >
            <Film className="w-4 h-4" />
            <span>Mostrar Guía Visual & Animación Técnica (1-2-3-4)</span>
          </button>
        )}

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

      {/* WEIGHT RECORDING CLARIFICATION BADGE */}
      {(() => {
        const currentVariants = EXERCISE_VARIANTS_MAP[currentEx.id];
        const activeVarId = currentVariants ? exerciseVariantMap[currentEx.id] || currentVariants[0].id : null;
        const isDumbbell = currentEx.equipment_id === 'mancuernas' || activeVarId === 'mancuernas';
        const isBarbell =
          currentEx.equipment_id === 'barra_discos' || activeVarId === 'barra' || activeVarId === 'barra_z';

        return (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 text-xs flex items-start gap-2.5 shadow-sm my-3">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              {isDumbbell ? (
                <span>
                  <strong className="text-cyan-300 font-bold block mb-0.5">¿Cómo registrar el peso con Mancuernas?</strong>
                  Anota el peso de <span className="underline decoration-cyan-400 font-black text-white">UNA sola mancuerna</span>. Por ejemplo, si usas dos mancuernas de 15 kg (una en cada mano), anotas <strong className="text-white font-bold">15 kg</strong>.
                </span>
              ) : isBarbell ? (
                <span>
                  <strong className="text-cyan-300 font-bold block mb-0.5">¿Cómo registrar el peso con Barra?</strong>
                  Anota el <span className="underline decoration-cyan-400 font-black text-white">peso TOTAL acumulado</span> (peso de la barra + todos los discos colocados).
                </span>
              ) : (
                <span>
                  <strong className="text-cyan-300 font-bold block mb-0.5">¿Cómo registrar en Polea o Máquina?</strong>
                  Anota el número de placa o peso seleccionado directamente en el pin de la máquina.
                </span>
              )}
            </div>
          </div>
        );
      })()}

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
                  <label className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Carga (kg)</span>
                    <span className="text-[9px] text-cyan-400 font-semibold">
                      {currentEx.equipment_id === 'mancuernas' ||
                      exerciseVariantMap[currentEx.id] === 'mancuernas'
                        ? 'por mancuerna'
                        : currentEx.equipment_id === 'barra_discos' ||
                          exerciseVariantMap[currentEx.id] === 'barra' ||
                          exerciseVariantMap[currentEx.id] === 'barra_z'
                        ? 'barra + discos'
                        : 'placas'}
                    </span>
                  </label>
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

        {/* Add Set Button */}
        <button
          type="button"
          onClick={() => {
            setExercisesList((prev) => {
              const next = [...prev];
              const exItem = next[currentExIndex];
              const lastSet = exItem.sets[exItem.sets.length - 1];
              const newSet: WorkoutSetRecord = {
                id: crypto.randomUUID(),
                workout_exercise_id: '',
                set_number: exItem.sets.length + 1,
                is_warmup: false,
                weight_kg: lastSet ? lastSet.weight_kg : 15,
                reps: lastSet ? lastSet.reps : 10,
                rir: 2,
                completed: false,
              };
              exItem.sets = [...exItem.sets, newSet];
              onSaveState?.({
                currentExIndex,
                elapsedSeconds,
                isPaused,
                exercisesList: next,
              });
              return next;
            });
          }}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-500/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Añadir Otra Serie a este Ejercicio (Volumen Extra)</span>
        </button>
      </div>

      {/* Footer Navigation & Actions */}
      <div className="space-y-2 mt-auto pt-2">
        <div className="flex gap-2">
          {/* Substitute Exercise button */}
          <button
            type="button"
            onClick={() => setIsSubModalOpen(true)}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-cyan-400 flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sustituir</span>
          </button>

          {/* Add extra exercise button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 hover:bg-slate-800 flex items-center gap-1.5 transition-all"
            title="Añadir ejercicio extra si tienes 1.5 - 2 horas hoy"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Ejercicio</span>
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

      <ExerciseSubstitutionModal
        currentExercise={currentEx}
        allExercises={allExercises}
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onSelectAlternative={handleSubstituteExercise}
        originalExerciseId={currentItem.templateExercise.exercise_id}
        activeExerciseIdsInSession={exercisesList.map((item) => item.exercise.id)}
      />

      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        allExercises={allExercises}
        existingExerciseIds={exercisesList.map((item) => item.exercise.id)}
        onAddExercise={handleAddExerciseToSession}
      />

      <WarmupModal
        template={template}
        isOpen={isWarmupOpen}
        onClose={() => setIsWarmupOpen(false)}
        onComplete={() => setIsWarmupOpen(false)}
        targetWorkingWeightKg={exercisesList[0]?.sets[0]?.weight_kg || 20}
        firstExerciseName={exercisesList[0]?.exercise.name || 'Primer Ejercicio'}
      />
    </div>
  );
}
