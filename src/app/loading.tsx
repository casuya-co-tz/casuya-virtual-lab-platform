export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="h-8 w-64 bg-bg-tertiary animate-pulse" />
      <div className="h-4 w-96 bg-bg-tertiary animate-pulse" />
      <div className="grid grid-cols-3 gap-4 mt-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 bg-bg-tertiary animate-pulse" />
        ))}
      </div>
    </div>
  )
}
