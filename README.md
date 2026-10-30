# Gym

A no-nonsense trainer for fat loss. Pick your level, workout days and home kit, then
choose gym or home each day and it tells you exactly what to do, in order: warm-up cardio, strength exercises with sets, reps and
weight, a fat-burn finisher, then cool-down stretches for the muscles you trained. One tap after each exercise (too hard / about right /
too easy) adjusts next time's target.

Everything is stored in the browser's localStorage. There is no backend.

## Run

```sh
npm install
npm run dev        # http://localhost:5173, also printed as a Network URL for your phone
npm test           # progression, plan and session logic
npm run build      # production build in dist/ (installable, works offline)
```

## Where things live

- `src/data/exercises.ts` - exercise library: names, cues, starting weights, rep ranges, swaps
- `src/data/equipment.ts` - machines at a standard Cult gym; unticked ones in Settings get swapped out
- `src/data/workouts.ts` - workout templates and which rotation each days-per-week count uses
- `src/lib/progression.ts` - how feedback changes weight and reps
- `src/lib/plan.ts` - the difficulty ladder (level sets the starting stage) and building a gym or home session

Adding an exercise: add it to `exercises.ts` with its free-exercise-db id, then run
`npm run fetch-exercises` to download its photos and instructions.

Exercise photos and instructions: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain).
