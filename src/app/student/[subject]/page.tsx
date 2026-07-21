import { query } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: { subject: string }
}

export default async function SubjectPage({ params }: Props) {
  const subjectResult = await query(
    'SELECT id, name, name_sw FROM subjects WHERE LOWER(name) = $1',
    [params.subject.toLowerCase()]
  )
  if (subjectResult.rows.length === 0) notFound()
  const subject = subjectResult.rows[0]

  const topicsResult = await query(
    `SELECT t.id, t.title, t.title_sw,
            (SELECT COUNT(*) FROM subtopics st WHERE st.topic_id = t.id) AS subtopic_count,
            (SELECT COUNT(*) FROM labs l JOIN subtopics st2 ON st2.id = l.subtopic_id WHERE st2.topic_id = t.id AND l.is_published = true) AS lab_count
     FROM topics t
     WHERE t.subject_id = $1
     ORDER BY t.sort_order`,
    [subject.id]
  )

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2">{subject.name}</h1>
      <p className="text-[14px] text-text-secondary mb-6">{subject.name_sw}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topicsResult.rows.map((topic: { id: string; title: string; title_sw: string; subtopic_count: number; lab_count: number }) => (
          <Card key={topic.id} hover interactive>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-text-primary">{topic.title}</h3>
                <p className="text-[12px] text-text-secondary mt-1">{topic.title_sw}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="neutral">{topic.subtopic_count} topics</Badge>
                <Badge variant="info">{topic.lab_count} labs</Badge>
              </div>
            </div>
            <Link
              href={`/student/${params.subject}/${topic.id}`}
              className="mt-4 inline-block text-[12px] text-accent-blue underline"
            >
              View labs
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
