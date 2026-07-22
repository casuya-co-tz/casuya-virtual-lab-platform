import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default function DocsPage() {
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
