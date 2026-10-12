'use client';

import React, { useState, useMemo } from 'react';
import {
  Play,
  Flame,
  Trophy,
  Scale,
  Clock,
  ChevronRight,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  HelpCircle,
  Dumbbell,
  Plus,
  Video,
  Layers,
  Edit3,
  Calendar
} from 'lucide-react';
import { WorkoutTemplate, WorkoutSession, PersonalRecord, BodyMeasurement } from '../lib/types';
import MeasurementGuideModal from '../components/MeasurementGuideModal';

interface HomeViewProps {
  templates: WorkoutTemplate[];
  currentRoutineIndex: number;
  lastSession: WorkoutSession | null;
  recentPRs: PersonalRecord[];
  latestMeasurement: BodyMeasurement | null;
  onStartWorkout: (template: WorkoutTemplate, timeMode: 'normal' | '45min' | '30min') => void;
  onResumeWorkout?: () => void;
  activeWorkoutInfo?: { name: string; elapsedSeconds: number } | null;
  onOpenWarmup: (template: WorkoutTemplate) => void;
  onSaveMeasurement: (weight: number, waist?: number) => void;
  onNavigateTab: (tab: 'workout' | 'progress' | 'more') => void;
  onOpenCreateRoutine?: () => void;
  onOpenEditRoutine?: (template: WorkoutTemplate) => void;
  onOpenCreateExercise?: () => void;
}

