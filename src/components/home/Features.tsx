export function Features() {
  const features = [
    { title: 'SWAHILI NATIVE', desc: 'Full Swahili language support across the platform' },
    { title: 'OFFLINE READY', desc: 'Continue labs without internet, sync when reconnected' },
    { title: 'M-PESA PAYMENTS', desc: 'Mobile money payments for premium lab access' },
    { title: 'NECTA ALIGNED', desc: 'Curriculum-matched simulations for Tanzanian exams' },
  ]

  return (
    <section className="px-6 py-12 bg-bg-secondary border-y border-border-DEFAULT">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-[clamp(20px,4vw,32px)] font-bold text-text-primary mb-8 text-center">
          BUILT FOR TANZANIA
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(f => (
            <div key={f.title} className="p-4 bg-bg-primary border border-border-DEFAULT text-center">
              <h3 className="text-[14px] font-bold uppercase tracking-[0.5px] text-text-primary">{f.title}</h3>
              <p className="text-[12px] text-text-secondary mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
