import { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number
}

export function Skeleton({ lines = 1, className = '', ...props }: SkeletonProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-bg-tertiary animate-pulse" />
      ))}
    </div>
  )
}
