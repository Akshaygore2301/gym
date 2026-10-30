import { exercise, cardioStage } from '../lib/plan'
import { currentLoad, targetSummary } from '../lib/progression'
import type { AppState, Step } from '../lib/state'
import { ExerciseAnim } from './ExerciseAnim'

const ROLE: Record<string, string> = { warmup: 'Warm-up', main: 'Cardio', finisher: 'Finisher' }

function stepSummary(step: Step, state: AppState): string {
  const def = exercise(step.exerciseId)
  if (step.type === 'cardio') {
    const settings = def.kind === 'cardio' ? def.settings(cardioStage(state.progress)) : []
    return [`${step.minutes} min`, ...settings].join(', ')
  }
  const sets = step.type === 'strength' ? step.sets : 1
  return targetSummary(def, currentLoad(def, state.loads[step.exerciseId]), sets)
}

export function StepList({
  steps,
  state,
  current,
  onInfo,
}: {
  steps: Step[]
  state: AppState
  current?: number
  onInfo: (id: string) => void
}) {
  return (
    <ol className="step-list">
      {steps.map((step, i) => {
        const def = exercise(step.exerciseId)
        const status = current === undefined ? '' : i < current ? 'past' : i === current ? 'now' : ''
        return (
          <li key={i} className={`${status} is-${step.type}`}>
            <button type="button" onClick={() => onInfo(step.exerciseId)}>
              <ExerciseAnim id={step.exerciseId} size="thumb" />
              <span className="text">
                <strong>{def.name}</strong>
                <span className="muted">
                  {step.type === 'cardio' && `${ROLE[step.role]}, `}
                  {stepSummary(step, state)}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
