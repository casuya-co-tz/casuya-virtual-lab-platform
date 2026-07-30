'use client'
import { ReactNode, useState } from 'react'

interface Tab {
  id: string
  label: string
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id)

  return (
    <div>
      <div className="flex overflow-x-auto border-b border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 text-[14px] font-bold uppercase tracking-[0.5px] transition-all duration-120 ease-out
              ${active === t.id ? 'text-accent-blue border-b-2 border-accent-blue' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-4">{tabs.find(t => t.id === active)?.content}</div>
    </div>
  )
}
