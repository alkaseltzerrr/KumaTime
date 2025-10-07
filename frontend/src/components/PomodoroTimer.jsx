import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useFocusMode } from '../contexts/FocusModeContext'
import { useNotification } from '../contexts/NotificationContext'
import MascotEncouragement from './MascotEncouragement'

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
  const { focusMode, toggleFocusMode } = useFocusMode()
  const { permission, showNotification } = useNotification()
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
  const [showFocusOptions, setShowFocusOptions] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [focusOptions, setFocusOptions] = useState({
    fullscreen: false,
    hideProgress: false,
    minimalistMode: false
  })
  const [showMascotEncouragement, setShowMascotEncouragement] = useState(false)
  const [lastEncouragementTime, setLastEncouragementTime] = useState(0)
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

  // Mascot encouragement logic - show once every 30 seconds during work sessions (FOR TESTING)
  useEffect(() => {
    if (!running || phase !== 'work') return

    const totalTimeElapsed = config.work - secondsLeft
    
    // FOR TESTING: Show encouragement once every 30 seconds
    const currentThirtySecInterval = Math.floor(totalTimeElapsed / 30) // Which 30-second interval we're in
    const lastThirtySecInterval = Math.floor(lastEncouragementTime / 30) // Last interval we showed encouragement
    
    const shouldShowEncouragement = totalTimeElapsed >= 30 && // At least 30 seconds elapsed
      currentThirtySecInterval > lastThirtySecInterval && // We're in a new 30-second interval
      totalTimeElapsed % 30 === 0 // Only trigger on exact 30-second marks

    if (shouldShowEncouragement) {
      setShowMascotEncouragement(true)
      setLastEncouragementTime(totalTimeElapsed)
    }
  }, [running, phase, secondsLeft, config.work, lastEncouragementTime])

  // Phase completion handling
  useEffect(() => {
    if (secondsLeft !== 0) return
    if (!running) return
    setRunning(false)
    beep()

    // Show notification based on phase completion
    if (phase === 'work') {
      showNotification('🎯 Work Session Complete!', {
        body: `Great job! You completed a ${Math.round(config.work/60)} minute work session. Time for a break! 🌸`,
        icon: '/vite.svg'
      })
    } else if (phase === 'shortBreak') {
      showNotification('☕ Break Complete!', {
        body: `Break time is over! Ready to focus again? Let\'s get back to work! 💪`,
        icon: '/vite.svg'
      })
    } else if (phase === 'longBreak') {
      showNotification('🌟 Long Break Complete!', {
        body: `You\'ve completed a full cycle! Feeling refreshed? Time to start a new focus session! ✨`,
        icon: '/vite.svg'
      })
    }

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
  }, [secondsLeft, running, phase, cycleCount, config, beep, storage, showNotification])

  // Fullscreen functionality
  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleFocusModeToggle = () => {
    if (!focusMode) {
      // Entering focus mode
      if (focusOptions.fullscreen) {
        enterFullscreen();
      }
    } else {
      // Exiting focus mode
      if (document.fullscreenElement) {
        exitFullscreen();
      }
    }
    toggleFocusMode();
    setShowFocusOptions(false);
  };

  const total = phase === 'work' ? config.work : phase === 'shortBreak' ? config.shortBreak : config.longBreak
  const progress = 1 - secondsLeft / total

  function startPause() { 
    setRunning((r) => !r)
    // Reset encouragement tracking when starting a new session
    if (!running) {
      setLastEncouragementTime(0)
    }
  }
  function reset() {
    setRunning(false)
    setSecondsLeft(total)
    setLastEncouragementTime(0)
    setShowMascotEncouragement(false)
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
    <div className={`${focusMode ? 'fixed inset-0 z-50 bg-gradient-to-br from-gray-900 to-black' : 'w-full h-full p-2 relative'}`}>
      {/* Focus Mode Toggle with Options - Outside the main div when not in focus mode */}
      {!focusMode && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
          <div className="relative">
            <button 
              onClick={() => setShowFocusOptions(!showFocusOptions)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 bg-gradient-to-r from-pink-100 to-purple-100 text-gray-700 hover:from-pink-200 hover:to-purple-200 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            >
              🔍 Focus Mode {showFocusOptions ? '▲' : '▼'}
            </button>
            
            {/* Focus Options Dropdown */}
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden transition-all duration-700 ease-in-out ${
              showFocusOptions 
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
            }`}>
              <div className="p-6 min-w-64 bg-gradient-to-br from-pink-50 via-white to-purple-50">
                <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                  ✨ Focus Options
                </h4>
                
                {/* Custom Checkbox Component */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={focusOptions.fullscreen}
                        onChange={(e) => setFocusOptions(prev => ({...prev, fullscreen: e.target.checked}))}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                        focusOptions.fullscreen 
                          ? 'bg-gradient-to-br from-pink-400 to-purple-500 border-purple-400 shadow-lg scale-110' 
                          : 'bg-white border-gray-300 group-hover:border-pink-300'
                      }`}>
                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                          focusOptions.fullscreen ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                        }`}>
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-pink-600 transition-colors">
                      🖥️ Fullscreen Mode
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={focusOptions.hideProgress}
                        onChange={(e) => setFocusOptions(prev => ({...prev, hideProgress: e.target.checked}))}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                        focusOptions.hideProgress 
                          ? 'bg-gradient-to-br from-green-400 to-blue-500 border-blue-400 shadow-lg scale-110' 
                          : 'bg-white border-gray-300 group-hover:border-green-300'
                      }`}>
                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                          focusOptions.hideProgress ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                        }`}>
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">
                      ⭕ Hide Progress Ring
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={focusOptions.minimalistMode}
                        onChange={(e) => setFocusOptions(prev => ({...prev, minimalistMode: e.target.checked}))}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                        focusOptions.minimalistMode 
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-orange-400 shadow-lg scale-110' 
                          : 'bg-white border-gray-300 group-hover:border-yellow-300'
                      }`}>
                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                          focusOptions.minimalistMode ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                        }`}>
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-yellow-600 transition-colors">
                      ✨ Ultra Minimalist
                    </span>
                  </label>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={handleFocusModeToggle}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-500 shadow-lg hover:shadow-xl"
                  >
                    🚀 Enter Focus
                  </button>
                  <button 
                    onClick={() => setShowFocusOptions(false)}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-500 transform hover:scale-[1.02]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`relative overflow-hidden transition-all duration-500 ${
        focusMode 
          ? 'w-full h-full flex items-center justify-center p-8' 
          : 'w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow p-6'
      }`}>
        {!focusMode && <div className="absolute -right-16 -top-16 opacity-20 text-9xl">🐻</div>}
        
        {/* Focus Mode Toggle - Inside when in focus mode */}
        {focusMode && (
          <div className="absolute top-8 right-8 animate-fade-in z-10">
            <button 
              onClick={handleFocusModeToggle}
              className="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 bg-gray-700/80 backdrop-blur-sm text-white hover:bg-gray-600/80 transform hover:scale-[1.03] shadow-lg hover:shadow-xl"
            >
              🔍 Exit Focus
            </button>
          </div>
        )}

        {/* Only show title in normal mode */}
        {!focusMode && (
          <div className={`flex items-center justify-between mb-6 transition-all duration-500 ${focusMode ? 'text-white mb-12' : ''}`}>
            <div>
              <h2 className={`font-bold transition-all duration-700 ${focusMode ? 'text-white text-5xl animate-pulse-slow' : 'text-gray-800 text-2xl'}`}>
                KumaTime
              </h2>
              <div className="mt-1 inline-flex items-center gap-2 animate-slide-in">
                <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${
                  phase === 'work' ? 'bg-red-100 text-red-700' : 
                  phase === 'shortBreak' ? 'bg-green-100 text-green-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {phase === 'work' ? 'Focus' : phase === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </span>
                <span className="text-xs text-gray-500">Cycle {cycleCount}</span>
              </div>
            </div>
            <div className="text-right animate-fade-in">
              <div className="text-sm text-gray-500">Session</div>
              <div className="text-lg font-semibold text-gray-700">{fmt(total)} total</div>
            </div>
          </div>
        )}

        <div className={`flex items-center gap-6 h-full ${focusMode ? 'justify-center flex-col' : ''}`}>
          <div className={`relative flex-shrink-0 transition-all duration-700 ease-out ${focusMode ? 'w-[500px] h-[500px] animate-grow' : 'w-56 h-56'}`}>
            {(!focusOptions.hideProgress || !focusMode) && (
              <svg viewBox="0 0 140 140" className={`w-full h-full transition-all duration-500 ${focusMode ? 'drop-shadow-2xl' : ''}`}>
                <defs>
                  <linearGradient id="g1" x1="0%" x2="100%">
                    <stop offset="0%" stopColor={focusMode ? "#374151" : "#fb7185"} />
                    <stop offset="100%" stopColor={focusMode ? "#1f2937" : "#7c3aed"} />
                  </linearGradient>
                </defs>
                <g transform="translate(70,70)">
                  <circle r="58" fill={focusMode ? "#111827" : "#fff"} className="transition-all duration-500" />
                  <circle r="54" fill="none" stroke={focusMode ? "#374151" : "#f3e8ff"} strokeWidth="12" className="transition-all duration-500" />
                  <circle r="54" fill="none" stroke="url(#g1)" strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={dash} strokeDashoffset={dashOffset} 
                    style={{ transition: 'stroke-dashoffset 400ms linear, stroke 500ms ease' }} 
                    className={focusMode ? 'drop-shadow-lg' : ''} />
                </g>
              </svg>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className={`font-bold transition-all duration-700 ease-out ${
                focusMode 
                  ? `${focusOptions.minimalistMode ? 'text-[6rem] animate-pulse-glow' : 'text-[5rem] animate-float'} text-white drop-shadow-2xl leading-none` 
                  : 'text-4xl text-gray-800'
              }`}>
                {fmt(secondsLeft)}
              </div>
              {!focusMode && <div className="text-xs text-gray-500 mt-1 animate-fade-in">{Math.round(progress*100)}% done</div>}
              {focusMode && !focusOptions.minimalistMode && (
                <div className="text-2xl text-gray-300 mt-6 capitalize animate-fade-in-delay font-light tracking-wide">
                  {phase === 'work' ? '✨ Focus Time' : '🌸 Break Time'}
                </div>
              )}
            </div>
          </div>

          {!focusMode && (
            <div className="flex-1 animate-slide-in-right">
              <div className="flex gap-3 mb-3">
                <button onClick={startPause} className={`flex-1 px-4 py-2 rounded-xl font-semibold shadow-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-lg transform active:scale-95 ${running ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white' : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white'}`}>
                  {running ? '⏸ Pause' : '▶ Start'}
                </button>
                <button onClick={reset} className="px-4 py-2 rounded-xl bg-white/60 hover:bg-white text-gray-700 shadow transition-all duration-500 hover:scale-[1.02] transform active:scale-95">🌸 Reset</button>
                <button onClick={skip} className="px-4 py-2 rounded-xl bg-white/60 hover:bg-white text-gray-700 shadow transition-all duration-500 hover:scale-[1.02] transform active:scale-95">🐾 Skip</button>
              </div>

              <div className="text-sm text-gray-600 mb-3 animate-fade-in">Quick controls</div>
              <div className="grid grid-cols-2 gap-2 animate-stagger-in">
                <div className="p-3 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-500 hover:scale-[1.02] transform">
                  <div className="text-xs text-gray-500">Work</div>
                  <div className="font-medium">{Math.round(config.work/60)} min</div>
                </div>
                <div className="p-3 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-500 hover:scale-[1.02] transform">
                  <div className="text-xs text-gray-500">Break</div>
                  <div className="font-medium">{Math.round(config.shortBreak/60)} min</div>
                </div>
                <div className="p-3 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-500 hover:scale-[1.02] transform">
                  <div className="text-xs text-gray-500">Long</div>
                  <div className="font-medium">{Math.round(config.longBreak/60)} min</div>
                </div>
                <div className="p-3 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-500 hover:scale-[1.02] transform">
                  <div className="text-xs text-gray-500">Every</div>
                  <div className="font-medium">{config.cyclesBeforeLongBreak} cycles</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Focus Mode Controls */}
          {focusMode && (
            <div className="flex gap-8 animate-slide-up mt-16">
              <button onClick={startPause} className={`px-12 py-6 rounded-2xl font-bold shadow-2xl transition-all duration-500 text-2xl transform hover:scale-[1.03] active:scale-95 ${
                running 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-yellow-500/25' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-green-500/25'
              } hover:shadow-3xl`}>
                {running ? '⏸ Pause' : '▶ Start'}
              </button>
              {!focusOptions.minimalistMode && (
                <>
                  <button onClick={reset} className="px-10 py-6 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white shadow-2xl text-xl font-semibold transition-all duration-500 transform hover:scale-[1.03] active:scale-95 hover:shadow-3xl">
                    🌸 Reset
                  </button>
                  <button onClick={skip} className="px-10 py-6 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white shadow-2xl text-xl font-semibold transition-all duration-500 transform hover:scale-[1.03] active:scale-95 hover:shadow-3xl">
                    🐾 Skip
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <details className={`mt-4 rounded-xl overflow-hidden transition-all duration-500 ${focusMode ? 'hidden' : 'bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl border border-white/30'}`} 
          open={showConfig} 
          onToggle={(e) => setShowConfig(e.target.open)}>
          <summary className="cursor-pointer font-semibold p-4 hover:bg-white/20 transition-all duration-300 flex items-center justify-between group backdrop-blur-sm">
            <span className="flex items-center gap-2 text-gray-700">
              <span className={`transition-transform duration-500 ${showConfig ? 'rotate-90 scale-110' : ''}`}>⚙️</span>
              Configuration
            </span>
            <span className={`transform transition-all duration-500 text-gray-500 group-hover:text-gray-700 ${showConfig ? 'rotate-180 scale-105' : 'group-hover:scale-105'}`}>
              ▼
            </span>
          </summary>
          
          <div className={`transition-all duration-800 ease-out overflow-hidden ${
            showConfig 
              ? 'max-h-96 opacity-100 translate-y-0 scale-100' 
              : 'max-h-0 opacity-0 -translate-y-8 scale-95'
          }`}>
            <div className="p-4 pt-2 bg-white/10 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { 
                    label: '⏰ Work Duration (min)', 
                    value: Math.round(config.work/60), 
                    onChange: (e) => {
                      const v = Math.max(1, Number(e.target.value)||25)
                      setConfig((c)=>({ ...c, work: v*60 }))
                      if (phase==='work') setSecondsLeft(v*60)
                    },
                    min: 1, max: 180, color: 'pink'
                  },
                  { 
                    label: '☕ Short Break (min)', 
                    value: Math.round(config.shortBreak/60), 
                    onChange: (e) => {
                      const v = Math.max(1, Number(e.target.value)||5)
                      setConfig((c)=>({ ...c, shortBreak: v*60 }))
                      if (phase==='shortBreak') setSecondsLeft(v*60)
                    },
                    min: 1, max: 60, color: 'green'
                  },
                  { 
                    label: '🌙 Long Break (min)', 
                    value: Math.round(config.longBreak/60), 
                    onChange: (e) => {
                      const v = Math.max(1, Number(e.target.value)||15)
                      setConfig((c)=>({ ...c, longBreak: v*60 }))
                      if (phase==='longBreak') setSecondsLeft(v*60)
                    },
                    min: 1, max: 120, color: 'blue'
                  },
                  { 
                    label: '🔄 Cycles Before Long Break', 
                    value: config.cyclesBeforeLongBreak, 
                    onChange: (e) => {
                      const v = Math.max(1, Number(e.target.value)||4)
                      setConfig((c)=>({ ...c, cyclesBeforeLongBreak: v }))
                    },
                    min: 1, max: 12, color: 'purple'
                  }
                ].map((field, index) => (
                  <div key={field.label} 
                    className="transition-all duration-500 hover:scale-[1.02] transform"
                    style={{animationDelay: `${index * 100}ms`}}>
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700 mb-2 block">
                        {field.label}
                      </span>
                      <div className="relative">
                        <input 
                          className={`w-full rounded-lg border-2 p-3 transition-all duration-300 bg-white/80 backdrop-blur-sm
                            focus:ring-4 focus:ring-${field.color}-200 focus:border-${field.color}-400 
                            hover:bg-white/90 hover:scale-[1.02] hover:shadow-md
                            ${field.color === 'pink' ? 'focus:ring-pink-200 focus:border-pink-400' : ''}
                            ${field.color === 'green' ? 'focus:ring-green-200 focus:border-green-400' : ''}
                            ${field.color === 'blue' ? 'focus:ring-blue-200 focus:border-blue-400' : ''}
                            ${field.color === 'purple' ? 'focus:ring-purple-200 focus:border-purple-400' : ''}
                          `} 
                          type="number" 
                          min={field.min} 
                          max={field.max} 
                          value={field.value} 
                          onChange={field.onChange}
                        />
                        <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none
                          ${field.color === 'pink' ? 'text-pink-400' : ''}
                          ${field.color === 'green' ? 'text-green-400' : ''}
                          ${field.color === 'blue' ? 'text-blue-400' : ''}
                          ${field.color === 'purple' ? 'text-purple-400' : ''}
                        `}>
                          {field.label.includes('Break') || field.label.includes('Work') ? 'min' : 'cycles'}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              
              {/* Quick presets */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  ✨ Quick Presets
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { name: '🍅 Classic', work: 25, short: 5, long: 15 },
                    { name: '⚡ Short', work: 15, short: 3, long: 10 },
                    { name: '🎯 Long Focus', work: 45, short: 10, long: 20 },
                  ].map((preset, index) => (
                    <button
                      key={preset.name}
                      className="px-3 py-1 text-xs rounded-full bg-white/60 hover:bg-white/80 text-gray-700 transition-all duration-300 hover:scale-[1.02] transform hover:shadow-md"
                      style={{animationDelay: `${400 + index * 100}ms`}}
                      onClick={() => {
                        setConfig(c => ({
                          ...c,
                          work: preset.work * 60,
                          shortBreak: preset.short * 60,
                          longBreak: preset.long * 60
                        }));
                        if (phase === 'work') setSecondsLeft(preset.work * 60);
                        else if (phase === 'shortBreak') setSecondsLeft(preset.short * 60);
                        else if (phase === 'longBreak') setSecondsLeft(preset.long * 60);
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </details>

        <div className={focusMode ? 'hidden' : ''}>
          <AnimatedSessionHistory />
        </div>
      </div>

      {/* Mascot Encouragement */}
      <MascotEncouragement 
        isVisible={showMascotEncouragement}
        onClose={() => setShowMascotEncouragement(false)}
        sessionType={phase === 'work' ? 'focus' : 'break'}
      />
    </div>
  )
}

function AnimatedSessionHistory(){
  const [items, setItems] = useState(()=>{
    try { return JSON.parse(window.localStorage.getItem('kt.sessions')||'[]').reverse() } catch { return [] }
  })
  const [showHistory, setShowHistory] = useState(false)
  
  return (
    <details className="kt-history mt-4 bg-white/30 rounded-lg overflow-hidden transition-all duration-300" 
      open={showHistory} 
      onToggle={(e) => setShowHistory(e.target.open)}>
      <summary className="cursor-pointer font-medium p-3 hover:bg-white/40 transition-all duration-500 flex items-center justify-between">
        <span>📈 History ({items.length})</span>
        <span className={`transform transition-transform duration-500 ${showHistory ? 'rotate-180' : ''}`}>▼</span>
      </summary>
      <div className={`transition-all duration-800 ease-in-out ${
        showHistory 
          ? 'max-h-60 opacity-100 translate-y-0' 
          : 'max-h-0 opacity-0 -translate-y-4'
      } overflow-hidden`}>
        <div className="p-3 pt-0">
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((s, i)=> (
              <li key={i} className="p-2 bg-white/50 rounded text-sm hover:bg-white/70 transition-all duration-500 hover:scale-[1.02] animate-fade-in" 
                style={{animationDelay: `${i * 0.15}s`}}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {s.type === 'work' ? '🎯' : '🌸'} {s.type} session
                  </span>
                  <span className="text-xs text-gray-600">
                    {Math.round(s.durationSec/60)}min
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(s.finishedAt).toLocaleString()}
                </div>
              </li>
            ))}
            {items.length === 0 && (
              <li className="p-4 text-center text-gray-500 text-sm animate-fade-in">
                🌱 No sessions yet. Start your first focus session!
              </li>
            )}
          </ul>
        </div>
      </div>
    </details>
  )
}
