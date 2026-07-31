export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-bg-primary px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-64 bg-bg-tertiary animate-pulse mb-4 mx-auto" />
        <div className="h-4 w-96 bg-bg-tertiary animate-pulse mb-10 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
