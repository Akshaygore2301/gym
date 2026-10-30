import { useState } from 'react'
import { ExerciseAnim } from '../components/ExerciseAnim'
import { Icon } from '../components/Icon'
import { Sheet } from '../components/Sheet'
import { Stepper } from '../components/Stepper'
import { WORKOUTS } from '../data/workouts'
import { completeSet, giveFeedback, nextStep, setLoad, swapCurrent } from '../lib/actions'
import { dateKey } from '../lib/dates'
import { alertDone, formatClock, unlockAudio, useCountdown, useWakeLock } from '../lib/device'
import type { Need } from '../data/equipment'
import { cardioStage, exercise, isAvailable, missingAt } from '../lib/plan'
import { currentLoad, formatWeight } from '../lib/progression'
import type { AppState, Feedback, Step } from '../lib/state'

type Update = (fn: (s: AppState) => AppState) => void

type Props = {
  state: AppState
  update: Update
  onPause: () => void
  onInfo: (id: string) => void
}

export function Run({ state, update, onPause, onInfo }: Props) {
  useWakeLock()
  const a = state.active!
  const step = a.steps[a.stepIndex]
  const workout = WORKOUTS[a.workoutKey as keyof typeof WORKOUTS]

  return (
    <main className="screen run">
      <header className="run-head">
        <button type="button" className="icon-btn" aria-label="Pause workout" onClick={onPause}>
          <Icon name="close" />
        </button>
        <span className="muted">{workout?.name}</span>
        <span className="run-count">
          {a.stepIndex + 1}<span className="muted">/{a.steps.length}</span>
        </span>
      </header>
      <div className="progress">
        <div style={{ width: `${(a.stepIndex / a.steps.length) * 100}%` }} />
      </div>

      {/* Keyed so timers and local UI reset on every new step or swap */}
      <StepView key={`${a.stepIndex}-${step.exerciseId}`} step={step} state={state} update={update} onInfo={onInfo} />
    </main>
  )
}

function StepView({ step, state, update, onInfo }: { step: Step; state: AppState; update: Update; onInfo: (id: string) => void }) {
  const def = exercise(step.exerciseId)
  const [swapOpen, setSwapOpen] = useState(false)
  const today = dateKey()
  const missing = state.settings ? missingAt(state.active!.place, state.settings) : []
  const options = swapOptions(step, missing)

  return (
    <>
      <button type="button" className="anim-btn" onClick={() => onInfo(def.id)} aria-label="How to do it">
        <ExerciseAnim id={def.id} />
      </button>

      <section className="run-body">
        <h1 className="ex-name">{def.name}</h1>
        {'unavailable' in step && step.unavailable && (
          <p className="muted small">Instead of {exercise(step.unavailable).name.toLowerCase()}</p>
        )}
        <div className="tools">
          <button type="button" className="tool" onClick={() => onInfo(def.id)}>
            <Icon name="info" size={18} /> How
          </button>
          {options.length > 0 && (
            <button type="button" className="tool" onClick={() => setSwapOpen(true)}>
              <Icon name="swap" size={18} /> Swap
            </button>
          )}
          <button type="button" className="tool" onClick={() => update((s) => nextStep(s, today))}>
            <Icon name="skip" size={18} /> Skip
          </button>
        </div>

        {step.type === 'cardio' && <CardioStep step={step} state={state} update={update} />}
        {step.type === 'strength' && <StrengthStep step={step} state={state} update={update} />}
        {step.type === 'stretch' && <StretchStep step={step} update={update} />}
      </section>

      {swapOpen && (
        <SwapSheet
          step={step}
          options={options}
          onClose={() => setSwapOpen(false)}
          onPick={(id, always) => update((s) => swapCurrent(s, id, always))}
        />
      )}
    </>
  )
}

function CardioStep({ step, state, update }: { step: Extract<Step, { type: 'cardio' }>; state: AppState; update: Update }) {
  const def = exercise(step.exerciseId)
  const settings = def.kind === 'cardio' ? def.settings(cardioStage(state.progress)) : []
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const left = useCountdown(endsAt, alertDone)
  const finished = endsAt !== null && left === 0

  return (
    <div className="target">
      <div className="big-settings">
        <div>
          <span className="big">{step.minutes}</span>
          <span className="muted">min</span>
        </div>
        {settings.map((s) => (
          <div key={s} className="setting">{s}</div>
        ))}
      </div>

      {endsAt === null ? (
        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={() => {
            unlockAudio()
            setEndsAt(Date.now() + step.minutes * 60_000)
          }}
        >
          Start timer
        </button>
      ) : (
        <div className="clock">{finished ? 'Time' : formatClock(left)}</div>
      )}

      <button type="button" className="btn btn-primary btn-block btn-xl" onClick={() => update((s) => nextStep(s, dateKey()))}>
        Next
      </button>
    </div>
  )
}

