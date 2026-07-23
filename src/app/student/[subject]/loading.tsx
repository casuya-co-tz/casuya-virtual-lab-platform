export default function SubjectLoading() {
  return (
    <div>
      <div className="h-8 w-48 bg-bg-tertiary animate-pulse mb-2" />
      <div className="h-4 w-32 bg-bg-tertiary animate-pulse mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-bg-tertiary animate-pulse" />
        ))}
      </div>
    </div>
  )
}
