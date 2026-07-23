'use client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useLanguage } from '@/hooks/useLanguage'

export default function DocsPage() {
  const { lang } = useLanguage()

  if (lang === 'sw') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-[clamp(20px,4vw,32px)] font-bold text-text-primary mb-2">Nyaraka</h1>
        <p className="text-[14px] text-text-secondary mb-8">Jifunze jinsi ya kutumia jukwaa la Maabara ya Mtandaoni ya Casuya.</p>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="text-[18px] font-bold text-text-primary mb-3">Kuanza</h2>
            <p className="text-[14px] text-text-secondary mb-3">
              Casuya inatoa majaribio ya sayansi yanayofuata mitaala ya NECTA kwa shule za sekondari za Tanzania.
              Vinjari masomo, anza maabara za mtandaoni, na ufuatilie maendeleo yako.
            </p>
            <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
              <li>Unda akaunti au ingia ili kufuatilia maendeleo yako</li>
              <li>Chagua somo (Fizikia, Kemia, au Biolojia)</li>
              <li>Chagua mada na anza jaribio la maabara</li>
              <li>Kamilisha shughuli za maabara na ukague matokeo yako</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-[18px] font-bold text-text-primary mb-3">Kwa Wanafunzi</h2>
            <p className="text-[14px] text-text-secondary mb-3">
              Baada ya kuingia, unaweza kufikia maabara zote zinazopatikana kupitia dashibodi ya mwanafunzi.
              Kila maabara inajumuisha uigaji shirikishi, maelekezo ya hatua kwa hatua, na maswali ya tathmini.
            </p>
            <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
              <li>Fuatilia maendeleo ya kukamilisha kwa kila somo</li>
              <li>Tazama matokeo ya kina na maoni</li>
              <li>Fanya mazoezi kwa kasi yako mwenyewe</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-[18px] font-bold text-text-primary mb-3">Kwa Wasanidi Programu</h2>
            <p className="text-[14px] text-text-secondary mb-3">
              Fikia data ya maabara kupitia REST API.
            </p>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="success">GET</Badge>
              <code className="text-[14px] font-mono text-text-primary">/api/v1/labs</code>
            </div>
            <p className="text-[14px] text-text-secondary mb-3">Orodhesha maabara zote zilizotolewa.</p>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="success">GET</Badge>
              <code className="text-[14px] font-mono text-text-primary">/api/v1/subjects</code>
            </div>
            <p className="text-[14px] text-text-secondary mb-3">Orodhesha masomo yote na mada zake.</p>
            <p className="text-[14px] text-text-secondary mt-4">
              Tazama <a href="/developer/docs" className="text-accent-blue underline">nyaraka kamili za API</a> kwa maelezo zaidi.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-[clamp(20px,4vw,32px)] font-bold text-text-primary mb-2">Documentation</h1>
      <p className="text-[14px] text-text-secondary mb-8">Learn how to use the Casuya Virtual Laboratory platform.</p>

      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="text-[18px] font-bold text-text-primary mb-3">Getting Started</h2>
          <p className="text-[14px] text-text-secondary mb-3">
            Casuya provides NECTA-aligned science simulations for Tanzanian secondary schools.
            Browse subjects, launch interactive labs, and track your progress.
          </p>
          <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
            <li>Create an account or log in to track your progress</li>
            <li>Select a subject (Physics, Chemistry, or Biology)</li>
            <li>Choose a topic and launch a lab simulation</li>
            <li>Complete lab activities and review your results</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-[18px] font-bold text-text-primary mb-3">For Students</h2>
          <p className="text-[14px] text-text-secondary mb-3">
            Once logged in, you can access all available labs through the student dashboard.
            Each lab includes interactive simulations, step-by-step instructions, and assessment questions.
          </p>
          <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
            <li>Track completion progress per subject</li>
            <li>View detailed results and feedback</li>
            <li>Practice at your own pace</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-[18px] font-bold text-text-primary mb-3">For Developers</h2>
          <p className="text-[14px] text-text-secondary mb-3">
            Access lab data programmatically via the REST API.
          </p>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="success">GET</Badge>
            <code className="text-[14px] font-mono text-text-primary">/api/v1/labs</code>
          </div>
          <p className="text-[14px] text-text-secondary mb-3">List all published labs.</p>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="success">GET</Badge>
            <code className="text-[14px] font-mono text-text-primary">/api/v1/subjects</code>
          </div>
          <p className="text-[14px] text-text-secondary mb-3">List all subjects with topics.</p>
          <p className="text-[14px] text-text-secondary mt-4">
            See the <a href="/developer/docs" className="text-accent-blue underline">full API documentation</a> for details.
          </p>
        </Card>
      </div>
    </div>
  )
}
