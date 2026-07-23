'use client'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <head>
        <style>{`body{margin:0;font-family:sans-serif;background:#fafafa;color:#111}button{cursor:pointer;border:0}.text-center{text-align:center}.min-h-screen{min-height:100vh}.flex{display:flex}.items-center{align-items:center}.justify-center{justify-content:center}.px-4{padding-left:16px;padding-right:16px}.w-full{width:100%}.max-w-md{max-width:448px}*{box-sizing:border-box}`}</style>
      </head>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#fafafa' }}>
          <div className="w-full max-w-md text-center">
            <h1 style={{ fontSize: 'clamp(48px,10vw,72px)', fontWeight: 700, margin: 0, color: '#3B82F6' }}>500</h1>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginTop: '8px', color: '#111' }}>Something went wrong</h2>
            <p style={{ fontSize: '14px', marginTop: '8px', marginBottom: '32px', color: '#666' }}>
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              style={{ height: '44px', padding: '0 24px', backgroundColor: '#3B82F6', color: '#fff', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
