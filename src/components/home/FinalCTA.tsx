'use client'
import { Button } from '@/components/ui/Button'

export function FinalCTA() {
  return (
    <section className="px-4 sm:px-6 py-10 sm:py-20 lg:py-24 bg-bg-primary border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center p-5 sm:p-10 lg:p-12 bg-bg-secondary border border-border-strong">
          <h2 className="text-[clamp(22px,5vw,44px)] font-extrabold text-text-primary tracking-tight mb-4 sm:mb-6 max-w-3xl">
            Ready to Transform Your Science Education?
          </h2>
          <p className="text-[14px] sm:text-[17px] text-text-secondary mb-6 sm:mb-8 max-w-2xl leading-relaxed">
            Join Tanzanian students, teachers, schools and developers who have already revolutionized their learning experience with Casuya Virtual Labs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a href="/auth">
              <Button variant="primary" className="!h-11 sm:!h-14 !px-6 sm:!px-10 text-[14px] sm:text-[15px] w-full sm:w-auto">
                Create Free Account
              </Button>
            </a>
            <a href="/contact">
              <Button variant="secondary" className="!h-11 sm:!h-14 !px-6 sm:!px-10 text-[14px] sm:text-[15px] w-full sm:w-auto">
                Contact Sales for Schools
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
