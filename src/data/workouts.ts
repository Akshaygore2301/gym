// `easy` replaces the exercise in stages 1-2, `hard` in stage 4.
export type Slot = { id: string; easy?: string; hard?: string }

export type Workout = {
  key: string
  name: string
  focus: string
  // In priority order: lower stages only do the first few.
  slots: Slot[]
  home: Slot[]
  stretches: Slot[] // cool-down, matched to the muscles trained
  cardioDay?: boolean
}

const W = (key: string, name: string, focus: string, slots: Slot[], home: Slot[], stretches: Slot[], cardioDay = false): Workout => ({
  key, name, focus, slots, home, stretches, cardioDay,
})

const HIP = { id: 'Kneeling_Hip_Flexor' }
const HAM = { id: 'Seated_Floor_Hamstring_Stretch' }
const QUAD = { id: 'On_Your_Side_Quad_Stretch' }
const GLUTE = { id: 'Ankle_On_The_Knee' }
const CALF = { id: 'Calf_Stretch_Hands_Against_Wall' }
const CHEST = { id: 'Elbows_Back' }
const LAT = { id: 'One_Arm_Against_Wall' }
const SHOULDER = { id: 'Shoulder_Stretch' }
const TRICEPS = { id: 'Triceps_Stretch' }
const BACK = { id: 'Childs_Pose' }

// Gym exercises that move to a version needing more balance in stage 4.
const CHEST_PRESS = { id: 'Leverage_Chest_Press', hard: 'Smith_Machine_Bench_Press' }
const SHOULDER_PRESS = { id: 'Machine_Shoulder_Military_Press', hard: 'Dumbbell_Shoulder_Press' }

// Home exercises use dumbbells or bands when there are some, else their bodyweight swaps.
const H_SQUAT = { id: 'Goblet_Squat', hard: 'Freehand_Jump_Squat' }
const H_LUNGE = { id: 'Dumbbell_Lunges' }
const H_HINGE = { id: 'Stiff-Legged_Dumbbell_Deadlift' }
const H_BRIDGE = { id: 'Butt_Lift_Bridge', hard: 'Single_Leg_Glute_Bridge' }
const H_PUSH = { id: 'Pushups', easy: 'Incline_Push-Up', hard: 'Push-Ups_With_Feet_Elevated' }
const H_ROW = { id: 'Bent_Over_Two-Dumbbell_Row' }
const H_PRESS = { id: 'Standing_Dumbbell_Press' }
const H_RAISE = { id: 'Side_Lateral_Raise' }
const H_DIPS = { id: 'Bench_Dips' }
const H_BACK = { id: 'Superman' }

