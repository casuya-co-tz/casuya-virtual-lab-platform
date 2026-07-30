'use client'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

export interface LabProgressEvent {
  type: 'lab-progress'
  status: 'in_progress' | 'completed'
  score: number
  completion_data?: Record<string, unknown>
}

interface SimulationWrapperProps {
  htmlCode: string
  previewKey: number
  onProgress?: (event: LabProgressEvent) => void
}

export function SimulationWrapper({ htmlCode, previewKey, onProgress }: SimulationWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [frameSrc, setFrameSrc] = useState('')
  const prevBlobUrl = useRef('')
  const { lang } = useLanguage()

  useEffect(() => {
    setIsLoading(true)

    const origin = typeof window !== 'undefined' ? window.location.origin : ''

    let modified = htmlCode.replace(
      /<script\s+src=["'][^"']*three(?:\.min)?\.js["']><\/script>/gi,
      `<script src="${origin}/js/three.min.js"></script>`
    )

    modified = modified.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')
    modified = modified.replace(/<script\s+type=["']importmap["'][^>]*>[\s\S]*?<\/script>/gi, '')

    const IMPORT_MAP_CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0'
    const importMap = `<script type="importmap">{
  "imports": {
    "three": "${IMPORT_MAP_CDN}/build/three.module.js",
    "three/addons/": "${IMPORT_MAP_CDN}/examples/jsm/"
  }
}</script>`

    const styleInjection = `
      <style>
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background-color: transparent;
        }
        canvas {
          display: block;
        }
      </style>
    `

    const headInjection = `${importMap}${styleInjection}`

    if (modified.includes('</head>')) {
      modified = modified.replace('</head>', `${headInjection}</head>`)
    } else {
      modified = headInjection + modified
    }

    if (prevBlobUrl.current) {
      URL.revokeObjectURL(prevBlobUrl.current)
    }

    const blob = new Blob([modified], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    prevBlobUrl.current = url
    setFrameSrc(url)
  }, [htmlCode, previewKey])

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data
      if (data && data.type === 'lab-progress' && typeof data.status === 'string' && typeof data.score === 'number') {
        onProgress?.({
          type: 'lab-progress',
          status: data.status,
          score: data.score,
          completion_data: data.completion_data,
        })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onProgress])

  useEffect(() => {
    return () => {
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full h-[60vh] max-h-[500px] bg-bg-primary overflow-hidden rounded-b-2xl">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bg-secondary">
          <div className="w-8 h-8 border-4 border-border-strong border-t-accent-blue rounded-full animate-spin mb-4" />
          <p className="text-[14px] text-text-secondary animate-pulse">{t('student.loadingLab', lang)}</p>
        </div>
      )}
      
      {frameSrc && (
        <iframe
          key={previewKey}
          src={frameSrc}
          sandbox="allow-scripts"
          className={`w-full h-full border-none transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          title="Lab Simulation"
          onLoad={() => setIsLoading(false)}
        />
      )}
    </div>
  )
}
