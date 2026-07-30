import { query } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { maybeSync } from '@/lib/lab-sync'

interface Props {
  params: { subject: string }
}

interface LabRow {
  id: string
  title: string
  title_sw: string
}

interface TopicRow {
  id: string
  title: string
  title_sw: string
  subtopic_count: number
  lab_count: number
  labs: LabRow[] | null
}

export default async function SubjectPage({ params }: Props) {
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
            (SELECT json_agg(json_build_object('id', l.id, 'title', l.title, 'title_sw', l.title_sw) ORDER BY l.created_at)
             FROM labs l JOIN subtopics st3 ON st3.id = l.subtopic_id
             WHERE st3.topic_id = t.id AND l.is_published = true) AS labs
     FROM topics t
     WHERE t.subject_id = $1
     ORDER BY t.sort_order`,
    [subject.id]
  )

  const topics: TopicRow[] = topicsResult.rows

  const unassignedResult = await query(
    `SELECT id, title, title_sw FROM labs WHERE subject = $1 AND is_published = true AND subtopic_id IS NULL ORDER BY created_at`,
    [subject.name.toLowerCase()]
  )
  const unassignedLabs: LabRow[] = unassignedResult.rows

  return (
    <div className="px-1 py-2">
      <Link href="/student" className="text-[11px] text-accent-blue underline mb-1 block">&larr; Back</Link>
      <h1 className="text-[clamp(18px,4vw,28px)] font-bold text-text-primary mb-1">{subject.name}</h1>
      <p className="text-[12px] text-text-secondary mb-3">{subject.name_sw}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {topics.map((topic) => {
          const labList = topic.labs || []
          return (
            <div key={topic.id} className="border border-border bg-bg-primary p-2">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] sm:text-[14px] font-bold text-text-primary">{topic.title}</h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">{topic.title_sw}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <span className="text-[10px] sm:text-[11px] text-text-secondary">{topic.subtopic_count} subtopics</span>
                  <span className="text-[10px] sm:text-[11px] text-accent-blue">{topic.lab_count} labs</span>
                </div>
              </div>
              {labList.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {labList.map((lab) => (
                    <Link key={lab.id} href={`/student/${params.subject}/${lab.id}`} className="block text-[11px] text-accent-blue underline">
                      {lab.title}
                    </Link>
                  ))}
                </div>
              ) : (
                <span className="mt-2 inline-block text-[11px] text-text-disabled">No labs available</span>
              )}
            </div>
          )
        })}
      </div>
      {unassignedLabs.length > 0 && (
        <div className="mt-3 border border-border bg-bg-primary">
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
            <div>
              <h3 className="text-[13px] sm:text-[14px] font-bold text-text-primary">All Labs</h3>
              <p className="text-[10px] text-text-secondary">Masomo yote</p>
            </div>
            <span className="text-[10px] sm:text-[11px] text-accent-blue font-medium">{unassignedLabs.length} labs</span>
          </div>
          <div className="divide-y divide-border-DEFAULT">
            {unassignedLabs.map((lab) => (
              <Link key={lab.id} href={`/student/${params.subject}/${lab.id}`} className="flex items-center justify-between px-2 py-2 hover:bg-bg-secondary transition-colors">
                <span className="text-[12px] sm:text-[13px] font-medium text-text-primary">{lab.title}</span>
                <span className="text-[10px] sm:text-[11px] text-accent-blue shrink-0 ml-2">Open &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
