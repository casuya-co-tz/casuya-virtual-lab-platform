export default function TeacherLoading() {
  return (
    <div className="flex h-screen bg-bg-primary">
      <aside className="w-64 bg-bg-tertiary border-r border-border p-4 hidden md:block">
        <div className="h-10 w-10 bg-bg-secondary animate-pulse mb-8" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-bg-secondary animate-pulse mb-2" />
        ))}
      </aside>
      <main className="flex-1 p-6">
        <div className="h-8 w-48 bg-bg-tertiary animate-pulse mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-bg-tertiary animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-bg-tertiary animate-pulse" />
      </main>
    </div>
  )
}
