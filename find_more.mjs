async function findMore() {
  const res = await fetch('https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/exercises.csv');
  const text = await res.text();
  const rows = text.split('\n').map(l => {
    const parts = l.split(',');
    return {
      bodyPart: parts[0],
      equipment: parts[1],
      id: parts[2],
      name: parts[3],
    };
  });

  const queries = ['incline', 'split squat', 'lying', 'pulley', 'lat pulldown', 'seated cable', 'dumbbell bench'];
  for (const q of queries) {
    console.log(`=== Matches for "${q}":`);
    rows.filter(r => r.name && r.name.toLowerCase().includes(q))
      .slice(0, 8)
      .forEach(m => console.log(`  ID: ${m.id} | ${m.name} (${m.equipment})`));
  }
}

findMore();
