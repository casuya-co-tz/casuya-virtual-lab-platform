'use client'
import { memo } from 'react'

export const Features = memo(function Features() {
  const features = [
    { title: 'SWAHILI NATIVE', desc: 'Full Swahili language support across the platform' },
    { title: 'OFFLINE READY', desc: 'Continue labs without internet, sync when reconnected' },
    { title: 'AZAMPAY', desc: 'Mobile money payment merchant for premium access' },
    { title: 'NECTA ALIGNED', desc: 'Curriculum-matched simulations for Tanzanian exams' },
  ]

  return (
    <section className="relative px-4 sm:px-6 py-10 sm:py-20 lg:py-24 bg-bg-secondary border-b border-border mesh-gradient-bg overflow-hidden">
      <div className="glow-orb glow-orb-2" />
      <div className="grid-overlay" />
      <div className="noise-overlay" />
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[clamp(22px,5vw,38px)] font-extrabold text-text-primary mb-6 sm:mb-10 text-center tracking-tight">
          BUILT FOR TANZANIA
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {features.map(f => (
            <div key={f.title} className="p-4 sm:p-6 bg-bg-primary border border-border-strong text-center flex flex-col items-center">
              <h3 className="text-[13px] sm:text-[15px] font-bold uppercase tracking-wide text-accent-blue mb-2 sm:mb-3">{f.title}</h3>
              <p className="text-[12px] sm:text-[13px] text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})
