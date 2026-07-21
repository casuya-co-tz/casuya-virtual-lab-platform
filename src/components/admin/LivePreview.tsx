'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface LivePreviewProps {
  code: string
}

export function LivePreview({ code }: LivePreviewProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  if (!code) {
    return (
      <div className="bg-bg-secondary border border-border-DEFAULT h-[400px] flex items-center justify-center">
        <p className="text-[14px] text-text-secondary">No code to preview</p>
      </div>
    )
  }

  return (
    <div className="border border-border-DEFAULT">
      <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary border-b border-border-DEFAULT">
        <span className="text-[12px] text-text-secondary uppercase">Live Preview</span>
        <Button variant="ghost" onClick={() => setRefreshKey(k => k + 1)}>
          Refresh
        </Button>
      </div>
      <iframe
        key={refreshKey}
        srcDoc={code}
        sandbox="allow-scripts"
        className="w-full h-[500px] bg-white"
        title="Lab Preview"
      />
    </div>
  )
}
