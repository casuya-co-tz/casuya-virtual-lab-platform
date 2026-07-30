'use client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useLanguage } from '@/hooks/useLanguage'

export default function DocsPage() {
  const { lang } = useLanguage()

  if (lang === 'sw') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
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
              <li>Angalia karatasi za mitihani ya zamani</li>
              <li>Jiunge na madirisha ya madarasa kwa msimbo wa darasa</li>
              <li>Sasisha wasifu wako na badilisha nenosiri</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-[18px] font-bold text-text-primary mb-3">Kwa Waalimu</h2>
            <p className="text-[14px] text-text-secondary mb-3">
              Dashibodi ya mwalimu inakupa ufikiaji wa maendeleo ya wanafunzi wako na zana za usimamizi wa darasa.
            </p>
            <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
              <li>Fuatilia maendeleo ya wanafunzi wako kwa maabara zote</li>
              <li>Angalia alama za wastani na viwango vya kukamilisha</li>
              <li>Unda madirasa na uwape wanafunzi msimbo wa kujiunga</li>
              <li>Simamia uanachama wa darasa la elimu</li>
              <li>Pata viungo vya ualikaji kwa shule yako</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-[18px] font-bold text-text-primary mb-3">Kwa Taasisi (Shule)</h2>
            <p className="text-[14px] text-text-secondary mb-3">
              Viwango vya ushuru vinaleta zana za hali ya juu kwa taasisi na shule.
            </p>
            <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
              <li>Upatikanaji wa maabara yote ya mtandaoni</li>
              <li>Usimamizi wa wanafunzi wote wa shule</li>
              <li>Taarifa za analytics za shule nzima</li>
              <li>Saizi ya kikomo cha hifadhi ya 5GB</li>
              <li>Msaada wa kipaumbele</li>
              <li>Ufikiaji wa mtandaoni nje ya mtandao</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-[18px] font-bold text-text-primary mb-3">Msaada na Tegemeo</h2>
            <p className="text-[14px] text-text-secondary mb-3">
              Tukio lolote la matatizo? Tuma tikiti ya msaada kupitia jukwaa.
            </p>
            <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
              <li>Unda tikiti na kichwa, maelezo, na kiwango cha kipaumbele</li>
              <li>Wasiliana na timu yetu kupitia ujumbe wa ndani</li>
              <li>Fuatilia hali ya tikiti yako</li>
              <li>Viwango vya kipaumbele: chini, kawaida, juu, ya haraka</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-[18px] font-bold text-text-primary mb-3">Bei na Usajili</h2>
            <p className="text-[14px] text-text-secondary mb-3">
              Chagua kiwango kinachofaa kwa mahitaji yako.
            </p>
            <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
              <li><strong>Bure:</strong> Maabara ya msingi, maendeleo ya kikomo</li>
              <li><strong>Premium:</strong> Maabara zote, mtandaoni nje ya mtandao, karatasi za mitihani</li>
              <li><strong>Taasisi:</strong> Upatikanaji wa shule nzima, analytics, msaada wa kipaumbele</li>
              <li>Lipa kwa AzamPesa, M-Pesa, au TigoPesa</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-[18px] font-bold text-text-primary mb-3">Hali ya Mfumo</h2>
            <p className="text-[14px] text-text-secondary mb-3">
              Angalia hali ya huduma za mfumo kwa wakati halisi.
            </p>
            <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
              <li><a href="/status" className="text-accent-blue underline">/status</a> - Hali ya mfumo na matukio</li>
              <li>Angalia viwango vya muda wote na hali ya API</li>
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
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="success">GET</Badge>
              <code className="text-[14px] font-mono text-text-primary">/api/v1/search?q=...</code>
            </div>
            <p className="text-[14px] text-text-secondary mb-3">Tafuta maabara kwa jina au mada.</p>
            <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1 mt-3">
              <li>Usajili na usimamizi wa ufikiaji wa API</li>
              <li>Viwango vya ombi kwa kiwango cha usajili</li>
              <li>Ufuatiliaji wa matumizi na uchambuzi</li>
              <li>Vyombo vya webhook kwa matukio ya maabara</li>
            </ul>
            <p className="text-[14px] text-text-secondary mt-4">
              Tazama <a href="/developer/docs" className="text-accent-blue underline">nyaraka kamili za API</a> kwa maelezo zaidi.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
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
            Once logged in, access all available labs through the student dashboard.
            Each lab includes interactive Three.js simulations, step-by-step instructions, and assessment questions.
          </p>
          <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
            <li>Track completion progress per subject</li>
            <li>View detailed results and feedback</li>
            <li>Practice at your own pace</li>
            <li>Browse and practice past exam papers (NECTA, JKT, etc.)</li>
            <li>Join classrooms using a class code from your teacher</li>
            <li>View progress overview with stats and recent activity</li>
            <li>Manage your profile, password, and language preferences</li>
            <li>Work offline with cached lab data</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-[18px] font-bold text-text-primary mb-3">For Teachers</h2>
          <p className="text-[14px] text-text-secondary mb-3">
            The teacher dashboard gives you visibility into student performance and classroom management tools.
          </p>
          <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
            <li>Monitor student progress across all labs</li>
            <li>View average scores and completion rates</li>
            <li>Create classrooms and invite students with a class code</li>
            <li>Manage classroom enrollment (add/remove students)</li>
            <li>Track recent lab activity for your students</li>
            <li>Generate school-scoped invite links</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-[18px] font-bold text-text-primary mb-3">For Institutions</h2>
          <p className="text-[14px] text-text-secondary mb-3">
            Institution-tier plans bring powerful tools for schools and organizations managing many students.
          </p>
          <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
            <li>Full access to all labs and simulations</li>
            <li>School-wide student management</li>
            <li>Organization-level analytics and reporting</li>
            <li>5GB storage limit for custom content</li>
            <li>Priority support</li>
            <li>Offline access to labs</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-[18px] font-bold text-text-primary mb-3">Support</h2>
          <p className="text-[14px] text-text-secondary mb-3">
            Running into issues? Submit a support ticket directly through the platform.
          </p>
          <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
            <li>Create tickets with subject, description, and priority level</li>
            <li>Communicate with our team via in-ticket messaging</li>
            <li>Track your ticket status (open / in progress / resolved)</li>
            <li>Priority levels: low, normal, high, urgent</li>
            <li><a href="/support" className="text-accent-blue underline">Open Support Center</a></li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-[18px] font-bold text-text-primary mb-3">Pricing &amp; Subscriptions</h2>
          <p className="text-[14px] text-text-secondary mb-3">
            Choose the plan that fits your needs. Pay via AzamPesa, M-Pesa, or TigoPesa.
          </p>
          <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
            <li><strong>Free:</strong> Basic labs, limited progress tracking</li>
            <li><strong>Premium:</strong> All labs, offline access, past exam papers, analytics</li>
            <li><strong>Institution:</strong> School-wide access, reporting, priority support</li>
            <li><strong>Developer:</strong> API access, webhooks, usage analytics</li>
            <li>Upgrade, manage, or cancel your subscription from <a href="/pricing" className="text-accent-blue underline">/pricing</a></li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-[18px] font-bold text-text-primary mb-3">System Status</h2>
          <p className="text-[14px] text-text-secondary mb-3">
            Check the real-time health of platform services.
          </p>
          <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1">
            <li><a href="/status" className="text-accent-blue underline">/status</a> &mdash; System status and incident history</li>
            <li>View uptime, API health, and database connectivity</li>
            <li>Track past and ongoing incidents with severity levels</li>
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
          <p className="text-[14px] text-text-secondary mb-3">List all published labs (with subject filter, pagination).</p>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="success">GET</Badge>
            <code className="text-[14px] font-mono text-text-primary">/api/v1/labs/:id</code>
          </div>
          <p className="text-[14px] text-text-secondary mb-3">Get a single lab by ID.</p>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="success">GET</Badge>
            <code className="text-[14px] font-mono text-text-primary">/api/v1/subjects</code>
          </div>
          <p className="text-[14px] text-text-secondary mb-3">List all subjects with topics.</p>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="success">GET</Badge>
            <code className="text-[14px] font-mono text-text-primary">/api/v1/search?q=...</code>
          </div>
          <p className="text-[14px] text-text-secondary mb-3">Full-text search across labs.</p>
          <ul className="text-[14px] text-text-secondary list-disc pl-5 space-y-1 mt-3">
            <li>Register as a developer and generate API keys</li>
            <li>Rate limits based on your subscription tier</li>
            <li>Usage analytics and export (CSV/JSON)</li>
            <li>Webhook integrations for lab events (created/updated)</li>
          </ul>
          <p className="text-[14px] text-text-secondary mt-4">
            See the <a href="/developer/docs" className="text-accent-blue underline">full API documentation</a> for details.
          </p>
        </Card>
      </div>
    </div>
  )
}
