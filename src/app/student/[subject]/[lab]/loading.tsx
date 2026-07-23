export default function LabLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-bg-tertiary animate-pulse mb-2" />
          <div className="h-4 w-24 bg-bg-tertiary animate-pulse" />
        </div>
        <div className="h-6 w-20 bg-bg-tertiary animate-pulse" />
      </div>
      <div className="flex gap-4 mb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-24 bg-bg-tertiary animate-pulse" />
        ))}
      </div>
      <div className="h-[60vh] max-h-[500px] bg-bg-tertiary animate-pulse" />
      <div className="flex gap-3">
        <div className="h-12 w-32 bg-bg-tertiary animate-pulse" />
        <div className="h-12 w-36 bg-bg-tertiary animate-pulse" />
      </div>
    </div>
  )
}
