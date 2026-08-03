import { query } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CopyButton } from './CopyButton'
import { maybeSync } from '@/lib/lab-sync'

interface Props {
  params: { subject: string }
}

interface LabRow {
  id: string
  title: string
  title_sw: string
  description: string | null
  is_published: boolean
  is_premium: boolean
  version: number | null
  created_at: string
}

interface TopicRow {
  id: string
  title: string
  title_sw: string
  subtopic_count: number
  lab_count: number
  labs: LabRow[] | null
}

export default async function DeveloperSubjectPage({ params }: Props) {
  maybeSync()

  const subjectResult = await query(
    'SELECT id, name, name_sw FROM subjects WHERE LOWER(name) = $1',
    [params.subject.toLowerCase()]
  )
  if (subjectResult.rows.length === 0) notFound()
  const subject = subjectResult.rows[0]

  const topicsResult = await query(
    `SELECT t.id, t.title, t.title_sw,
            (SELECT COUNT(*) FROM subtopics st WHERE st.topic_id = t.id) AS subtopic_count,
            (SELECT COUNT(*) FROM labs l JOIN subtopics st2 ON st2.id = l.subtopic_id WHERE st2.topic_id = t.id AND l.is_published = true) AS lab_count,
            (SELECT json_agg(json_build_object(
              'id', l.id, 'title', l.title, 'title_sw', l.title_sw,
              'description', l.description, 'is_published', l.is_published,
              'is_premium', l.is_premium, 'version', l.version, 'created_at', l.created_at
            ) ORDER BY l.created_at)
             FROM labs l JOIN subtopics st3 ON st3.id = l.subtopic_id
             WHERE st3.topic_id = t.id) AS labs
     FROM topics t
     WHERE t.subject_id = $1
     ORDER BY t.sort_order`,
    [subject.id]
  )

  const topics: TopicRow[] = topicsResult.rows

  const unassignedResult = await query(
    `SELECT id, title, title_sw, description, is_published, is_premium, version, created_at FROM labs WHERE subject = $1 AND subtopic_id IS NULL ORDER BY created_at`,
    [subject.name.toLowerCase()]
  )
  const unassignedLabs: LabRow[] = unassignedResult.rows

  return (
    <div>
      <Link
        href="/developer"
        className="text-[12px] text-accent-blue underline mb-2 block"
      >
        &larr; {params.subject === 'physics' ? 'Physics' : params.subject === 'chemistry' ? 'Chemistry' : 'Biology'}
      </Link>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-[clamp(18px,4vw,24px)] font-bold text-text-primary">{subject.name}</h1>
          <p className="text-[12px] text-text-secondary">{subject.name_sw}</p>
        </div>
        <div className="bg-bg-tertiary border border-border-strong px-2 py-1 text-[11px] text-text-secondary">
          GET /api/v1/labs?subject={params.subject}
        </div>
      </div>

      <div className="space-y-3">
        {topics.map((topic) => {
          const labList = topic.labs || []
          return (
            <div key={topic.id} className="border border-border bg-bg-primary">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-bg-tertiary">
                <div>
                  <h3 className="text-[13px] font-bold text-text-primary">{topic.title}</h3>
                  <p className="text-[11px] text-text-secondary">{topic.title_sw}</p>
                </div>
                <div className="flex gap-2 text-[11px]">
                  <span className="text-text-secondary">{topic.subtopic_count} subtopics</span>
                  <span className="text-accent-blue font-medium">{topic.lab_count} labs</span>
                </div>
              </div>

              {labList.length > 0 ? (
                <div className="divide-y divide-border">
                  {labList.map((lab) => (
                    <div key={lab.id} className="px-3 py-2 hover:bg-bg-secondary transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-[12px] font-medium text-text-primary truncate">{lab.title}</h4>
                            {lab.is_premium && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-accent-purple/10 text-accent-purple font-medium">PRO</span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 font-medium ${lab.is_published ? 'bg-accent-green/10 text-accent-green' : 'bg-bg-tertiary text-text-secondary'}`}>
                              {lab.is_published ? 'LIVE' : 'DRAFT'}
                            </span>
                          </div>
                          {lab.description && (
                            <p className="text-[11px] text-text-secondary line-clamp-1">{lab.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-text-secondary">ID:</span>
                              <code className="text-[11px] font-mono text-accent-blue bg-bg-secondary px-1.5 py-0.5">{lab.id}</code>
                              <CopyButton text={lab.id} />
                            </div>
                            {lab.version && (
                              <span className="text-[11px] text-text-secondary">v{lab.version}</span>
                            )}
                            <span className="text-[11px] text-text-secondary">
                              {new Date(lab.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/developer/${params.subject}/${lab.id}`}
                          className="text-[11px] text-accent-blue underline whitespace-nowrap mt-1"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-3 text-center">
                  <span className="text-[12px] text-text-disabled">No labs in this topic</span>
                </div>
              )}
            </div>
          )
        })}
        {unassignedLabs.length > 0 && (
          <div className="border border-border bg-bg-primary">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-bg-tertiary">
              <div>
                <h3 className="text-[13px] font-bold text-text-primary">All Labs</h3>
                <p className="text-[11px] text-text-secondary">Masomo yote</p>
              </div>
              <span className="text-[11px] text-accent-blue font-medium">{unassignedLabs.length} labs</span>
            </div>
            <div className="divide-y divide-border">
              {unassignedLabs.map((lab) => (
                <div key={lab.id} className="px-3 py-2 hover:bg-bg-secondary transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[12px] font-medium text-text-primary truncate">{lab.title}</h4>
                        {lab.is_premium && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-accent-purple/10 text-accent-purple font-medium">PRO</span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 font-medium ${lab.is_published ? 'bg-accent-green/10 text-accent-green' : 'bg-bg-tertiary text-text-secondary'}`}>
                          {lab.is_published ? 'LIVE' : 'DRAFT'}
                        </span>
                      </div>
                      {lab.description && (
                        <p className="text-[11px] text-text-secondary line-clamp-1">{lab.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-text-secondary">ID:</span>
                          <code className="text-[11px] font-mono text-accent-blue bg-bg-secondary px-1.5 py-0.5">{lab.id}</code>
                          <CopyButton text={lab.id} />
                        </div>
                        {lab.version && (
                          <span className="text-[11px] text-text-secondary">v{lab.version}</span>
                        )}
                        <span className="text-[11px] text-text-secondary">
                          {new Date(lab.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/developer/${params.subject}/${lab.id}`}
                        className="text-[11px] text-accent-blue underline whitespace-nowrap mt-1"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {topics.length === 0 && unassignedLabs.length === 0 && (
        <div className="text-center py-6">
          <p className="text-text-secondary">No topics found for this subject.</p>
        </div>
      )}
    </div>
  )
}
