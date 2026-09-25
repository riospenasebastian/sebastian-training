'use client';

import React, { useState } from 'react';
import { Smile, ThumbsUp, AlertTriangle, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { ALTERNATIVES_MAP, DEFAULT_EXERCISES } from '../lib/data-defaults';

interface ExerciseFeedbackModalProps {
  exerciseId: string;
  exerciseName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feeling: 'very_easy' | 'good' | 'very_heavy' | 'pain', notes?: string) => void;
  onSelectAlternative?: (altId: string) => void;
}

export default function ExerciseFeedbackModal({
  exerciseId,
  exerciseName,
  isOpen,
  onClose,
  onSubmit,
  onSelectAlternative,
}: ExerciseFeedbackModalProps) {
  const [selectedFeeling, setSelectedFeeling] = useState<
    'very_easy' | 'good' | 'very_heavy' | 'pain' | null
  >(null);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const alternatives = ALTERNATIVES_MAP[exerciseId] || [];

  const handleConfirm = () => {
    if (selectedFeeling) {
      onSubmit(selectedFeeling, notes);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#121622] border border-cyan-500/20 p-5 shadow-2xl flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">¿Cómo se sintió?</h3>
            <p className="text-xs text-slate-400 line-clamp-1">{exerciseName}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setSelectedFeeling('very_easy')}
            className={`p-3 rounded-2xl border text-left flex flex-col items-center gap-1.5 transition-all ${
              selectedFeeling === 'very_easy'
                ? 'bg-cyan-500/20 border-cyan-400 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Smile className="w-6 h-6 text-cyan-400" />
            <span className="text-xs font-bold">Muy fácil</span>
            <span className="text-[10px] text-slate-400 text-center">RIR alto, puedo subir</span>
          </button>

          <button
            onClick={() => setSelectedFeeling('good')}
            className={`p-3 rounded-2xl border text-left flex flex-col items-center gap-1.5 transition-all ${
              selectedFeeling === 'good'
                ? 'bg-emerald-500/20 border-emerald-400 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <ThumbsUp className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-bold">Excelente</span>
            <span className="text-[10px] text-slate-400 text-center">Buen estímulo (1-2 RIR)</span>
          </button>

          <button
            onClick={() => setSelectedFeeling('very_heavy')}
            className={`p-3 rounded-2xl border text-left flex flex-col items-center gap-1.5 transition-all ${
              selectedFeeling === 'very_heavy'
                ? 'bg-amber-500/20 border-amber-400 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span className="text-xs font-bold">Muy pesado</span>
            <span className="text-[10px] text-slate-400 text-center">Llegué al límite/fallo</span>
          </button>

          <button
            onClick={() => setSelectedFeeling('pain')}
            className={`p-3 rounded-2xl border text-left flex flex-col items-center gap-1.5 transition-all ${
              selectedFeeling === 'pain'
                ? 'bg-red-500/20 border-red-400 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-6 h-6 text-red-400" />
            <span className="text-xs font-bold text-red-400">Molestia / Dolor</span>
            <span className="text-[10px] text-slate-400 text-center">Articular o incómodo</span>
          </button>
        </div>

        {/* If pain: show safe alternatives */}
        {selectedFeeling === 'pain' && (
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 space-y-2">
            <p className="font-semibold text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Precaución recomendada:
            </p>
            <p className="text-[11px] leading-relaxed">
              No forzaremos aumento de carga. En hipertrofia, el dolor articular destruye la progresión. Puedes sustituirlo por una alternativa segura del mismo patrón:
            </p>
            {alternatives.length > 0 && (
              <div className="space-y-1 pt-1">
                {alternatives.map((alt) => {
                  const altEx = DEFAULT_EXERCISES.find((e) => e.id === alt.altId);
                  if (!altEx) return null;
                  return (
                    <button
                      key={alt.altId}
                      onClick={() => {
                        onSelectAlternative?.(alt.altId);
                        onSubmit('pain', `Sustituido por ${altEx.short_name}`);
                        onClose();
                      }}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-red-400 flex items-center justify-between text-left group"
                    >
                      <div>
                        <span className="text-xs font-bold text-white group-hover:text-red-300">
                          {altEx.short_name}
                        </span>
                        <p className="text-[10px] text-slate-400">{alt.reason}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Optional Notes */}
        <div>
          <input
            type="text"
            placeholder="Nota breve (ej. mejor agarre, buena técnica)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          disabled={!selectedFeeling}
          onClick={handleConfirm}
          className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-98"
        >
          Guardar Sensación y Continuar
        </button>
      </div>
    </div>
  );
}
