'use client'
import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-[10px] text-text-secondary hover:text-accent-blue transition-colors"
      title="Copy ID"
    >
      {copied ? '✓' : '⧉'}
    </button>
  )
}
