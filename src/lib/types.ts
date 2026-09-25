export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  beginner_mode: boolean;
  current_routine_index: number;
  preferred_unit: 'kg' | 'lb';
  created_at?: string;
}

export interface GymEquipment {
  id: string;
  name: string;
  category: string;
  description?: string;
  is_default_available: boolean;
}

export interface UserEquipment {
  id: string;
  equipment_id: string;
  is_available: boolean;
}

export interface Muscle {
  id: string;
  name: string;
  muscle_group: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';
  svg_target_id?: string;
  description?: string;
}

export interface Exercise {
  id: string;
  name: string;
  short_name: string;
  primary_muscle_group: string;
  primary_muscle_id: string;
  movement_pattern: string;
  equipment_id: string;
  difficulty: string;
  default_sets: number;
  rep_range_min: number;
  rep_range_max: number;
  default_rir: number;
  default_rest_sec: number;
  is_compound: boolean;
  instructions: string;
  setup: string;
  execution: string;
  cues: string;
  common_errors: string;
  how_it_should_feel: string;
  video_url: string;
  gif_url?: string;
  scientific_note: string;
  why_this_exercise: string;
  ranking_tier: 'S' | 'A' | 'B';
  primary_muscles?: string[];
  secondary_muscles?: string[];
}

export interface ExerciseAlternative {
  exercise_id: string;
  alternative_exercise_id: string;
  reason: string;
  equipment_needed: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  code: string;
  sequence_order: number;
  target_focus: string;
  estimated_duration_min: number;
  description: string;
  warmup_cardio_min: number;
  warmup_mobility: string;
  exercises?: WorkoutTemplateExercise[];
}

export interface WorkoutTemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  target_rir: number;
  target_rest_sec: number;
  priority: 'high' | 'medium' | 'low';
  warmup_feeder_sets: number;
  special_notes?: string;
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: string;
  user_id?: string;
  template_id: string;
  name: string;
  started_at: string;
  completed_at?: string;
  duration_sec: number;
  time_mode: 'normal' | '45min' | '30min';
  status: 'in_progress' | 'completed' | 'cancelled';
  overall_notes?: string;
  exercises?: WorkoutExerciseRecord[];
}

export interface WorkoutExerciseRecord {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
  is_substituted?: boolean;
  original_exercise_id?: string;
  feeling?: 'very_easy' | 'good' | 'very_heavy' | 'pain';
  notes?: string;
  sets: WorkoutSetRecord[];
  exercise?: Exercise;
}

export interface WorkoutSetRecord {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  is_warmup: boolean;
  weight_kg: number;
  reps: number;
  rir: number;
  completed: boolean;
}

export interface PersonalRecord {
  id: string;
  user_id?: string;
  exercise_id: string;
  exercise_name?: string;
  record_type: 'max_weight' | 'max_reps' | 'e1rm';
  weight_kg: number;
  reps: number;
  e1rm_kg: number;
  achieved_at: string;
}

export interface BodyMeasurement {
  id: string;
  user_id?: string;
  recorded_date: string;
  weight_kg: number;
  waist_cm?: number;
  chest_cm?: number;
  arms_cm?: number;
  thighs_cm?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  user_id?: string;
  photo_date: string;
  photo_type: 'front' | 'side' | 'back';
  photo_url: string;
  notes?: string;
}
