'use client';

import React, { useState, useEffect } from 'react';
import {
  WorkoutTemplate,
  WorkoutSession,
  Exercise,
  Profile,
  BodyMeasurement,
  PersonalRecord,
} from '../lib/types';
import {
  getProfile,
  saveProfile,
  getExercises,
  getTemplates,
  getWorkoutSessions,
  saveCompletedWorkoutSession,
  getBodyMeasurements,
  saveBodyMeasurement,
  getPersonalRecords,
  checkAndRecordPR,
} from '../lib/supabase';
import { DEFAULT_TEMPLATES, DEFAULT_EXERCISES } from '../lib/data-defaults';
import BottomNav, { TabType } from '../components/BottomNav';
import HomeView from '../views/HomeView';
import WorkoutView from '../views/WorkoutView';
import ProgressView from '../views/ProgressView';
import MoreView from '../views/MoreView';
import WarmupModal from '../components/WarmupModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [profile, setProfile] = useState<Profile>({
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Sebastián',
    beginner_mode: true,
    current_routine_index: 0,
    preferred_unit: 'kg',
  });
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(DEFAULT_TEMPLATES);
  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);

  // Active workout state
  const [activeWorkout, setActiveWorkout] = useState<{
    template: WorkoutTemplate;
    timeMode: 'normal' | '45min' | '30min';
  } | null>(null);

  // Warmup modal state
  const [warmupModal, setWarmupModal] = useState<{
    isOpen: boolean;
    template: WorkoutTemplate | null;
  }>({ isOpen: false, template: null });

  // Initial data loading
  useEffect(() => {
    async function loadData() {
      try {
        const [prof, tpls, exs, hist, meas, prs] = await Promise.all([
          getProfile(),
          getTemplates(),
          getExercises(),
          getWorkoutSessions(),
          getBodyMeasurements(),
          getPersonalRecords(),
        ]);

        if (prof) setProfile(prof);
        if (tpls && tpls.length > 0) setTemplates(tpls);
        if (exs && exs.length > 0) setExercises(exs);
        if (hist) setWorkoutHistory(hist);
        if (meas) setMeasurements(meas);
        if (prs) setPersonalRecords(prs);
      } catch (e) {
        console.warn('Using default initialization', e);
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleStartWorkout = (
    template: WorkoutTemplate,
    timeMode: 'normal' | '45min' | '30min'
  ) => {
    setActiveWorkout({ template, timeMode });
    setCurrentTab('workout');
  };

  const handleFinishWorkout = async (session: WorkoutSession) => {
    // 1. Calculate any new PRs from this workout
    const updatedPRs = [...personalRecords];
    if (session.exercises) {
      for (const we of session.exercises) {
        const ex = exercises.find((e) => e.id === we.exercise_id);
        const exName = ex?.short_name || we.exercise_id;
        for (const s of we.sets) {
          if (s.completed && !s.is_warmup) {
            const prCheck = await checkAndRecordPR(we.exercise_id, exName, s.weight_kg, s.reps);
            if (prCheck.isNewPR && prCheck.record) {
              updatedPRs.unshift(prCheck.record);
            }
          }
        }
      }
    }
    setPersonalRecords(updatedPRs);

    // 2. Save completed session
    await saveCompletedWorkoutSession(session);
    setWorkoutHistory((prev) => [session, ...prev]);

    // 3. Update profile sequence
    const nextIndex = (profile.current_routine_index + 1) % 4;
    setProfile((prev) => ({ ...prev, current_routine_index: nextIndex }));

    // 4. Return to home view
    setActiveWorkout(null);
    setCurrentTab('home');
  };

  const handleCancelWorkout = () => {
    if (confirm('¿Deseas cancelar el entrenamiento actual?')) {
      setActiveWorkout(null);
      setCurrentTab('home');
    }
  };

  const handleSaveMeasurement = async (weight: number, waist?: number) => {
    const newM: BodyMeasurement = {
      id: crypto.randomUUID(),
      recorded_date: new Date().toISOString().split('T')[0],
      weight_kg: weight,
      waist_cm: waist,
    };
    await saveBodyMeasurement(newM);
    setMeasurements((prev) => [newM, ...prev.filter((m) => m.id !== newM.id)]);
  };

  const handleToggleBeginnerMode = async (val: boolean) => {
    const updated = await saveProfile({ beginner_mode: val });
    setProfile(updated);
  };

  const lastSession = workoutHistory[0] || null;
  const latestMeasurement = measurements[0] || null;

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* View Router */}
      <div className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            templates={templates}
            currentRoutineIndex={profile.current_routine_index}
            lastSession={lastSession}
            recentPRs={personalRecords}
            latestMeasurement={latestMeasurement}
            onStartWorkout={handleStartWorkout}
            onOpenWarmup={(tpl) => setWarmupModal({ isOpen: true, template: tpl })}
            onSaveMeasurement={handleSaveMeasurement}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'workout' && (
          activeWorkout ? (
            <WorkoutView
              template={activeWorkout.template}
              timeMode={activeWorkout.timeMode}
              allExercises={exercises}
              pastSessions={workoutHistory}
              onFinishWorkout={handleFinishWorkout}
              onCancelWorkout={handleCancelWorkout}
              beginnerMode={profile.beginner_mode}
            />
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh] max-w-sm mx-auto space-y-4 pt-safe">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <span className="text-2xl">🏋️</span>
              </div>
              <h2 className="text-xl font-bold text-white">No hay entrenamiento en curso</h2>
              <p className="text-xs text-slate-400">
                Ve a Inicio y pulsa "EMPEZAR ENTRENAMIENTO" para iniciar la siguiente rutina de tu ciclo.
              </p>
              <button
                onClick={() => setCurrentTab('home')}
                className="py-3 px-6 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md"
              >
                Ir a Inicio
              </button>
            </div>
          )
        )}

        {currentTab === 'progress' && (
          <ProgressView
            measurements={measurements}
            personalRecords={personalRecords}
            workoutHistory={workoutHistory}
            onAddMeasurement={(m) => {
              saveBodyMeasurement(m);
              setMeasurements((prev) => [m, ...prev]);
            }}
          />
        )}

        {currentTab === 'more' && (
          <MoreView
            templates={templates}
            exercises={exercises}
            workoutHistory={workoutHistory}
            beginnerMode={profile.beginner_mode}
            onToggleBeginnerMode={handleToggleBeginnerMode}
            onSelectRoutine={(tpl) => {
              handleStartWorkout(tpl, 'normal');
            }}
          />
        )}
      </div>

      {/* Guided Warmup Modal */}
      {warmupModal.isOpen && warmupModal.template && (
        <WarmupModal
          template={warmupModal.template}
          isOpen={warmupModal.isOpen}
          onClose={() => setWarmupModal({ isOpen: false, template: null })}
          onComplete={() => {
            if (warmupModal.template) {
              handleStartWorkout(warmupModal.template, 'normal');
            }
          }}
          targetWorkingWeightKg={20}
        />
      )}

      {/* Mobile Bottom Navigation (Hidden during active workout to maximize screen real-estate) */}
      {!activeWorkout && (
        <BottomNav
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          hasActiveWorkout={!!activeWorkout}
        />
      )}
    </main>
  );
}
