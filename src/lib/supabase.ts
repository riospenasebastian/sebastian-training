import { createClient } from '@supabase/supabase-js';
import { Exercise, WorkoutTemplate, WorkoutSession, BodyMeasurement, PersonalRecord, Profile } from './types';
import { DEFAULT_EXERCISES, DEFAULT_TEMPLATES } from './data-defaults';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lgvoiwpcdhgmczbitrmc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm9pd3BjZGhnbWN6Yml0cm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNDY0NTEsImV4cCI6MjEwNTkyMjQ1MX0.4CBMo9G_2CBIFw-_E2iJ36IrSAC97QO-62sv6EevJrw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STORAGE_KEYS = {
  PROFILE: 'sebasgym_profile',
  SESSIONS: 'sebasgym_sessions',
  MEASUREMENTS: 'sebasgym_measurements',
  PRS: 'sebasgym_prs',
  EQUIPMENT: 'sebasgym_equipment',
  ACTIVE_WORKOUT: 'sebasgym_active_workout',
  CUSTOM_EXERCISES: 'sebasgym_custom_exercises',
  CUSTOM_TEMPLATES: 'sebasgym_custom_templates',
};

// --- Profile ---
export async function getProfile(): Promise<Profile> {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
  }

  try {
    const { data } = await supabase.from('profiles').select('*').limit(1).single();
    if (data) {
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Using default profile', e);
  }

  const defaultProfile: Profile = {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Sebastián',
    beginner_mode: true,
    current_routine_index: 0,
    preferred_unit: 'kg'
  };
  return defaultProfile;
}

export async function saveProfile(profile: Partial<Profile>): Promise<Profile> {
  const current = await getProfile();
  const updated = { ...current, ...profile };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
  }

  try {
    await supabase.from('profiles').upsert(updated);
  } catch (e) {
    console.warn('Error syncing profile with Supabase', e);
  }

  return updated;
}

// --- Custom Exercises Storage ---
export function getStoredCustomExercises(): Exercise[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading custom exercises', e);
  }
  return [];
}

export async function saveCustomExercise(exercise: Exercise): Promise<Exercise> {
  const list = getStoredCustomExercises();
  const existingIndex = list.findIndex(e => e.id === exercise.id);
  let updatedList: Exercise[];
  if (existingIndex >= 0) {
    updatedList = [...list];
    updatedList[existingIndex] = { ...exercise, is_custom: true };
  } else {
    updatedList = [{ ...exercise, is_custom: true }, ...list];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(updatedList));
  }

  try {
    await supabase.from('exercises').upsert({
      id: exercise.id,
      name: exercise.name,
      short_name: exercise.short_name,
      primary_muscle_group: exercise.primary_muscle_group,
      primary_muscle_id: exercise.primary_muscle_id,
      movement_pattern: exercise.movement_pattern,
      equipment_id: exercise.equipment_id,
      difficulty: exercise.difficulty,
      default_sets: exercise.default_sets,
      rep_range_min: exercise.rep_range_min,
      rep_range_max: exercise.rep_range_max,
      default_rir: exercise.default_rir,
      default_rest_sec: exercise.default_rest_sec,
      instructions: exercise.instructions,
      cues: exercise.cues,
      video_url: exercise.video_url,
      gif_url: exercise.gif_url
    });
  } catch (e) {
    console.warn('Saved custom exercise locally', e);
  }

  return { ...exercise, is_custom: true };
}

export async function deleteCustomExercise(exerciseId: string): Promise<void> {
  const list = getStoredCustomExercises();
  const updatedList = list.filter(e => e.id !== exerciseId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(updatedList));
  }
  try {
    await supabase.from('exercises').delete().eq('id', exerciseId);
  } catch {}
}

