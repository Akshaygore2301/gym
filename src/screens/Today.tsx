import { useState } from 'react'
import { Icon } from '../components/Icon'
import { PlacePicker } from '../components/Pickers'
import { StepList } from '../components/StepList'
import { DAY_LONG, DAY_SHORT, dateKey, nextGymDay, relativeDayName } from '../lib/dates'
import { MAX_STAGE, estimateMinutes, progressOn, stageFor } from '../lib/plan'
import { previewSession, upcomingDays, type PlannedDay } from '../lib/schedule'
import type { AppState, Place, Settings } from '../lib/state'
import { WORKOUTS } from '../data/workouts'

type Props = {
  state: AppState
  settings: Settings
  onStart: (place: Place) => void
  onResume: () => void
  onFinishActive: () => void
  onDiscard: () => void
  onSettings: () => void
  onInfo: (id: string) => void
}

export function Today({ state, settings, onStart, onResume, onFinishActive, onDiscard, onSettings, onInfo }: Props) {
  const [now] = useState(() => new Date())
  const [selected, setSelected] = useState(0)
  // Asked every time: nothing is picked until the user taps Gym or Home.
  const [place, setPlace] = useState<Place | null>(null)
  const week = upcomingDays(state, settings, now)
  const day = week[selected]
  const dateLabel = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <main className="screen">
      <header className="topbar">
        <p className="muted">{dateLabel}</p>
        <button type="button" className="icon-btn" aria-label="Settings" onClick={onSettings}>
          <Icon name="settings" />
        </button>
      </header>

      <WeekStrip week={week} selected={selected} onSelect={setSelected} />

      {selected === 0 && state.active ? (
        <ActiveSession state={state} onResume={onResume} onFinish={onFinishActive} onDiscard={onDiscard} onInfo={onInfo} />
      ) : day.status === 'rest' && selected > 0 ? (
        <section className="title">
          <h1>Rest</h1>
          <p className="muted">Walk, sleep, eat protein.</p>
        </section>
      ) : (
        <Plan
          state={state}
          settings={settings}
          offset={day.offset ?? 0}
          now={now}
          isToday={selected === 0}
          note={day.status === 'done' ? 'Done today' : day.status === 'rest' ? 'Rest day' : undefined}
          place={place}
          onPlace={setPlace}
          onStart={onStart}
          onInfo={onInfo}
        />
      )}
    </main>
  )
}

function Plan({ state, settings, offset, now, isToday, note, place, onPlace, onStart, onInfo }: {
  state: AppState
  settings: Settings
  offset: number
  now: Date
  isToday: boolean
  note?: string // shown when today has no session left, above the next one
  place: Place | null
  onPlace: (p: Place) => void
  onStart: (place: Place) => void
  onInfo: (id: string) => void
}) {
  const { workout, steps } = previewSession(state, settings, offset, place ?? 'gym')
  const stage = stageFor(progressOn(state, dateKey(now)) + offset)
  const nextDay = nextGymDay(settings.days, now)

  return (
    <>
      <section className="title">
        {note && (
          <p className="note-line">
            {note === 'Done today' && <Icon name="check" size={18} />} {note}
            {nextDay !== null && <span className="muted">. Next: {relativeDayName(nextDay, now)}</span>}
          </p>
        )}
        <h1>{workout.name}</h1>
        <p className="muted">{workout.focus}</p>
        <div className="stats">
          <span><strong>{estimateMinutes(steps)}</strong> min</span>
          <span className="stage" aria-label={`Stage ${stage} of ${MAX_STAGE}`}>
            {Array.from({ length: MAX_STAGE }, (_, i) => <i key={i} className={i < stage ? 'on' : ''} />)}
            Stage {stage}
          </span>
        </div>
      </section>

      <PlacePicker value={place} onChange={onPlace} />

      {place && (
        <>
          <StepList steps={steps} state={state} onInfo={onInfo} />
          {isToday && (
            <footer className="actions">
              <button type="button" className="btn btn-primary btn-block btn-xl" onClick={() => onStart(place)}>
                Start
              </button>
            </footer>
          )}
        </>
      )}
    </>
  )
}

function WeekStrip({ week, selected, onSelect }: {
  week: PlannedDay[]
  selected: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="week" role="tablist" aria-label="This week">
      {week.map((day, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === selected}
          className={`week-day ${i === selected ? 'on' : ''} is-${day.status}`}
          onClick={() => onSelect(i)}
        >
          <span className="small">{DAY_SHORT[day.date.getDay()].slice(0, 2)}</span>
          <strong>{day.date.getDate()}</strong>
          <span className="mark" aria-hidden />
        </button>
      ))}
    </div>
  )
}

function ActiveSession({ state, onResume, onFinish, onDiscard, onInfo }: {
  state: AppState
  onResume: () => void
  onFinish: () => void
  onDiscard: () => void
  onInfo: (id: string) => void
}) {
  const a = state.active!
  const workout = WORKOUTS[a.workoutKey as keyof typeof WORKOUTS]
  const startedToday = a.date === dateKey()
  const startedDay = DAY_LONG[new Date(`${a.date}T00:00`).getDay()]
  return (
    <>
      <section className="title">
        <p className="muted">{startedToday ? 'Paused' : `Unfinished from ${startedDay}`}</p>
        <h1>{workout?.name ?? 'Workout'}</h1>
        <p className="muted">
          {a.place === 'home' ? 'Home' : 'Gym'}, step {a.stepIndex + 1} of {a.steps.length}
        </p>
      </section>
      <StepList steps={a.steps} state={state} current={a.stepIndex} onInfo={onInfo} />
      <footer className="actions">
        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={onFinish}>
            Mark done
          </button>
          <button
            type="button"
            className="btn btn-ghost danger"
            onClick={() => confirm('Discard this workout? It will not count.') && onDiscard()}
          >
            Discard
          </button>
        </div>
        <button type="button" className="btn btn-primary btn-block btn-xl" onClick={onResume}>
          Resume
        </button>
      </footer>
    </>
  )
}
