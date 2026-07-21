'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

interface Subtopic {
  id: string
  title: string
  title_sw: string
  has_lab: boolean
}

interface Topic {
  id: string
  title: string
  title_sw: string
  subtopics: Subtopic[]
}

interface SyllabusTreeProps {
  topics: Topic[]
  subject: string
  lang?: 'en' | 'sw'
}

export function SyllabusTree({ topics, subject, lang = 'en' }: SyllabusTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  function toggle(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-2">
      {topics.map(topic => (
        <div key={topic.id} className="border border-border-DEFAULT">
          <button
            onClick={() => toggle(topic.id)}
            className="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-bg-tertiary transition-colors"
          >
            <span className="text-[14px] font-bold text-text-primary">
              {lang === 'sw' ? topic.title_sw : topic.title}
            </span>
            <span className="text-[12px] text-text-secondary">{expanded[topic.id] ? '−' : '+'}</span>
          </button>
          {expanded[topic.id] && (
            <div className="border-t border-border-DEFAULT">
              {topic.subtopics.map(st => (
                <div key={st.id} className="flex items-center justify-between px-4 py-3 border-b border-border-DEFAULT last:border-b-0">
                  <span className="text-[13px] text-text-primary">{lang === 'sw' ? st.title_sw : st.title}</span>
                  {st.has_lab ? (
                    <Link href={`/student/${subject}/${st.id}`} className="text-[12px] text-accent-blue underline">
                      Open Lab
                    </Link>
                  ) : (
                    <Badge variant="neutral">No lab</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
