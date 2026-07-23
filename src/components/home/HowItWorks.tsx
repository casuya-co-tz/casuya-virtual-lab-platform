'use client'
import { useLanguage } from '@/hooks/useLanguage'

export function HowItWorks() {
  const { lang } = useLanguage()

  const steps = [
    { 
      number: '01', 
      title: 'Chagua Jaribio', 
      desc: 'Browse our NECTA-aligned catalog of physics, chemistry, and biology experiments.' 
    },
    { 
      number: '02', 
      title: 'Fanya kwa Vitendo', 
      desc: 'Interact with 3D models, mix chemicals, and observe scientific phenomena instantly.' 
    },
    { 
      number: '03', 
      title: 'Pata Matokeo', 
      desc: 'Submit your lab work and receive automated grading and instant feedback.' 
    },
  ]

  return (
    <section className="px-6 py-24 bg-bg-secondary border-b border-border-default">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[clamp(28px,5vw,40px)] font-extrabold text-text-primary tracking-tight">
            How It Works
          </h2>
          <p className="text-[16px] text-text-secondary mt-4 max-w-2xl mx-auto">
            A logical, step-by-step process to master your science practicals digitally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(step => (
            <div key={step.number} className="flex flex-col p-8 bg-bg-primary border border-border-strong relative h-full">
              <div className="text-[48px] font-mono font-black text-accent-blue/20 mb-4">{step.number}</div>
              <h3 className="text-[20px] font-bold text-text-primary mb-3 uppercase tracking-wide">{step.title}</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed mt-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