export default function HomeView({
  templates,
  currentRoutineIndex,
  lastSession,
  recentPRs,
  latestMeasurement,
  onStartWorkout,
  onResumeWorkout,
  activeWorkoutInfo,
  onOpenWarmup,
  onSaveMeasurement,
  onNavigateTab,
  onOpenCreateRoutine,
  onOpenEditRoutine,
  onOpenCreateExercise,
}: HomeViewProps) {
  const [timeMode, setTimeMode] = useState<'normal' | '45min' | '30min'>('normal');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isExerciseListOpen, setIsExerciseListOpen] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Quick check-in state
  const [checkinWeight, setCheckinWeight] = useState(latestMeasurement ? String(latestMeasurement.weight_kg) : '74.5');
  const [checkinWaist, setCheckinWaist] = useState(latestMeasurement?.waist_cm ? String(latestMeasurement.waist_cm) : '84');
  const [showCheckinSuccess, setShowCheckinSuccess] = useState(false);

  // Filter templates by muscle group / category
  const customTemplates = useMemo(() => templates.filter((t) => t.is_custom), [templates]);

  // Available muscle filter options
  const muscleFilterOptions = useMemo(() => {
    const list = [
      { id: 'all', label: 'Todas las Rutinas' },
    ];
    if (customTemplates.length > 0) {
      list.push({ id: 'custom', label: `⭐ Mis Rutinas (${customTemplates.length})` });
    }
    list.push(
      { id: 'pecho', label: 'Pecho & Bíceps' },
      { id: 'espalda', label: 'Espalda & Tríceps' },
      { id: 'hombros', label: 'Hombros & Brazos' },
      { id: 'pierna', label: 'Pierna Completa' },
      { id: 'torso', label: 'Torso & Bombeo' }
    );
    return list;
  }, [customTemplates.length]);

  const filteredTemplates = useMemo(() => {
    if (selectedMuscleFilter === 'all') return templates;
    if (selectedMuscleFilter === 'custom') return customTemplates.length > 0 ? customTemplates : templates;

    return templates.filter((t) => {
      const nameLower = t.name.toLowerCase();
      const codeLower = t.code.toLowerCase();
      const groups = (t.target_muscle_groups || []).map((m) => m.toLowerCase());
      const focusLower = (t.target_focus || '').toLowerCase();

      if (selectedMuscleFilter === 'pecho') {
        return nameLower.includes('pecho') || codeLower.includes('pecho') || groups.some(g => g.includes('pecho'));
      }
      if (selectedMuscleFilter === 'espalda') {
        return nameLower.includes('espalda') || codeLower.includes('espalda') || groups.some(g => g.includes('espalda'));
      }
      if (selectedMuscleFilter === 'hombros') {
        return nameLower.includes('hombro') || codeLower.includes('hombro') || groups.some(g => g.includes('hombro'));
      }
      if (selectedMuscleFilter === 'pierna') {
        return nameLower.includes('pierna') || codeLower.includes('pierna') || codeLower.includes('lower') || groups.some(g => g.includes('cuádriceps') || g.includes('pierna'));
      }
      if (selectedMuscleFilter === 'torso') {
        return nameLower.includes('torso') || codeLower.includes('torso') || codeLower.includes('upper');
      }
      return true;
    });
  }, [templates, customTemplates, selectedMuscleFilter]);

  // Current active template
  const currentTemplate = useMemo(() => {
    if (selectedTemplateId) {
      const found = templates.find((t) => t.id === selectedTemplateId);
      if (found) return found;
    }
    if (filteredTemplates.length > 0) {
      return filteredTemplates[0];
    }
    return templates[0];
  }, [selectedTemplateId, filteredTemplates, templates]);

  // Days since last workout
  const daysSinceLastSession = useMemo(() => {
    if (!lastSession || !lastSession.started_at) return 'Sin sesiones previas';
    const lastDate = new Date(lastSession.started_at);
    const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays} días`;
  }, [lastSession]);

  const handleQuickCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(checkinWeight);
    const waist = parseFloat(checkinWaist);
    if (!isNaN(w) && w > 20 && w < 250) {
      onSaveMeasurement(w, isNaN(waist) ? undefined : waist);
      setShowCheckinSuccess(true);
      setTimeout(() => {
        setShowCheckinSuccess(false);
        setIsCheckinModalOpen(false);
      }, 1500);
    }
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col space-y-5 pb-28 max-w-md mx-auto px-4 pt-safe">
      {/* 1. MINIMALIST LUXURY HEADER */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Sebastián Training
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
            ¡A entrenar! 💪
          </h1>
          <span className="text-[11px] text-slate-400 font-medium">
            Última sesión: <strong className="text-slate-200">{daysSinceLastSession}</strong>
          </span>
        </div>

        {/* Minimalist Top Utility Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCreateRoutine?.()}
            title="Crear Rutina Personalizada"
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Rutina</span>
          </button>
          <button
            onClick={() => onOpenCreateExercise?.()}
            title="Grabar Ejercicio con Video"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-purple-400 transition-all active:scale-95 shadow-sm"
          >
            <Video className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </header>

      {/* 2. ACTIVE WORKOUT FLOATING BANNER (if running in background) */}
      {activeWorkoutInfo && onResumeWorkout && (
        <div
          onClick={onResumeWorkout}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-400/50 shadow-lg shadow-emerald-500/10 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Sesión en Curso
              </span>
              <h3 className="text-xs font-bold text-white line-clamp-1">{activeWorkoutInfo.name}</h3>
              <span className="text-[11px] font-mono text-cyan-300">
                {formatElapsed(activeWorkoutInfo.elapsedSeconds)}
              </span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-md">
            Continuar →
          </div>
        </div>
      )}

      {/* 3. MUSCLE GROUP FILTER (Organizado por Grupo Muscular) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            ¿Qué grupo entrenas hoy?
          </span>
          <span className="text-[10px] font-semibold text-cyan-400">
            {filteredTemplates.length} rutinas
          </span>
        </div>

        {/* Clean Muscle Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {muscleFilterOptions.map((opt) => {
            const isSelected = selectedMuscleFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSelectedMuscleFilter(opt.id);
                  // Auto-select first in category
                  const match = templates.find((t) => {
                    if (opt.id === 'all') return true;
                    if (opt.id === 'custom') return t.is_custom;
                    return (
                      t.name.toLowerCase().includes(opt.id) ||
                      t.code.toLowerCase().includes(opt.id) ||
                      (t.target_muscle_groups || []).some(m => m.toLowerCase().includes(opt.id))
                    );
                  });
                  if (match) setSelectedTemplateId(match.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800/80 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Routine Cards Carousel */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {filteredTemplates.map((tpl) => {
            const isSelected = tpl.id === currentTemplate?.id;
            const muscleTags = tpl.target_muscle_groups && tpl.target_muscle_groups.length > 0
              ? tpl.target_muscle_groups
              : [tpl.name.split('(')[0].trim()];

            return (
              <div
                key={tpl.id}
                onClick={() => {
                  setSelectedTemplateId(tpl.id);
                  setIsExerciseListOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between shrink-0 w-48 relative ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      {tpl.is_custom ? '⭐ Personalizada' : 'Rutina'}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
                    )}
                  </div>
                  <h3 className={`text-xs font-black line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {tpl.name}
                  </h3>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {muscleTags.slice(0, 2).map((m, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[9px] font-semibold text-slate-300"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 text-[10px] text-slate-400 border-t border-slate-800/60 mt-2">
                  <span>{tpl.exercises?.length || 0} ejercicios</span>
                  <span className="font-mono font-medium">~{tpl.estimated_duration_min || 55}m</span>
                </div>
              </div>
            );
          })}

          {/* "+ Crear Nueva" Quick Card */}
          <button
            onClick={() => onOpenCreateRoutine?.()}
            className="p-3.5 rounded-2xl border border-dashed border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 flex flex-col items-center justify-center shrink-0 w-36 h-[112px] transition-all bg-slate-950/40 active:scale-95"
          >
            <Plus className="w-5 h-5 mb-1 text-cyan-400" />
            <span className="text-xs font-bold text-center leading-tight">Nueva Rutina</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Personalizada</span>
          </button>
        </div>
      </div>

      {/* 4. SELECTED ROUTINE HERO CARD (Minimalista, Limpio & Centrado) */}
      {currentTemplate && (
        <div className="relative rounded-3xl overflow-hidden bg-[#0D111A] border border-slate-800/90 p-5 space-y-4 shadow-xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Top: Badges & Title */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1 flex-1 pr-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-bold border border-cyan-500/25">
                  <Sparkles className="w-3 h-3" />
                  {currentTemplate.is_custom ? 'Rutina Personalizada' : 'Rutina Seleccionada'}
                </span>

                {currentTemplate.target_muscle_groups?.slice(0, 3).map((grp, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-slate-300"
                  >
                    {grp}
                  </span>
                ))}
              </div>

              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                {currentTemplate.name}
              </h2>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {currentTemplate.target_focus || currentTemplate.description}
              </p>
            </div>

            {currentTemplate.is_custom && onOpenEditRoutine && (
              <button
                onClick={() => onOpenEditRoutine(currentTemplate)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white transition-colors"
                title="Editar Rutina"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="relative z-10 grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Ejercicios</span>
              <span className="text-xs font-black text-white">{currentTemplate.exercises?.length || 0}</span>
            </div>
            <div className="border-x border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Tiempo</span>
              <span className="text-xs font-black text-cyan-400">
                {timeMode === 'normal'
                  ? `~${currentTemplate.estimated_duration_min || 55}m`
                  : timeMode === '45min'
                  ? '45m'
                  : '30m'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Calentamiento</span>
              <span className="text-xs font-black text-amber-400">
                {currentTemplate.warmup_exercises && currentTemplate.warmup_exercises.length > 0
                  ? `${currentTemplate.warmup_exercises.length} ej.`
                  : 'Cardio + Mov.'}
              </span>
            </div>
          </div>

          {/* Compact Time Selector */}
          <div className="relative z-10 flex items-center justify-between gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTimeMode('normal')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                timeMode === 'normal'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Completa
            </button>
            <button
              type="button"
              onClick={() => setTimeMode('45min')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                timeMode === '45min'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              45 min
            </button>
            <button
              type="button"
              onClick={() => setTimeMode('30min')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                timeMode === '30min'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              30 min Express
            </button>
          </div>

          {/* Collapsible Exercise List Preview (No llena la pantalla de texto) */}
          <div className="relative z-10">
            <button
              type="button"
              onClick={() => setIsExerciseListOpen(!isExerciseListOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-300 py-1 hover:text-cyan-400 transition-colors"
            >
              <span>Ver lista de ejercicios ({currentTemplate.exercises?.length || 0})</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExerciseListOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isExerciseListOpen && (
              <div className="mt-2.5 space-y-1.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs animate-in fade-in duration-150">
                {currentTemplate.exercises?.map((te, idx) => (
                  <div
                    key={te.id || idx}
                    className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">
                        {te.exercise?.short_name || te.exercise?.name || `Ejercicio ${idx + 1}`}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {te.target_sets} × {te.target_reps_min}-{te.target_reps_max}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons: Primary & Warmup */}
          <div className="relative z-10 space-y-2 pt-1">
            <button
              onClick={() => onStartWorkout(currentTemplate, timeMode)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950 stroke-none" />
              <span>INICIAR ENTRENAMIENTO</span>
            </button>

            <button
              onClick={() => onOpenWarmup(currentTemplate)}
              className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>
                {currentTemplate.warmup_exercises && currentTemplate.warmup_exercises.length > 0
                  ? `Ver Calentamiento (${currentTemplate.warmup_exercises.length} ejercicios con técnica)`
                  : 'Ver Calentamiento Visual (GIFs)'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 5. MINIMALIST TRACKER WIDGETS (Check-in & Records en Formato Limpio) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Weight & Waist Compact Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Peso Corporal
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="text-slate-500 hover:text-slate-300"
              title="¿Cómo medirme?"
            >
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white font-mono">
                {latestMeasurement?.weight_kg || '74.5'}
              </span>
              <span className="text-xs text-slate-400">kg</span>
            </div>
            <span className="text-[10px] text-slate-500">
              Cintura: {latestMeasurement?.waist_cm ? `${latestMeasurement.waist_cm} cm` : '84 cm'}
            </span>
          </div>

          <button
            onClick={() => setIsCheckinModalOpen(true)}
            className="mt-3 w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95"
          >
            <span>Actualizar</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* PRs Compact Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Récords (PR)
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('progress')}
              className="text-slate-500 hover:text-cyan-400"
              title="Ver historial de récords"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            {recentPRs.length > 0 ? (
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-white block line-clamp-1">
                  {recentPRs[0].exercise_name}
                </span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  {recentPRs[0].weight_kg} kg × {recentPRs[0].reps}
                </span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 italic py-1">
                Registra tu primer récord hoy
              </p>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('progress')}
            className="mt-3 w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95"
          >
            <span>Ver Todos</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* QUICK WEIGHT CHECK-IN MODAL (Solo se abre cuando el usuario lo pide) */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#121622] border border-cyan-500/30 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Check-in de Peso & Cintura</h3>
              </div>
              <button
                onClick={() => setIsCheckinModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleQuickCheckinSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Peso en ayunas (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={checkinWeight}
                  onChange={(e) => setCheckinWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                  placeholder="74.5"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Cintura a nivel ombligo (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={checkinWaist}
                  onChange={(e) => setCheckinWaist(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                  placeholder="84"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
              >
                {showCheckinSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>¡Registrado con éxito!</span>
                  </>
                ) : (
                  <span>Guardar Medición</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MEASUREMENT GUIDE MODAL */}
      <MeasurementGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