export const WORKOUTS = {
  A: W('A', 'Full body A', 'Legs, chest, back, shoulders', [
    { id: 'Leg_Press' },
    CHEST_PRESS,
    { id: 'Wide-Grip_Lat_Pulldown' },
    SHOULDER_PRESS,
    { id: 'Plank' },
    { id: 'Seated_Leg_Curl' },
  ], [H_SQUAT, H_PUSH, H_ROW, H_PRESS, { id: 'Plank' }, H_BRIDGE],
  [HIP, HAM, CHEST, LAT, SHOULDER]),
  B: W('B', 'Full body B', 'Squat, back, upper chest, hamstrings', [
    { id: 'Goblet_Squat' },
    { id: 'Seated_Cable_Rows' },
    { id: 'Incline_Dumbbell_Press' },
    { id: 'Stiff-Legged_Dumbbell_Deadlift' },
    { id: 'Dead_Bug' },
    { id: 'Side_Lateral_Raise' },
  ], [H_LUNGE, H_ROW, H_PUSH, H_HINGE, { id: 'Dead_Bug' }, H_DIPS],
  [QUAD, HAM, CHEST, BACK, SHOULDER]),
  C: W('C', 'Full body C', 'Lunges, chest, back, glutes, arms', [
    { id: 'Dumbbell_Lunges' },
    { id: 'Dumbbell_Bench_Press' },
    { id: 'One-Arm_Dumbbell_Row' },
    { id: 'Butt_Lift_Bridge' },
    { id: 'Cable_Crunch' },
    { id: 'Triceps_Pushdown_-_Rope_Attachment' },
  ], [H_SQUAT, H_PUSH, H_ROW, H_BRIDGE, { id: 'Reverse_Crunch' }, H_RAISE],
  [HIP, GLUTE, CHEST, LAT, TRICEPS]),
  UA: W('UA', 'Upper body A', 'Chest, back, shoulders, arms', [
    CHEST_PRESS,
    { id: 'Wide-Grip_Lat_Pulldown' },
    SHOULDER_PRESS,
    { id: 'Seated_Cable_Rows' },
    { id: 'Butterfly' },
    { id: 'Triceps_Pushdown_-_Rope_Attachment' },
  ], [H_PUSH, H_ROW, H_PRESS, H_DIPS, { id: 'Plank' }, H_BACK],
  [CHEST, LAT, SHOULDER, BACK, TRICEPS]),
  LA: W('LA', 'Lower body A', 'Quads, hamstrings, calves, core', [
    { id: 'Leg_Press' },
    { id: 'Stiff-Legged_Dumbbell_Deadlift' },
    { id: 'Seated_Leg_Curl' },
    { id: 'Plank' },
    { id: 'Seated_Calf_Raise' },
  ], [H_SQUAT, H_HINGE, H_LUNGE, { id: 'Plank' }, H_BRIDGE],
  [QUAD, HAM, HIP, CALF, BACK]),
  UB: W('UB', 'Upper body B', 'Upper chest, back, shoulders, arms', [
    { id: 'Incline_Dumbbell_Press' },
    { id: 'One-Arm_Dumbbell_Row' },
    { id: 'Close-Grip_Front_Lat_Pulldown' },
    { id: 'Side_Lateral_Raise' },
    { id: 'Face_Pull' },
    { id: 'Hammer_Curls' },
  ], [H_PUSH, H_ROW, H_RAISE, H_DIPS, { id: 'Side_Bridge' }, H_BACK],
  [CHEST, LAT, SHOULDER, BACK, TRICEPS]),
  LB: W('LB', 'Lower body B', 'Squat, lunges, lower back, core', [
    { id: 'Goblet_Squat' },
    { id: 'Dumbbell_Lunges' },
    { id: 'Hyperextensions_Back_Extensions' },
    { id: 'Knee_Hip_Raise_On_Parallel_Bars' },
    { id: 'Leg_Extensions' },
  ], [H_SQUAT, H_LUNGE, H_BACK, { id: 'Reverse_Crunch' }, H_BRIDGE],
  [HIP, QUAD, GLUTE, HAM, BACK]),
  CD: W('CD', 'Cardio + core', 'Long cardio for fat loss, then abs', [
    { id: 'Knee_Hip_Raise_On_Parallel_Bars' },
    { id: 'Plank' },
    { id: 'Hyperextensions_Back_Extensions' },
  ], [{ id: 'Dead_Bug' }, { id: 'Plank' }, { id: 'Side_Bridge' }],
  [CALF, HAM, HIP, BACK], true),
} satisfies Record<string, Workout>

// The split depends only on how many days a week are picked, not on level.
export function rotationFor(daysPerWeek: number): Workout[] {
  const w = WORKOUTS
  if (daysPerWeek <= 3) return [w.A, w.B, w.C]
  if (daysPerWeek === 4) return [w.UA, w.LA, w.UB, w.LB]
  if (daysPerWeek === 5) return [w.UA, w.LA, w.CD, w.UB, w.LB]
  return [w.UA, w.LA, w.CD, w.UB, w.LB, w.CD]
}

export function splitName(daysPerWeek: number): string {
  if (daysPerWeek === 0) return 'Pick at least one day'
  if (daysPerWeek <= 3) return 'Full body'
  if (daysPerWeek === 4) return 'Upper and lower body'
  return 'Upper, lower and cardio days'
}
