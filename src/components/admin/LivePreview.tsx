'use client'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'

interface LivePreviewProps {
  code: string
}

export function LivePreview({ code }: LivePreviewProps) {
  const { lang } = useLanguage()
  const [refreshKey, setRefreshKey] = useState(0)
  const [frameSrc, setFrameSrc] = useState('')
  const prevBlobUrl = useRef('')

  useEffect(() => {
    if (!code) return

    const origin = typeof window !== 'undefined' ? window.location.origin : ''

    let modified = code.replace(
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

    if (modified.includes('</head>')) {
      modified = modified.replace('</head>', `${importMap}</head>`)
    } else if (modified.includes('<script')) {
      modified = importMap + modified
    } else {
      modified = importMap + modified
    }

    if (prevBlobUrl.current) {
      URL.revokeObjectURL(prevBlobUrl.current)
    }

    const blob = new Blob([modified], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    prevBlobUrl.current = url
    setFrameSrc(url)
  }, [code, refreshKey])

  useEffect(() => {
    return () => {
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current)
      }
    }
  }, [])

  if (!code) {
    return (
      <div className="bg-bg-secondary border border-border h-[400px] flex items-center justify-center">
        <p className="text-[14px] text-text-secondary">{t('admin.previewNoCode', lang)}</p>
      </div>
    )
  }

  return (
    <div className="border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary border-b border-border">
        <span className="text-[12px] text-text-secondary uppercase">{t('admin.livePreview', lang)}</span>
        <Button variant="ghost" onClick={() => setRefreshKey(k => k + 1)}>
          {t('admin.refresh', lang)}
        </Button>
      </div>
      {frameSrc && (
        <iframe
          key={refreshKey}
          src={frameSrc}
          sandbox="allow-scripts"
          className="w-full h-[500px] bg-white"
          title="Lab Preview"
        />
      )}
    </div>
  )
}
