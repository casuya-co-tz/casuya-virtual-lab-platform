'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface LabTimerProps {
  mode?: 'stopwatch' | 'countdown'
  durationMinutes?: number
  onTimeUp?: () => void
  onTick?: (elapsed: number) => void
  autoStart?: boolean
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function LabTimer({ mode = 'stopwatch', durationMinutes = 60, onTimeUp, onTick, autoStart = true }: LabTimerProps) {
  const totalSeconds = mode === 'countdown' ? durationMinutes * 60 : 0
  const [seconds, setSeconds] = useState(totalSeconds)
  const [running, setRunning] = useState(autoStart)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const secondsRef = useRef(totalSeconds)
  const timeUpFiredRef = useRef(false)

  const tick = useCallback(() => {
    const current = secondsRef.current
    const next = mode === 'countdown' ? Math.max(0, current - 1) : current + 1
    secondsRef.current = next
    setSeconds(next)

    if (mode === 'countdown' && next <= 0) {
      setRunning(false)
      if (!timeUpFiredRef.current) {
        timeUpFiredRef.current = true
        onTimeUp?.()
      }
    } else {
      onTick?.(mode === 'countdown' ? totalSeconds - next : next)
    }
  }, [mode, totalSeconds, onTimeUp, onTick])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, tick])

  useEffect(() => {
    secondsRef.current = seconds
  }, [seconds])

  // Reset the guard when the timer is restarted.
  useEffect(() => {
    timeUpFiredRef.current = false
  }, [mode, durationMinutes])

  const isOvertime = mode === 'stopwatch' && seconds >= durationMinutes * 60
  const isWarning = mode === 'countdown' && seconds > 0 && seconds <= 300
  const isDanger = mode === 'countdown' && seconds > 0 && seconds <= 60

  return (
    <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 border transition-colors ${
      isDanger ? 'border-accent-red/50 bg-accent-red/5' :
      isWarning ? 'border-accent-amber/50 bg-accent-amber/5' :
      isOvertime ? 'border-accent-amber/30 bg-accent-amber/5' :
      'border-border bg-bg-secondary'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        running
          ? isDanger ? 'bg-accent-red animate-pulse' : isWarning ? 'bg-accent-amber animate-pulse' : 'bg-accent-green animate-pulse'
          : 'bg-text-disabled'
      }`} />
      <span className={`text-[12px] uppercase tracking-wider font-bold ${
        isDanger ? 'text-accent-red' : isWarning ? 'text-accent-amber' : 'text-text-secondary'
      }`}>
        {mode === 'countdown' ? 'Time Left' : 'Elapsed'}
      </span>
      <span className={`text-[18px] sm:text-[20px] font-mono font-bold tabular-nums ${
        isDanger ? 'text-accent-red' : isWarning ? 'text-accent-amber' : 'text-text-primary'
      }`}>
        {formatTime(mode === 'countdown' ? seconds : seconds)}
      </span>
      {isOvertime && (
        <span className="text-[11px] text-accent-amber font-bold ml-1">OVERTIME</span>
      )}
      <button
        onClick={() => setRunning(!running)}
        className={`ml-auto px-2 py-1 text-[11px] font-bold uppercase tracking-wider border transition-colors ${
          running
            ? 'border-border text-text-secondary hover:bg-bg-tertiary'
            : 'border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10'
        }`}
      >
        {running ? 'Pause' : 'Resume'}
      </button>
    </div>
  )
}
