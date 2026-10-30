import { useCallback, useEffect, useState } from 'react'
import { ExerciseInfo } from './components/ExerciseInfo'
import { discardSession, finishSession, saveSettings, startSession } from './lib/actions'
import { dateKey } from './lib/dates'
import { loadState, saveState, type AppState } from './lib/state'
import { Done } from './screens/Done'
import { Run } from './screens/Run'
import { SettingsScreen } from './screens/SettingsScreen'
import { Setup } from './screens/Setup'
import { Today } from './screens/Today'

type View = 'today' | 'run' | 'settings'

export default function App() {
  const [state, setState] = useState<AppState>(loadState)
  const [view, setView] = useState<View>('today')
  const [infoId, setInfoId] = useState<string | null>(null)

  useEffect(() => {
    saveState(state)
  }, [state])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view, state.active?.stepIndex])

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), [])
  const closeInfo = useCallback(() => setInfoId(null), [])

  const { settings } = state
  let screen
  if (!settings) {
    screen = <Setup onDone={(s) => update((st) => saveSettings(st, s))} />
  } else if (view === 'settings') {
    screen = <SettingsScreen state={state} settings={settings} update={update} onBack={() => setView('today')} />
  } else if (view === 'run' && state.active) {
    screen = <Run state={state} update={update} onPause={() => setView('today')} onInfo={setInfoId} />
  } else if (view === 'run') {
    // The last step finished the session.
    screen = <Done state={state} settings={settings} onHome={() => setView('today')} />
  } else {
    screen = (
      <Today
        state={state}
        settings={settings}
        onStart={(place) => {
          update((s) => startSession(s, dateKey(), place))
          setView('run')
        }}
        onResume={() => setView('run')}
        onFinishActive={() => update((s) => finishSession(s, dateKey()))}
        onDiscard={() => update(discardSession)}
        onSettings={() => setView('settings')}
        onInfo={setInfoId}
      />
    )
  }

  return (
    <>
      {screen}
      {infoId && <ExerciseInfo id={infoId} onClose={closeInfo} />}
    </>
  )
}
