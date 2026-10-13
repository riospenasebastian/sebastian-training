'use client';

import React from 'react';
import { Home, Dumbbell, LineChart, MoreHorizontal } from 'lucide-react';

export type TabType = 'home' | 'workout' | 'progress' | 'more';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  hasActiveWorkout?: boolean;
}

export default function BottomNav({
  currentTab,
  onChangeTab,
  hasActiveWorkout = false,
}: BottomNavProps) {
  const tabs = [
    { id: 'home' as TabType, label: 'Inicio', icon: Home },
    { id: 'workout' as TabType, label: 'Entrenar', icon: Dumbbell, badge: hasActiveWorkout },
    { id: 'progress' as TabType, label: 'Progreso', icon: LineChart },
    { id: 'more' as TabType, label: 'Más', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#08090C]/95 backdrop-blur-2xl border-t border-white/[0.08] pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
      <div className="max-w-md mx-auto px-4 flex items-center justify-around">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChangeTab(t.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl relative transition-all active:scale-95 ${
                isActive
                  ? 'text-[#CCFF00] font-black'
                  : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              {/* Glowing pill when active */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-[#CCFF00] shadow-[0_0_10px_#CCFF00]" />
              )}
              
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {t.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
