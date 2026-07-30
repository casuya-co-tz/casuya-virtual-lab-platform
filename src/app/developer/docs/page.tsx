'use client'
import { useEffect, useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { useLanguage } from '@/hooks/useLanguage'

interface Doc {
  id: string
  slug: string
  title: string
  content: string
  category: string
  updated_at: string
}

export default function DeveloperDocsPage() {
  const { lang, mounted } = useLanguage()
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    fetch('/api/developer/docs')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setDocs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const categories = [...new Set(docs.map(d => d.category))]
  const groupedDocs = categories.map(cat => ({
    category: cat,
    docs: docs.filter(d => d.category === cat),
  }))

  const staticTabs = [
    {
      id: 'quickstart',
      label: 'Quickstart',
      content: (
        <div className="bg-bg-primary border border-border p-2">
          <h3 className="text-[14px] font-bold text-text-primary mb-2">Base URL</h3>
          <code className="block p-2 bg-bg-secondary border border-border text-[12px] text-text-primary font-mono mb-3">
            {origin}/api/v1
          </code>
          <h3 className="text-[14px] font-bold text-text-primary mb-2">Authentication</h3>
          <p className="text-[12px] text-text-secondary mb-1">Include your API key in the Authorization header:</p>
          <code className="block p-2 bg-bg-secondary border border-border text-[12px] text-text-primary font-mono mb-3">
            Authorization: Bearer cvs_your_public_token:your_secret
          </code>
          <p className="text-[12px] text-text-secondary mb-3">
            Keys are shown once when created in your dashboard as <code className="font-mono">public_token:secret</code>.
          </p>
          <h3 className="text-[14px] font-bold text-text-primary mb-2">Rate Limits</h3>
          <p className="text-[12px] text-text-secondary mb-1">
            Free tier: 5,000 requests/month. Premium: 50,000. Enterprise: unlimited.
          </p>
          <p className="text-[12px] text-text-secondary">
            Create API keys from your <a href="/developer" className="text-accent-blue underline">Developer Dashboard</a>.
          </p>
        </div>
      ),
    },
    {
      id: 'endpoints',
      label: 'Endpoints',
      content: (
        <div className="flex flex-col gap-2">
          <div className="bg-bg-primary border border-border p-2">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success">GET</Badge>
              <code className="text-[12px] font-mono text-text-primary">/api/v1/labs</code>
            </div>
            <p className="text-[12px] text-text-secondary mb-2">List all published labs.</p>
            <ul className="text-[11px] text-text-secondary list-disc pl-3 space-y-0.5">
              <li><code className="font-mono">subject</code> — Filter by subject (physics, chemistry, biology)</li>
              <li><code className="font-mono">limit</code> — Number of results (default 20, max 100)</li>
              <li><code className="font-mono">offset</code> — Pagination offset</li>
            </ul>
          </div>
          <div className="bg-bg-primary border border-border p-2">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success">GET</Badge>
              <code className="text-[12px] font-mono text-text-primary">/api/v1/labs/:id</code>
            </div>
            <p className="text-[12px] text-text-secondary">Get a single lab by ID.</p>
          </div>
          <div className="bg-bg-primary border border-border p-2">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="info">GET</Badge>
              <code className="text-[12px] font-mono text-text-primary">/api/v1/search?q=keyword</code>
            </div>
            <p className="text-[12px] text-text-secondary">Full-text search across all published labs.</p>
          </div>
          <div className="bg-bg-primary border border-border p-2">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="neutral">GET</Badge>
              <code className="text-[12px] font-mono text-text-primary">/api/v1/public</code>
            </div>
            <p className="text-[12px] text-text-secondary">Public endpoint — no API key required. Rate limit: 30 req/min.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'examples',
      label: 'Examples',
      content: (
        <div className="bg-bg-primary border border-border p-2">
          <h3 className="text-[14px] font-bold text-text-primary mb-2">List Physics Labs</h3>
          <code className="block p-2 bg-bg-secondary border border-border text-[12px] text-text-primary font-mono mb-3 whitespace-pre-wrap">{`curl -H "Authorization: Bearer cvs_your_token:your_secret" \\
  "/api/v1/labs?subject=physics&limit=10"`}</code>
          <h3 className="text-[14px] font-bold text-text-primary mb-2">Response</h3>
          <code className="block p-2 bg-bg-secondary border border-border text-[12px] text-text-primary font-mono whitespace-pre-wrap">{`{
  "data": [
    {
      "id": "uuid",
      "title": "Ohm's Law",
      "title_sw": "Sheria ya Ohm",
      "subject": "physics",
      "subtopic": "Current",
      "topic": "Electricity"
    }
  ],
  "total": 12,
  "limit": 10,
  "offset": 0
}`}</code>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div>
        <h1 className="text-[clamp(18px,4vw,24px)] font-bold text-text-primary mb-1">API Documentation</h1>
        <p className="text-text-secondary">Loading...</p>
      </div>
    )
  }

  const dbTabs = groupedDocs.map(group => ({
    id: group.category,
    label: group.category.charAt(0).toUpperCase() + group.category.slice(1),
    content: (
      <div className="flex flex-col gap-2">
        {group.docs.map(doc => (
          <div key={doc.id} className="bg-bg-primary border border-border p-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[14px] font-bold text-text-primary">{doc.title}</h3>
              {doc.updated_at && (
                <span className="text-[10px] text-text-secondary">
                  Updated {new Date(doc.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="text-[12px] text-text-secondary whitespace-pre-wrap leading-relaxed">
              {doc.content}
            </div>
          </div>
        ))}
      </div>
    ),
  }))

  const allTabs = [...staticTabs, ...dbTabs]

  return (
    <div>
      <h1 className="text-[clamp(18px,4vw,24px)] font-bold text-text-primary mb-1">API Documentation</h1>
      <p className="text-[12px] text-text-secondary mb-3">REST API for accessing Casuya Virtual Lab data</p>
      <div className="overflow-x-auto hide-scrollbar -mx-1 sm:mx-0 px-1 sm:px-0">
        <Tabs tabs={allTabs} />
      </div>
    </div>
  )
}
