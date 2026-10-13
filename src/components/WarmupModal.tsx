'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Flame,
  CheckCircle2,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  X,
  ExternalLink,
  Sparkles,
  Info,
  Video
} from 'lucide-react';
import { WorkoutTemplate } from '../lib/types';
import { WARMUP_MOBILITY_ASSETS } from '../lib/data-defaults';
import { getVideoObjectUrl } from '../lib/media-storage';

interface WarmupModalProps {
  template: WorkoutTemplate;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  targetWorkingWeightKg?: number;
  firstExerciseName?: string;
}

export default function WarmupModal({
  template,
  isOpen,
  onClose,
  onComplete,
  targetWorkingWeightKg = 20,
  firstExerciseName = 'Press Inclinado con Mancuernas',
}: WarmupModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(2); // Start on Step 2 (Movilidad Visual) so visual GIFs are seen immediately!
  const [cardioSeconds, setCardioSeconds] = useState(template.warmup_cardio_min ? template.warmup_cardio_min * 60 : 300);
  const [isCardioRunning, setIsCardioRunning] = useState(false);
  const [mobilityChecks, setMobilityChecks] = useState<boolean[]>([]);
  const [expandedItems, setExpandedItems] = useState<number[]>([0, 1, 2]); // Open with GIFs visible!
  const [customVideoUrls, setCustomVideoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load local videos for custom warmup exercises if any
    if (template.warmup_exercises) {
      template.warmup_exercises.forEach(async (w) => {
        if (w.video_storage_key) {
          const url = await getVideoObjectUrl(w.video_storage_key);
          if (url) {
            setCustomVideoUrls((prev) => ({ ...prev, [w.video_storage_key!]: url }));
          }
        }
      });
    }
  }, [template]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCardioRunning && cardioSeconds > 0) {
      interval = setInterval(() => {
        setCardioSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCardioRunning, cardioSeconds]);

  if (!isOpen) return null;

  // Routine-specific tailored warmups (100% standing and light dumbbells 1-2kg)
  let mobilityItems = [
    WARMUP_MOBILITY_ASSETS.arm_circles,
    WARMUP_MOBILITY_ASSETS.thoracic_rotation,
    WARMUP_MOBILITY_ASSETS.scapular_retractions,
  ];

  if (template.code.includes('pecho')) {
    mobilityItems = [
      WARMUP_MOBILITY_ASSETS.arm_circles, // Around the world de pie
      WARMUP_MOBILITY_ASSETS.thoracic_rotation, // Aperturas dinámicas de pecho
      WARMUP_MOBILITY_ASSETS.biceps_triceps_prep, // Flexo-extensión suave de codos para bíceps
    ];
  } else if (template.code.includes('espalda')) {
    mobilityItems = [
      WARMUP_MOBILITY_ASSETS.scapular_retractions, // Elevaciones en Y y retracción escapular
      WARMUP_MOBILITY_ASSETS.thoracic_rotation, // Aperturas y rotación torácica
      WARMUP_MOBILITY_ASSETS.biceps_triceps_prep, // Flexo-extensión suave de codos para tríceps
    ];
  } else if (template.code.includes('hombro')) {
    mobilityItems = [
      WARMUP_MOBILITY_ASSETS.arm_circles, // Around the world con mancuernas 1-2kg
      WARMUP_MOBILITY_ASSETS.rotator_cuff_external, // Rotaciones externas de manguito rotador
      WARMUP_MOBILITY_ASSETS.scapular_retractions, // Elevaciones en Y para deltoides
    ];
  } else if (template.code.includes('pierna') || template.code.includes('lower')) {
    mobilityItems = [
      WARMUP_MOBILITY_ASSETS.ankle_mobility, // Movilidad de tobillo contra pared de pie
      WARMUP_MOBILITY_ASSETS.hip_90_90, // Elevaciones dinámicas de talones
      WARMUP_MOBILITY_ASSETS.goblet_squat_hold, // Sentadilla profunda de pie con soporte
    ];
  }

  // Feeder sets calculation
  const feederSets = [
    { weight: Math.max(2, Math.round((targetWorkingWeightKg * 0.4) / 0.5) * 0.5), reps: 8, note: 'Muy fácil: para lubricar tendones' },
    { weight: Math.max(4, Math.round((targetWorkingWeightKg * 0.65) / 0.5) * 0.5), reps: 5, note: 'Velocidad moderada sin fatiga' },
    { weight: Math.max(6, Math.round((targetWorkingWeightKg * 0.85) / 0.5) * 0.5), reps: 2, note: 'Prepara el sistema nervioso para el peso real' },
  ];

  const formatCardio = () => {
    const mins = Math.floor(cardioSeconds / 60);
    const s = cardioSeconds % 60;
    return `${mins}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#0E1016] border border-zinc-800 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-[#FF6B00]" />
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider">Calentamiento Guiado</h2>
              <p className="text-xs text-zinc-400 font-medium">{template.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-3 border-b border-zinc-800 text-xs font-bold">
          <button
            onClick={() => setStep(1)}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
              step === 1 ? 'border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/10' : 'border-transparent text-zinc-400'
            }`}
          >
            <span>Paso 1</span>
            <span className="text-[10px] opacity-80">5m Cardio</span>
          </button>
          <button
            onClick={() => setStep(2)}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
              step === 2 ? 'border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/10' : 'border-transparent text-zinc-400'
            }`}
          >
            <span>Paso 2</span>
            <span className="text-[10px] opacity-80">Movilidad Visual</span>
          </button>
          <button
            onClick={() => setStep(3)}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
              step === 3 ? 'border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/10' : 'border-transparent text-zinc-400'
            }`}
          >
            <span>Paso 3</span>
            <span className="text-[10px] opacity-80">Aproximación</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                <span className="font-black text-[#CCFF00] block mb-1">🎯 Objetivo:</span>
                Caminar en cinta con inclinación leve, pedalear en bicicleta o elíptica suave durante 5 minutos.
                Debe elevar la temperatura de músculos y tendones. <strong>No debe cansarte</strong>; debes poder hablar con oraciones completas normalmente sin jadear.
              </div>

              {/* Timer Display */}
              <div className="py-6 flex flex-col items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-5xl font-mono font-black text-[#CCFF00] drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                  {formatCardio()}
                </span>
                <span className="text-xs text-zinc-400 mt-2 font-medium">Ritmo suave / conversación fácil</span>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setIsCardioRunning(!isCardioRunning)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black text-sm shadow-md transition-all active:scale-95"
                  >
                    {isCardioRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
                    <span>{isCardioRunning ? 'Pausar' : 'Iniciar'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCardioRunning(false);
                      setCardioSeconds(300);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-850 border border-zinc-750 text-zinc-300 hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {template.warmup_exercises && template.warmup_exercises.length > 0 ? (
                <>
                  <div className="p-3 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-xs text-[#FF9E4A]">
                    <strong className="text-white">Calentamiento personalizado del profesor:</strong> Realiza estos ejercicios con barra vacía o peso ligero según la rutina:
                  </div>

                  {template.warmup_exercises.map((w, idx) => {
                    const isExpanded = expandedItems.includes(idx);
                    const isChecked = mobilityChecks[idx];
                    const videoUrl = w.video_storage_key ? customVideoUrls[w.video_storage_key] : null;

                    return (
                      <div
                        key={w.id || idx}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isChecked
                            ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40'
                            : isExpanded
                            ? 'bg-zinc-900 border-[#CCFF00]/40'
                            : 'bg-zinc-900/60 border-zinc-800'
                        }`}
                      >
                        <div
                          onClick={() =>
                            setExpandedItems((prev) =>
                              prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                            )
                          }
                          className="p-3.5 flex items-center justify-between cursor-pointer select-none bg-zinc-900/90"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = [...mobilityChecks];
                                next[idx] = !next[idx];
                                setMobilityChecks(next);
                              }}
                              className="mt-0.5"
                            >
                              {isChecked ? (
                                <CheckCircle2 className="w-5 h-5 text-[#CCFF00]" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-zinc-600 hover:border-[#CCFF00] transition-colors" />
                              )}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white">{w.name}</h4>
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#FF6B00]/20 text-[#FF9E4A] font-bold">
                                  {w.sets || 2} series × {w.reps_or_time || '15 reps'}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#CCFF00] font-medium">
                                {isExpanded ? 'Toca para contraer' : 'Toca para ver detalles y video'}
                              </span>
                            </div>
                          </div>

                          <ChevronRight
                            className={`w-4 h-4 text-zinc-500 transition-transform ${
                              isExpanded ? 'rotate-90 text-[#CCFF00]' : ''
                            }`}
                          />
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-zinc-800 space-y-3">
                            {videoUrl && (
                              <div className="rounded-xl overflow-hidden bg-black border border-zinc-800">
                                <video
                                  src={videoUrl}
                                  controls
                                  playsInline
                                  className="w-full max-h-56 object-contain bg-black"
                                />
                              </div>
                            )}

                            {w.gif_url && !videoUrl && (
                              <div className="flex flex-col items-center justify-center bg-black rounded-2xl p-2 border border-zinc-800">
                                <img
                                  src={w.gif_url}
                                  alt={w.name}
                                  className="w-48 h-48 object-contain rounded-xl"
                                />
                              </div>
                            )}

                            {w.notes && (
                              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-start gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 mt-0.5" />
                                <span>
                                  <strong className="text-white">Indicación del profesor:</strong> {w.notes}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-xs text-[#FF9E4A]">
                    <strong className="text-white">¿Por qué y cómo hacerlos?</strong> Toca cada ejercicio para ver la animación GIF de cómo se ejecuta paso a paso:
                  </div>

                  {mobilityItems.map((item, idx) => {
                    const isExpanded = expandedItems.includes(idx);
                    const isChecked = mobilityChecks[idx];
                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isChecked
                            ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40'
                            : isExpanded
                            ? 'bg-zinc-900 border-[#CCFF00]/40'
                            : 'bg-zinc-900/60 border-zinc-800'
                        }`}
                      >
                        {/* Item Header */}
                        <div
                          onClick={() =>
                            setExpandedItems((prev) =>
                              prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                            )
                          }
                          className="p-3.5 flex items-center justify-between cursor-pointer select-none bg-zinc-900/90"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = [...mobilityChecks];
                                next[idx] = !next[idx];
                                setMobilityChecks(next);
                              }}
                              className="mt-0.5"
                            >
                              {isChecked ? (
                                <CheckCircle2 className="w-5 h-5 text-[#CCFF00]" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-zinc-600 hover:border-[#CCFF00] transition-colors" />
                              )}
                            </button>
                            <div>
                              <h4 className="text-xs font-bold text-white">{item.title}</h4>
                              <span className="text-[10px] text-[#CCFF00] font-medium">
                                {isExpanded ? 'Toca para contraer' : 'Toca para ver animación GIF'}
                              </span>
                            </div>
                          </div>

                          <ChevronRight
                            className={`w-4 h-4 text-zinc-500 transition-transform ${
                              isExpanded ? 'rotate-90 text-[#CCFF00]' : ''
                            }`}
                          />
                        </div>

                        {/* Expanded Visual & GIF */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-zinc-800 space-y-3">
                            <div className="flex flex-col items-center justify-center bg-black rounded-2xl p-2 border border-zinc-800 shadow-inner relative">
                              <img
                                src={item.gif}
                                alt={item.title}
                                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                                loading="eager"
                              />
                              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/85 backdrop-blur-sm border border-[#CCFF00]/30 text-[9px] text-[#CCFF00] font-bold">
                                🔄 Animación en bucle
                              </span>
                            </div>

                            <p className="text-xs text-zinc-300 leading-relaxed">{item.desc}</p>

                            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-start gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-white">Clave técnica:</strong> {item.cue}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300">
                <span className="font-black text-white block mb-0.5">Series de aproximación para:</span>
                <span className="text-[#CCFF00] font-bold">{firstExerciseName}</span>
                <span className="block mt-1 text-[11px] text-zinc-400">
                  (Peso de trabajo estimado hoy: ~{targetWorkingWeightKg} kg). Estas series preparan articulaciones y sistema nervioso. <strong>NO cuentan como series efectivas.</strong>
                </span>
              </div>

              <div className="space-y-2">
                {feederSets.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-[#CCFF00]">
                          Aprox #{i + 1}
                        </span>
                        <span className="text-base font-black text-white">{f.weight} kg</span>
                        <span className="text-xs text-zinc-400 font-medium">× {f.reps} reps</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">{f.note}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-zinc-700" />
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-zinc-500 italic text-center">
                Al terminar estas aproximaciones, descansa 90 segundos y comienza tu 1ª serie efectiva.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-bold text-xs hover:bg-zinc-800 transition-colors"
            >
              Anterior
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 font-bold text-xs hover:bg-zinc-800 transition-colors"
            >
              Cerrar
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="flex-1 py-3 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#CCFF00]/20 transition-all active:scale-98"
            >
              <span>Siguiente ({step === 1 ? 'Movilidad Visual' : 'Aproximación'})</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <button
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#CCFF00]/25 transition-all active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>¡Calentamiento Listo! Empezar Series</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
