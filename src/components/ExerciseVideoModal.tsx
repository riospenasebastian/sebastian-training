'use client';

import React, { useState, useEffect } from 'react';
import { Exercise } from '../lib/types';
import { X, ExternalLink, Sparkles, AlertCircle, HeartHandshake, Info, Play, Film, Layers, Video, Trash2 } from 'lucide-react';
import MuscleMap from './MuscleMap';
import { getVisualStepsForExercise } from '../lib/exercise-steps';
import { getVideoObjectUrl } from '../lib/media-storage';

interface ExerciseVideoModalProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
  beginnerMode?: boolean;
  onDeleteExercise?: (exerciseId: string) => void;
}

export default function ExerciseVideoModal({
  exercise,
  isOpen,
  onClose,
  beginnerMode = true,
  onDeleteExercise,
}: ExerciseVideoModalProps) {
  const [activeMediaTab, setActiveMediaTab] = useState<'gif' | 'video' | 'muscle' | 'local_video'>(
    exercise.video_storage_key ? 'local_video' : exercise.gif_url ? 'gif' : 'video'
  );
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (exercise.video_storage_key) {
      getVideoObjectUrl(exercise.video_storage_key).then((url) => {
        if (isMounted && url) {
          setLocalVideoUrl(url);
          setActiveMediaTab('local_video');
        }
      });
    } else {
      setLocalVideoUrl(null);
      if (!exercise.gif_url && exercise.video_url) {
        setActiveMediaTab('video');
      }
    }
    return () => {
      isMounted = false;
    };
  }, [exercise]);

  if (!isOpen) return null;

  // Extract YouTube ID if present (add start timestamp to skip talking intro)
  let embedUrl = '';
  if (exercise.video_url && exercise.video_url.includes('watch?v=')) {
    const videoId = exercise.video_url.split('watch?v=')[1]?.split('&')[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?start=30&autoplay=0&rel=0`;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#0E1016] border border-zinc-800 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
                {exercise.is_custom ? 'Personalizado' : `Tier ${exercise.ranking_tier}`}
              </span>
              <h3 className="text-base font-black text-white">{exercise.name}</h3>
            </div>
            <p className="text-xs text-zinc-400 font-medium capitalize mt-0.5">{exercise.movement_pattern?.replace('_', ' ') || exercise.primary_muscle_group}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Switcher Tabs */}
        <div className={`grid ${localVideoUrl ? 'grid-cols-4' : 'grid-cols-3'} border-b border-zinc-800 text-xs font-bold bg-zinc-950`}>
          {localVideoUrl && (
            <button
              onClick={() => setActiveMediaTab('local_video')}
              className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeMediaTab === 'local_video'
                  ? 'border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/10'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4 text-[#CCFF00] animate-pulse" />
              <span>Video Profe</span>
            </button>
          )}

          <button
            onClick={() => setActiveMediaTab('gif')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeMediaTab === 'gif'
                ? 'border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/10'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Animación GIF</span>
          </button>

          <button
            onClick={() => setActiveMediaTab('video')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeMediaTab === 'video'
                ? 'border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/10'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>YouTube</span>
          </button>

          <button
            onClick={() => setActiveMediaTab('muscle')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeMediaTab === 'muscle'
                ? 'border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/10'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Músculos</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* LOCAL RECORDED VIDEO */}
          {activeMediaTab === 'local_video' && localVideoUrl && (
            <div className="space-y-3">
              <div className="w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 relative shadow-xl">
                <video
                  src={localVideoUrl}
                  controls
                  playsInline
                  autoPlay
                  loop
                  className="w-full max-h-72 object-contain bg-black"
                />
              </div>

              {exercise.cues && (
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-xs font-bold text-[#CCFF00] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                    <span>Indicaciones Clave del Profesor:</span>
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                    {exercise.cues}
                  </p>
                </div>
              )}
            </div>
          )}
          {/* MEDIA DISPLAY */}
          {activeMediaTab === 'gif' && (
            <div className="flex flex-col items-center space-y-4">
              {exercise.gif_url ? (
                <div className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-xl relative flex items-center justify-center">
                  <img
                    src={exercise.gif_url}
                    alt={exercise.name}
                    className="w-full h-full object-contain p-2"
                    loading="eager"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/85 backdrop-blur-sm border border-[#CCFF00]/40 text-[9px] font-bold text-[#CCFF00] flex items-center gap-1">
                    <Film className="w-2.5 h-2.5 text-[#CCFF00] animate-pulse" />
                    <span>Loop continuo</span>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
                  Animación próximamente disponible
                </div>
              )}

              {/* 1 - 2 - 3 - 4 Visual Steps directly below GIF */}
              <div className="w-full space-y-2">
                <span className="text-xs font-black text-white tracking-wide uppercase block">
                  Pasos de Técnica Visual (1-2-3-4):
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {getVisualStepsForExercise(exercise.id, {
                    setup: exercise.setup,
                    execution: exercise.execution,
                    cues: exercise.cues
                  }).map((step) => (
                    <div
                      key={step.step}
                      className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-2.5 shadow-sm"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/35 text-[#CCFF00] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {step.step}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-white leading-tight">
                          {step.title}
                        </h5>
                        <p className="text-xs text-zinc-300 leading-snug mt-0.5">
                          {step.instruction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMediaTab === 'video' && (
            <div className="space-y-3">
              {embedUrl ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 relative shadow-lg">
                  <iframe
                    src={embedUrl}
                    title={exercise.name}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}

              {exercise.video_url && (
                <a
                  href={exercise.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between group hover:border-[#CCFF00]/40 transition-all text-xs text-zinc-200 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>Abrir guía completa en YouTube</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#CCFF00] group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>
          )}

          {activeMediaTab === 'muscle' && (
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs font-bold text-zinc-300 block mb-2 text-center">
                Músculos Primarios y Secundarios
              </span>
              <MuscleMap
                primaryMuscles={exercise.primary_muscles}
                secondaryMuscles={exercise.secondary_muscles}
                size="md"
                showLabels
              />
            </div>
          )}

          {/* Beginner Mode Helper */}
          {beginnerMode && (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Modo Principiante: Instrucciones en lenguaje claro</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                <strong className="text-white">¿Qué hacer?</strong> {exercise.instructions}
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed">
                <strong className="text-white">¿Dónde debo sentirlo?</strong> {exercise.how_it_should_feel}
              </p>
            </div>
          )}

          {/* Setup & Execution */}
          <div className="space-y-2">
            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <h4 className="text-xs font-bold text-[#CCFF00] mb-1">Posición Inicial & Ajuste</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{exercise.setup}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <h4 className="text-xs font-bold text-[#CCFF00] mb-1">Ejecución Paso a Paso</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{exercise.execution}</p>
            </div>
          </div>

          {/* Key Cues & Common Errors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <span className="text-[11px] font-bold text-emerald-400 block mb-1 flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5" /> Clave mental (Cue)
              </span>
              <p className="text-[11px] text-slate-300">{exercise.cues}</p>
            </div>

            <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20">
              <span className="text-[11px] font-bold text-red-400 block mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Errores comunes
              </span>
              <p className="text-[11px] text-slate-300">{exercise.common_errors}</p>
            </div>
          </div>

          {/* Why this exercise? Scientific note */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> ¿Por qué este ejercicio? (Ciencia & Jeff Nippard)
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{exercise.why_this_exercise}</p>
            {exercise.scientific_note && (
              <p className="text-[11px] text-slate-400 italic pt-1 border-t border-indigo-500/20">
                Evidencia: {exercise.scientific_note}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#0C0D11]/90 space-y-2">
          {exercise.is_custom && onDeleteExercise && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`¿Eliminar el ejercicio personalizado "${exercise.name}"?`)) {
                  onDeleteExercise(exercise.id);
                  onClose();
                }
              }}
              className="w-full py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar este Ejercicio Personalizado</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#CCFF00]/15 transition-all active:scale-98"
          >
            Entendido, volver a la rutina
          </button>
        </div>
      </div>
    </div>
  );
}
