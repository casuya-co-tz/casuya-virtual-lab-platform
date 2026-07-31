'use client'
import { memo } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

export const HowItWorks = memo(function HowItWorks() {
  const { lang } = useLanguage()

  const steps = [
    {
      number: '01',
      title: lang === 'sw' ? 'Chagua Jaribio' : 'Choose Experiment',
      desc: lang === 'sw' ? 'Vinu vinapatikana vikiendana na mitihani ya NECTA ya Fizikia, Kemikalia na Biolojia.' : 'Browse our NECTA-aligned catalog of physics, chemistry, and biology experiments.',
    },
    {
      number: '02',
      title: lang === 'sw' ? 'Fanya kwa Vitendo' : 'Hands-On Practice',
      desc: lang === 'sw' ? 'Wasiliana na miundo ya 3D, changanya kemikali na uangalie matukio ya kisayansi mara moja.' : 'Interact with 3D models, mix chemicals, and observe scientific phenomena instantly.',
    },
    {
      number: '03',
      title: lang === 'sw' ? 'Pata Matokeo' : 'Get Results',
      desc: lang === 'sw' ? 'Wasilisha kazi yako ya maabara na upokee ukadiriaji wa moja kwa moja na mrejesho wa papo hapo.' : 'Submit your lab work and receive automated grading and instant feedback.',
    },
  ]

  return (
    <section className="px-4 sm:px-6 py-10 sm:py-20 lg:py-24 bg-bg-secondary border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="text-[clamp(22px,5vw,38px)] font-extrabold text-text-primary tracking-tight">
            {lang === 'sw' ? 'Jinsi Inavyofanya Kazi' : 'How It Works'}
          </h2>
          <p className="text-[13px] sm:text-[15px] text-text-secondary mt-3 max-w-2xl mx-auto">
            {lang === 'sw' ? 'Mchakato wa mantiki, hatua kwa hatua ili kujua vizuri masomo yako ya sayansi kwa mtandao.' : 'A logical, step-by-step process to master your science practicals digitally.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map(step => (
            <div key={step.number} className="flex flex-col p-5 sm:p-7 bg-bg-primary border border-border-strong relative h-full">
              <div className="text-[32px] sm:text-[44px] font-mono font-black text-accent-blue/20 mb-3">{step.number}</div>
              <h3 className="text-[16px] sm:text-[19px] font-bold text-text-primary mb-2 uppercase tracking-wide">{step.title}</h3>
              <p className="text-[13px] sm:text-[14px] text-text-secondary leading-relaxed mt-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})