// --- Exercises (Default + Custom) ---
export async function getExercises(): Promise<Exercise[]> {
  const customList = getStoredCustomExercises();
  let baseExercises: Exercise[] = DEFAULT_EXERCISES;

  try {
    const { data, error } = await supabase.from('exercises').select('*');
    if (data && data.length > 0 && !error) {
      const dbMapped = data.map((dbEx: any) => {
        const defaultEx = DEFAULT_EXERCISES.find((d) => d.id === dbEx.id);
        const customEx = customList.find((c) => c.id === dbEx.id);
        return {
          ...defaultEx,
          ...customEx,
          ...dbEx,
          gif_url: dbEx.gif_url || defaultEx?.gif_url || customEx?.gif_url || '',
          instructions: dbEx.instructions || defaultEx?.instructions || customEx?.instructions || '',
          setup: dbEx.setup || defaultEx?.setup || customEx?.setup || '',
          execution: dbEx.execution || defaultEx?.execution || customEx?.execution || '',
          cues: dbEx.cues || defaultEx?.cues || customEx?.cues || '',
          common_errors: dbEx.common_errors || defaultEx?.common_errors || '',
          how_it_should_feel: dbEx.how_it_should_feel || defaultEx?.how_it_should_feel || '',
          video_url: dbEx.video_url || defaultEx?.video_url || customEx?.video_url || '',
          scientific_note: dbEx.scientific_note || defaultEx?.scientific_note || '',
          why_this_exercise: dbEx.why_this_exercise || defaultEx?.why_this_exercise || '',
          ranking_tier: dbEx.ranking_tier || defaultEx?.ranking_tier || 'A',
          primary_muscles: dbEx.primary_muscles || defaultEx?.primary_muscles || [dbEx.primary_muscle_id],
          secondary_muscles: dbEx.secondary_muscles || defaultEx?.secondary_muscles || []
        };
      });
      const missingExercises = DEFAULT_EXERCISES.filter((de) => !data.some((e: any) => e.id === de.id));
      baseExercises = [...dbMapped, ...missingExercises];
    }
  } catch (e) {
    console.warn('Loading default exercises', e);
  }

  // Merge custom exercises that might not be in DB yet
  const combined = [...customList];
  for (const ex of baseExercises) {
    if (!combined.some(c => c.id === ex.id)) {
      combined.push(ex);
    }
  }
  return combined;
}

// --- Custom Templates Storage ---
export function getStoredCustomTemplates(): WorkoutTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading custom templates', e);
  }
  return [];
}

export async function saveCustomTemplate(template: WorkoutTemplate): Promise<WorkoutTemplate> {
  const list = getStoredCustomTemplates();
  const existingIdx = list.findIndex(t => t.id === template.id);
  const toSave: WorkoutTemplate = {
    ...template,
    is_custom: true,
    created_at: template.created_at || new Date().toISOString()
  };

  let updatedList: WorkoutTemplate[];
  if (existingIdx >= 0) {
    updatedList = [...list];
    updatedList[existingIdx] = toSave;
  } else {
    updatedList = [toSave, ...list];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(updatedList));
  }

  return toSave;
}

export async function deleteCustomTemplate(templateId: string): Promise<void> {
  const list = getStoredCustomTemplates();
  const updatedList = list.filter(t => t.id !== templateId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(updatedList));
  }
}

// --- Workout Templates (Default + Custom) ---
export async function getTemplates(): Promise<WorkoutTemplate[]> {
  const customTemplates = getStoredCustomTemplates();
  let baseTemplates = DEFAULT_TEMPLATES;

  try {
    const { data: templates } = await supabase.from('workout_templates').select('*').order('sequence_order');
    const { data: templateExercises } = await supabase.from('workout_template_exercises').select('*, exercise:exercises(*)').order('order_index');

    if (templates && templates.length > 0) {
      const dbMapped = templates.map(t => {
        const defaultT = DEFAULT_TEMPLATES.find(dt => dt.code === t.code || dt.id === t.id);
        const mappedTE = (templateExercises || [])
          .filter(te => te.template_id === t.id)
          .map(te => {
            const defaultEx = DEFAULT_EXERCISES.find(d => d.id === te.exercise_id);
            const defaultTE = defaultT?.exercises?.find(dte => dte.exercise_id === te.exercise_id);
            return {
              ...defaultTE,
              ...te,
              exercise: {
                ...defaultEx,
                ...te.exercise,
                gif_url: te.exercise?.gif_url || defaultEx?.gif_url || ''
              }
            };
          });

        return {
          ...defaultT,
          ...t,
          exercises: mappedTE.length > 0 ? mappedTE : defaultT?.exercises
        };
      });

      const missingTemplates = DEFAULT_TEMPLATES.filter(
        dt => !templates.some(t => t.id === dt.id || t.code === dt.code)
      );
      baseTemplates = [...dbMapped, ...missingTemplates].sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));
    }
  } catch (e) {
    console.warn('Loading default templates', e);
  }

  // Combine custom templates first (or integrated), then base templates
  const combined = [...customTemplates];
  for (const bt of baseTemplates) {
    if (!combined.some(c => c.id === bt.id)) {
      combined.push(bt);
    }
  }

  return combined;
}

// --- Workout Sessions & History ---
export async function getWorkoutSessions(): Promise<WorkoutSession[]> {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.length > 0) return parsed;
      } catch {}
    }
  }

  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*, exercises:workout_exercises(*, sets(*), exercise:exercises(*))')
      .order('started_at', { ascending: false });
    
    if (data && !error) {
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Using local workout sessions', e);
  }

  return [];
}

