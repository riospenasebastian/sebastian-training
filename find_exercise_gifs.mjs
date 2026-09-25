async function run() {
  const res = await fetch('https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/exercises.csv');
  const text = await res.text();
  const rows = text.split('\n').map(l => {
    const parts = l.split(',');
    return {
      bodyPart: parts[0],
      equipment: parts[1],
      id: parts[2],
      name: parts[3],
      target: parts[4]
    };
  });

  const targets = [
    'incline dumbbell press',
    'bench press',
    'chest supported row',
    'pulldown',
    'lateral raise',
    'incline curl',
    'overhead triceps',
    'leg press',
    'romanian deadlift',
    'leg extension',
    'leg curl',
    'calf raise',
    'plank',
    'seated row',
    'pullover',
    'pushdown',
    'hammer curl',
    'bulgarian split squat',
    'hanging leg raise'
  ];

  console.log('Searching for target exercises:');
  for (const t of targets) {
    const matches = rows.filter(r => r.name && r.name.toLowerCase().includes(t.toLowerCase()));
    console.log(`=== Matches for "${t}":`);
    matches.slice(0, 5).forEach(m => console.log(`  ID: ${m.id} | Name: ${m.name} | Equip: ${m.equipment}`));
  }
}

run();
