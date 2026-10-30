import { describe, expect, it } from 'vitest'
import { EXERCISES } from '../data/exercises'
import { WORKOUTS, rotationFor } from '../data/workouts'
import details from '../data/exercise-details.json'
import { completeSet, giveFeedback, nextStep, startSession, swapCurrent } from './actions'
import { nextGymDay } from './dates'
import { previewSession, upcomingDays } from './schedule'
import { buildSteps, nextWorkout, resolveAvailable } from './plan'
import { ALL_NEEDS } from '../data/equipment'
import { applyFeedback } from './progression'
import { INITIAL_STATE, type AppState, type Settings } from './state'

const legPress = EXERCISES.Leg_Press // reps 8-12, step 5
const plank = EXERCISES.Plank // 20-60s

const withSettings = (patch: Partial<AppState> = {}): AppState => ({
  ...INITIAL_STATE,
  settings: { days: [1, 3, 5], level: 'beginner', homeKit: [] },
  ...patch,
})

describe('progression', () => {
  it('adds a rep when it felt right', () => {
    expect(applyFeedback(legPress, { weight: 40, reps: 10 }, 'right')).toEqual({ weight: 40, reps: 11 })
  })

  it('adds weight and resets reps at the top of the range', () => {
    expect(applyFeedback(legPress, { weight: 40, reps: 12 }, 'right')).toEqual({ weight: 45, reps: 8 })
  })

  it('adds weight right away when too easy', () => {
    expect(applyFeedback(legPress, { weight: 40, reps: 9 }, 'easy')).toEqual({ weight: 45, reps: 9 })
  })

  it('drops reps first, then weight, when too hard', () => {
    expect(applyFeedback(legPress, { weight: 40, reps: 11 }, 'hard')).toEqual({ weight: 40, reps: 8 })
    expect(applyFeedback(legPress, { weight: 40, reps: 8 }, 'hard')).toEqual({ weight: 35, reps: 8 })
  })

  it('never goes below the minimum weight', () => {
    expect(applyFeedback(legPress, { weight: 0, reps: 8 }, 'hard')).toEqual({ weight: 0, reps: 8 })
  })

  it('keeps holds inside their range', () => {
    expect(applyFeedback(plank, undefined, 'right')).toEqual({ seconds: 25 })
    expect(applyFeedback(plank, { seconds: 58 }, 'easy')).toEqual({ seconds: 60 })
    expect(applyFeedback(plank, { seconds: 20 }, 'hard')).toEqual({ seconds: 20 })
  })
})

describe('plan', () => {
  it('picks the rotation from days per week', () => {
    expect(rotationFor(3).map((w) => w.key)).toEqual(['A', 'B', 'C'])
    expect(rotationFor(4).map((w) => w.key)).toEqual(['UA', 'LA', 'UB', 'LB'])
    expect(rotationFor(6)).toHaveLength(6)
  })

  it('continues the rotation instead of following the calendar', () => {
    expect(nextWorkout(withSettings({ sessionsDone: 4 }), withSettings().settings!).key).toBe('B')
  })

  it('orders warm-up, strength, finisher cardio, then stretches', () => {
    const s = withSettings({ progress: 18 })
    const types = buildSteps(WORKOUTS.A, s, s.settings!, 'gym').map((x) => (x.type === 'cardio' ? x.role : x.type))
    expect(types).toEqual([
      'warmup', ...Array(6).fill('strength'), 'finisher', ...Array(5).fill('stretch'),
    ])
  })

  it('uses harder versions in stage 4 and applies saved swaps', () => {
    const s = withSettings({ progress: 18, swaps: { Leg_Press: 'Goblet_Squat' } })
    const ids = buildSteps(WORKOUTS.A, s, s.settings!, 'gym').map((x) => x.exerciseId)
    expect(ids).toContain('Smith_Machine_Bench_Press')
    expect(ids).toContain('Goblet_Squat')
    expect(ids).not.toContain('Leg_Press')
  })
})

describe('session flow', () => {
  it('runs sets, feedback and finishes the session', () => {
    let s = startSession(withSettings(), '2026-10-06', 'gym')
    const steps = s.active!.steps
    for (const step of steps) {
      if (step.type !== 'strength') {
        s = nextStep(s, '2026-10-06')
        continue
      }
      for (let i = 0; i < step.sets; i++) s = completeSet(s)
      s = giveFeedback(s, 'right', '2026-10-06')
    }
    expect(s.active).toBeNull()
    expect(s.sessionsDone).toBe(1)
    expect(s.lastDone).toBe('2026-10-06')
    expect(s.loads.Leg_Press).toEqual({ weight: 20, reps: 9 })
  })

  it('remembers a swap only when asked', () => {
    let s = startSession(withSettings(), '2026-10-06', 'gym')
    s = { ...s, active: { ...s.active!, stepIndex: 1 } } // Leg press
    expect(swapCurrent(s, 'Goblet_Squat', false).swaps).toEqual({})
    const kept = swapCurrent(s, 'Goblet_Squat', true)
    expect(kept.swaps).toEqual({ Leg_Press: 'Goblet_Squat' })
    expect(kept.active!.steps[1].exerciseId).toBe('Goblet_Squat')
    expect(swapCurrent(kept, 'Leg_Press', true).swaps).toEqual({})
  })
})

