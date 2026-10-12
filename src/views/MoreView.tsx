'use client';

import React, { useState } from 'react';
import {
  WorkoutTemplate,
  WorkoutSession,
  Exercise,
  GymEquipment,
} from '../lib/types';
import {
  BookOpen,
  Dumbbell,
  History,
  Shield,
  Sparkles,
  Info,
  ChevronRight,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  X,
  Camera,
  Video,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';
import MuscleMap from '../components/MuscleMap';
import ExerciseVideoModal from '../components/ExerciseVideoModal';
import { DEFAULT_EQUIPMENT } from '../lib/data-defaults';

interface MoreViewProps {
  templates: WorkoutTemplate[];
  exercises: Exercise[];
  workoutHistory: WorkoutSession[];
  beginnerMode: boolean;
  onToggleBeginnerMode: (val: boolean) => void;
  onSelectRoutine: (template: WorkoutTemplate) => void;
  onOpenCreateRoutine?: () => void;
  onOpenEditRoutine?: (template: WorkoutTemplate) => void;
  onDeleteRoutine?: (templateId: string) => void;
  onOpenCreateExercise?: () => void;
  onDeleteExercise?: (exerciseId: string) => void;
}

export default function MoreView({
  templates,
  exercises,
  workoutHistory,
  beginnerMode,
  onToggleBeginnerMode,
  onSelectRoutine,
  onOpenCreateRoutine,
  onOpenEditRoutine,
  onDeleteRoutine,
  onOpenCreateExercise,
  onDeleteExercise,
}: MoreViewProps) {
  const [subView, setSubView] = useState<
    'menu' | 'exercises' | 'routines' | 'history' | 'equipment' | 'science'
  >('menu');

  // Exercise library state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('all');
  const [activeModalExercise, setActiveModalExercise] = useState<Exercise | null>(null);

  // Equipment toggles state
  const [equipmentList, setEquipmentList] = useState<GymEquipment[]>(DEFAULT_EQUIPMENT);

  const toggleEquipment = (id: string) => {
    setEquipmentList((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, is_default_available: !eq.is_default_available } : eq))
    );
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.short_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primary_muscle_group.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle =
      selectedMuscleFilter === 'all'
        ? true
        : selectedMuscleFilter === 'custom'
        ? ex.is_custom
        : ex.primary_muscle_group === selectedMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="flex flex-col space-y-4 pb-28 max-w-md mx-auto px-4 pt-safe">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {subView !== 'menu' && (
            <button
              onClick={() => setSubView('menu')}
              className="text-xs text-cyan-400 font-bold mb-1 flex items-center gap-1 hover:underline"
            >
              ← Volver al menú
            </button>
          )}
          <h1 className="text-2xl font-black text-white tracking-tight">
            {subView === 'menu' && 'Ajustes & Biblioteca'}
            {subView === 'exercises' && 'Biblioteca de Ejercicios'}
            {subView === 'routines' && 'Tus 4 Rutinas'}
            {subView === 'history' && 'Historial de Sesiones'}
            {subView === 'equipment' && 'Equipamiento de Gimnasio'}
            {subView === 'science' && 'Fundamentos & Metodología'}
          </h1>
        </div>
      </div>

      {/* MENU ROOT */}
      {subView === 'menu' && (
        <div className="space-y-4">
          {/* Beginner Mode Toggle Banner */}
          <div className="glass-panel-elevated rounded-3xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Modo Principiante</h3>
                <p className="text-[11px] text-slate-400">
                  {beginnerMode ? 'Activado: Lenguaje sencillo y RIR intuitivo' : 'Desactivado: Modo compacto experto'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleBeginnerMode(!beginnerMode)}
              className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                beginnerMode ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  beginnerMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="glass-panel rounded-3xl p-2 divide-y divide-slate-800/80">
            <button
              onClick={() => setSubView('exercises')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 rounded-2xl transition-all"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Biblioteca de Ejercicios (19)</h4>
                  <p className="text-[11px] text-slate-400">Técnica, videos públicos, anatomía y alternativas</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => setSubView('routines')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 rounded-2xl transition-all"
            >
              <div className="flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Estructura de Rutinas (Upper/Lower)</h4>
                  <p className="text-[11px] text-slate-400">Upper A, Lower A, Upper B, Lower B</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => setSubView('history')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 rounded-2xl transition-all"
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Historial de Entrenamientos</h4>
                  <p className="text-[11px] text-slate-400">{workoutHistory.length} sesiones completadas</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => setSubView('equipment')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 rounded-2xl transition-all"
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Equipamiento Disponible</h4>
                  <p className="text-[11px] text-slate-400">Configura qué máquinas tiene tu gimnasio</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => setSubView('science')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 rounded-2xl transition-all"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Ciencia & Metodología Jeff Nippard</h4>
                  <p className="text-[11px] text-slate-400">Hipertrofia, RIR, sobrecarga progresiva y V-taper</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}

      {/* SUBVIEW 1: EXERCISES LIBRARY */}
      {subView === 'exercises' && (
        <div className="space-y-3">
          {/* Create Custom Exercise with Video Button */}
          <button
            onClick={() => onOpenCreateExercise?.()}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>📹 Grabar Nuevo Ejercicio con Video</span>
          </button>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar ejercicio o grupo muscular..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Muscle Pills Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {['all', 'custom', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedMuscleFilter(cat)}
                className={`px-3 py-1.5 rounded-xl capitalize whitespace-nowrap font-medium transition-all ${
                  selectedMuscleFilter === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all'
                  ? 'Todos'
                  : cat === 'custom'
                  ? '⭐ Mis Videos / Profe'
                  : cat === 'chest'
                  ? 'Pecho'
                  : cat === 'back'
                  ? 'Espalda'
                  : cat === 'shoulders'
                  ? 'Hombros'
                  : cat === 'arms'
                  ? 'Brazos'
                  : cat === 'legs'
                  ? 'Piernas'
                  : 'Core'}
              </button>
            ))}
          </div>

          {/* Exercise List */}
          <div className="space-y-2">
            {filteredExercises.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No se encontraron ejercicios con este filtro.
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => setActiveModalExercise(ex)}
                  className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {ex.gif_url ? (
                      <div className="w-12 h-12 rounded-xl bg-slate-950 p-1 border border-slate-800 shrink-0 overflow-hidden">
                        <img
                          src={ex.gif_url}
                          alt={ex.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                        {ex.video_storage_key ? <Video className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {ex.is_custom ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Personalizado
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            Tier {ex.ranking_tier}
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                          {ex.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {ex.default_sets} series × {ex.rep_range_min}-{ex.rep_range_max} reps • {ex.default_rest_sec}s descanso
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {(ex.video_storage_key || ex.video_url) && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-bold flex items-center gap-0.5">
                        <Video className="w-2.5 h-2.5" />
                        <span>Video</span>
                      </span>
                    )}
                    {ex.is_custom && onDeleteExercise && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿Eliminar ejercicio "${ex.name}"?`)) {
                            onDeleteExercise(ex.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        title="Eliminar ejercicio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>

          {activeModalExercise && (
            <ExerciseVideoModal
              exercise={activeModalExercise}
              isOpen={!!activeModalExercise}
              onClose={() => setActiveModalExercise(null)}
              beginnerMode={beginnerMode}
            />
          )}
        </div>
      )}

      {/* SUBVIEW 2: ROUTINES */}
      {subView === 'routines' && (
        <div className="space-y-4">
          {/* Create Custom Routine Button */}
          <button
            onClick={() => onOpenCreateRoutine?.()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>✨ Crear Nueva Rutina Personalizada</span>
          </button>

          <p className="text-xs text-slate-400">
            Tus rutinas disponibles para entrenar:
          </p>

          <div className="space-y-3">
            {templates.map((tpl, i) => (
              <div
                key={tpl.id}
                className={`glass-panel rounded-3xl p-4 space-y-3 border ${
                  tpl.is_custom ? 'border-cyan-500/40 bg-[#0d1424]' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-black flex items-center justify-center font-mono">
                      {i + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white">{tpl.name}</h3>
                    {tpl.is_custom && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 font-bold">
                        Personalizada
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{tpl.estimated_duration_min} min</span>
                    {tpl.is_custom && onOpenEditRoutine && (
                      <button
                        onClick={() => onOpenEditRoutine(tpl)}
                        className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                        title="Editar rutina"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {tpl.is_custom && onDeleteRoutine && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la rutina "${tpl.name}"?`)) {
                            onDeleteRoutine(tpl.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        title="Eliminar rutina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300">{tpl.target_focus}</p>

                {/* Warmup summary if custom warmup exists */}
                {tpl.warmup_exercises && tpl.warmup_exercises.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Flame className="w-3 h-3" />
                      <span>Calentamiento Personalizado ({tpl.warmup_exercises.length} ejercicios):</span>
                    </div>
                    <div className="text-slate-300 space-y-0.5">
                      {tpl.warmup_exercises.map((w, wIdx) => (
                        <div key={w.id || wIdx} className="flex items-center justify-between">
                          <span>• {w.name}</span>
                          <span className="text-amber-400/80 font-mono text-[10px]">
                            {w.sets} × {w.reps_or_time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Exercises summary */}
                <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Ejercicios principales ({tpl.exercises?.length || 0}):
                  </span>
                  {tpl.exercises?.map((te, idx) => (
                    <div key={te.id || idx} className="flex items-center justify-between">
                      <span className="text-slate-300">
                        {idx + 1}. {te.exercise?.name || te.exercise_id}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {te.target_sets} × {te.target_reps_min}-{te.target_reps_max}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onSelectRoutine(tpl)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 border border-cyan-500/30 text-cyan-300 hover:text-slate-950 font-bold text-xs transition-all active:scale-98"
                >
                  Seleccionar esta rutina para hoy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBVIEW 3: HISTORY */}
      {subView === 'history' && (
        <div className="space-y-3">
          {workoutHistory.length > 0 ? (
            workoutHistory.map((s) => (
              <div key={s.id} className="glass-panel rounded-3xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white">{s.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(s.started_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {Math.round((s.duration_sec || 0) / 60)} min
                  </span>
                  <span>•</span>
                  <span>Modo: {s.time_mode}</span>
                  <span>•</span>
                  <span>{s.exercises?.length || 0} ejercicios</span>
                </div>

                {s.exercises && s.exercises.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-slate-800 text-[11px]">
                    {s.exercises.map((we, idx) => (
                      <div key={we.id || idx} className="flex items-center justify-between text-slate-300">
                        <span>{we.exercise?.short_name || we.exercise_id}</span>
                        <span className="font-mono text-cyan-300 text-[10px]">
                          {we.sets
                            ?.filter((st) => st.completed)
                            .map((st) => `${st.weight_kg}k×${st.reps}`)
                            .join(' / ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-6">
              Aún no hay entrenamientos registrados. Al completar uno, podrás revisar los detalles completos aquí.
            </p>
          )}
        </div>
      )}

      {/* SUBVIEW 4: EQUIPMENT CHECKLIST */}
      {subView === 'equipment' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Marca el equipamiento que tiene tu gimnasio de barrio. Si desmarcas alguno, la app priorizará alternativas con mancuernas o barras equivalentes:
          </p>

          <div className="space-y-2">
            {equipmentList.map((eq) => (
              <div
                key={eq.id}
                onClick={() => toggleEquipment(eq.id)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  eq.is_default_available
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold">{eq.name}</h4>
                  <span className="text-[10px] text-slate-400">{eq.category}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    eq.is_default_available
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'border-slate-700'
                  }`}
                >
                  {eq.is_default_available && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBVIEW 5: SCIENCE & METHODOLOGY */}
      {subView === 'science' && (
        <div className="glass-panel rounded-3xl p-5 space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Filosofía: Dummies por fuera, rigurosa por dentro
            </h3>
            <p>
              Esta app sigue las revisiones sistemáticas de Brad Schoenfeld y las recomendaciones prácticas de Jeff Nippard para maximizar la relación estímulo/fatiga (SFR).
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 space-y-1">
            <span className="font-bold text-cyan-400 block">1. Progresión Doble</span>
            <p>
              El peso no se sube a lo loco. Primero conquistas el rango de repeticiones (ej. 3 series de 12). Solo cuando completas 12/12/12 con 1-2 RIR, la app te sugiere incrementar la carga en 1-2.5 kg.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 space-y-1">
            <span className="font-bold text-emerald-400 block">2. Qué es RIR (Repeticiones en Reserva)</span>
            <p>
              2 RIR significa que terminas la serie sintiendo que, si tu vida dependiera de ello, solo habrías podido hacer 2 repeticiones más con buena técnica. Esto estimula la hipertrofia máxima sin destruir tus articulaciones.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-1">
            <span className="font-bold text-purple-400 block">3. Estética V-Taper</span>
            <p>
              Prioridad al deltoide lateral (elevaciones laterales con alta frecuencia), pecho superior (press inclinado a 30°) y dorsales (jalones neutros y remos con apoyo de pecho).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
