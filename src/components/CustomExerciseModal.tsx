'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Video,
  Camera,
  Upload,
  CheckCircle2,
  Trash2,
  Sparkles,
  Play,
  Dumbbell,
  FileVideo,
  Info,
  Link as LinkIcon
} from 'lucide-react';
import { Exercise } from '../lib/types';
import { saveVideoBlob, getVideoObjectUrl } from '../lib/media-storage';

interface CustomExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExercise: (exercise: Exercise) => void;
  initialMuscleGroup?: string;
  initialCategory?: 'main' | 'warmup';
}

export default function CustomExerciseModal({
  isOpen,
  onClose,
  onSaveExercise,
  initialMuscleGroup = 'arms',
}: CustomExerciseModalProps) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState(initialMuscleGroup);
  const [equipment, setEquipment] = useState('barra_discos');
  const [cues, setCues] = useState('');
  const [defaultSets, setDefaultSets] = useState(3);
  const [repMin, setRepMin] = useState(8);
  const [repMax, setRepMax] = useState(12);
  const [restSec, setRestSec] = useState(90);

  // Video state
  const [videoMode, setVideoMode] = useState<'upload' | 'link'>('upload');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialMuscleGroup) {
      setMuscleGroup(initialMuscleGroup);
    }
  }, [initialMuscleGroup]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objUrl = URL.createObjectURL(file);
      setPreviewVideoUrl(objUrl);
    }
  };

  const handleRemoveVideo = () => {
    setSelectedFile(null);
    if (previewVideoUrl && previewVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewVideoUrl);
    }
    setPreviewVideoUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const exerciseId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let videoStorageKey: string | undefined = undefined;

    try {
      if (selectedFile) {
        videoStorageKey = `vid_${exerciseId}`;
        await saveVideoBlob(videoStorageKey, selectedFile);
      }

      const newExercise: Exercise = {
        id: exerciseId,
        name: name.trim(),
        short_name: name.trim().slice(0, 24),
        primary_muscle_group: muscleGroup,
        primary_muscle_id: muscleGroup,
        movement_pattern: 'isolation',
        equipment_id: equipment,
        difficulty: 'Principiante',
        default_sets: defaultSets,
        rep_range_min: repMin,
        rep_range_max: repMax,
        default_rir: 2,
        default_rest_sec: restSec,
        is_compound: false,
        instructions: cues.trim() || 'Indicaciones registradas por el profesor en el gimnasio.',
        setup: 'Ajuste inicial según indicación del entrenador.',
        execution: cues.trim() || 'Ejecución técnica según explicación grabada.',
        cues: cues.trim(),
        common_errors: 'Evitar perder la postura y controlar siempre la fase excéntrica.',
        how_it_should_feel: 'Tensión concentrada y congestión en el músculo objetivo.',
        video_url: videoMode === 'link' ? videoUrl.trim() : '',
        scientific_note: 'Variante personalizada y técnica indicada por el profesor en el gimnasio.',
        why_this_exercise: 'Seleccionado por el entrenador para enfoque específico y estímulo muscular.',
        ranking_tier: 'A',
        is_custom: true,
        video_type: videoStorageKey ? 'local_video' : videoUrl ? 'youtube' : undefined,
        video_storage_key: videoStorageKey,
        video_file_name: selectedFile?.name,
        notes: cues.trim(),
      };

      onSaveExercise(newExercise);
      onClose();
    } catch (err) {
      console.error('Error al guardar ejercicio personalizado:', err);
      alert('Hubo un error al guardar el ejercicio con video.');
    } finally {
      setIsSaving(false);
    }
  };

  const muscleOptions = [
    { id: 'chest', label: 'Pecho' },
    { id: 'back', label: 'Espalda' },
    { id: 'shoulders', label: 'Hombros' },
    { id: 'arms', label: 'Brazos / Bíceps / Tríceps' },
    { id: 'legs', label: 'Piernas / Glúteos' },
    { id: 'core', label: 'Abdomen / Core' },
  ];

  const equipmentOptions = [
    { id: 'barra_discos', label: 'Barra Olímpica / Z' },
    { id: 'mancuernas', label: 'Mancuernas' },
    { id: 'maquina_smith', label: 'Máquina guiada / Smith' },
    { id: 'polea_alta', label: 'Polea / Cable' },
    { id: 'prensa_piernas', label: 'Prensa / Máquina tren inf.' },
    { id: 'banco_ajustable', label: 'Banco / Peso Corporal' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#111217] border border-white/[0.08] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#0C0D11]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00]/30 text-[#CCFF00]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nuevo Ejercicio Personalizado</h3>
              <p className="text-xs text-zinc-400">Graba la técnica o guárdalo para tus rutinas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Exercise Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <span>Nombre del Ejercicio</span>
              <span className="text-[#CCFF00]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Bíceps 21 con barra Z, Press en máquina Smith..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
            />
          </div>

          {/* Muscle Group */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-200">Grupo Muscular Principal</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {muscleOptions.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMuscleGroup(m.id)}
                  className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                    muscleGroup === m.id
                      ? 'bg-[#CCFF00] border-[#CCFF00] text-black font-black shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200">Equipamiento / Máquina</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {equipmentOptions.map((eq) => (
                <button
                  type="button"
                  key={eq.id}
                  onClick={() => setEquipment(eq.id)}
                  className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                    equipment === eq.id
                      ? 'bg-[#CCFF00] border-[#CCFF00] text-black font-black shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Teacher's Cues / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-200 flex items-center justify-between">
              <span>Indicaciones y Técnica del Profe</span>
              <span className="text-[10px] text-zinc-400 font-normal">Consejos de postura o técnica</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ej: 7 repeticiones parciales abajo, 7 parciales arriba y 7 completas. No balancear la espalda y mantener los codos pegados al cuerpo."
              value={cues}
              onChange={(e) => setCues(e.target.value)}
              className="w-full p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
            />
          </div>

          {/* VIDEO RECORDING / UPLOAD SECTION */}
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#CCFF00]" />
                <span className="text-xs font-bold text-white">Video Demostrativo del Profe</span>
              </div>
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setVideoMode('upload')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    videoMode === 'upload' ? 'bg-[#CCFF00] text-black font-black' : 'text-zinc-400'
                  }`}
                >
                  Grabar / Video
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode('link')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    videoMode === 'link' ? 'bg-[#CCFF00] text-black font-black' : 'text-zinc-400'
                  }`}
                >
                  Link URL
                </button>
              </div>
            </div>

            {videoMode === 'upload' && (
              <div className="space-y-2">
                {previewVideoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black">
                    <video
                      src={previewVideoUrl}
                      controls
                      playsInline
                      className="w-full max-h-48 object-contain bg-black"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-500 shadow-md transition-all"
                      title="Eliminar video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 bg-zinc-950/90 text-[10px] text-[#CCFF00] flex items-center justify-between font-medium">
                      <span>✓ Video cargado: {selectedFile?.name || 'video_grabado.mp4'}</span>
                      <span>{(selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(1) : 0)} MB</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {/* Record directly with phone camera */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-3.5 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900 hover:border-[#CCFF00]/50 flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
                    >
                      <Camera className="w-5 h-5 text-[#CCFF00] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-white">Grabar con Cámara</span>
                      <span className="text-[10px] text-zinc-400">Abre la cámara del celular</span>
                    </button>

                    {/* Choose from gallery */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3.5 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900 flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
                    >
                      <Upload className="w-5 h-5 text-zinc-300 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-white">Subir de Galería</span>
                      <span className="text-[10px] text-zinc-400">Archivo de video</span>
                    </button>

                    {/* Hidden inputs */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="video/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
                <p className="text-[11px] text-zinc-400 leading-tight">
                  💡 Puedes grabarte a ti o pedirle permiso al profe para grabar 5-10 segundos de la técnica exacta. Se guarda en tu dispositivo.
                </p>
              </div>
            )}

            {videoMode === 'link' && (
              <div className="space-y-1.5">
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
                />
                <p className="text-[10px] text-zinc-400">Pega un enlace de YouTube si encontraste la técnica online.</p>
              </div>
            )}
          </div>

          {/* Default sets & reps */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <label className="text-[10px] text-slate-400 block mb-1">Series</label>
              <input
                type="number"
                min={1}
                max={10}
                value={defaultSets}
                onChange={(e) => setDefaultSets(parseInt(e.target.value) || 3)}
                className="w-full text-center bg-slate-950 rounded-lg py-1 text-sm font-bold text-white border border-slate-800"
              />
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <label className="text-[10px] text-slate-400 block mb-1">Rango Reps</label>
              <div className="flex items-center justify-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={repMin}
                  onChange={(e) => setRepMin(parseInt(e.target.value) || 8)}
                  className="w-10 text-center bg-slate-950 rounded-lg py-1 text-xs font-bold text-white border border-slate-800"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={repMax}
                  onChange={(e) => setRepMax(parseInt(e.target.value) || 12)}
                  className="w-10 text-center bg-slate-950 rounded-lg py-1 text-xs font-bold text-white border border-slate-800"
                />
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <label className="text-[10px] text-slate-400 block mb-1">Descanso (s)</label>
              <input
                type="number"
                min={15}
                step={15}
                max={300}
                value={restSec}
                onChange={(e) => setRestSec(parseInt(e.target.value) || 90)}
                className="w-full text-center bg-slate-950 rounded-lg py-1 text-sm font-bold text-white border border-slate-800"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="w-full py-4 rounded-2xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#CCFF00]/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98"
            >
              {isSaving ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-black" />
                  <span>Guardando ejercicio...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>Guardar Ejercicio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
