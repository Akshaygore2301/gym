// Exercise library. Ids match free-exercise-db (public domain), which supplies
// images, muscles and instructions. Run `npm run fetch-exercises` after adding one.

import type { Need } from './equipment'

type Base = {
  id: string
  name: string
  cue: string
  needs: Need[] // all of these must be available
  swaps: string[] // alternatives, best first
}

export type WeightedDef = Base & {
  kind: 'weighted'
  start: number // suggested first weight in kg
  step: number // smallest realistic jump in kg
  min: number
  perHand?: boolean
  reps: [number, number]
  rest: number // seconds
}

export type BodyweightDef = Base & {
  kind: 'bodyweight'
  reps: [number, number]
  rest: number
}

export type HoldDef = Base & {
  kind: 'hold'
  seconds: [number, number]
  rest: number
}

export type CardioDef = Base & {
  kind: 'cardio'
  // stage grows every few sessions, so cardio gets slowly harder
  settings: (stage: number) => string[]
}

// Static cool-down stretch. No progression, just a timed hold.
export type StretchDef = Base & {
  kind: 'stretch'
  seconds: number
  perSide: boolean
}

export type ExerciseDef = WeightedDef | BodyweightDef | HoldDef | CardioDef | StretchDef

const CARDIO = ['Walking_Treadmill', 'Elliptical_Trainer', 'Bicycling_Stationary', 'Recumbent_Bike', 'Step_Mill']
const others = (ids: string[], id: string) => ids.filter((x) => x !== id)

const stretches = (list: [id: string, name: string, perSide: boolean, cue: string][]): StretchDef[] =>
  list.map(([id, name, perSide, cue]) => ({ kind: 'stretch', id, name, cue, perSide, seconds: 30, needs: [], swaps: [] }))

