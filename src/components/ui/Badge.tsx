import { HTMLAttributes } from 'react'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-accent-green text-white',
  warning: 'bg-accent-amber text-black',
  danger: 'bg-accent-red text-white',
  info: 'bg-accent-blue text-white',
  neutral: 'bg-bg-tertiary text-text-secondary',
}

export function Badge({ variant = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center h-6 px-2 text-[11px] font-bold uppercase tracking-[1px]
        ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