export async function saveCompletedWorkoutSession(session: WorkoutSession): Promise<void> {
  // Always persist locally first so data is never lost
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    let list: WorkoutSession[] = [];
    try { if (local) list = JSON.parse(local); } catch {}
    list = [session, ...list.filter(s => s.id !== session.id)];
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list));
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
  }

  // Update routine sequence index
  const profile = await getProfile();
  const nextRoutineIndex = (profile.current_routine_index + 1) % 4;
  await saveProfile({ current_routine_index: nextRoutineIndex });

  // Sync to Supabase
  try {
    const { data: sessionData, error: sessionErr } = await supabase.from('workout_sessions').upsert({
      id: session.id,
      name: session.name,
      template_id: session.template_id,
      started_at: session.started_at,
      completed_at: session.completed_at || new Date().toISOString(),
      duration_sec: session.duration_sec,
      time_mode: session.time_mode,
      status: 'completed',
      overall_notes: session.overall_notes
    }).select().single();

    if (!sessionErr && session.exercises) {
      for (const ex of session.exercises) {
        const { data: exData } = await supabase.from('workout_exercises').upsert({
          id: ex.id,
          session_id: session.id,
          exercise_id: ex.exercise_id,
          order_index: ex.order_index,
          feeling: ex.feeling,
          notes: ex.notes
        }).select().single();

        if (exData && ex.sets) {
          const setsPayload = ex.sets.map(s => ({
            id: s.id,
            workout_exercise_id: ex.id,
            set_number: s.set_number,
            is_warmup: s.is_warmup,
            weight_kg: s.weight_kg,
            reps: s.reps,
            rir: s.rir,
            completed: s.completed
          }));
          await supabase.from('sets').upsert(setsPayload);
        }
      }
    }
  } catch (err) {
    console.warn('Saved locally, will sync when Supabase is reached', err);
  }
}

// --- Body Measurements & Weight ---
export async function getBodyMeasurements(): Promise<BodyMeasurement[]> {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
  }

  try {
    const { data, error } = await supabase.from('body_measurements').select('*').order('recorded_date', { ascending: false });
    if (data && !error) {
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Error fetching measurements', e);
  }

  return [
    {
      id: 'init-1',
      recorded_date: new Date().toISOString().split('T')[0],
      weight_kg: 74.5,
      waist_cm: 84.0,
      notes: 'Check-in inicial'
    }
  ];
}

export async function saveBodyMeasurement(measurement: BodyMeasurement): Promise<void> {
  if (typeof window !== 'undefined') {
    const current = await getBodyMeasurements();
    const updated = [measurement, ...current.filter(m => m.id !== measurement.id)];
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(updated));
  }

  try {
    await supabase.from('body_measurements').upsert(measurement);
  } catch (e) {
    console.warn('Saved measurement locally', e);
  }
}

// --- Personal Records (PRs) ---
export function calculateE1RM(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  // Brzycki & Epley averaged for realistic hypertrophy estimates
  const epley = weightKg * (1 + reps / 30);
  const brzycki = weightKg * (36 / (37 - Math.min(reps, 36)));
  return Math.round(((epley + brzycki) / 2) * 10) / 10;
}

export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEYS.PRS);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
  }

  try {
    const { data, error } = await supabase.from('personal_records').select('*').order('achieved_at', { ascending: false });
    if (data && !error) {
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PRS, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Error fetching PRs', e);
  }
  return [];
}

export async function checkAndRecordPR(
  exerciseId: string,
  exerciseName: string,
  weightKg: number,
  reps: number
): Promise<{ isNewPR: boolean; record?: PersonalRecord; message?: string }> {
  if (weightKg <= 0 || reps <= 0) return { isNewPR: false };
  const e1rm = calculateE1RM(weightKg, reps);
  const prs = await getPersonalRecords();
  const existing = prs.filter(p => p.exercise_id === exerciseId);

  const highestWeight = existing.reduce((max, p) => Math.max(max, p.weight_kg), 0);
  const highestE1RM = existing.reduce((max, p) => Math.max(max, p.e1rm_kg), 0);

  let isNew = false;
  let reason = '';

  if (weightKg > highestWeight && highestWeight > 0) {
    isNew = true;
    reason = `¡Mayor peso histórico! (${weightKg} kg)`;
  } else if (e1rm > highestE1RM) {
    isNew = true;
    reason = `¡Nuevo récord estimado! (e1RM: ${e1rm} kg)`;
  } else if (existing.length === 0) {
    isNew = true;
    reason = `¡Primer récord registrado! (${weightKg} kg × ${reps} reps)`;
  }

  if (isNew) {
    const newRecord: PersonalRecord = {
      id: crypto.randomUUID(),
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      record_type: 'e1rm',
      weight_kg: weightKg,
      reps: reps,
      e1rm_kg: e1rm,
      achieved_at: new Date().toISOString()
    };

    const updated = [newRecord, ...prs];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRS, JSON.stringify(updated));
    }
    try {
      await supabase.from('personal_records').upsert(newRecord);
    } catch {}

    return { isNewPR: true, record: newRecord, message: reason };
  }

  return { isNewPR: false };
}
