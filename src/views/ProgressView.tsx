'use client';

import React, { useState } from 'react';
import {
  BodyMeasurement,
  PersonalRecord,
  WorkoutSession,
  Exercise,
} from '../lib/types';
import {
  LineChart,
  Scale,
  Trophy,
  Flame,
  Calendar,
  Activity,
  Camera,
  Layers,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Plus,
  Upload,
  ArrowRight
} from 'lucide-react';
import MuscleMap from '../components/MuscleMap';
import MeasurementGuideModal from '../components/MeasurementGuideModal';
import { DEFAULT_EXERCISES } from '../lib/data-defaults';

interface ProgressViewProps {
  measurements: BodyMeasurement[];
  personalRecords: PersonalRecord[];
  workoutHistory: WorkoutSession[];
  onAddMeasurement: (m: BodyMeasurement) => void;
}

export default function ProgressView({
  measurements,
  personalRecords,
  workoutHistory,
  onAddMeasurement,
}: ProgressViewProps) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'muscles' | 'prs' | 'photos'>('metrics');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // New measurement form state
  const [newWeight, setNewWeight] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newArm, setNewArm] = useState('');
  const [newChest, setNewChest] = useState('');

  // Weekly muscle volume calculations (Count effective sets in past 7 days)
  const calculateWeeklyVolume = () => {
    const volume: Record<string, number> = {};
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const session of workoutHistory) {
      if (new Date(session.started_at).getTime() >= oneWeekAgo && session.exercises) {
        for (const we of session.exercises) {
          const ex = DEFAULT_EXERCISES.find((e) => e.id === we.exercise_id);
          const effectiveSets = (we.sets || []).filter((s) => s.completed && !s.is_warmup).length;

          if (ex && ex.primary_muscles) {
            for (const m of ex.primary_muscles) {
              volume[m] = (volume[m] || 0) + effectiveSets;
            }
          }
          if (ex && ex.secondary_muscles) {
            for (const m of ex.secondary_muscles) {
              volume[m] = (volume[m] || 0) + Math.round(effectiveSets * 0.5);
            }
          }
        }
      }
    }
    return volume;
  };

  const volumeByMuscle = calculateWeeklyVolume();

  // Weekly weight moving average
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime()
  );

  const latestWeight = sortedMeasurements[sortedMeasurements.length - 1]?.weight_kg || 74.5;
  const latestWaist = sortedMeasurements[sortedMeasurements.length - 1]?.waist_cm || 84.0;
  const initialWeight = sortedMeasurements[0]?.weight_kg || 74.5;
  const weightChange = Math.round((latestWeight - initialWeight) * 10) / 10;

  // Calculate 7-day moving average
  const movingAvg =
    sortedMeasurements.length >= 3
      ? Math.round(
          (sortedMeasurements
            .slice(-7)
            .reduce((sum, m) => sum + m.weight_kg, 0) /
            Math.min(sortedMeasurements.length, 7)) *
            10
        ) / 10
      : latestWeight;

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 0) {
      const m: BodyMeasurement = {
        id: crypto.randomUUID(),
        recorded_date: new Date().toISOString().split('T')[0],
        weight_kg: w,
        waist_cm: parseFloat(newWaist) || undefined,
        arms_cm: parseFloat(newArm) || undefined,
        chest_cm: parseFloat(newChest) || undefined,
      };
      onAddMeasurement(m);
      setShowAddModal(false);
      setNewWeight('');
      setNewWaist('');
      setNewArm('');
      setNewChest('');
    }
  };

  return (
    <div className="flex flex-col space-y-4 pb-28 max-w-md mx-auto px-4 pt-safe">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#CCFF00]">
            Evolución y Rendimiento
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">Progreso</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(true)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[#CCFF00] font-bold text-xs flex items-center gap-1 shadow-sm hover:border-[#CCFF00]/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guía Medidas</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black text-xs flex items-center gap-1 shadow-md shadow-[#CCFF00]/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Registrar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-xs font-bold">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'metrics'
              ? 'bg-[#CCFF00] text-black font-black shadow-md shadow-[#CCFF00]/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Métricas
        </button>
        <button
          onClick={() => setActiveTab('muscles')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'muscles'
              ? 'bg-[#CCFF00] text-black font-black shadow-md shadow-[#CCFF00]/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Cuerpo
        </button>
        <button
          onClick={() => setActiveTab('prs')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'prs'
              ? 'bg-[#CCFF00] text-black font-black shadow-md shadow-[#CCFF00]/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Récords
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'photos'
              ? 'bg-[#CCFF00] text-black font-black shadow-md shadow-[#CCFF00]/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Fotos
        </button>
      </div>

      {/* TAB 1: METRICS & CHARTS */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          {/* Main KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel rounded-3xl p-4 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Peso Actual
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white font-mono">{latestWeight}</span>
                <span className="text-xs text-slate-400 font-bold">kg</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-300">
                <span>Media 7 días:</span>
                <span className="font-bold font-mono text-[#CCFF00]">{movingAvg} kg</span>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-4 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                Cintura
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-400 font-mono">
                  {latestWaist}
                </span>
                <span className="text-xs text-zinc-400 font-bold">cm</span>
              </div>
              <p className="text-[11px] text-zinc-400">Indicador clave de grasa visceral</p>
            </div>
          </div>

          {/* Weight Chart (Visual Bars) */}
          <div className="glass-panel rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Tendencia de Peso Corporal
              </h3>
              <span className="text-[10px] text-zinc-400">Últimos registros</span>
            </div>

            {/* Pure SVG Line Chart */}
            <div className="h-32 w-full pt-4 flex items-end justify-between gap-1.5 px-2">
              {sortedMeasurements.slice(-10).map((m, idx) => {
                const minWeight = 60;
                const maxWeight = 90;
                const heightPercent = Math.max(
                  15,
                  Math.min(100, ((m.weight_kg - minWeight) / (maxWeight - minWeight)) * 100)
                );
                return (
                  <div key={m.id || idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[9px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.weight_kg}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#CCFF00]/50 to-[#CCFF00] transition-all hover:brightness-125"
                    />
                    <span className="text-[8px] text-zinc-500 font-mono">
                      {m.recorded_date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-zinc-400 text-center italic">
              💡 Guía científica: El peso fluctúa diariamente por agua y glucógeno. Enfócate en la media semanal y en que la cintura se mantenga o reduzca.
            </p>
          </div>

          {/* Sessions & Adherence */}
          <div className="glass-panel rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#CCFF00]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Consistencia & Adherencia
                </h3>
              </div>
              <span className="text-xs font-black text-[#CCFF00]">
                {workoutHistory.length} sesiones
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">Total Sesiones</span>
                <span className="text-lg font-black text-white font-mono">
                  {workoutHistory.length}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">Récords PR</span>
                <span className="text-lg font-black text-[#FF6B00] font-mono">
                  {personalRecords.length}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">Adherencia</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {workoutHistory.length > 0 ? '100%' : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL ANATOMICAL MUSCLE MAP & VOLUME */}
      {activeTab === 'muscles' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-4 space-y-3">
            <div className="text-center">
              <h3 className="text-sm font-bold text-white">Mapa de Volumen Semanal</h3>
              <p className="text-xs text-zinc-400">
                Series efectivas acumuladas en los últimos 7 días por grupo muscular
              </p>
            </div>

            <MuscleMap volumeByMuscle={volumeByMuscle} view="both" size="md" showLabels />

            {/* Volume Breakdown Table */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-zinc-300 block">
                Series Efectivas por Grupo:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'pecho_superior', name: 'Pecho Superior', target: '8-12' },
                  { id: 'dorsal_ancho', name: 'Dorsales (V-Taper)', target: '10-14' },
                  { id: 'deltoide_lateral', name: 'Hombro Lateral', target: '12-16' },
                  { id: 'biceps', name: 'Bíceps & Braquial', target: '8-12' },
                  { id: 'triceps_larga', name: 'Tríceps', target: '8-12' },
                  { id: 'cuadriceps', name: 'Cuádriceps', target: '8-12' },
                  { id: 'isquiosurales', name: 'Isquiosurales', target: '6-10' },
                  { id: 'abdomen', name: 'Abdomen / Core', target: '6-8' },
                ].map((m) => {
                  const sets = volumeByMuscle[m.id] || 0;
                  return (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-semibold text-white block">{m.name}</span>
                        <span className="text-[10px] text-zinc-400">Obj: {m.target} series</span>
                      </div>
                      <span className="text-sm font-black font-mono text-[#CCFF00]">
                        {sets} set{sets !== 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERSONAL RECORDS (PRs) */}
      {activeTab === 'prs' && (
        <div className="space-y-3">
          <div className="glass-panel rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="text-sm font-bold text-white">Todos tus Récords Personales</h3>
            </div>

            {personalRecords.length > 0 ? (
              <div className="space-y-2">
                {personalRecords.map((pr) => (
                  <div
                    key={pr.id}
                    className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{pr.exercise_name}</h4>
                      <p className="text-[10px] text-zinc-400">
                        e1RM estimado: <strong className="text-[#CCFF00]">{pr.e1rm_kg} kg</strong>
                      </p>
                      <span className="text-[9px] text-zinc-500">
                        {new Date(pr.achieved_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-right">
                      <span className="text-sm font-black text-[#FF6B00] font-mono">
                        {pr.weight_kg} kg
                      </span>
                      <span className="text-[10px] text-zinc-400 block font-medium">× {pr.reps} reps</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic text-center py-4">
                Aún no tienes récords guardados. Al completar tu primer entrenamiento se generarán automáticamente.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PROGRESS PHOTOS */}
      {activeTab === 'photos' && (
        <div className="glass-panel rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#CCFF00]" />
              <h3 className="text-sm font-bold text-white">Comparativa Fotográfica</h3>
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">Frontal • Lateral • Espalda</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-4">
            <div className="aspect-[3/4] rounded-2xl bg-zinc-900 border border-dashed border-zinc-700 flex flex-col items-center justify-center p-2 text-center">
              <Camera className="w-6 h-6 text-zinc-500 mb-1" />
              <span className="text-[10px] font-bold text-zinc-400">Foto Frontal</span>
              <span className="text-[9px] text-zinc-500">Toca para subir</span>
            </div>
            <div className="aspect-[3/4] rounded-2xl bg-zinc-900 border border-dashed border-zinc-700 flex flex-col items-center justify-center p-2 text-center">
              <Camera className="w-6 h-6 text-zinc-500 mb-1" />
              <span className="text-[10px] font-bold text-zinc-400">Foto Lateral</span>
              <span className="text-[9px] text-zinc-500">Toca para subir</span>
            </div>
            <div className="aspect-[3/4] rounded-2xl bg-zinc-900 border border-dashed border-zinc-700 flex flex-col items-center justify-center p-2 text-center">
              <Camera className="w-6 h-6 text-zinc-500 mb-1" />
              <span className="text-[10px] font-bold text-zinc-400">Foto Espalda</span>
              <span className="text-[9px] text-zinc-500">Toca para subir</span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
            Tómate las fotos cada 2 a 4 semanas, siempre con la misma iluminación matutina en ayunas para evaluar el desarrollo de hombros y reducción de cintura.
          </p>
        </div>
      )}

      {/* Modal: Add Measurement */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#0E1016] border border-zinc-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Nuevo Registro Corporal</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveMeasurement} className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1 font-bold">Peso (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="74.5"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1 font-bold">Cintura (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newWaist}
                  onChange={(e) => setNewWaist(e.target.value)}
                  placeholder="84"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 font-bold">Brazo (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newArm}
                    onChange={(e) => setNewArm(e.target.value)}
                    placeholder="34"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 font-bold">Pecho (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newChest}
                    onChange={(e) => setNewChest(e.target.value)}
                    placeholder="98"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black text-xs uppercase tracking-wider shadow-md shadow-[#CCFF00]/20 transition-all active:scale-98"
              >
                Guardar Medidas
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Measurement Guide Modal */}
      <MeasurementGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </div>
  );
}
