'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Flame, ShieldAlert, CheckCircle2, ChevronRight, Play, Pause, RotateCcw, X } from 'lucide-react';
import { WorkoutTemplate } from '../lib/types';

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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cardioSeconds, setCardioSeconds] = useState(300); // 5 min
  const [isCardioRunning, setIsCardioRunning] = useState(false);
  const [mobilityChecks, setMobilityChecks] = useState<boolean[]>([false, false, false]);

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

  const isUpper = template.code.startsWith('upper');
  const mobilityItems = isUpper
    ? [
        { title: 'Círculos de brazos & dislocaciones', desc: '15 reps amplias y controladas hacia adelante y atrás para irrigar el manguito rotador.' },
        { title: 'Retracciones escapulares en pared o banco', desc: '10 repeticiones apretando escápulas sin encoger hombros.' },
        { title: 'Rotación torácica dinámica', desc: '8 aperturas por lado para liberar la columna dorsal antes de los empujes y tracciones.' }
      ]
    : [
        { title: 'Movilidad de tobillo contra pared', desc: '12 empujes de rodilla hacia adelante manteniendo el talón clavado al piso.' },
        { title: 'Aperturas de cadera en 90/90', desc: '8 transiciones suaves de lado a lado para desbloquear rotación interna y externa.' },
        { title: 'Sentadilla corporal isométrica (Goblet pose)', desc: '10 segundos en la posición profunda abriendo rodillas con los codos.' }
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
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#121622] border border-cyan-500/20 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-orange-400" />
            <div>
              <h2 className="text-base font-bold text-white">Calentamiento Guiado</h2>
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
            <span className="text-[10px] opacity-80">Movilidad</span>
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
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed">
                <span className="font-bold text-cyan-400 block mb-1">🎯 Objetivo:</span>
                Caminar en cinta, pedalear en bicicleta estática o elíptica suave durante 5 minutos.
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
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <strong>Nota científica:</strong> No realices estiramientos estáticos largos antes de levantar, reducen la fuerza muscular momentánea. Realiza movimientos dinámicos específicos:
              </div>

              {mobilityItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const next = [...mobilityChecks];
                    next[idx] = !next[idx];
                    setMobilityChecks(next);
                  }}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    mobilityChecks[idx]
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5">
                    {mobilityChecks[idx] ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
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
              <span>Siguiente ({step === 1 ? 'Movilidad' : 'Aproximación'})</span>
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
