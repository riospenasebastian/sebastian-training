'use client';

import React, { useState } from 'react';
import { Play, Flame, Trophy, Scale, Calendar, Clock, ChevronRight, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { WorkoutTemplate, WorkoutSession, PersonalRecord, BodyMeasurement } from '../lib/types';
import MuscleMap from '../components/MuscleMap';

interface HomeViewProps {
  templates: WorkoutTemplate[];
  currentRoutineIndex: number;
  lastSession: WorkoutSession | null;
  recentPRs: PersonalRecord[];
  latestMeasurement: BodyMeasurement | null;
  onStartWorkout: (template: WorkoutTemplate, timeMode: 'normal' | '45min' | '30min') => void;
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
  onOpenWarmup,
  onSaveMeasurement,
  onNavigateTab,
}: HomeViewProps) {
  const [timeMode, setTimeMode] = useState<'normal' | '45min' | '30min'>('normal');
  const [checkinWeight, setCheckinWeight] = useState(latestMeasurement ? String(latestMeasurement.weight_kg) : '74.5');
  const [checkinWaist, setCheckinWaist] = useState(latestMeasurement?.waist_cm ? String(latestMeasurement.waist_cm) : '84');
  const [showCheckinSuccess, setShowCheckinSuccess] = useState(false);

  // Determine next template in sequence
  const nextTemplate = templates[currentRoutineIndex % (templates.length || 1)] || templates[0];

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

  // Primary muscle tags of next routine
  const isUpper = nextTemplate?.code.startsWith('upper');
  const primaryMuscles = isUpper
    ? ['pecho_superior', 'dorsal_ancho', 'deltoide_lateral', 'biceps']
    : ['cuadriceps', 'isquiosurales', 'gluteos', 'gemelos'];

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

      {/* Hero Card: SIGUIENTE ENTRENAMIENTO */}
      {nextTemplate && (
        <div className="relative rounded-3xl overflow-hidden glass-panel-elevated p-5 flex flex-col space-y-4">
          {/* Subtle gradient background */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 mb-1.5">
                <Sparkles className="w-3 h-3" /> Secuencia Inteligente (Día independiente)
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                {nextTemplate.name}
              </h2>
              <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                {nextTemplate.target_focus}
              </p>
            </div>
            <div className="hidden sm:block">
              <MuscleMap primaryMuscles={primaryMuscles} size="sm" view="front" />
            </div>
          </div>

          {/* Time Selector */}
          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">¿Cuánto tiempo tienes hoy?</span>
              <span className="text-cyan-400 font-bold">
                {timeMode === 'normal' ? '~55 min (Completa)' : timeMode === '45min' ? '45 min' : '30 min Express'}
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
              onClick={() => onStartWorkout(nextTemplate, timeMode)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all"
            >
              <Play className="w-5 h-5 fill-slate-950 stroke-none" />
              <span>EMPEZAR ENTRENAMIENTO</span>
            </button>

            <button
              onClick={() => onOpenWarmup(nextTemplate)}
              className="w-full py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:text-cyan-400 flex items-center justify-center gap-1.5 transition-all"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Ver Calentamiento Previo (5m Cardio + Movilidad)</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Check-in (Weight & Waist) */}
      <div className="glass-panel rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Check-in Rápido de Hoy</h3>
          </div>
          {latestMeasurement && (
            <span className="text-[11px] text-slate-400">
              Último: {latestMeasurement.weight_kg} kg
            </span>
          )}
        </div>

        <form onSubmit={handleQuickCheckin} className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Peso corporal (kg)</label>
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
            <label className="text-[10px] text-slate-400 block mb-1">Cintura (cm opcional)</label>
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
    </div>
  );
}
