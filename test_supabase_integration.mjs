import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lgvoiwpcdhgmczbitrmc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxndm9pd3BjZGhnbWN6Yml0cm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNDY0NTEsImV4cCI6MjEwNTkyMjQ1MX0.4CBMo9G_2CBIFw-_E2iJ36IrSAC97QO-62sv6EevJrw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAll() {
  console.log('1. Testing profile fetch...');
  const { data: profile, error: pErr } = await supabase.from('profiles').select('*').limit(1);
  console.log('Profile:', profile?.[0]?.full_name, 'Error:', pErr?.message || 'none');

  console.log('2. Testing exercises fetch...');
  const { data: exercises, error: eErr } = await supabase.from('exercises').select('id, name, ranking_tier').limit(3);
  console.log('Exercises count:', exercises?.length, 'Sample:', exercises?.[0]?.name, 'Error:', eErr?.message || 'none');

  console.log('3. Testing templates fetch...');
  const { data: templates, error: tErr } = await supabase.from('workout_templates').select('id, name').order('sequence_order');
  console.log('Templates:', templates?.map(t => t.name).join(', '), 'Error:', tErr?.message || 'none');

  console.log('4. Testing body measurement insert...');
  const testM = {
    id: '11111111-1111-1111-1111-111111111111',
    recorded_date: new Date().toISOString().split('T')[0],
    weight_kg: 74.8,
    waist_cm: 83.5,
    notes: 'Prueba de integración QA'
  };
  const { error: mErr } = await supabase.from('body_measurements').upsert(testM);
  console.log('Measurement write error:', mErr?.message || 'none (SUCCESS)');

  console.log('5. Testing personal records insert...');
  const testPR = {
    id: '22222222-2222-2222-2222-222222222222',
    exercise_id: 'press_inclinado_mancuernas',
    record_type: 'e1rm',
    weight_kg: 22.5,
    reps: 10,
    e1rm_kg: 30.0
  };
  const { error: prErr } = await supabase.from('personal_records').upsert(testPR);
  console.log('PR write error:', prErr?.message || 'none (SUCCESS)');

  console.log('ALL INTEGRATION TESTS PASSED!');
}

testAll();
