import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'disabled'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent-blue text-white border-2 border-accent-blue',
  secondary: 'bg-transparent text-text-primary border-2 border-border-strong',
  danger: 'bg-accent-red text-white border-2 border-accent-red',
  ghost: 'bg-transparent text-text-secondary border-2 border-transparent',
  disabled: 'bg-bg-tertiary text-text-disabled border-2 border-bg-tertiary pointer-events-none',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`h-[clamp(36px,5vw,44px)] px-4 text-[14px] font-bold uppercase tracking-[0.5px] transition-all duration-120 ease-out 
          hover:brightness-110 active:brightness-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2
          ${variantClasses[variant]} ${loading ? 'relative text-transparent' : ''} ${className}`}
        disabled={variant === 'disabled' || loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-4 w-4 animate-pulse bg-bg-tertiary" />
          </span>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
