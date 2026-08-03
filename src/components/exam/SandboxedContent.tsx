'use client'
import { useRef, useState, useCallback, useEffect } from 'react'

interface SandboxedContentProps {
  html: string
  title?: string
}

const CSP_META = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\' \'unsafe-eval\' https:; style-src \'unsafe-inline\' https:; img-src data: blob: https:; font-src data: https:; connect-src \'none\'; frame-src \'none\';">'

function buildSandboxDoc(html: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${CSP_META}
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { width: 100% !important; overflow-x: hidden; }
  body {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: clamp(14px, 3.5vw, 16px);
    line-height: 1.6;
    color: #1a1a2e;
    padding: 4px;
    background: transparent;
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden;
  }
  img { max-width: 100%; height: auto; }
  table { width: 100% !important; border-collapse: collapse; table-layout: auto; }
  td, th { padding: 6px; border: 1px solid #ccc; word-break: break-word; }
  canvas { max-width: 100%; display: block; }
  pre { overflow-x: auto; white-space: pre-wrap; word-break: break-word; max-width: 100%; }
  div, p, section, article, header, footer, main, aside, nav, form, fieldset {
    max-width: 100% !important;
    min-width: 0 !important;
  }
  *::-webkit-scrollbar { height: 4px; }
  *::-webkit-scrollbar-thumb { background: #ccc; }
</style>
</head>
<body>
${html}
<script>
  (function () {
    function send() {
      try {
        var h = Math.max(document.body.scrollHeight, document.body.offsetHeight, 200);
        parent.postMessage({ type: 'sandbox-height', height: h }, '*');
      } catch (e) {}
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', send);
    }
    send();
    setInterval(send, 1000);
    new MutationObserver(send).observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener('resize', send);
  })();
</script>
</body>
</html>`
}

export default function SandboxedContent({ html, title }: SandboxedContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(400)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleHeightMessage = useCallback((event: MessageEvent) => {
    const iframe = iframeRef.current
    if (!iframe || event.source !== iframe.contentWindow) return
    const data = event.data
    if (data && data.type === 'sandbox-height' && typeof data.height === 'number') {
      setHeight(Math.min(Math.max(data.height, 200), 4000))
      setError(false)
    }
  }, [])

  const handleLoad = useCallback(() => {
    setLoading(false)
  }, [])

  useEffect(() => {
    window.addEventListener('message', handleHeightMessage)
    return () => window.removeEventListener('message', handleHeightMessage)
  }, [handleHeightMessage])

  const srcdoc = buildSandboxDoc(html)

  if (error) {
    return (
      <div className="w-full p-4 bg-bg-primary text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-accent-red/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-text-primary mb-1">Interactive content unavailable</p>
        <p className="text-[13px] text-text-secondary">This content requires additional permissions to display.</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-white relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 z-10">
          <div className="flex items-center gap-2.5">
            <svg className="animate-spin w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[13px] text-text-secondary">Loading interactive content...</span>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        srcDoc={srcdoc}
        title={title || 'Interactive content'}
        sandbox="allow-scripts"
        onLoad={handleLoad}
        onError={() => { setError(true); setLoading(false) }}
        className="w-full border-0"
        style={{ height: `${height}px` }}
      />
    </div>
  )
}
