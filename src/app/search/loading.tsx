export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="flex h-16 items-center justify-between border-b border-border-DEFAULT px-6">
        <div className="h-5 w-24 bg-bg-tertiary animate-pulse" />
        <div className="flex gap-6">
          <div className="h-4 w-16 bg-bg-tertiary animate-pulse" />
          <div className="h-4 w-16 bg-bg-tertiary animate-pulse" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-8 h-8 w-48 bg-bg-tertiary animate-pulse" />
        <div className="mb-6 h-12 w-full bg-bg-tertiary animate-pulse rounded-lg" />
        <div className="mb-2 h-4 w-32 bg-bg-tertiary animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-4 rounded-xl border border-border-DEFAULT bg-bg-secondary p-5">
            <div className="mb-2 h-5 w-40 bg-bg-tertiary animate-pulse" />
            <div className="mb-2 h-4 w-full bg-bg-tertiary animate-pulse" />
            <div className="h-4 w-2/3 bg-bg-tertiary animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
