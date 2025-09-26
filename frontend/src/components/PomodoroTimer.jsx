import { useEffect, useMemo, useRef, useState } from 'react'

// Simple localStorage-backed session store (fallbacks if storage is unavailable)
function safeStorage() {
  try {
    const testKey = '__kt__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return window.localStorage
  } catch {
    return null
  }
}

function useBeep() {
  const ctxRef = useRef(null)
  useEffect(() => () => { ctxRef.current?.close?.() }, [])
  return () => {
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = ctxRef.current
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      g.gain.setValueAtTime(0.001, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
      o.connect(g).connect(ctx.destination)
      o.start()
      o.stop(ctx.currentTime + 0.26)
    } catch {}
  }
}

const defaultConfig = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  cyclesBeforeLongBreak: 4,
}

export default function PomodoroTimer() {
  const storage = useMemo(safeStorage, [])
  const [config, setConfig] = useState(() => {
    try {
      const raw = storage?.getItem('kt.timer.config')
      return raw ? { ...defaultConfig, ...JSON.parse(raw) } : defaultConfig
    } catch {
      return defaultConfig
    }
  })
  const [phase, setPhase] = useState('work') // 'work' | 'shortBreak' | 'longBreak'
  const [secondsLeft, setSecondsLeft] = useState(config.work)
  const [running, setRunning] = useState(false)
  const [cycleCount, setCycleCount] = useState(0)
  const beep = useBeep()

  // Persist config changes
  useEffect(() => {
    try { storage?.setItem('kt.timer.config', JSON.stringify(config)) } catch {}
  }, [config, storage])

  // Timer tick
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [running])

  // Phase completion handling
  useEffect(() => {
    if (secondsLeft !== 0) return
    if (!running) return
    setRunning(false)
    beep()

    if (phase === 'work') {
      // Save a completed work session
      try {
        const now = new Date().toISOString()
        const payload = { type: 'work', startedAt: new Date(Date.now() - config.work * 1000).toISOString(), finishedAt: now, durationSec: config.work }
        const prev = JSON.parse(storage?.getItem('kt.sessions') || '[]')
        prev.push(payload)
        storage?.setItem('kt.sessions', JSON.stringify(prev))
        // Optionally sync to backend if configured
        const base = import.meta.env.VITE_API_URL
        if (base) {
          fetch(`${base}/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(()=>{})
        }
      } catch {}
      const nextCycle = cycleCount + 1
      setCycleCount(nextCycle)
      const nextPhase = nextCycle % config.cyclesBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak'
      setPhase(nextPhase)
      setSecondsLeft(nextPhase === 'longBreak' ? config.longBreak : config.shortBreak)
    } else {
      setPhase('work')
      setSecondsLeft(config.work)
    }
  }, [secondsLeft, running, phase, cycleCount, config, beep, storage])

  const total = phase === 'work' ? config.work : phase === 'shortBreak' ? config.shortBreak : config.longBreak
  const progress = 1 - secondsLeft / total

  function startPause() { setRunning((r) => !r) }
  function reset() {
    setRunning(false)
    setSecondsLeft(total)
  }
  function skip() { setSecondsLeft(0) }

  function fmt(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="kt-wrap">
      <h1>KumaTime</h1>
      <div className={`kt-phase ${phase}`}>{phase === 'work' ? 'Focus' : phase === 'shortBreak' ? 'Short Break' : 'Long Break'}</div>
      <div className="kt-timer">
        <div className="kt-time">{fmt(secondsLeft)}</div>
        <div className="kt-progress">
          <div className="kt-bar" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="kt-controls">
          <button onClick={startPause}>{running ? 'Pause' : 'Start'}</button>
          <button onClick={reset}>Reset</button>
          <button onClick={skip}>Skip</button>
        </div>
      </div>

      <details className="kt-config">
        <summary>Config</summary>
        <div className="kt-grid">
          <label>
            Work (min)
            <input type="number" min={1} max={180} value={Math.round(config.work/60)} onChange={(e)=>{
              const v = Math.max(1, Number(e.target.value)||25)
              setConfig((c)=>({ ...c, work: v*60 }))
              if (phase==='work') setSecondsLeft(v*60)
            }} />
          </label>
          <label>
            Short break (min)
            <input type="number" min={1} max={60} value={Math.round(config.shortBreak/60)} onChange={(e)=>{
              const v = Math.max(1, Number(e.target.value)||5)
              setConfig((c)=>({ ...c, shortBreak: v*60 }))
              if (phase==='shortBreak') setSecondsLeft(v*60)
            }} />
          </label>
          <label>
            Long break (min)
            <input type="number" min={1} max={120} value={Math.round(config.longBreak/60)} onChange={(e)=>{
              const v = Math.max(1, Number(e.target.value)||15)
              setConfig((c)=>({ ...c, longBreak: v*60 }))
              if (phase==='longBreak') setSecondsLeft(v*60)
            }} />
          </label>
          <label>
            Cycles before long break
            <input type="number" min={1} max={12} value={config.cyclesBeforeLongBreak} onChange={(e)=>{
              const v = Math.max(1, Number(e.target.value)||4)
              setConfig((c)=>({ ...c, cyclesBeforeLongBreak: v }))
            }} />
          </label>
        </div>
      </details>

      <SessionHistory />
    </div>
  )
}

function SessionHistory(){
  const [items, setItems] = useState(()=>{
    try { return JSON.parse(window.localStorage.getItem('kt.sessions')||'[]').reverse() } catch { return [] }
  })
  return (
    <details className="kt-history">
      <summary>History ({items.length})</summary>
      <ul>
        {items.map((s, i)=> (
          <li key={i}>{new Date(s.finishedAt).toLocaleString()} — {s.type} {Math.round(s.durationSec/60)}m</li>
        ))}
      </ul>
    </details>
  )
}
