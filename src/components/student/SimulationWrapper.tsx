'use client'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

interface SimulationWrapperProps {
  htmlCode: string
  previewKey: number
}

function injectSandboxCsp(html: string): string {
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self';">`
  const headMatch = html.match(/<head[^>]*>/i)
  if (headMatch && headMatch.index !== undefined) {
    const pos = headMatch.index + headMatch[0].length
    return html.slice(0, pos) + csp + html.slice(pos)
  }
  return csp + html
}

export function SimulationWrapper({ htmlCode, previewKey }: SimulationWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [processedHtml, setProcessedHtml] = useState('')
  const { lang } = useLanguage()

  useEffect(() => {
    setIsLoading(true)

    // 1. Replace external three.js with local cached version
    let modified = htmlCode.replace(
      /<script\s+src=["'][^"']*three(?:\.min)?\.js["']><\/script>/gi,
      '<script src="/js/three.min.js"></script>'
    )

    // 2. Inject CSS theme styles
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

    if (modified.includes('</head>')) {
      modified = modified.replace('</head>', `${styleInjection}</head>`)
    } else {
      modified = styleInjection + modified
    }

    // 3. Inject sandboxed CSP meta tag
    modified = injectSandboxCsp(modified)

    setProcessedHtml(modified)
  }, [htmlCode, previewKey])

  return (
    <div className="relative w-full h-[60vh] max-h-[500px] bg-bg-primary overflow-hidden rounded-b-2xl">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bg-secondary">
          <div className="w-8 h-8 border-4 border-border-strong border-t-accent-blue rounded-full animate-spin mb-4" />
          <p className="text-[14px] text-text-secondary animate-pulse">{t('student.loadingLab', lang)}</p>
        </div>
      )}
      
      {processedHtml && (
        <iframe
          key={previewKey}
          srcDoc={processedHtml}
          sandbox="allow-scripts"
          className={`w-full h-full border-none transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          title="Lab Simulation"
          onLoad={() => setIsLoading(false)}
        />
      )}
    </div>
  )
}
