'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function FinalCTA() {
  const router = useRouter()

  return (
    <section className="px-6 py-24 bg-bg-primary border-b border-border-default">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center p-12 bg-bg-secondary border border-border-strong">
          <h2 className="text-[clamp(32px,5vw,48px)] font-extrabold text-text-primary tracking-tight mb-6 max-w-3xl">
            Ready to Transform Your Science Education?
          </h2>
          <p className="text-[18px] text-text-secondary mb-10 max-w-2xl leading-relaxed">
            Join thousands of Tanzanian students and teachers who have already revolutionized their learning experience with Casuya Virtual Labs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button variant="primary" className="!h-[56px] !px-10 text-[16px] w-full sm:w-auto" onClick={() => router.push('/auth')}>
              Create Free Account
            </Button>
            <Button variant="secondary" className="!h-[56px] !px-10 text-[16px] w-full sm:w-auto" onClick={() => router.push('/contact')}>
              Contact Sales for Schools
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
