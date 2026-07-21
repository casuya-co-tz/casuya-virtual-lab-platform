'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

interface Lab {
  id: string
  title: string
  title_sw: string
  subject: string
  description: string
  subtopic: string
  topic: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Lab[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (query.trim().length < 2) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.data || [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2">Search Labs</h1>
      <p className="text-[14px] text-text-secondary mb-6">Find physics, chemistry, and biology lab simulations</p>

      <div className="flex gap-3 mb-6">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search labs, topics, subtopics..."
          className="flex-1"
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-accent-blue text-white text-[14px] font-bold uppercase tracking-[0.5px] hover:opacity-90 transition-opacity"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {searched && results.length === 0 && !loading && (
        <p className="text-[14px] text-text-secondary">No results found for &quot;{query}&quot;</p>
      )}

      <div className="flex flex-col gap-3">
        {results.map(lab => (
          <Link key={lab.id} href={`/student/${lab.subject}/${lab.id}`}>
            <Card hover interactive>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">{lab.title}</h3>
                  <p className="text-[12px] text-text-secondary mt-1">{lab.topic} &rarr; {lab.subtopic}</p>
                  {lab.description && <p className="text-[13px] text-text-secondary mt-2 line-clamp-2">{lab.description}</p>}
                </div>
                <Badge variant={lab.subject === 'physics' ? 'info' : lab.subject === 'chemistry' ? 'warning' : 'success'}>
                  {lab.subject}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
