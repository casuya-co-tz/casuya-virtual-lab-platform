export function Features() {
  const features = [
    { title: 'SWAHILI NATIVE', desc: 'Full Swahili language support across the platform' },
    { title: 'OFFLINE READY', desc: 'Continue labs without internet, sync when reconnected' },
    { title: 'AZAMPESA', desc: 'Mobile money payments for premium lab access' },
    { title: 'NECTA ALIGNED', desc: 'Curriculum-matched simulations for Tanzanian exams' },
  ]

  return (
    <section className="px-6 py-24 bg-bg-secondary border-b border-border-default">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[clamp(28px,5vw,40px)] font-extrabold text-text-primary mb-12 text-center tracking-tight">
          BUILT FOR TANZANIA
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {features.map(f => (
            <div key={f.title} className="p-8 bg-bg-primary border border-border-strong text-center flex flex-col items-center">
              <h3 className="text-[16px] font-bold uppercase tracking-[0.5px] text-accent-blue mb-4">{f.title}</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