describe('data', () => {
  it('has details and images for every exercise and valid swaps', () => {
    for (const def of Object.values(EXERCISES)) {
      expect(details, def.id).toHaveProperty(def.id)
      for (const swap of def.swaps) expect(EXERCISES, `${def.id} -> ${swap}`).toHaveProperty(swap)
    }
    for (const w of Object.values(WORKOUTS)) {
      for (const slot of [...w.slots, ...w.home]) {
        for (const id of [slot.id, slot.easy, slot.hard]) if (id) expect(EXERCISES).toHaveProperty(id)
      }
      for (const slot of w.stretches) expect(EXERCISES[slot.id]?.kind, slot.id).toBe('stretch')
    }
  })
})

describe('dates', () => {
  it('finds the next gym day after today', () => {
    const tuesday = new Date('2026-10-06T10:00')
    expect(nextGymDay([1, 3, 5], tuesday)).toBe(3)
    expect(nextGymDay([2], tuesday)).toBe(2) // next week
    expect(nextGymDay([], tuesday)).toBeNull()
  })
})

describe('week schedule', () => {
  const tuesday = new Date('2026-10-06T10:00')
  const settings: Settings = { days: [2, 4, 6], level: 'beginner', homeKit: [] } // Tue, Thu, Sat
  const summary = (s: AppState) =>
    upcomingDays(s, settings, tuesday).map((d) =>
      d.offset === undefined ? d.status : previewSession(s, settings, d.offset).workout.key,
    )

  it('assigns the rotation to upcoming gym days', () => {
    expect(summary(withSettings({ settings }))).toEqual(['A', 'rest', 'B', 'rest', 'C', 'rest', 'rest'])
  })

  it('starts from the next gym day when today is already done', () => {
    const s = withSettings({ settings, sessionsDone: 1, lastDone: '2026-10-06' })
    expect(summary(s)).toEqual(['done', 'rest', 'B', 'rest', 'C', 'rest', 'rest'])
  })

  it('skips the in-progress workout', () => {
    const s = startSession(withSettings({ settings }), '2026-10-06', 'gym')
    expect(summary(s)).toEqual(['active', 'rest', 'B', 'rest', 'C', 'rest', 'rest'])
  })

  it('previews future sessions with their set count', () => {
    const s = withSettings({ settings, sessionsDone: 11, progress: 11 })
    const later = previewSession(s, settings, 1).steps.find((x) => x.type === 'strength')!
    expect(later).toMatchObject({ sets: 3 })
  })
})

describe('gym equipment', () => {
  it('keeps exercises whose equipment is there', () => {
    expect(resolveAvailable('Leg_Press', [])).toBe('Leg_Press')
  })

  it('falls back to the closest swap the gym can do', () => {
    expect(resolveAvailable('Leg_Press', ['leg-press'])).toBe('Hack_Squat')
    expect(resolveAvailable('Leg_Press', ['leg-press', 'hack-squat'])).toBe('Goblet_Squat')
    expect(resolveAvailable('Seated_Cable_Rows', ['seated-row', 'plate-row'])).toBe('One-Arm_Dumbbell_Row')
  })

  it('marks replaced steps in the plan, including cardio', () => {
    const s = withSettings({ settings: { days: [1, 3, 5], level: 'beginner', homeKit: [], missing: ['treadmill', 'leg-press'] } })
    const steps = buildSteps(WORKOUTS.A, s, s.settings!, 'gym')
    expect(steps[0]).toMatchObject({ exerciseId: 'Elliptical_Trainer', unavailable: 'Walking_Treadmill' })
    expect(steps[1]).toMatchObject({ exerciseId: 'Hack_Squat', unavailable: 'Leg_Press', baseId: 'Leg_Press' })
    expect(steps[2]).not.toHaveProperty('unavailable')
  })

  it('adds the stairmill to finishers from stage 3', () => {
    const finisher = (n: number) => {
      const s = withSettings({ sessionsDone: n, progress: n })
      return buildSteps(WORKOUTS.A, s, s.settings!, 'gym').find((x) => x.type === 'cardio' && x.role === 'finisher')!
    }
    expect(finisher(3).exerciseId).not.toBe('Step_Mill')
    expect(finisher(15).exerciseId).toBe('Step_Mill') // 15 % 4 === 3
  })

  it('only uses known equipment', () => {
    for (const def of Object.values(EXERCISES)) {
      for (const n of def.needs) expect(ALL_NEEDS, `${def.id} needs ${n}`).toContain(n)
    }
  })
})
