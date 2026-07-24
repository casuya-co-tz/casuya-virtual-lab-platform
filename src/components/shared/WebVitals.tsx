'use client'
import { useEffect } from 'react'
import { onLCP, onINP, onCLS, onTTFB } from 'web-vitals'

function getRating(name: string, value: number): string {
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000],
    INP: [200, 500],
    CLS: [0.1, 0.25],
    TTFB: [800, 1800],
  }
  const [good, poor] = thresholds[name] || [0, 0]
  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

export function WebVitals() {
  useEffect(() => {
    function sendMetric(name: string, value: number) {
      const body = {
        metric_name: name,
        metric_value: value,
        rating: getRating(name, value),
        page_url: window.location.pathname,
      }
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
