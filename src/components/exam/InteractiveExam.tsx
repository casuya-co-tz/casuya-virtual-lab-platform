'use client'
import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { sanitizeSafe, needsSandbox, hasMermaid, hasMath } from '@/lib/sanitize'
import SandboxedContent from './SandboxedContent'
import 'katex/dist/katex.min.css'

interface ParsedQuestion {
  number: number
  text: string
  options: string[]
  hint: string
}

function parseQuiz(text: string): ParsedQuestion[] {
  const blocks = text.split(/\n\s*\n+/)
  const questions: ParsedQuestion[] = []

  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue

    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) continue

    const firstLine = lines[0]
    const qNumMatch = firstLine.match(/^(\d+)[.)]\s*(.+)/)
    if (!qNumMatch) continue

    const number = parseInt(qNumMatch[1])
    const text = qNumMatch[2]
    const options: string[] = []
    let hint = ''

    let i = 1
    while (i < lines.length) {
      const line = lines[i]
      if (/show\s*hint/i.test(line)) {
        hint = lines.slice(i + 1).join('\n').trim()
        break
      }
      options.push(line)
      i++
    }

    questions.push({ number, text, options, hint })
  }

  return questions
}

interface InteractiveExamProps {
  questions: unknown
}

export default function InteractiveExam({ questions }: InteractiveExamProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mermaidReady, setMermaidReady] = useState(false)
  const [htmlRendered, setHtmlRendered] = useState(false)

  const rawContent = useMemo(() => {
    if (typeof questions === 'object' && questions && '_html' in questions) {
      return String((questions as Record<string, unknown>)._html)
    }
    return ''
  }, [questions])

  const isHtml = /<[a-z][\s\S]*>/i.test(rawContent)
  const requiresSandbox = isHtml && needsSandbox(rawContent)

  const sanitizedHtml = useMemo(() => {
    if (!isHtml || requiresSandbox) return ''
    return sanitizeSafe(rawContent)
  }, [rawContent, isHtml, requiresSandbox])

  useEffect(() => {
    setMermaidReady(false)
    setHtmlRendered(false)
  }, [sanitizedHtml])

  const handleHtmlLoad = useCallback(() => {
    setHtmlRendered(true)
  }, [])

  useEffect(() => {
    if (!isHtml || requiresSandbox || !containerRef.current) return

    const container = containerRef.current
    let cancelled = false

    const hasMathContent = hasMath(sanitizedHtml)
    const hasMermaidContent = hasMermaid(sanitizedHtml)

    if (hasMathContent) {
      import('katex/contrib/auto-render').then(({ default: renderMathInElement }) => {
        if (cancelled) return
        try {
          import('katex/contrib/mhchem')
          renderMathInElement(container, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true },
            ],
            throwOnError: false,
            macros: {
              '\\C': '\\mathbb{C}',
              '\\R': '\\mathbb{R}',
              '\\N': '\\mathbb{N}',
              '\\Q': '\\mathbb{Q}',
              '\\Z': '\\mathbb{Z}',
            },
          })
        } catch {}
      }).catch(() => {})
    }

    if (hasMermaidContent) {
      const mermaidElements = container.querySelectorAll<HTMLElement>('.mermaid')
      if (mermaidElements.length > 0) {
        import('mermaid').then(mermaid => {
          if (cancelled) return
          try {
            mermaid.default.initialize({ startOnLoad: false })
            mermaid.default.run({ nodes: Array.from(mermaidElements) })
            setMermaidReady(true)
          } catch {}
        }).catch(() => {})
      }
    } else {
      setMermaidReady(true)
    }

    return () => { cancelled = true }
  }, [isHtml, requiresSandbox, sanitizedHtml])

  if (!rawContent) return null

  if (requiresSandbox) {
    return (
      <div className="w-full">
        <SandboxedContent html={rawContent} />
      </div>
    )
  }

  if (isHtml) {
    return (
      <div className="w-full overflow-x-auto" ref={containerRef}>
        <div
          className="[&_*]:max-w-full [&_*]:min-w-0 [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_table]:border-collapse [&_table]:text-[clamp(12px,3.5vw,14px)] [&_td]:p-1.5 [&_th]:p-1.5 [&_div]:w-full [&_div]:!max-w-full [&_p]:w-full"
          style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>
    )
  }

  const parsed = parseQuiz(rawContent)

  if (parsed.length === 0) {
    return (
      <div className="w-full p-2 sm:p-3">
        <pre className="whitespace-pre-wrap font-sans text-[clamp(13px,3.5vw,15px)] text-text-primary leading-relaxed">
          {rawContent}
        </pre>
      </div>
    )
  }

  return <InteractiveQuiz questions={parsed} />
}

function InteractiveQuiz({ questions }: { questions: ParsedQuestion[] }) {
  const [selected, setSelected] = useState<Record<number, number | null>>({})
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({})

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {questions.map(q => (
        <div key={q.number} className="p-3 sm:p-4 bg-bg-primary border border-border">
          <p className="text-[clamp(14px,3.5vw,16px)] font-semibold text-text-primary mb-2 sm:mb-3 leading-relaxed">
            {q.number}. {q.text}
          </p>

          <div className="space-y-1.5 mb-2 sm:mb-3">
            {q.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx)
              const isSelected = selected[q.number] === idx
              return (
                <button
                  key={idx}
                  onClick={() => setSelected(prev => ({ ...prev, [q.number]: prev[q.number] === idx ? null : idx }))}
                  className={`w-full text-left p-2.5 sm:p-3 text-[clamp(13px,3vw,14px)] border transition-all duration-200 leading-relaxed
                    ${isSelected
                      ? 'border-accent-blue bg-accent-blue/10 text-text-primary shadow-sm'
                      : 'border-border bg-bg-secondary text-text-secondary hover:border-border-strong hover:bg-bg-primary'
                    }`}
                >
                  <span className="font-semibold mr-2">{letter}.</span>
                  {opt}
                </button>
              )
            })}
          </div>

          {q.hint && (
            <div>
              <button
                onClick={() => setRevealedHints(prev => ({ ...prev, [q.number]: !prev[q.number] }))}
                className="text-[clamp(12px,2.8vw,13px)] text-accent-blue hover:text-accent-blue/80 font-medium transition-colors"
              >
                {revealedHints[q.number] ? 'Hide Hint' : 'Show Hint'}
              </button>
              {revealedHints[q.number] && (
                <div className="mt-1.5 p-2 bg-accent-yellow/10 border border-accent-yellow/30 text-[clamp(13px,3vw,14px)] text-text-secondary leading-relaxed">
                  {q.hint}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
