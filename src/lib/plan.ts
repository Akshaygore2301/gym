import { EXERCISES } from '../data/exercises'
import { rotationFor, type Slot, type Workout } from '../data/workouts'
import { ALL_NEEDS, type Need } from '../data/equipment'
import type { AppState, Level, Place, Settings, Step } from './state'

// The difficulty ladder. More volume pays off over months, and most dropouts happen in
// the first month. So everyone starts with fewer exercises and less cardio and climbs a
// stage every 6 sessions; the level only sets where on the ladder you start.
// Every exercise is 3 sets at every stage. Index = stage - 1.
export const SESSIONS_PER_STAGE = 6
export const MAX_STAGE = 4
const SETS = 3
const EXERCISE_COUNT = [4, 5, 6, 7]
const STRETCH_COUNT = [4, 4, 5, 5]
const WARMUP = [5, 8, 10, 10]
const FINISHER = [10, 12, 15, 20]
const CARDIO_DAY = [20, 25, 35, 45]

export const LEVEL_START: Record<Level, number> = {
  beginner: 0,
  intermediate: 2 * SESSIONS_PER_STAGE,
  advanced: 3 * SESSIONS_PER_STAGE,
}
// A break this long steps back one stage, so coming back feels doable.
const BREAK_DAYS = 14

const GYM_FINISHERS = ['Bicycling_Stationary', 'Elliptical_Trainer', 'Walking_Treadmill']
const HOME_FINISHERS = ['Star_Jump', 'Mountain_Climbers']
const HOME_EASY_CARDIO = 'Step-up_with_Knee_Raise'

export const stageFor = (progress: number) => Math.min(MAX_STAGE, 1 + Math.floor(progress / SESSIONS_PER_STAGE))

// Cardio settings (incline, level, interval length) keep creeping up past stage 4.
export const cardioStage = (progress: number) => Math.floor(progress / SESSIONS_PER_STAGE)

// Ladder position for a session started on `today`, after any break.
export function progressOn(state: AppState, today: string): number {
  if (!state.lastDone) return state.progress
  const days = (Date.parse(today) - Date.parse(state.lastDone)) / 86_400_000
  return days >= BREAK_DAYS ? Math.max(0, state.progress - SESSIONS_PER_STAGE) : state.progress
}

export function nextWorkout(state: AppState, settings: Settings): Workout {
  const rotation = rotationFor(settings.days.length)
  return rotation[state.sessionsDone % rotation.length]
}

// The planned exercise for a slot at this stage, before any user swap.
export function plannedId(slot: Slot, stage: number): string {
  if (stage <= 2 && slot.easy) return slot.easy
  if (stage >= MAX_STAGE && slot.hard) return slot.hard
  return slot.id
}

// What isn't there: gym equipment the user unticked, or everything but the home kit.
export function missingAt(place: Place, settings: Settings): Need[] {
  if (place === 'home') return ALL_NEEDS.filter((n) => !(settings.homeKit as Need[]).includes(n))
  return [...(settings.missing ?? []), 'bands']
}

export function buildSteps(workout: Workout, state: AppState, settings: Settings, place: Place): Step[] {
  const n = state.sessionsDone
  const progress = state.progress
  const i = stageFor(progress) - 1
  const missing = missingAt(place, settings)

  const pick = (id: string) => {
    const exerciseId = resolveAvailable(id, missing)
    return exerciseId === id ? { exerciseId } : { exerciseId, unavailable: id }
  }
  const cardio = (id: string, role: 'warmup' | 'main' | 'finisher', mins: number): Step => ({
    type: 'cardio', role, minutes: mins, ...pick(id),
  })

  // Different slots can fall back to the same exercise when equipment is missing.
  const used = new Set<string>()
  const strength: Extract<Step, { type: 'strength' }>[] = []
  for (const slot of (place === 'home' ? workout.home : workout.slots).slice(0, EXERCISE_COUNT[i])) {
    const baseId = plannedId(slot, i + 1)
    const step = { type: 'strength' as const, baseId, sets: SETS, ...pick(state.swaps[baseId] ?? baseId) }
    if (used.has(step.exerciseId)) continue
    used.add(step.exerciseId)
    strength.push(step)
  }

  const stretches: Step[] = workout.stretches
    .slice(0, STRETCH_COUNT[i])
    .map((slot) => ({ type: 'stretch', exerciseId: slot.id }))

  let finishers = GYM_FINISHERS
  if (place === 'home') finishers = i < 2 ? [HOME_EASY_CARDIO] : HOME_FINISHERS
  // The stairmill is hard, so it joins the rotation from stage 3.
  else if (i >= 2) finishers = [...GYM_FINISHERS, 'Step_Mill']
  const warmupId = place === 'home' ? HOME_EASY_CARDIO : 'Walking_Treadmill'

  if (workout.cardioDay) {
    const mainId = place === 'home' ? finishers[n % finishers.length] : 'Walking_Treadmill'
    return [cardio(mainId, 'main', CARDIO_DAY[i]), ...strength, ...stretches]
  }
  return [
    cardio(warmupId, 'warmup', WARMUP[i]),
    ...strength,
    cardio(finishers[n % finishers.length], 'finisher', FINISHER[i]),
    ...stretches,
  ]
}

// Rough duration: cardio time, about 2.5 minutes per strength set including rest,
// and each stretch hold plus a little time to get into position.
export function estimateMinutes(steps: Step[]): number {
  const minutesFor = (s: Step) => {
    if (s.type === 'cardio') return s.minutes
    if (s.type === 'strength') return s.sets * 2.5
    const def = exercise(s.exerciseId)
    return def.kind === 'stretch' ? ((def.perSide ? 2 : 1) * def.seconds) / 60 + 0.25 : 1
  }
  return Math.round(steps.reduce((sum, s) => sum + minutesFor(s), 0) / 5) * 5
}

export function isAvailable(id: string, missing: readonly Need[]): boolean {
  return exercise(id).needs.every((n) => !missing.includes(n))
}

// The exercise itself if what it needs is there, otherwise the closest swap
// that works (searching swaps, then their swaps). Keeps the original if nothing fits.
export function resolveAvailable(id: string, missing: readonly Need[]): string {
  const seen = new Set<string>()
  const queue = [id]
  while (queue.length > 0) {
    const next = queue.shift()!
    if (seen.has(next)) continue
    seen.add(next)
    if (isAvailable(next, missing)) return next
    queue.push(...exercise(next).swaps)
  }
  return id
}

export function exercise(id: string) {
  const def = EXERCISES[id]
  if (!def) throw new Error(`Unknown exercise ${id}`)
  return def
}
