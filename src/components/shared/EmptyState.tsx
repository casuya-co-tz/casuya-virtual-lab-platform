interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  title = 'No data found',
  description = 'There are no items to display yet.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border border-border-DEFAULT bg-bg-secondary">
      <p className="text-[18px] font-bold text-text-primary">{title}</p>
      <p className="text-[14px] text-text-secondary mt-2 max-w-sm text-center">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
