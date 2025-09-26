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

  // Circular progress ring geometry
  const R = 54
  const C = 2 * Math.PI * R
  const dash = C
  const dashOffset = C * (1 - Math.min(Math.max(progress, 0), 1))

  return (
    <div className="w-full h-full p-2">
  <div className="w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow p-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 opacity-20 text-9xl">🐻</div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">KumaTime</h2>
            <div className="mt-1 inline-flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${phase === 'work' ? 'bg-red-100 text-red-700' : phase === 'shortBreak' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {phase === 'work' ? 'Focus' : phase === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </span>
              <span className="text-xs text-gray-500">Cycle {cycleCount}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Session</div>
            <div className="text-lg font-semibold text-gray-700">{fmt(total)} total</div>
          </div>
        </div>

        <div className="flex items-center gap-6 h-full">
          <div className="relative w-56 h-56 flex-shrink-0">
            <svg viewBox="0 0 140 140" className="w-full h-full">
              <defs>
                <linearGradient id="g1" x1="0%" x2="100%">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <g transform="translate(70,70)">
                <circle r="58" fill="#fff" />
                <circle r="54" fill="none" stroke="#f3e8ff" strokeWidth="12" />
                <circle r="54" fill="none" stroke="url(#g1)" strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={dash} strokeDashoffset={dashOffset} style={{ transition: 'stroke-dashoffset 400ms linear' }} />
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-4xl font-bold text-gray-800">{fmt(secondsLeft)}</div>
              <div className="text-xs text-gray-500 mt-1">{Math.round(progress*100)}% done</div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex gap-3 mb-3">
              <button onClick={startPause} className={`flex-1 px-4 py-2 rounded-xl font-semibold shadow-sm transition ${running ? 'bg-yellow-400 hover:bg-yellow-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                {running ? 'Pause' : 'Start'}
              </button>
              <button onClick={reset} className="px-4 py-2 rounded-xl bg-white/60 hover:bg-white text-gray-700 shadow">Reset</button>
              <button onClick={skip} className="px-4 py-2 rounded-xl bg-white/60 hover:bg-white text-gray-700 shadow">Skip</button>
            </div>

            <div className="text-sm text-gray-600 mb-3">Quick controls</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white/60 rounded-lg">
                <div className="text-xs text-gray-500">Work</div>
                <div className="font-medium">{Math.round(config.work/60)} min</div>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <div className="text-xs text-gray-500">Break</div>
                <div className="font-medium">{Math.round(config.shortBreak/60)} min</div>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <div className="text-xs text-gray-500">Long</div>
                <div className="font-medium">{Math.round(config.longBreak/60)} min</div>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <div className="text-xs text-gray-500">Every</div>
                <div className="font-medium">{config.cyclesBeforeLongBreak} cycles</div>
              </div>
            </div>
          </div>
        </div>

        <details className="mt-4 bg-white/30 rounded-lg p-3">
          <summary className="cursor-pointer font-medium">Config</summary>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-sm text-gray-600">Work (min)
              <input className="mt-1 block w-full rounded border-gray-200 p-2" type="number" min={1} max={180} value={Math.round(config.work/60)} onChange={(e)=>{
                const v = Math.max(1, Number(e.target.value)||25)
                setConfig((c)=>({ ...c, work: v*60 }))
                if (phase==='work') setSecondsLeft(v*60)
              }} />
            </label>
            <label className="text-sm text-gray-600">Short break (min)
              <input className="mt-1 block w-full rounded border-gray-200 p-2" type="number" min={1} max={60} value={Math.round(config.shortBreak/60)} onChange={(e)=>{
                const v = Math.max(1, Number(e.target.value)||5)
                setConfig((c)=>({ ...c, shortBreak: v*60 }))
                if (phase==='shortBreak') setSecondsLeft(v*60)
              }} />
            </label>
            <label className="text-sm text-gray-600">Long break (min)
              <input className="mt-1 block w-full rounded border-gray-200 p-2" type="number" min={1} max={120} value={Math.round(config.longBreak/60)} onChange={(e)=>{
                const v = Math.max(1, Number(e.target.value)||15)
                setConfig((c)=>({ ...c, longBreak: v*60 }))
                if (phase==='longBreak') setSecondsLeft(v*60)
              }} />
            </label>
            <label className="text-sm text-gray-600">Cycles before long break
              <input className="mt-1 block w-full rounded border-gray-200 p-2" type="number" min={1} max={12} value={config.cyclesBeforeLongBreak} onChange={(e)=>{
                const v = Math.max(1, Number(e.target.value)||4)
                setConfig((c)=>({ ...c, cyclesBeforeLongBreak: v }))
              }} />
            </label>
          </div>
        </details>

        <SessionHistory />
      </div>
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
