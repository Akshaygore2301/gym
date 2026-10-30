import { HOME_KIT, type HomeKitId } from '../data/equipment'
import { DAY_SHORT, WEEK_ORDER } from '../lib/dates'
import type { Level, Place } from '../lib/state'

export function DaysPicker({ days, onChange }: { days: number[]; onChange: (days: number[]) => void }) {
  const toggle = (d: number) =>
    onChange(days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort((a, b) => a - b))
  return (
    <div className="days">
      {WEEK_ORDER.map((d) => (
        <button
          key={d}
          type="button"
          className={days.includes(d) ? 'chip on' : 'chip'}
          aria-pressed={days.includes(d)}
          onClick={() => toggle(d)}
        >
          {DAY_SHORT[d].slice(0, 2)}
        </button>
      ))}
    </div>
  )
}

// Each level is drawn as a bumper plate in its weight colour: green 10, yellow 15, red 25.
const LEVELS: { level: Level; name: string; hint: string }[] = [
  { level: 'beginner', name: 'Beginner', hint: 'New, or under 3 months' },
  { level: 'intermediate', name: 'Intermediate', hint: '3 to 12 months' },
  { level: 'advanced', name: 'Advanced', hint: 'Over a year' },
]

export function LevelPicker({ value, onChange }: { value?: Level; onChange: (l: Level) => void }) {
  return (
    <div className="levels">
      {LEVELS.map(({ level, name, hint }) => (
        <button
          key={level}
          type="button"
          className={`level ${value === level ? 'on' : ''}`}
          aria-pressed={value === level}
          onClick={() => onChange(level)}
        >
          <span className={`plate plate-${level}`} aria-hidden />
          <span className="level-text">
            <strong>{name}</strong>
            <span className="muted">{hint}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

export function KitPicker({ value, onChange }: { value: HomeKitId[]; onChange: (kit: HomeKitId[]) => void }) {
  const toggle = (id: HomeKitId) => onChange(value.includes(id) ? value.filter((k) => k !== id) : [...value, id])
  return (
    <div className="tiles">
      <button type="button" className={`tile ${value.length === 0 ? 'on' : ''}`} aria-pressed={value.length === 0}
        onClick={() => onChange([])}>
        Nothing
      </button>
      {HOME_KIT.map((k) => (
        <button key={k.id} type="button" className={`tile ${value.includes(k.id) ? 'on' : ''}`}
          aria-pressed={value.includes(k.id)} onClick={() => toggle(k.id)}>
          {k.name}
        </button>
      ))}
    </div>
  )
}

export function PlacePicker({ value, onChange }: { value: Place | null; onChange: (p: Place) => void }) {
  return (
    <div className="places">
      {(['gym', 'home'] as const).map((p) => (
        <button key={p} type="button" className={`place ${value === p ? 'on' : ''}`} aria-pressed={value === p}
          onClick={() => onChange(p)}>
          {p === 'gym' ? 'Gym' : 'Home'}
        </button>
      ))}
    </div>
  )
}
