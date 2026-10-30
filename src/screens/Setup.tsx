import { useState } from 'react'
import { DaysPicker, KitPicker, LevelPicker } from '../components/Pickers'
import type { HomeKitId } from '../data/equipment'
import { splitName } from '../data/workouts'
import type { Level, Settings } from '../lib/state'

// One question per screen. Picking a level moves on by itself.
export function Setup({ onDone }: { onDone: (s: Settings) => void }) {
  const [step, setStep] = useState(0)
  const [level, setLevel] = useState<Level>()
  const [days, setDays] = useState<number[]>([1, 3, 5])
  const [homeKit, setHomeKit] = useState<HomeKitId[]>([])

  return (
    <main className="screen setup">
      <div className="setup-progress" aria-label={`Step ${step + 1} of 3`}>
        {[0, 1, 2].map((i) => (
          <button key={i} type="button" aria-label={`Step ${i + 1}`} className={i <= step ? 'on' : ''}
            disabled={i > step} onClick={() => setStep(i)} />
        ))}
      </div>

      {step === 0 && (
        <>
          <h1>Your level</h1>
          <LevelPicker value={level} onChange={(l) => { setLevel(l); setStep(1) }} />
        </>
      )}

      {step === 1 && (
        <>
          <h1>Workout days</h1>
          <DaysPicker days={days} onChange={setDays} />
          <p className="muted">{splitName(days.length)}</p>
          <footer className="actions">
            <button type="button" className="btn btn-primary btn-block btn-xl" disabled={days.length === 0} onClick={() => setStep(2)}>
              Next
            </button>
          </footer>
        </>
      )}

      {step === 2 && (
        <>
          <h1>At home you have</h1>
          <KitPicker value={homeKit} onChange={setHomeKit} />
          <footer className="actions">
            <button type="button" className="btn btn-primary btn-block btn-xl" onClick={() => onDone({ level: level!, days, homeKit })}>
              Start
            </button>
          </footer>
        </>
      )}
    </main>
  )
}
