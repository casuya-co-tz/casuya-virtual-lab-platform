export default function StudentLoading() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="flex h-16 items-center justify-between border-b border-border-DEFAULT px-6">
        <div className="h-5 w-24 bg-bg-tertiary animate-pulse" />
        <div className="flex gap-6">
          <div className="h-4 w-16 bg-bg-tertiary animate-pulse" />
          <div className="h-4 w-16 bg-bg-tertiary animate-pulse" />
          <div className="h-4 w-16 bg-bg-tertiary animate-pulse" />
        </div>
      </div>
      <div className="p-6">
        <div className="mb-6 h-8 w-48 bg-bg-tertiary animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-DEFAULT bg-bg-secondary p-6">
              <div className="mb-3 h-5 w-32 bg-bg-tertiary animate-pulse" />
              <div className="mb-2 h-4 w-full bg-bg-tertiary animate-pulse" />
              <div className="mb-4 h-4 w-2/3 bg-bg-tertiary animate-pulse" />
              <div className="flex gap-3">
                <div className="h-8 w-24 bg-bg-tertiary animate-pulse rounded" />
                <div className="h-8 w-20 bg-bg-tertiary animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