const defs: ExerciseDef[] = [
  // Cardio
  {
    kind: 'cardio',
    id: 'Walking_Treadmill',
    needs: ['treadmill'],
    name: 'Incline treadmill walk',
    cue: "Walk tall, don't hold the handrails. You should be able to talk, but not sing.",
    settings: (stage) => {
      const incline = Math.min(6 + stage, 12)
      const speed = incline < 12 ? 5 : Math.min(5 + (stage - 6) * 0.5, 6)
      return [`Incline ${incline}`, `Speed ${speed.toFixed(1)} km/h`]
    },
    swaps: others(CARDIO, 'Walking_Treadmill'),
  },
  {
    kind: 'cardio',
    id: 'Bicycling_Stationary',
    needs: ['upright-bike'],
    name: 'Stationary bike',
    cue: 'Seat at hip height, slight bend in the knee at the bottom. Steady pace.',
    settings: (stage) => [`Level ${Math.min(4 + stage, 12)}`, '70-80 RPM'],
    swaps: others(CARDIO, 'Bicycling_Stationary'),
  },
  {
    kind: 'cardio',
    id: 'Elliptical_Trainer',
    needs: ['elliptical'],
    name: 'Cross trainer',
    cue: 'Push and pull the handles, keep your heels down. Steady pace.',
    settings: (stage) => [`Resistance ${Math.min(4 + stage, 12)}`, 'Steady pace'],
    swaps: others(CARDIO, 'Elliptical_Trainer'),
  },

  // Legs
  {
    kind: 'weighted',
    id: 'Leg_Press',
    needs: ['leg-press'],
    name: 'Leg press',
    cue: "Feet shoulder-width, lower until knees reach ~90°. Don't lock the knees at the top.",
    start: 20, step: 5, min: 0, reps: [8, 12], rest: 90,
    swaps: ['Hack_Squat', 'Goblet_Squat', 'Smith_Machine_Squat'],
  },
  {
    kind: 'weighted',
    id: 'Goblet_Squat',
    needs: ['dumbbells'],
    name: 'Goblet squat',
    cue: 'Hold one dumbbell at your chest. Sit between your heels, chest up, heels down.',
    start: 7.5, step: 2.5, min: 2.5, reps: [8, 12], rest: 90,
    swaps: ['Leg_Press', 'Hack_Squat', 'Smith_Machine_Squat', 'Squats_-_With_Bands', 'Bodyweight_Squat'],
  },
  {
    kind: 'weighted',
    id: 'Smith_Machine_Squat',
    needs: ['smith'],
    name: 'Smith machine squat',
    cue: 'Bar on upper back, feet slightly forward. Lower until thighs are parallel.',
    start: 10, step: 5, min: 0, reps: [8, 12], rest: 90,
    swaps: ['Leg_Press', 'Goblet_Squat'],
  },
  {
    kind: 'weighted',
    id: 'Dumbbell_Lunges',
    needs: ['dumbbells'],
    name: 'Dumbbell lunges',
    cue: 'Long step, back knee almost touches the floor. Reps are per leg.',
    start: 5, step: 2.5, min: 0, perHand: true, reps: [8, 12], rest: 90,
    swaps: ['Leg_Press', 'Goblet_Squat', 'Bodyweight_Walking_Lunge'],
  },
  {
    kind: 'weighted',
    id: 'Stiff-Legged_Dumbbell_Deadlift',
    needs: ['dumbbells'],
    name: 'Dumbbell Romanian deadlift',
    cue: 'Soft knees, push hips back, keep the back flat. Stop when you feel the hamstrings stretch.',
    start: 7.5, step: 2.5, min: 2.5, perHand: true, reps: [8, 12], rest: 90,
    swaps: ['Seated_Leg_Curl', 'Hip_Extension_with_Bands', 'Butt_Lift_Bridge'],
  },
  {
    kind: 'weighted',
    id: 'Seated_Leg_Curl',
    needs: ['leg-curl-seated'],
    name: 'Seated leg curl',
    cue: 'Knees lined up with the machine pivot. Curl down, control it back up.',
    start: 15, step: 5, min: 5, reps: [10, 15], rest: 60,
    swaps: ['Lying_Leg_Curls', 'Stiff-Legged_Dumbbell_Deadlift'],
  },
  {
    kind: 'weighted',
    id: 'Lying_Leg_Curls',
    needs: ['leg-curl-lying'],
    name: 'Lying leg curl',
    cue: 'Hips pressed into the pad. Curl up, lower slowly.',
    start: 15, step: 5, min: 5, reps: [10, 15], rest: 60,
    swaps: ['Seated_Leg_Curl', 'Stiff-Legged_Dumbbell_Deadlift'],
  },
  {
    kind: 'weighted',
    id: 'Leg_Extensions',
    needs: ['leg-extension'],
    name: 'Leg extension',
    cue: 'Knees lined up with the pivot. Straighten, squeeze 1 second, lower slowly.',
    start: 15, step: 5, min: 5, reps: [10, 15], rest: 60,
    swaps: ['Goblet_Squat', 'Leg_Press'],
  },
  {
    kind: 'bodyweight',
    id: 'Butt_Lift_Bridge',
    needs: [],
    name: 'Glute bridge',
    cue: 'Lie on your back, feet flat. Push hips up and squeeze glutes for 1 second at the top.',
    reps: [12, 20], rest: 45,
    swaps: ['Hyperextensions_Back_Extensions', 'Thigh_Abductor', 'Stiff-Legged_Dumbbell_Deadlift'],
  },
  {
    kind: 'weighted',
    id: 'Calf_Press_On_The_Leg_Press_Machine',
    needs: ['leg-press'],
    name: 'Calf press on leg press',
    cue: 'Balls of your feet on the bottom edge of the platform. Push with your toes.',
    start: 20, step: 5, min: 0, reps: [12, 15], rest: 45,
    swaps: ['Seated_Calf_Raise'],
  },

  // Push
  {
    kind: 'weighted',
    id: 'Leverage_Chest_Press',
    needs: ['chest-press'],
    name: 'Chest press machine',
    cue: 'Handles at mid-chest height. Push out, control the way back.',
    start: 10, step: 5, min: 5, reps: [8, 12], rest: 90,
    swaps: ['Dumbbell_Bench_Press', 'Smith_Machine_Bench_Press', 'Pushups'],
  },
  {
    kind: 'weighted',
    id: 'Dumbbell_Bench_Press',
    needs: ['dumbbells', 'bench'],
    name: 'Dumbbell bench press',
    cue: 'Feet flat, shoulder blades squeezed together. Lower to chest level, press up.',
    start: 5, step: 2.5, min: 2.5, perHand: true, reps: [8, 12], rest: 90,
    swaps: ['Leverage_Chest_Press', 'Smith_Machine_Bench_Press', 'Pushups'],
  },
  {
    kind: 'weighted',
    id: 'Smith_Machine_Bench_Press',
    needs: ['smith', 'bench'],
    name: 'Smith machine bench press',
    cue: 'Bar lowers to mid-chest. Weight shown is plates only, the bar is extra.',
    start: 10, step: 5, min: 0, reps: [8, 12], rest: 90,
    swaps: ['Leverage_Chest_Press', 'Dumbbell_Bench_Press'],
  },
  {
    kind: 'weighted',
    id: 'Incline_Dumbbell_Press',
    needs: ['dumbbells', 'bench'],
    name: 'Incline dumbbell press',
    cue: 'Bench at about 30°. Lower to upper chest, press up and slightly in.',
    start: 5, step: 2.5, min: 2.5, perHand: true, reps: [8, 12], rest: 90,
    swaps: ['Leverage_Incline_Chest_Press', 'Leverage_Chest_Press', 'Incline_Push-Up'],
  },
  {
    kind: 'bodyweight',
    id: 'Pushups',
    needs: [],
    name: 'Push-ups',
    cue: 'Body in a straight line. Too hard? Do them with hands on a bench.',
    reps: [6, 15], rest: 60,
    swaps: ['Incline_Push-Up', 'Leverage_Chest_Press'],
  },
  {
    kind: 'bodyweight',
    id: 'Incline_Push-Up',
    needs: [],
    name: 'Incline push-ups',
    cue: 'Hands on a bench, table or bed. Body straight, chest to the edge.',
    reps: [8, 15], rest: 60,
    swaps: ['Pushups', 'Leverage_Chest_Press'],
  },
  {
    kind: 'weighted',
    id: 'Machine_Shoulder_Military_Press',
    needs: ['shoulder-press'],
    name: 'Shoulder press machine',
    cue: 'Back flat on the pad. Press up without shrugging, lower to chin height.',
    start: 10, step: 5, min: 5, reps: [8, 12], rest: 90,
    swaps: ['Dumbbell_Shoulder_Press'],
  },
  {
    kind: 'weighted',
    id: 'Dumbbell_Shoulder_Press',
    needs: ['dumbbells', 'bench'],
    name: 'Seated dumbbell shoulder press',
    cue: 'Sit with back support. Press from ear height to overhead, no arching.',
    start: 5, step: 2.5, min: 2.5, perHand: true, reps: [8, 12], rest: 90,
    swaps: ['Machine_Shoulder_Military_Press'],
  },
  {
    kind: 'weighted',
    id: 'Side_Lateral_Raise',
    needs: ['dumbbells'],
    name: 'Lateral raise',
    cue: 'Light weight. Raise to shoulder height with soft elbows, lower slowly.',
    start: 3, step: 1, min: 1, perHand: true, reps: [10, 15], rest: 60,
    swaps: ['Cable_Seated_Lateral_Raise', 'Lateral_Raise_-_With_Bands', 'Push_Up_to_Side_Plank'],
  },
  {
    kind: 'weighted',
    id: 'Cable_Seated_Lateral_Raise',
    needs: ['cable'],
    name: 'Cable lateral raise',
    cue: 'Cable at the lowest point. Raise to shoulder height, lower slowly.',
    start: 2.5, step: 2.5, min: 2.5, reps: [10, 15], rest: 60,
    swaps: ['Side_Lateral_Raise'],
  },
  {
    kind: 'weighted',
    id: 'Triceps_Pushdown_-_Rope_Attachment',
    needs: ['cable'],
    name: 'Triceps rope pushdown',
    cue: 'Elbows pinned to your sides. Push down and spread the rope at the bottom.',
    start: 10, step: 2.5, min: 2.5, reps: [10, 15], rest: 60,
    swaps: ['Triceps_Pushdown', 'Machine_Triceps_Extension', 'Dip_Machine'],
  },
  {
    kind: 'weighted',
    id: 'Triceps_Pushdown',
    needs: ['cable'],
    name: 'Triceps bar pushdown',
    cue: 'Elbows pinned to your sides. Only the forearms move.',
    start: 10, step: 2.5, min: 2.5, reps: [10, 15], rest: 60,
    swaps: ['Triceps_Pushdown_-_Rope_Attachment', 'Machine_Triceps_Extension', 'Dip_Machine'],
  },

  // Pull
  {
    kind: 'weighted',
    id: 'Wide-Grip_Lat_Pulldown',
    needs: ['lat-pulldown'],
    name: 'Lat pulldown',
    cue: 'Grip a bit wider than shoulders. Pull the bar to your upper chest, elbows down.',
    start: 20, step: 5, min: 5, reps: [8, 12], rest: 90,
    swaps: ['Close-Grip_Front_Lat_Pulldown', 'Seated_Cable_Rows'],
  },
  {
    kind: 'weighted',
    id: 'Close-Grip_Front_Lat_Pulldown',
    needs: ['lat-pulldown'],
    name: 'Close-grip pulldown',
    cue: 'Hands shoulder-width. Pull to upper chest, squeeze your back.',
    start: 20, step: 5, min: 5, reps: [8, 12], rest: 90,
    swaps: ['Wide-Grip_Lat_Pulldown', 'Seated_Cable_Rows'],
  },
  {
    kind: 'weighted',
    id: 'Seated_Cable_Rows',
    needs: ['seated-row'],
    name: 'Seated cable row',
    cue: 'Sit tall, pull the handle to your belly, squeeze shoulder blades. No rocking.',
    start: 20, step: 5, min: 5, reps: [8, 12], rest: 90,
    swaps: ['Leverage_Iso_Row', 'One-Arm_Dumbbell_Row'],
  },
  {
    kind: 'weighted',
    id: 'One-Arm_Dumbbell_Row',
    needs: ['dumbbells', 'bench'],
    name: 'One-arm dumbbell row',
    cue: 'Hand and knee on a bench, back flat. Pull the dumbbell to your hip. Reps are per arm.',
    start: 7.5, step: 2.5, min: 2.5, reps: [8, 12], rest: 60,
    swaps: ['Leverage_Iso_Row', 'Seated_Cable_Rows'],
  },
  {
    kind: 'weighted',
    id: 'Face_Pull',
    needs: ['cable'],
    name: 'Face pull',
    cue: 'Rope at face height. Pull toward your eyes, elbows high and wide.',
    start: 10, step: 2.5, min: 2.5, reps: [12, 15], rest: 60,
    swaps: ['Reverse_Machine_Flyes'],
  },
  {
    kind: 'weighted',
    id: 'Reverse_Machine_Flyes',
    needs: ['pec-fly'],
    name: 'Reverse fly machine',
    cue: 'Face the pad. Open your arms wide, squeeze the back of your shoulders.',
    start: 10, step: 5, min: 5, reps: [12, 15], rest: 60,
    swaps: ['Face_Pull'],
  },
  {
    kind: 'weighted',
    id: 'Dumbbell_Bicep_Curl',
    needs: ['dumbbells'],
    name: 'Dumbbell biceps curl',
    cue: "Elbows by your sides, don't swing. Lower slowly.",
    start: 5, step: 1, min: 1, perHand: true, reps: [10, 15], rest: 60,
    swaps: ['Hammer_Curls', 'Machine_Bicep_Curl'],
  },
  {
    kind: 'weighted',
    id: 'Hammer_Curls',
    needs: ['dumbbells'],
    name: 'Hammer curl',
    cue: "Palms face each other. Elbows by your sides, don't swing.",
    start: 5, step: 1, min: 1, perHand: true, reps: [10, 15], rest: 60,
    swaps: ['Dumbbell_Bicep_Curl', 'Machine_Bicep_Curl'],
  },

  // Core
  {
    kind: 'hold',
    id: 'Plank',
    needs: [],
    name: 'Plank',
    cue: 'Elbows under shoulders, body in a straight line. Squeeze glutes and abs.',
    seconds: [20, 60], rest: 45,
    swaps: ['Dead_Bug'],
  },
  {
    kind: 'bodyweight',
    id: 'Dead_Bug',
    needs: [],
    name: 'Dead bug',
    cue: 'Lower back pressed into the floor. Extend opposite arm and leg slowly. Reps are per side.',
    reps: [8, 12], rest: 45,
    swaps: ['Knee_Hip_Raise_On_Parallel_Bars', 'Plank', 'Reverse_Crunch'],
  },
  {
    kind: 'weighted',
    id: 'Cable_Crunch',
    needs: ['cable'],
    name: 'Cable crunch',
    cue: 'Kneel, rope by your head. Curl your chest toward your knees using your abs.',
    start: 15, step: 5, min: 5, reps: [10, 15], rest: 45,
    swaps: ['Knee_Hip_Raise_On_Parallel_Bars', 'Reverse_Crunch', 'Dead_Bug'],
  },
  {
    kind: 'bodyweight',
    id: 'Reverse_Crunch',
    needs: [],
    name: 'Reverse crunch',
    cue: 'Lie on your back, knees bent. Curl hips off the floor using your abs, lower slowly.',
    reps: [10, 15], rest: 45,
    swaps: ['Knee_Hip_Raise_On_Parallel_Bars', 'Dead_Bug', 'Cable_Crunch'],
  },

  // Cult gym machines
  {
    kind: 'cardio',
    id: 'Recumbent_Bike',
    name: 'Recumbent bike',
    needs: ['recumbent-bike'],
    cue: 'Sit back against the seat, legs almost straight at the far point. Easy on the knees and back.',
    settings: (stage) => [`Level ${Math.min(4 + stage, 12)}`, '70-80 RPM'],
    swaps: others(CARDIO, 'Recumbent_Bike'),
  },
  {
    kind: 'cardio',
    id: 'Step_Mill',
    name: 'Stairmill',
    needs: ['stairmill'],
    cue: 'Stand tall, whole foot on each step, hands only lightly on the rails. Burns a lot, so go slow.',
    settings: (stage) => [`Level ${Math.min(3 + Math.floor(stage / 2), 8)}`, 'Steady pace'],
    swaps: others(CARDIO, 'Step_Mill'),
  },
  {
    kind: 'weighted',
    id: 'Hack_Squat',
    name: 'Hack squat machine',
    needs: ['hack-squat'],
    cue: 'Back flat on the pad, feet shoulder-width. Lower until thighs are parallel. Weight is plates only.',
    start: 10, step: 5, min: 0, reps: [8, 12], rest: 90,
    swaps: ['Leg_Press', 'Goblet_Squat', 'Smith_Machine_Squat'],
  },
  {
    kind: 'weighted',
    id: 'Seated_Calf_Raise',
    name: 'Seated calf raise',
    needs: ['calf-seated'],
    cue: 'Pad on your lower thighs. Full stretch at the bottom, rise high onto your toes, pause.',
    start: 10, step: 5, min: 0, reps: [12, 15], rest: 45,
    swaps: ['Calf_Press_On_The_Leg_Press_Machine'],
  },
  {
    kind: 'weighted',
    id: 'Thigh_Abductor',
    name: 'Hip abductor machine',
    needs: ['abductor-adductor'],
    cue: 'Pads on the outside of your knees. Push out, pause, return slowly. Works the side glutes.',
    start: 20, step: 5, min: 5, reps: [12, 15], rest: 45,
    swaps: ['Thigh_Adductor', 'Butt_Lift_Bridge'],
  },
  {
    kind: 'weighted',
    id: 'Thigh_Adductor',
    name: 'Hip adductor machine',
    needs: ['abductor-adductor'],
    cue: 'Pads on the inside of your knees. Squeeze legs together, return slowly. Works the inner thighs.',
    start: 20, step: 5, min: 5, reps: [12, 15], rest: 45,
    swaps: ['Thigh_Abductor'],
  },
  {
    kind: 'bodyweight',
    id: 'Hyperextensions_Back_Extensions',
    name: 'Back extension',
    needs: ['hyperextension'],
    cue: 'Hips on the pad, arms crossed. Lower with a flat back, rise until your body is straight. No over-arching.',
    reps: [10, 15], rest: 60,
    swaps: ['Butt_Lift_Bridge', 'Stiff-Legged_Dumbbell_Deadlift'],
  },
  {
    kind: 'bodyweight',
    id: 'Knee_Hip_Raise_On_Parallel_Bars',
    name: "Captain's chair knee raise",
    needs: ['knee-raise'],
    cue: 'Back against the pad, forearms on the rests. Lift your knees toward your chest, lower slowly. No swinging.',
    reps: [8, 15], rest: 45,
    swaps: ['Reverse_Crunch', 'Dead_Bug'],
  },
  {
    kind: 'weighted',
    id: 'Butterfly',
    name: 'Pec deck fly',
    needs: ['pec-fly'],
    cue: 'Handles at chest height, slight bend in the elbows. Squeeze together in front of your chest, open slowly.',
    start: 10, step: 5, min: 5, reps: [10, 15], rest: 60,
    swaps: ['Cable_Crossover'],
  },
  {
    kind: 'weighted',
    id: 'Cable_Crossover',
    name: 'Cable fly',
    needs: ['cable'],
    cue: 'Handles at shoulder height, step forward. Bring hands together in a hugging arc. Weight is per side.',
    start: 5, step: 2.5, min: 2.5, reps: [10, 15], rest: 60,
    swaps: ['Butterfly'],
  },
  {
    kind: 'weighted',
    id: 'Leverage_Iso_Row',
    name: 'Plate-loaded row',
    needs: ['plate-row'],
    cue: 'Chest on the pad, pull the handles to your sides, squeeze your shoulder blades. Weight is plates only.',
    start: 10, step: 5, min: 0, reps: [8, 12], rest: 90,
    swaps: ['Seated_Cable_Rows', 'One-Arm_Dumbbell_Row'],
  },
  {
    kind: 'weighted',
    id: 'Leverage_Incline_Chest_Press',
    name: 'Incline chest press machine',
    needs: ['plate-incline-press'],
    cue: 'Handles at upper-chest height. Press up and out, control the way back. Weight is plates only.',
    start: 10, step: 5, min: 0, reps: [8, 12], rest: 90,
    swaps: ['Incline_Dumbbell_Press', 'Leverage_Chest_Press'],
  },
  {
    kind: 'weighted',
    id: 'Machine_Bicep_Curl',
    name: 'Biceps curl machine',
    needs: ['arm-machine'],
    cue: 'Elbows lined up with the pivot. Curl up, lower slowly.',
    start: 10, step: 5, min: 5, reps: [10, 15], rest: 60,
    swaps: ['Dumbbell_Bicep_Curl', 'Hammer_Curls'],
  },
  {
    kind: 'weighted',
    id: 'Machine_Triceps_Extension',
    name: 'Triceps extension machine',
    needs: ['arm-machine'],
    cue: 'Upper arms on the pads, elbows lined up with the pivot. Straighten your arms, return slowly.',
    start: 10, step: 5, min: 5, reps: [10, 15], rest: 60,
    swaps: ['Triceps_Pushdown_-_Rope_Attachment', 'Dip_Machine'],
  },
  {
    kind: 'weighted',
    id: 'Dip_Machine',
    name: 'Triceps press machine',
    needs: ['dip-machine'],
    cue: 'Sit tall, elbows tucked in. Press the handles down until arms are straight.',
    start: 15, step: 5, min: 5, reps: [10, 15], rest: 60,
    swaps: ['Triceps_Pushdown_-_Rope_Attachment', 'Machine_Triceps_Extension'],
  },

  // Home
  {
    kind: 'cardio',
    id: 'Step-up_with_Knee_Raise',
    needs: [],
    name: 'Step-ups',
    cue: 'Use a stair or sturdy step. Step up, drive the other knee high, step down. Switch legs.',
    settings: (stage) => [stage < 2 ? 'Easy pace' : 'Steady pace'],
    swaps: ['Star_Jump', 'Mountain_Climbers'],
  },
  {
    kind: 'cardio',
    id: 'Star_Jump',
    needs: [],
    name: 'Jumping jacks',
    cue: 'Jump feet wide while raising arms overhead, jump back. Land softly.',
    settings: (stage) => [`${Math.min(20 + stage * 5, 45)}s fast`, `${Math.max(40 - stage * 5, 15)}s easy`],
    swaps: ['Mountain_Climbers', 'Step-up_with_Knee_Raise'],
  },
  {
    kind: 'cardio',
    id: 'Mountain_Climbers',
    needs: [],
    name: 'Mountain climbers',
    cue: 'Hands under shoulders, body straight. Drive knees to chest one after the other.',
    settings: (stage) => [`${Math.min(20 + stage * 5, 45)}s fast`, `${Math.max(40 - stage * 5, 15)}s easy`],
    swaps: ['Star_Jump', 'Step-up_with_Knee_Raise'],
  },
  {
    kind: 'bodyweight',
    id: 'Bodyweight_Squat',
    needs: [],
    name: 'Squat',
    cue: 'Feet shoulder-width, sit back and down, chest up, heels down.',
    reps: [12, 20], rest: 60,
    swaps: ['Squats_-_With_Bands', 'Goblet_Squat'],
  },
  {
    kind: 'bodyweight',
    id: 'Freehand_Jump_Squat',
    needs: [],
    name: 'Jump squat',
    cue: 'Squat down, jump up explosively, land softly and go straight into the next rep.',
    reps: [8, 15], rest: 60,
    swaps: ['Bodyweight_Squat'],
  },
  {
    kind: 'bodyweight',
    id: 'Squats_-_With_Bands',
    needs: ['bands'],
    name: 'Band squat',
    cue: 'Stand on the band, handles at your shoulders. Sit back and down, push up through your heels.',
    reps: [10, 15], rest: 60,
    swaps: ['Bodyweight_Squat'],
  },
  {
    kind: 'bodyweight',
    id: 'Bodyweight_Walking_Lunge',
    needs: [],
    name: 'Lunges',
    cue: 'Long step, back knee almost touches the floor. Reps are per leg.',
    reps: [8, 15], rest: 60,
    swaps: ['Bodyweight_Squat'],
  },
  {
    kind: 'bodyweight',
    id: 'Single_Leg_Glute_Bridge',
    needs: [],
    name: 'Single-leg glute bridge',
    cue: 'One foot on the floor, other leg up. Push hips up, squeeze 1 second. Reps are per leg.',
    reps: [8, 15], rest: 45,
    swaps: ['Butt_Lift_Bridge'],
  },
  {
    kind: 'bodyweight',
    id: 'Hip_Extension_with_Bands',
    needs: ['bands'],
    name: 'Band kickback',
    cue: 'Band around your foot, hold something steady. Push the leg straight back, squeeze the glute. Reps are per leg.',
    reps: [12, 20], rest: 45,
    swaps: ['Butt_Lift_Bridge'],
  },
  {
    kind: 'bodyweight',
    id: 'Push-Ups_With_Feet_Elevated',
    needs: [],
    name: 'Feet-up push-ups',
    cue: 'Feet on a chair or bed, hands on the floor. Body straight, chest to the floor.',
    reps: [6, 15], rest: 60,
    swaps: ['Pushups'],
  },
  {
    kind: 'weighted',
    id: 'Bent_Over_Two-Dumbbell_Row',
    needs: ['dumbbells'],
    name: 'Bent-over dumbbell row',
    cue: 'Hinge forward, back flat. Pull both dumbbells to your hips, squeeze your back.',
    start: 5, step: 2.5, min: 2.5, perHand: true, reps: [8, 12], rest: 60,
    swaps: ['Back_Flyes_-_With_Bands', 'Superman'],
  },
  {
    kind: 'bodyweight',
    id: 'Back_Flyes_-_With_Bands',
    needs: ['bands'],
    name: 'Band row',
    cue: 'Band around something steady at chest height. Pull to your belly, squeeze your shoulder blades.',
    reps: [10, 15], rest: 60,
    swaps: ['Superman'],
  },
  {
    kind: 'bodyweight',
    id: 'Superman',
    needs: [],
    name: 'Superman',
    cue: 'Lie face down. Lift arms, chest and legs off the floor, hold 2 seconds, lower.',
    reps: [10, 15], rest: 45,
    swaps: ['Back_Flyes_-_With_Bands'],
  },
  {
    kind: 'bodyweight',
    id: 'Lateral_Raise_-_With_Bands',
    needs: ['bands'],
    name: 'Band lateral raise',
    cue: 'Stand on the band. Raise arms to shoulder height with soft elbows, lower slowly.',
    reps: [10, 15], rest: 45,
    swaps: ['Push_Up_to_Side_Plank'],
  },
  {
    kind: 'weighted',
    id: 'Standing_Dumbbell_Press',
    needs: ['dumbbells'],
    name: 'Standing dumbbell press',
    cue: 'Brace your abs. Press from ear height to overhead, no leaning back.',
    start: 4, step: 1, min: 1, perHand: true, reps: [8, 12], rest: 60,
    swaps: ['Shoulder_Press_-_With_Bands', 'Push_Up_to_Side_Plank'],
  },
  {
    kind: 'bodyweight',
    id: 'Shoulder_Press_-_With_Bands',
    needs: ['bands'],
    name: 'Band shoulder press',
    cue: 'Stand on the band, handles at your shoulders. Press overhead, lower slowly.',
    reps: [10, 15], rest: 45,
    swaps: ['Push_Up_to_Side_Plank'],
  },
  {
    kind: 'bodyweight',
    id: 'Push_Up_to_Side_Plank',
    needs: [],
    name: 'Push-up to side plank',
    cue: 'Do a push-up, then rotate into a side plank with one arm up. Alternate sides.',
    reps: [6, 12], rest: 60,
    swaps: ['Pushups'],
  },
  {
    kind: 'bodyweight',
    id: 'Bench_Dips',
    needs: [],
    name: 'Chair dips',
    cue: 'Hands on a sturdy chair behind you. Bend elbows to 90°, push back up. Keep hips close.',
    reps: [8, 15], rest: 60,
    swaps: ['Pushups'],
  },
  {
    kind: 'hold',
    id: 'Side_Bridge',
    needs: [],
    name: 'Side plank',
    cue: 'Elbow under shoulder, body in a straight line. Time is per side.',
    seconds: [15, 45], rest: 30,
    swaps: ['Plank'],
  },

  // Cool-down stretches
  ...stretches([
    ['Kneeling_Hip_Flexor', 'Kneeling hip flexor stretch', true,
      'Kneel on one knee, squeeze that glute and shift your hips forward. Feel it in the front of the back hip.'],
    ['Seated_Floor_Hamstring_Stretch', 'Seated hamstring stretch', true,
      'One leg straight, the other foot against your thigh. Lean forward from the hips with a flat back.'],
    ['On_Your_Side_Quad_Stretch', 'Lying quad stretch', true,
      'Lie on your side, pull your top heel toward your glute. Keep knees close together.'],
    ['Ankle_On_The_Knee', 'Figure-four glute stretch', true,
      'On your back, cross one ankle over the other knee, then pull the bottom leg toward your chest.'],
    ['Calf_Stretch_Hands_Against_Wall', 'Wall calf stretch', true,
      'Hands on the wall, back leg straight, back heel pressed down. Lean in slowly.'],
    ['Elbows_Back', 'Standing chest opener', false,
      'Hands on your lower back, squeeze your elbows back toward each other. Chest up, breathe.'],
    ['One_Arm_Against_Wall', 'Wall lat stretch', true,
      'Bent arm on a wall or pillar above your head. Lean in and let your side stretch.'],
    ['Shoulder_Stretch', 'Cross-body shoulder stretch', true,
      'Pull one straight arm across your chest with the other hand. Keep shoulders down.'],
    ['Triceps_Stretch', 'Overhead triceps stretch', true,
      'Hand behind your head, gently pull the elbow with the other hand.'],
    ['Childs_Pose', "Child's pose", false,
      'Kneel, sit back onto your heels and fold forward. Arms forward or by your feet. Slow, deep breaths.'],
  ]),
]

export const EXERCISES: Record<string, ExerciseDef> = Object.fromEntries(
  defs.map((d) => [d.id, d]),
)

export const EXERCISE_IDS = defs.map((d) => d.id)
