'use client'
import { useEffect } from 'react'
import { onLCP, onINP, onCLS, onTTFB } from 'web-vitals'

export function WebVitals() {
  useEffect(() => {
    function sendMetric(name: string, value: number) {
      const body = { [name.toLowerCase()]: value, pathname: window.location.pathname }
      navigator.sendBeacon?.('/api/vitals', JSON.stringify(body))
    }

    try {
      onLCP(m => sendMetric('LCP', m.value))
      onINP(m => sendMetric('INP', m.value))
      onCLS(m => sendMetric('CLS', m.value))
      onTTFB(m => sendMetric('TTFB', m.value))
    } catch {}
  }, [])

  return null
}
