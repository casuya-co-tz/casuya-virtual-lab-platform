export function LabSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-64 bg-bg-tertiary" />
          <div className="h-4 w-96 bg-bg-tertiary" />
        </div>
        <div className="h-6 w-24 bg-bg-tertiary" />
      </div>
      <div className="h-[500px] bg-bg-tertiary" />
      <div className="flex gap-3">
        <div className="h-11 w-32 bg-bg-tertiary" />
        <div className="h-11 w-32 bg-bg-tertiary" />
      </div>
    </div>
  )
}
