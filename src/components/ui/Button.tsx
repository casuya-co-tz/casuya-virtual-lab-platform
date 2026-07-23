'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'disabled'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-md shadow-accent-blue/20 border border-transparent',
  secondary: 'bg-bg-secondary text-text-primary border border-border-strong hover:shadow-sm',
  danger: 'bg-gradient-to-r from-accent-red to-red-600 text-white shadow-md shadow-accent-red/20 border border-transparent',
  ghost: 'bg-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary',
  disabled: 'bg-bg-tertiary text-text-disabled border border-bg-tertiary pointer-events-none',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`flex items-center justify-center h-[40px] px-5 w-full sm:w-auto text-[14px] font-bold uppercase tracking-[0.5px] transition-all duration-300 ease-out 
          hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2
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
