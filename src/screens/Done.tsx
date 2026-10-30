import { nextGymDay, relativeDayName } from '../lib/dates'
import { Icon } from '../components/Icon'
import { MAX_STAGE, SESSIONS_PER_STAGE, nextWorkout, stageFor } from '../lib/plan'
import type { AppState, Settings } from '../lib/state'

export function Done({ state, settings, onHome }: { state: AppState; settings: Settings; onHome: () => void }) {
  const next = nextWorkout(state, settings)
  const day = nextGymDay(settings.days)
  const stage = stageFor(state.progress)
  const steppedUp = stage > stageFor(state.progress - 1)
  const toGo = SESSIONS_PER_STAGE - (state.progress % SESSIONS_PER_STAGE)
  return (
    <main className="screen done">
      <div className="done-mark" aria-hidden>
        <Icon name="check" size={44} />
      </div>
      <h1>Done</h1>
      <p className="muted">
        {steppedUp ? `Stage ${stage} unlocked` : stage < MAX_STAGE ? `${toGo} to stage ${stage + 1}` : `Session ${state.sessionsDone}`}
      </p>
      <p className="muted">
        Next: {next.name}{day !== null && `, ${relativeDayName(day)}`}
      </p>
      <footer className="actions">
        <button type="button" className="btn btn-primary btn-block btn-xl" onClick={onHome}>
          Home
        </button>
      </footer>
    </main>
  )
}
