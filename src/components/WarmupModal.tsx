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
  Info
} from 'lucide-react';
import { WorkoutTemplate } from '../lib/types';
import { WARMUP_MOBILITY_ASSETS } from '../lib/data-defaults';

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
  const [cardioSeconds, setCardioSeconds] = useState(300); // 5 min
  const [isCardioRunning, setIsCardioRunning] = useState(false);
  const [mobilityChecks, setMobilityChecks] = useState<boolean[]>([false, false, false]);
  const [expandedItems, setExpandedItems] = useState<number[]>([0, 1, 2]); // All 3 warmups open with GIFs visible!

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

  const isLower = template.code.includes('lower') || template.code.includes('pierna');
  const isUpper = !isLower;
  const mobilityItems = isUpper
    ? [
        WARMUP_MOBILITY_ASSETS.arm_circles,
        WARMUP_MOBILITY_ASSETS.scapular_retractions,
        WARMUP_MOBILITY_ASSETS.thoracic_rotation,
      ]
    : [
        WARMUP_MOBILITY_ASSETS.ankle_mobility,
        WARMUP_MOBILITY_ASSETS.hip_90_90,
        WARMUP_MOBILITY_ASSETS.goblet_squat_hold,
      ];

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
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#121622] border border-cyan-500/20 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-orange-400" />
            <div>
              <h2 className="text-base font-bold text-white">Calentamiento Guiado Visual</h2>
              <p className="text-xs text-slate-400">{template.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setStep(1)}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
              step === 1 ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10' : 'border-transparent text-slate-400'
            }`}
          >
            <span>Paso 1</span>
            <span className="text-[10px] opacity-80">5m Cardio</span>
          </button>
          <button
            onClick={() => setStep(2)}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
              step === 2 ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10' : 'border-transparent text-slate-400'
            }`}
          >
            <span>Paso 2</span>
            <span className="text-[10px] opacity-80">Movilidad Visual</span>
          </button>
          <button
            onClick={() => setStep(3)}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
              step === 3 ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10' : 'border-transparent text-slate-400'
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
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed">
                <span className="font-bold text-cyan-400 block mb-1">🎯 Objetivo:</span>
                Caminar en cinta con inclinación leve, pedalear en bicicleta o elíptica suave durante 5 minutos.
                Debe elevar la temperatura de músculos y tendones. <strong>No debe cansarte</strong>; debes poder hablar con oraciones completas normalmente sin jadear.
              </div>

              {/* Timer Display */}
              <div className="py-6 flex flex-col items-center justify-center rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-5xl font-mono font-black text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  {formatCardio()}
                </span>
                <span className="text-xs text-slate-400 mt-2">Ritmo suave / conversación fácil</span>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setIsCardioRunning(!isCardioRunning)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    {isCardioRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isCardioRunning ? 'Pausar' : 'Iniciar'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCardioRunning(false);
                      setCardioSeconds(300);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <strong>¿Por qué y cómo hacerlos?</strong> Toca cada ejercicio para ver la animación GIF de cómo se ejecuta paso a paso:
              </div>

              {mobilityItems.map((item, idx) => {
                const isExpanded = expandedItems.includes(idx);
                const isChecked = mobilityChecks[idx];
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : isExpanded
                        ? 'bg-slate-900 border-cyan-500/40'
                        : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    {/* Item Header */}
                    <div
                      onClick={() =>
                        setExpandedItems((prev) =>
                          prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                        )
                      }
                      className="p-3.5 flex items-center justify-between cursor-pointer select-none bg-slate-900/90"
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
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-600 hover:border-cyan-400 transition-colors" />
                          )}
                        </button>
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.title}</h4>
                          <span className="text-[10px] text-cyan-400 font-medium">
                            {isExpanded ? 'Toca para contraer' : 'Toca para ver animación GIF'}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          isExpanded ? 'rotate-90 text-cyan-400' : ''
                        }`}
                      />
                    </div>

                    {/* Expanded Visual & GIF */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-800 space-y-3">
                        <div className="flex flex-col items-center justify-center bg-slate-950 rounded-2xl p-2 border border-cyan-500/20 shadow-inner relative">
                          <img
                            src={item.gif}
                            alt={item.title}
                            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                            loading="eager"
                          />
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-cyan-500/30 text-[9px] text-cyan-300 font-bold">
                            🔄 Animación en bucle
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>

                        <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Clave técnica:</strong> {item.cue}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200">
                <span className="font-bold text-white block mb-0.5">Series de aproximación para:</span>
                <span className="text-cyan-400 font-semibold">{firstExerciseName}</span>
                <span className="block mt-1 text-[11px] text-slate-400">
                  (Peso de trabajo estimado hoy: ~{targetWorkingWeightKg} kg). Estas series preparan articulaciones y sistema nervioso. <strong>NO cuentan como series efectivas.</strong>
                </span>
              </div>

              <div className="space-y-2">
                {feederSets.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-400">
                          Aprox #{i + 1}
                        </span>
                        <span className="text-base font-black text-white">{f.weight} kg</span>
                        <span className="text-xs text-slate-400">× {f.reps} reps</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{f.note}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-slate-700" />
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 italic text-center">
                Al terminar estas aproximaciones, descansa 90 segundos y comienza tu 1ª serie efectiva.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
            >
              Anterior
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 font-semibold text-xs hover:bg-slate-700"
            >
              Cerrar
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98"
            >
              <span>Siguiente ({step === 1 ? 'Movilidad Visual' : 'Aproximación'})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>¡Calentamiento Listo! Empezar Series</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
