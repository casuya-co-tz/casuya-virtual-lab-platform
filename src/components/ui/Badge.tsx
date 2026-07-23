import { HTMLAttributes } from 'react'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-accent-green/20 text-accent-green border border-accent-green/30',
  warning: 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30',
  danger: 'bg-accent-red/20 text-accent-red border border-accent-red/30',
  info: 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30',
  neutral: 'bg-bg-tertiary text-text-secondary border border-border-default',
}

export function Badge({ variant = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center h-6 px-3 text-[11px] font-bold uppercase tracking-[1px] rounded-full
        ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
