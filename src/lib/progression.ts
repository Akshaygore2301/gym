import type { ExerciseDef } from '../data/exercises'
import type { Feedback, Load } from './state'

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const roundKg = (n: number) => Math.round(n * 100) / 100

// Fills in defaults. Weight stays undefined until the user picks a first weight.
export function currentLoad(def: ExerciseDef, saved: Load | undefined): Load {
  switch (def.kind) {
    case 'weighted':
      return { weight: saved?.weight, reps: saved?.reps ?? def.reps[0] }
    case 'bodyweight':
      return { reps: saved?.reps ?? def.reps[0] }
    case 'hold':
      return { seconds: saved?.seconds ?? def.seconds[0] }
    case 'cardio':
    case 'stretch':
      return {}
  }
}

// Double progression: add reps until the top of the range, then add weight and
// drop back to the bottom of the range.
export function applyFeedback(def: ExerciseDef, saved: Load | undefined, fb: Feedback): Load {
  const load = currentLoad(def, saved)
  switch (def.kind) {
    case 'weighted': {
      const [lo, hi] = def.reps
      const weight = load.weight ?? def.start
      const reps = load.reps ?? lo
      if (fb === 'easy') return { weight: roundKg(weight + def.step), reps }
      if (fb === 'hard') {
        if (reps > lo) return { weight, reps: lo }
        return { weight: roundKg(Math.max(def.min, weight - def.step)), reps: lo }
      }
      if (reps + 1 > hi) return { weight: roundKg(weight + def.step), reps: lo }
      return { weight, reps: reps + 1 }
    }
    case 'bodyweight': {
      const [lo, hi] = def.reps
      const delta = { easy: 2, right: 1, hard: -2 }[fb]
      return { reps: clamp(load.reps! + delta, lo, hi) }
    }
    case 'hold': {
      const [lo, hi] = def.seconds
      const delta = { easy: 10, right: 5, hard: -5 }[fb]
      return { seconds: clamp(load.seconds! + delta, lo, hi) }
    }
    case 'cardio':
    case 'stretch':
      return {}
  }
}

export function formatWeight(def: ExerciseDef, weight: number): string {
  const kg = `${weight} kg`
  return def.kind === 'weighted' && def.perHand ? `${kg} each hand` : kg
}

// Short "3 × 10 @ 20 kg" style summary for lists.
export function targetSummary(def: ExerciseDef, load: Load, sets: number): string {
  switch (def.kind) {
    case 'weighted':
      return `${sets} × ${load.reps}` + (load.weight === undefined ? ', pick weight' : ` @ ${formatWeight(def, load.weight)}`)
    case 'bodyweight':
      return `${sets} × ${load.reps}`
    case 'hold':
      return `${sets} × ${load.seconds}s hold`
    case 'stretch':
      return `${def.seconds}s` + (def.perSide ? ' each side' : '')
    case 'cardio':
      return ''
  }
}
