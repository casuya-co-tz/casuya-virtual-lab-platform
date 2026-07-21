'use client'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'

export default function DeveloperDocsPage() {
  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2">API Documentation</h1>
      <p className="text-[14px] text-text-secondary mb-6">REST API for accessing Casuya Virtual Lab data</p>

      <Tabs
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: (
              <Card>
                <h3 className="text-[16px] font-bold text-text-primary mb-3">Base URL</h3>
                <code className="block p-3 bg-bg-secondary border border-border-DEFAULT text-[13px] text-text-primary font-mono mb-4">https://api.casuya.com/v1</code>
                <h3 className="text-[16px] font-bold text-text-primary mb-3">Authentication</h3>
                <p className="text-[14px] text-text-secondary mb-2">Include your API key in the Authorization header:</p>
                <code className="block p-3 bg-bg-secondary border border-border-DEFAULT text-[13px] text-text-primary font-mono mb-4">Authorization: Bearer cvs_your_api_key_here</code>
                <h3 className="text-[16px] font-bold text-text-primary mb-3">Rate Limits</h3>
                <p className="text-[14px] text-text-secondary mb-2">Free tier: 5,000 requests/month. Premium: 50,000. Enterprise: unlimited.</p>
              </Card>
            ),
          },
          {
            id: 'endpoints',
            label: 'Endpoints',
            content: (
              <div className="flex flex-col gap-4">
                <Card>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="success">GET</Badge>
                    <code className="text-[14px] font-mono text-text-primary">/api/v1/labs</code>
                  </div>
                  <p className="text-[14px] text-text-secondary mb-3">List all published labs. Supports query parameters:</p>
                  <ul className="text-[13px] text-text-secondary list-disc pl-4 space-y-1">
                    <li><code className="font-mono">subject</code> — Filter by subject (physics, chemistry, biology)</li>
                    <li><code className="font-mono">limit</code> — Number of results (default 20, max 100)</li>
                    <li><code className="font-mono">offset</code> — Pagination offset</li>
                  </ul>
                </Card>
                <Card>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="success">GET</Badge>
                    <code className="text-[14px] font-mono text-text-primary">/api/v1/labs/:id</code>
                  </div>
                  <p className="text-[14px] text-text-secondary">Get a single lab by ID.</p>
                </Card>
                <Card>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="success">GET</Badge>
                    <code className="text-[14px] font-mono text-text-primary">/api/v1/subjects</code>
                  </div>
                  <p className="text-[14px] text-text-secondary">List all subjects with their topics and subtopics.</p>
                </Card>
              </div>
            ),
          },
          {
            id: 'examples',
            label: 'Examples',
            content: (
              <Card>
                <h3 className="text-[16px] font-bold text-text-primary mb-3">List Physics Labs</h3>
                <code className="block p-3 bg-bg-secondary border border-border-DEFAULT text-[13px] text-text-primary font-mono mb-4 whitespace-pre-wrap">{`curl -H "Authorization: Bearer cvs_your_key" \\
  "https://api.casuya.com/v1/labs?subject=physics&limit=10"`}</code>
                <h3 className="text-[16px] font-bold text-text-primary mb-3">Response</h3>
                <code className="block p-3 bg-bg-secondary border border-border-DEFAULT text-[13px] text-text-primary font-mono whitespace-pre-wrap">{`{
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
              </Card>
            ),
          },
        ]}
      />
    </div>
  )
}