// Timed hold. For one-sided stretches the timer runs once per side, with a beep to switch.
function StretchStep({ step, update }: { step: Extract<Step, { type: 'stretch' }>; update: Update }) {
  const def = exercise(step.exerciseId)
  const seconds = def.kind === 'stretch' ? def.seconds : 30
  const sides = def.kind === 'stretch' && def.perSide ? 2 : 1
  const [side, setSide] = useState(0)
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const left = useCountdown(endsAt, () => {
    alertDone()
    if (side + 1 < sides) {
      setSide(side + 1)
      setEndsAt(Date.now() + seconds * 1000)
    } else {
      setSide(sides)
      setEndsAt(null)
    }
  })
  const finished = side >= sides

  return (
    <div className="target">
      {endsAt === null ? (
        <p className="big center">
          {seconds} <span className="unit">sec{sides > 1 && ' each side'}</span>
        </p>
      ) : (
        <>
          {sides > 1 && <p className="muted center">{side === 0 ? 'Side 1' : 'Side 2'}</p>}
          <div className="clock">{formatClock(left)}</div>
        </>
      )}

      {!finished && (
        endsAt === null && (
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => {
              unlockAudio()
              setEndsAt(Date.now() + seconds * 1000)
            }}
          >
            Start
          </button>
        )
      )}

      <button type="button" className="btn btn-primary btn-block btn-xl" onClick={() => update((s) => nextStep(s, dateKey()))}>
        Next
      </button>
    </div>
  )
}

function StrengthStep({ step, state, update }: { step: Extract<Step, { type: 'strength' }>; state: AppState; update: Update }) {
  const def = exercise(step.exerciseId)
  const load = currentLoad(def, state.loads[def.id])
  const setIndex = state.active!.setIndex
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null)
  const [editWeight, setEditWeight] = useState(false)

  if (def.kind === 'weighted' && load.weight === undefined) {
    return <FirstWeight start={def.start} step={def.step} min={def.min} perHand={!!def.perHand} reps={load.reps!}
      onPick={(weight) => update((s) => setLoad(s, def.id, { weight }))} />
  }

  if (setIndex >= step.sets) {
    return <FeedbackPicker onPick={(fb) => update((s) => giveFeedback(s, fb, dateKey()))} />
  }

  const target = def.kind === 'hold' ? `${load.seconds} sec`
    : `${load.reps} reps` + (def.kind === 'weighted' && load.weight !== undefined ? `, ${formatWeight(def, load.weight)}` : '')
  const rest = 'rest' in def ? def.rest : 60
  const doneSet = () => {
    unlockAudio()
    update(completeSet)
    if (setIndex + 1 < step.sets) setRestEndsAt(Date.now() + rest * 1000)
  }

  return (
    <div className="target">
      <ol className="sets" aria-label={`Set ${setIndex + 1} of ${step.sets}`}>
        {Array.from({ length: step.sets }, (_, i) => (
          <li key={i} className={i < setIndex ? 'done' : i === setIndex ? 'now' : ''}>
            <span>Set {i + 1}</span>
            {i === setIndex ? <strong>{target}</strong> : <span>{target}</span>}
          </li>
        ))}
      </ol>
      {def.kind === 'hold' && <HoldTimer seconds={load.seconds!} onDone={doneSet} />}

      {def.kind === 'weighted' && load.weight !== undefined && (
        <div className="center">
          <button type="button" className="weight-line" onClick={() => setEditWeight((v) => !v)}>
            {formatWeight(def, load.weight)} <span className="muted small">edit</span>
          </button>
          {editWeight && (
            <Stepper value={load.weight} step={def.step} min={def.min} suffix="kg"
              onChange={(weight) => update((s) => setLoad(s, def.id, { weight }))} />
          )}
        </div>
      )}

      {def.kind !== 'hold' && (
        <button type="button" className="btn btn-primary btn-block btn-xl" onClick={doneSet}>
          Done with set {setIndex + 1}
        </button>
      )}

      {restEndsAt !== null && (
        <RestOverlay
          endsAt={restEndsAt}
          next={`Set ${setIndex + 1} of ${step.sets}`}
          onAdd={() => setRestEndsAt((t) => (t ?? Date.now()) + 15_000)}
          onClose={() => setRestEndsAt(null)}
        />
      )}
    </div>
  )
}

