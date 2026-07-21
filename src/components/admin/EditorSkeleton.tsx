export function EditorSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-24 bg-bg-tertiary" />
        <div className="h-24 bg-bg-tertiary" />
      </div>
      <div className="h-24 bg-bg-tertiary" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-24 bg-bg-tertiary" />
        <div className="h-24 bg-bg-tertiary" />
      </div>
      <div className="h-64 bg-bg-tertiary" />
      <div className="h-11 w-32 bg-bg-tertiary" />
    </div>
  )
}
