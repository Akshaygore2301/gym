import { rotationFor, type Workout } from '../data/workouts'
import { dateKey } from './dates'
import { buildSteps, progressOn } from './plan'
import type { AppState, Place, Settings, Step } from './state'

export type PlannedDay = {
  date: Date
  // done: finished today. active: a workout is in progress. gym: a session is planned.
  status: 'done' | 'active' | 'gym' | 'rest'
  // How many sessions ahead of the next one this day is, for 'gym' days.
  offset?: number
}

// The next `count` days starting today. Sessions follow the rotation, so the
// first planned gym day gets the next workout, the one after gets the following one.
export function upcomingDays(state: AppState, settings: Settings, from: Date, count = 7): PlannedDay[] {
  let offset = state.active ? 1 : 0
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
    if (i === 0 && state.active) return { date, status: 'active' }
    if (i === 0 && state.lastDone === dateKey(from)) return { date, status: 'done' }
    if (!settings.days.includes(date.getDay())) return { date, status: 'rest' }
    return { date, status: 'gym', offset: offset++ }
  })
}

export type SessionPreview = { workout: Workout; steps: Step[]; number: number }

// What a session `offset` sessions from now will look like, using current weights.
export function previewSession(state: AppState, settings: Settings, offset: number, place: Place = 'gym'): SessionPreview {
  const sessionsDone = state.sessionsDone + offset
  const progress = progressOn(state, dateKey()) + offset
  const rotation = rotationFor(settings.days.length)
  const workout = rotation[sessionsDone % rotation.length]
  return { workout, steps: buildSteps(workout, { ...state, sessionsDone, progress }, settings, place), number: sessionsDone + 1 }
}
