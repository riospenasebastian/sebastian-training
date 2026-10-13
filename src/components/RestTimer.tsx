'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Plus, SkipForward, Bell, Volume2, X } from 'lucide-react';

interface RestTimerProps {
  seconds: number;
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
  exerciseName?: string;
}

export default function RestTimer({
  seconds,
  isOpen,
  onClose,
  onFinish,
  exerciseName,
}: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(seconds);
    setIsRunning(true);
    setIsMinimized(false);
  }, [seconds]);

  // Audio beep generator using Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio not available', e);
    }
  };

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } catch {}
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playBeep();
            triggerHaptic();
            onFinish?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isRunning]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const addSeconds = (amt: number) => {
    setTimeLeft((prev) => prev + amt);
    setIsRunning(true);
  };

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0E1016]/95 text-white font-bold shadow-2xl border border-[#CCFF00]/40 backdrop-blur cursor-pointer active:scale-95 transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
        <span className="font-mono text-lg font-black text-[#CCFF00]">{formattedTime}</span>
        <span className="text-xs text-zinc-400">Descanso</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[#0E1016] border border-zinc-800 p-6 shadow-2xl flex flex-col items-center relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#CCFF00]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#CCFF00] animate-pulse" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Tiempo de Descanso
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="px-2.5 py-1 text-xs font-semibold text-zinc-400 bg-zinc-900 rounded-lg hover:text-white border border-zinc-800"
            >
              Minimizar
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {exerciseName && (
          <p className="text-sm font-bold text-zinc-200 text-center mb-2 line-clamp-1">
            {exerciseName}
          </p>
        )}

        {/* Big Timer Display */}
        <div className="my-6 flex flex-col items-center">
          <div className="text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_20px_rgba(204,255,0,0.25)]">
            {formattedTime}
          </div>
          <p className="text-xs text-zinc-400 mt-2 font-medium">
            {timeLeft > 0 ? 'Recupera ATP y ritmo respiratorio' : '¡Listo para la siguiente serie! ⚡'}
          </p>
        </div>

        {/* Controls */}
        <div className="w-full grid grid-cols-3 gap-2.5 mb-4">
          <button
            onClick={() => addSeconds(30)}
            className="flex items-center justify-center gap-1 py-3 px-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 active:scale-95 text-[#CCFF00] font-black text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+30s</span>
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center justify-center gap-1 py-3 px-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
              isRunning
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pausar' : 'Reanudar'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-1 py-3 px-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 active:scale-95 text-zinc-400 font-semibold text-sm transition-all"
          >
            <SkipForward className="w-4 h-4" />
            <span>Saltar</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-[#CCFF00]/20 active:scale-98 transition-all"
        >
          {timeLeft === 0 ? '¡A darle a la serie! ⚡' : 'Cerrar Temporizador'}
        </button>
      </div>
    </div>
  );
}
