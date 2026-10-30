import type { EquipmentId, HomeKitId } from '../data/equipment'

export type Level = 'beginner' | 'intermediate' | 'advanced'
export type Place = 'gym' | 'home'
export type Feedback = 'hard' | 'right' | 'easy'

export type Settings = {
  days: number[] // 0 = Sunday ... 6 = Saturday, like Date.getDay()
  level: Level
  homeKit: HomeKitId[]
  missing?: EquipmentId[] // equipment this gym doesn't have; absent means a full Cult gym
}

// `unavailable` on a step is the planned exercise that was replaced because its
// equipment is missing here.

// Current target for one exercise. Which fields are used depends on the exercise kind.
export type Load = { weight?: number; reps?: number; seconds?: number }

export type Step =
  | { type: 'cardio'; exerciseId: string; role: 'warmup' | 'main' | 'finisher'; minutes: number; unavailable?: string }
  | { type: 'strength'; exerciseId: string; baseId: string; sets: number; unavailable?: string }
  | { type: 'stretch'; exerciseId: string }

export type ActiveSession = {
  date: string
  workoutKey: string
  place: Place
  steps: Step[]
  stepIndex: number
  setIndex: number
}

export type AppState = {
  version: 1
  settings: Settings | null
  sessionsDone: number
  // Position on the difficulty ladder, in sessions. The level sets where it starts,
  // each finished session adds one and a long break steps back.
  progress: number
  lastDone: string | null
  loads: Record<string, Load>
  swaps: Record<string, string> // permanent swaps: planned exercise id -> replacement id
  active: ActiveSession | null
}

export const INITIAL_STATE: AppState = {
  version: 1,
  settings: null,
  sessionsDone: 0,
  progress: 0,
  lastDone: null,
  loads: {},
  swaps: {},
  active: null,
}

const KEY = 'gym-app-state'

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? parseState(raw) : INITIAL_STATE
  } catch {
    return INITIAL_STATE
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked: the app still works for this visit.
  }
}

export function parseState(raw: string): AppState {
  const data = JSON.parse(raw)
  if (data?.version !== 1) throw new Error('Not a backup from this app')
  const state: AppState = { ...INITIAL_STATE, ...data }
  // Older versions had no levels, home workouts or ladder.
  if (state.settings && !state.settings.level) state.settings = { ...state.settings, level: 'beginner', homeKit: [] }
  if (state.active && !state.active.place) state.active = { ...state.active, place: 'gym' }
  if (data.progress === undefined) state.progress = state.sessionsDone
  return state
}
