'use client';

import React from 'react';
import { X, Scale, Ruler, Sparkles, CheckCircle2, AlertCircle, Info, Calendar } from 'lucide-react';

interface MeasurementGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MeasurementGuideModal({ isOpen, onClose }: MeasurementGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#121622] border border-cyan-500/20 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Guía Oficial de Pesaje y Medidas</h3>
              <p className="text-xs text-slate-400">Protocolo científico para evaluar tu progreso real</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs text-slate-300 leading-relaxed">
          {/* SECTION 1: CÓMO Y CUÁNDO PESARSE */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Scale className="w-4 h-4" />
              <span>1. Cómo y cada cuánto pesarte</span>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <span className="font-bold text-white">Frecuencia recomendada:</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px]">
                  3 a 4 mañanas por semana
                </span>
              </div>
              <p className="text-slate-300">
                La app calcula automáticamente tu <strong>media móvil semanal</strong>. Esto es clave: tu cuerpo puede fluctuar entre 1 y 2 kg de un día a otro solo por retención de agua, sal o glucógeno; jamás te alarmes por el peso de un solo día.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white block">Reglas de oro para pesarse:</span>
              <div className="grid grid-cols-1 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <p><strong>Recién levantado:</strong> Siempre por la mañana antes de cualquier actividad física.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <p><strong>Tras ir al baño:</strong> Siempre después de orinar y evacuar.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <p><strong>En ayunas absoluto:</strong> Antes de tomar café, agua o desayunar.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                  <p><strong>Misma condición:</strong> En ropa interior o sin ropa, sobre superficie dura (nunca sobre tapete ni alfombra).</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CÓMO MEDIR LA CINTURA PASO A PASO */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Ruler className="w-4 h-4" />
              <span>2. Cómo medir la cintura (Paso a Paso)</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="font-bold text-white">Frecuencia recomendada:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                  Cada 10 a 14 días
                </span>
              </div>
              <p className="text-slate-300">
                La cintura es el <strong>indicador número 1 de pérdida de grasa real</strong> (grasa visceral y subcutánea). Si tu peso sube por ganar músculo pero tu cintura se mantiene o baja, ¡tu recomposición corporal es perfecta!
              </p>
            </div>

            {/* Step by step visual instructions */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">A</span>
                  ¿En qué parte exacta colocar la cinta?
                </h4>
                <p className="text-slate-300">
                  Coloca la cinta métrica en el punto medio entre el borde inferior de tus costillas y el hueso superior de tu cadera (la cresta ilíaca). En la mayoría de personas, esto queda <strong>exactamente a la altura del ombligo</strong> o 1-2 cm por encima.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">B</span>
                  Postura corporal
                </h4>
                <p className="text-slate-300">
                  Ponte de pie erguido, pies juntos y mirando al frente. La cinta métrica debe quedar <strong>completamente horizontal</strong> alrededor de todo tu torso (revisa en el espejo que no quede caída por la espalda).
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">C</span>
                  Respiración: El secreto de la precisión
                </h4>
                <p className="text-slate-300">
                  Inhala normalmente y luego <strong>exhala relajadamente</strong>. Toma la medida justo al final de la exhalación con el abdomen neutro. <strong>¡Nunca metas la barriga ni la infles!</strong>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">D</span>
                  Tensión de la cinta
                </h4>
                <p className="text-slate-300">
                  La cinta debe descansar suavemente sobre la piel sin apretar ni hundir la carne. Debe poder deslizarse sin holgura ni compresión.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-98"
          >
            ¡Entendido! Volver
          </button>
        </div>
      </div>
    </div>
  );
}
