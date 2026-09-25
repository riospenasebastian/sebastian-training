'use client';

import React, { useState } from 'react';
import {
  Play,
  Flame,
  Trophy,
  Scale,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  HelpCircle,
  Dumbbell
} from 'lucide-react';
import { WorkoutTemplate, WorkoutSession, PersonalRecord, BodyMeasurement } from '../lib/types';
import MuscleMap from '../components/MuscleMap';
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
}: HomeViewProps) {
  const [timeMode, setTimeMode] = useState<'normal' | '45min' | '30min'>('normal');
  const [checkinWeight, setCheckinWeight] = useState(latestMeasurement ? String(latestMeasurement.weight_kg) : '74.5');
  const [checkinWaist, setCheckinWaist] = useState(latestMeasurement?.waist_cm ? String(latestMeasurement.waist_cm) : '84');
  const [showCheckinSuccess, setShowCheckinSuccess] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const [selectedSplitCategory, setSelectedSplitCategory] = useState<'hypertrophy' | 'upper_lower'>('hypertrophy');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Group templates by split
  const hypertrophyTemplates = templates.filter((t) =>
    ['pecho_biceps', 'espalda_triceps', 'hombros_brazos', 'pierna_completa', 'torso_bombeo'].includes(t.code)
  );
  const upperLowerTemplates = templates.filter((t) =>
    ['upper_a', 'lower_a', 'upper_b', 'lower_b'].includes(t.code)
  );

  const activeSplitList =
    selectedSplitCategory === 'hypertrophy'
      ? hypertrophyTemplates.length > 0
        ? hypertrophyTemplates
        : templates
      : upperLowerTemplates.length > 0
      ? upperLowerTemplates
      : templates;

  // Selected template (or default to current/first)
  const currentTemplate =
    templates.find((t) => t.id === selectedTemplateId) ||
    activeSplitList[currentRoutineIndex % (activeSplitList.length || 1)] ||
    activeSplitList[0] ||
    templates[0];

  // Calculate days since last session
  const getDaysSinceLast = () => {
    if (!lastSession || !lastSession.started_at) return 'Sin sesiones previas';
    const lastDate = new Date(lastSession.started_at);
    const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays} días`;
  };

  const handleQuickCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(checkinWeight);
    const waist = parseFloat(checkinWaist);
    if (!isNaN(w) && w > 20 && w < 250) {
      onSaveMeasurement(w, isNaN(waist) ? undefined : waist);
      setShowCheckinSuccess(true);
      setTimeout(() => setShowCheckinSuccess(false), 3000);
    }
  };

  // Primary muscle tags of active routine
  const isLower = currentTemplate?.code.includes('lower') || currentTemplate?.code.includes('pierna');
  const primaryMuscles = isLower
    ? ['cuadriceps', 'isquiosurales', 'gluteos', 'gemelos']
    : currentTemplate?.code.includes('pecho')
    ? ['pecho_superior', 'pecho_medio', 'biceps', 'braquial']
    : currentTemplate?.code.includes('espalda')
    ? ['dorsal_ancho', 'espalda_alta', 'triceps_larga', 'triceps_lateral']
    : ['deltoide_lateral', 'deltoide_anterior', 'deltoide_posterior', 'biceps'];

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col space-y-5 pb-24 max-w-md mx-auto px-4 pt-safe">
      {/* Header Profile Greeting */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Sebastián Training
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
            ¡Hola, Sebastián! 💪
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-400 block">Último entreno</span>
          <span className="text-xs font-bold text-slate-200">{getDaysSinceLast()}</span>
        </div>
      </div>

      {/* ACTIVE WORKOUT FLOATING BANNER (if running in background) */}
      {activeWorkoutInfo && onResumeWorkout && (
        <div
          onClick={onResumeWorkout}
          className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border-2 border-emerald-400 shadow-xl shadow-emerald-500/20 flex items-center justify-between cursor-pointer animate-pulse active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Entrenamiento en Curso (Activo)
              </span>
              <h3 className="text-sm font-black text-white">{activeWorkoutInfo.name}</h3>
              <span className="text-xs font-mono text-cyan-300">
                Tiempo: {formatElapsed(activeWorkoutInfo.elapsedSeconds)}
              </span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">
            Continuar →
          </div>
        </div>
      )}

      {/* SPLIT FOCUS SELECTOR: Hipertrofia (1 día Pierna) vs Torso/Pierna */}
      <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1 text-xs">
        <button
          type="button"
          onClick={() => {
            setSelectedSplitCategory('hypertrophy');
            setSelectedTemplateId(null);
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            selectedSplitCategory === 'hypertrophy'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hipertrofia & Bombeo (1x Pierna)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedSplitCategory('upper_lower');
            setSelectedTemplateId(null);
          }}
          className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            selectedSplitCategory === 'upper_lower'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Torso / Pierna</span>
        </button>
      </div>

      {/* QUICK DAY TABS (Swipeable/Selectable Day Cards) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {activeSplitList.map((tpl, idx) => {
          const isSelected = tpl.id === currentTemplate.id;
          return (
            <button
              key={tpl.id}
              onClick={() => setSelectedTemplateId(tpl.id)}
              className={`px-3 py-2 rounded-2xl border text-left whitespace-nowrap transition-all flex flex-col shrink-0 ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'
                  }`}
                />
                <span
                  className={`text-[11px] font-black ${
                    isSelected ? 'text-cyan-300' : 'text-slate-300'
                  }`}
                >
                  {tpl.name.split(':')[0] || `Día ${idx + 1}`}
                </span>
              </div>
              <span
                className={`text-[10px] font-medium line-clamp-1 max-w-[130px] ${
                  isSelected ? 'text-white font-bold' : 'text-slate-500'
                }`}
              >
                {tpl.name.split(':')[1]?.trim() || tpl.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hero Card: RUTINA SELECCIONADA PARA HOY */}
      {currentTemplate && (
        <div className="relative rounded-3xl overflow-hidden glass-panel-elevated p-5 flex flex-col space-y-4 border border-cyan-500/30">
          {/* Subtle gradient background */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 mb-1.5">
                <Sparkles className="w-3 h-3" /> Rutina Lista para Entrenar
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                {currentTemplate.name}
              </h2>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                {currentTemplate.target_focus}
              </p>
            </div>
            <div className="hidden sm:block">
              <MuscleMap primaryMuscles={primaryMuscles} size="sm" view="front" />
            </div>
          </div>

          {/* Exercise list snapshot preview */}
          {currentTemplate.exercises && currentTemplate.exercises.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Ejercicios de la sesión ({currentTemplate.exercises.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentTemplate.exercises.map((te, i) => (
                  <span
                    key={te.id || i}
                    className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300"
                  >
                    {te.exercise?.short_name || te.exercise?.name || `Ej. #${i + 1}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Time Selector */}
          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">¿Cuánto tiempo tienes hoy?</span>
              <span className="text-cyan-400 font-bold">
                {timeMode === 'normal'
                  ? `~${currentTemplate.estimated_duration_min || 55} min (Completa)`
                  : timeMode === '45min'
                  ? '45 min'
                  : '30 min Express'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTimeMode('normal')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  timeMode === 'normal'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setTimeMode('45min')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  timeMode === '45min'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                45 min
              </button>
              <button
                type="button"
                onClick={() => setTimeMode('30min')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  timeMode === '30min'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                30 min
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-1 relative z-10">
            <button
              onClick={() => onStartWorkout(currentTemplate, timeMode)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all"
            >
              <Play className="w-5 h-5 fill-slate-950 stroke-none" />
              <span>EMPEZAR {currentTemplate.name.toUpperCase()}</span>
            </button>

            <button
              onClick={() => onOpenWarmup(currentTemplate)}
              className="w-full py-3 rounded-xl bg-orange-950/20 border border-orange-500/30 text-xs font-bold text-orange-300 hover:text-orange-200 hover:bg-orange-950/30 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>Ver Calentamiento Visual (Cardio + Mancuernas 1-2kg - GIFs)</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Check-in (Weight & Waist) + Guide Link */}
      <div className="glass-panel rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Check-in de Peso & Cintura</h3>
          </div>

          {/* Measurement Guide Button */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>¿Cómo medirme?</span>
          </button>
        </div>

        <form onSubmit={handleQuickCheckin} className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Peso en ayunas (kg)</label>
            <input
              type="number"
              step="0.1"
              value={checkinWeight}
              onChange={(e) => setCheckinWeight(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
              placeholder="74.5"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Cintura a nivel ombligo (cm)</label>
            <input
              type="number"
              step="0.5"
              value={checkinWaist}
              onChange={(e) => setCheckinWaist(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
              placeholder="84"
            />
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
            >
              {showCheckinSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Guardado con éxito!</span>
                </>
              ) : (
                <>
                  <span>Registrar Check-in</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Personal Records (PRs) */}
      <div className="glass-panel rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Récords Personales (PRs)</h3>
          </div>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-0.5"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {recentPRs.length > 0 ? (
          <div className="space-y-2">
            {recentPRs.slice(0, 3).map((pr) => (
              <div
                key={pr.id}
                className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{pr.exercise_name}</h4>
                  <p className="text-[10px] text-slate-400">e1RM: {pr.e1rm_kg} kg</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-amber-400 font-mono">
                    {pr.weight_kg} kg × {pr.reps}
                  </span>
                  <span className="block text-[9px] text-slate-500">
                    {new Date(pr.achieved_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-2 text-center">
            Aún no has registrado récords. ¡En tu próxima sesión quedarán guardados automáticamente!
          </p>
        )}
      </div>

      {/* Measurement & Weighing Protocol Modal */}
      <MeasurementGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
