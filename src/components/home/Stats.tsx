export function Stats() {
  const stats = [
    { value: '500K+', label: 'STUDENTS' },
    { value: '150+', label: 'LABS' },
    { value: '99.9%', label: 'UPTIME' },
  ]

  return (
    <section className="px-6 py-12 max-w-6xl mx-auto">
      <div className="grid grid-cols-3 gap-8">
        {stats.map(s => (
          <div key={s.label} className="text-center">
            <p className="text-[clamp(24px,5vw,32px)] font-bold text-text-primary">{s.value}</p>
            <p className="text-[12px] uppercase tracking-[0.5px] text-text-secondary mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
