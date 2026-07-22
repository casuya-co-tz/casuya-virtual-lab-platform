import { Card } from '@/components/ui/Card'

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-[clamp(20px,4vw,32px)] font-bold text-text-primary mb-2">Contact</h1>
      <p className="text-[14px] text-text-secondary mb-8">
        Reach the Casuya support team for product questions, onboarding help, and classroom support.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-[18px] font-bold text-text-primary mb-2">Support Email</h2>
          <p className="text-[14px] text-text-secondary mb-3">
            For general assistance, classroom setup, and platform questions.
          </p>
          <a href="mailto:support@casuya.com" className="text-accent-blue underline text-[14px]">
            support@casuya.com
          </a>
        </Card>

        <Card>
          <h2 className="text-[18px] font-bold text-text-primary mb-2">Developer Docs</h2>
          <p className="text-[14px] text-text-secondary mb-3">
            Browse API guides, integration steps, and platform reference material.
          </p>
          <a href="/developer/docs" className="text-accent-blue underline text-[14px]">
            Open developer documentation
          </a>
        </Card>
      </div>
    </div>
  )
}
