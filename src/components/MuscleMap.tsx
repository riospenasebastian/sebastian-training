'use client';

import React from 'react';

interface MuscleMapProps {
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  volumeByMuscle?: Record<string, number>;
  selectedMuscle?: string | null;
  onSelectMuscle?: (muscleId: string) => void;
  view?: 'front' | 'back' | 'both';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export default function MuscleMap({
  primaryMuscles = [],
  secondaryMuscles = [],
  volumeByMuscle,
  selectedMuscle,
  onSelectMuscle,
  view = 'both',
  size = 'md',
  showLabels = false,
}: MuscleMapProps) {
  const getMuscleColor = (muscleId: string) => {
    if (selectedMuscle === muscleId) {
      return '#38BDF8'; // Sky blue highlight
    }

    if (volumeByMuscle) {
      const sets = volumeByMuscle[muscleId] || 0;
      if (sets === 0) return '#1E293B';
      if (sets <= 3) return '#0284C7';
      if (sets <= 6) return '#06B6D4';
      if (sets <= 9) return '#10B981';
      if (sets <= 12) return '#F59E0B';
      return '#EF4444';
    }

    if (primaryMuscles.includes(muscleId)) {
      return '#EF4444'; // Red primary
    }
    if (secondaryMuscles.includes(muscleId)) {
      return '#F97316'; // Orange secondary
    }
    return '#1E293B'; // Inactive slate
  };

  const getMuscleFilter = (muscleId: string) => {
    if (primaryMuscles.includes(muscleId)) {
      return 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.7))';
    }
    if (secondaryMuscles.includes(muscleId)) {
      return 'drop-shadow(0 0 4px rgba(249, 115, 22, 0.5))';
    }
    if (selectedMuscle === muscleId) {
      return 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))';
    }
    return 'none';
  };

  const scaleClass =
    size === 'sm' ? 'w-28 h-44' : size === 'md' ? 'w-36 h-56' : 'w-48 h-72';

  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#0F1420]/80 border border-slate-800/80 shadow-inner">
      <div className="flex items-center justify-center gap-4">
        {/* Front View */}
        {(view === 'front' || view === 'both') && (
          <div className="flex flex-col items-center">
            {showLabels && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                Frontal
              </span>
            )}
            <svg
              viewBox="0 0 160 280"
              className={`${scaleClass} transition-all duration-300`}
            >
              {/* Head & Neck */}
              <circle cx="80" cy="24" r="16" fill="#1E293B" stroke="#334155" strokeWidth="1" />
              <path d="M74 40 L86 40 L88 48 L72 48 Z" fill="#1E293B" stroke="#334155" strokeWidth="1" />

              {/* Deltoids Front */}
              <path
                d="M48 50 C40 52 34 62 36 74 C40 76 46 72 50 64 C50 56 49 52 48 50 Z"
                fill={getMuscleColor('deltoide_anterior')}
                style={{ filter: getMuscleFilter('deltoide_anterior') }}
                onClick={() => onSelectMuscle?.('deltoide_anterior')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M112 50 C120 52 126 62 124 74 C120 76 114 72 110 64 C110 56 111 52 112 50 Z"
                fill={getMuscleColor('deltoide_anterior')}
                style={{ filter: getMuscleFilter('deltoide_anterior') }}
                onClick={() => onSelectMuscle?.('deltoide_anterior')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Deltoids Lateral */}
              <path
                d="M34 60 C30 66 28 78 32 86 C36 84 38 78 37 72 Z"
                fill={getMuscleColor('deltoide_lateral')}
                style={{ filter: getMuscleFilter('deltoide_lateral') }}
                onClick={() => onSelectMuscle?.('deltoide_lateral')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M126 60 C130 66 132 78 128 86 C124 84 122 78 123 72 Z"
                fill={getMuscleColor('deltoide_lateral')}
                style={{ filter: getMuscleFilter('deltoide_lateral') }}
                onClick={() => onSelectMuscle?.('deltoide_lateral')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Upper Chest (Clavicular) */}
              <path
                d="M52 50 C62 50 78 52 79 62 C68 62 56 60 52 50 Z"
                fill={getMuscleColor('pecho_superior')}
                style={{ filter: getMuscleFilter('pecho_superior') }}
                onClick={() => onSelectMuscle?.('pecho_superior')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M108 50 C98 50 82 52 81 62 C92 62 104 60 108 50 Z"
                fill={getMuscleColor('pecho_superior')}
                style={{ filter: getMuscleFilter('pecho_superior') }}
                onClick={() => onSelectMuscle?.('pecho_superior')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Mid/Lower Chest (Sternal) */}
              <path
                d="M52 52 C56 62 68 64 78 64 C78 78 64 80 54 74 C50 68 50 60 52 52 Z"
                fill={getMuscleColor('pecho_medio')}
                style={{ filter: getMuscleFilter('pecho_medio') }}
                onClick={() => onSelectMuscle?.('pecho_medio')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M108 52 C104 62 92 64 82 64 C82 78 96 80 106 74 C110 68 110 60 108 52 Z"
                fill={getMuscleColor('pecho_medio')}
                style={{ filter: getMuscleFilter('pecho_medio') }}
                onClick={() => onSelectMuscle?.('pecho_medio')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Biceps */}
              <path
                d="M36 82 C34 94 36 108 42 116 C46 114 48 102 46 90 C44 82 40 80 36 82 Z"
                fill={getMuscleColor('biceps')}
                style={{ filter: getMuscleFilter('biceps') }}
                onClick={() => onSelectMuscle?.('biceps')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M124 82 C126 94 124 108 118 116 C114 114 112 102 114 90 C116 82 120 80 124 82 Z"
                fill={getMuscleColor('biceps')}
                style={{ filter: getMuscleFilter('biceps') }}
                onClick={() => onSelectMuscle?.('biceps')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Forearms / Brachialis */}
              <path
                d="M40 120 C34 136 32 154 36 168 C40 166 46 148 48 132 Z"
                fill={getMuscleColor('braquial')}
                style={{ filter: getMuscleFilter('braquial') }}
                onClick={() => onSelectMuscle?.('braquial')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M120 120 C126 136 128 154 124 168 C120 166 114 148 112 132 Z"
                fill={getMuscleColor('braquial')}
                style={{ filter: getMuscleFilter('braquial') }}
                onClick={() => onSelectMuscle?.('braquial')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Abdomen & Core */}
              <path
                d="M66 82 L94 82 L92 126 L68 126 Z"
                fill={getMuscleColor('abdomen')}
                style={{ filter: getMuscleFilter('abdomen') }}
                onClick={() => onSelectMuscle?.('abdomen')}
                className="cursor-pointer transition-colors duration-200"
              />
              {/* Abdominal 6-pack line division */}
              <line x1="80" y1="84" x2="80" y2="124" stroke="#090A0F" strokeWidth="1.5" />
              <line x1="68" y1="96" x2="92" y2="96" stroke="#090A0F" strokeWidth="1.5" />
              <line x1="69" y1="110" x2="91" y2="110" stroke="#090A0F" strokeWidth="1.5" />

              {/* Pelvis / Hip base */}
              <path d="M64 126 L96 126 L102 142 L58 142 Z" fill="#1E293B" stroke="#334155" strokeWidth="1" />

              {/* Quads Left */}
              <path
                d="M58 144 C54 170 52 196 64 212 C72 212 76 190 76 160 C76 148 70 144 58 144 Z"
                fill={getMuscleColor('cuadriceps')}
                style={{ filter: getMuscleFilter('cuadriceps') }}
                onClick={() => onSelectMuscle?.('cuadriceps')}
                className="cursor-pointer transition-colors duration-200"
              />
              {/* Quads Right */}
              <path
                d="M102 144 C106 170 108 196 96 212 C88 212 84 190 84 160 C84 148 90 144 102 144 Z"
                fill={getMuscleColor('cuadriceps')}
                style={{ filter: getMuscleFilter('cuadriceps') }}
                onClick={() => onSelectMuscle?.('cuadriceps')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Knees */}
              <circle cx="66" cy="218" r="5" fill="#1E293B" stroke="#334155" strokeWidth="1" />
              <circle cx="94" cy="218" r="5" fill="#1E293B" stroke="#334155" strokeWidth="1" />

              {/* Calves Front */}
              <path
                d="M60 224 C56 240 58 260 62 272 C66 272 70 258 72 240 C72 230 68 224 60 224 Z"
                fill={getMuscleColor('gemelos')}
                style={{ filter: getMuscleFilter('gemelos') }}
                onClick={() => onSelectMuscle?.('gemelos')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M100 224 C104 240 102 260 98 272 C94 272 90 258 88 240 C88 230 92 224 100 224 Z"
                fill={getMuscleColor('gemelos')}
                style={{ filter: getMuscleFilter('gemelos') }}
                onClick={() => onSelectMuscle?.('gemelos')}
                className="cursor-pointer transition-colors duration-200"
              />
            </svg>
          </div>
        )}

        {/* Back View */}
        {(view === 'back' || view === 'both') && (
          <div className="flex flex-col items-center">
            {showLabels && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                Posterior
              </span>
            )}
            <svg
              viewBox="0 0 160 280"
              className={`${scaleClass} transition-all duration-300`}
            >
              {/* Head & Neck Back */}
              <circle cx="80" cy="24" r="16" fill="#1E293B" stroke="#334155" strokeWidth="1" />
              <path d="M74 40 L86 40 L88 48 L72 48 Z" fill="#1E293B" stroke="#334155" strokeWidth="1" />

              {/* Upper Back / Traps */}
              <path
                d="M68 46 L92 46 L108 58 L80 92 L52 58 Z"
                fill={getMuscleColor('espalda_alta')}
                style={{ filter: getMuscleFilter('espalda_alta') }}
                onClick={() => onSelectMuscle?.('espalda_alta')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Rear Deltoids */}
              <path
                d="M48 54 C38 56 34 66 36 76 C42 74 46 66 50 60 Z"
                fill={getMuscleColor('deltoide_posterior')}
                style={{ filter: getMuscleFilter('deltoide_posterior') }}
                onClick={() => onSelectMuscle?.('deltoide_posterior')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M112 54 C122 56 126 66 124 76 C118 74 114 66 110 60 Z"
                fill={getMuscleColor('deltoide_posterior')}
                style={{ filter: getMuscleFilter('deltoide_posterior') }}
                onClick={() => onSelectMuscle?.('deltoide_posterior')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Lats (Dorsal Ancho - V-Taper) */}
              <path
                d="M52 64 C46 80 44 104 58 118 C66 116 72 108 74 94 C64 80 58 70 52 64 Z"
                fill={getMuscleColor('dorsal_ancho')}
                style={{ filter: getMuscleFilter('dorsal_ancho') }}
                onClick={() => onSelectMuscle?.('dorsal_ancho')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M108 64 C114 80 116 104 102 118 C94 116 88 108 86 94 C96 80 102 70 108 64 Z"
                fill={getMuscleColor('dorsal_ancho')}
                style={{ filter: getMuscleFilter('dorsal_ancho') }}
                onClick={() => onSelectMuscle?.('dorsal_ancho')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Triceps (Long Head) */}
              <path
                d="M34 80 C32 94 34 106 40 114 C44 112 46 100 44 88 C40 82 36 80 34 80 Z"
                fill={getMuscleColor('triceps_larga')}
                style={{ filter: getMuscleFilter('triceps_larga') }}
                onClick={() => onSelectMuscle?.('triceps_larga')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M126 80 C128 94 126 106 120 114 C116 112 114 100 116 88 C120 82 124 80 126 80 Z"
                fill={getMuscleColor('triceps_larga')}
                style={{ filter: getMuscleFilter('triceps_larga') }}
                onClick={() => onSelectMuscle?.('triceps_larga')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Lower Back / Erector Spinae */}
              <path d="M72 96 L88 96 L86 128 L74 128 Z" fill="#1E293B" stroke="#334155" strokeWidth="1" />

              {/* Glutes */}
              <path
                d="M56 130 C54 148 60 162 76 162 C78 152 78 138 74 130 Z"
                fill={getMuscleColor('gluteos')}
                style={{ filter: getMuscleFilter('gluteos') }}
                onClick={() => onSelectMuscle?.('gluteos')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M104 130 C106 148 100 162 84 162 C82 152 82 138 86 130 Z"
                fill={getMuscleColor('gluteos')}
                style={{ filter: getMuscleFilter('gluteos') }}
                onClick={() => onSelectMuscle?.('gluteos')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Hamstrings (Isquiosurales) */}
              <path
                d="M58 164 C54 186 56 206 66 214 C74 212 76 196 76 172 C74 164 68 164 58 164 Z"
                fill={getMuscleColor('isquiosurales')}
                style={{ filter: getMuscleFilter('isquiosurales') }}
                onClick={() => onSelectMuscle?.('isquiosurales')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M102 164 C106 186 104 206 94 214 C86 212 84 196 84 172 C86 164 92 164 102 164 Z"
                fill={getMuscleColor('isquiosurales')}
                style={{ filter: getMuscleFilter('isquiosurales') }}
                onClick={() => onSelectMuscle?.('isquiosurales')}
                className="cursor-pointer transition-colors duration-200"
              />

              {/* Calves Back (Gastrocnemius & Soleus) */}
              <path
                d="M58 222 C52 238 54 256 62 272 C66 270 72 254 72 236 C70 226 66 222 58 222 Z"
                fill={getMuscleColor('gemelos')}
                style={{ filter: getMuscleFilter('gemelos') }}
                onClick={() => onSelectMuscle?.('gemelos')}
                className="cursor-pointer transition-colors duration-200"
              />
              <path
                d="M102 222 C108 238 106 256 98 272 C94 270 88 254 88 236 C90 226 94 222 102 222 Z"
                fill={getMuscleColor('gemelos')}
                style={{ filter: getMuscleFilter('gemelos') }}
                onClick={() => onSelectMuscle?.('gemelos')}
                className="cursor-pointer transition-colors duration-200"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 text-[11px] font-medium text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
          <span>Principal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_5px_#f97316]" />
          <span>Secundario</span>
        </div>
      </div>
    </div>
  );
}