function FirstWeight({ start, step, min, perHand, reps, onPick }: {
  start: number; step: number; min: number; perHand: boolean; reps: number; onPick: (w: number) => void
}) {
  const [weight, setWeight] = useState(start)
  return (
    <div className="target first-weight">
      <h2 className="center">Pick a light weight</h2>
      <p className="muted center">One you could lift 15 times. You'll do {reps}.</p>
      <Stepper value={weight} step={step} min={min} suffix={perHand ? 'kg each hand' : 'kg'} onChange={setWeight} />
      <button type="button" className="btn btn-primary btn-block btn-xl" onClick={() => onPick(weight)}>
        Use {weight} kg
      </button>
    </div>
  )
}

function HoldTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const left = useCountdown(endsAt, () => {
    alertDone()
    setEndsAt(null)
    onDone()
  })
  return (
    <>
      <p className="big center">
        {endsAt === null ? seconds : left} <span className="unit">sec</span>
      </p>
      {endsAt === null ? (
        <button type="button" className="btn btn-primary btn-block btn-xl" onClick={() => { unlockAudio(); setEndsAt(Date.now() + seconds * 1000) }}>
          Start
        </button>
      ) : (
        <button type="button" className="btn btn-ghost btn-block" onClick={() => { setEndsAt(null); onDone() }}>
          Stop
        </button>
      )}
    </>
  )
}

function RestOverlay({ endsAt, next, onAdd, onClose }: { endsAt: number; next: string; onAdd: () => void; onClose: () => void }) {
  const left = useCountdown(endsAt, () => {
    alertDone()
    onClose()
  })
  return (
    <div className="rest" role="dialog" aria-label="Rest">
      <p className="muted">Rest</p>
      <p className="clock">{formatClock(left)}</p>
      <p className="muted">Next: {next}</p>
      <div className="row">
        <button type="button" className="btn btn-ghost" onClick={onAdd}>
          +15s
        </button>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Go
        </button>
      </div>
    </div>
  )
}

const FEEDBACK: { fb: Feedback; label: string }[] = [
  { fb: 'easy', label: 'Easy' },
  { fb: 'right', label: 'Just right' },
  { fb: 'hard', label: 'Too hard' },
]

function FeedbackPicker({ onPick }: { onPick: (fb: Feedback) => void }) {
  return (
    <div className="target">
      <h2 className="center">How was it?</h2>
      <div className="feedback">
        {FEEDBACK.map(({ fb, label }) => (
          <button key={fb} type="button" className={`btn fb-${fb}`} onClick={() => onPick(fb)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Alternatives for the current step that can be done here.
function swapOptions(step: Step, missing: readonly Need[]): string[] {
  const base = step.type === 'strength' ? step.baseId : step.exerciseId
  return [base, ...exercise(base).swaps, ...exercise(step.exerciseId).swaps].filter(
    (id, i, all) => id !== step.exerciseId && all.indexOf(id) === i && isAvailable(id, missing),
  )
}

function SwapSheet({ step, options, onClose, onPick }: {
  step: Step
  options: string[]
  onClose: () => void
  onPick: (id: string, always: boolean) => void
}) {
  const [always, setAlways] = useState(false)
  const base = step.type === 'strength' ? step.baseId : step.exerciseId

  return (
    <Sheet title="Swap" onClose={onClose}>
      <ul className="swap-list">
        {options.map((id) => (
          <li key={id}>
            <button type="button" onClick={() => { onPick(id, always); onClose() }}>
              <ExerciseAnim id={id} size="thumb" />
              <span>
                <strong>{exercise(id).name}</strong>
                {id === base && <span className="muted small"> (original)</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {step.type === 'strength' && (
        <label className="check">
          <input type="checkbox" checked={always} onChange={(e) => setAlways(e.target.checked)} />
          Always swap
        </label>
      )}
    </Sheet>
  )
}
