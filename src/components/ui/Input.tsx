'use client'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-[12px] uppercase text-text-secondary tracking-[0.5px]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`rounded-xl h-[clamp(36px,5vw,40px)] px-3 bg-bg-secondary border text-[14px] text-text-primary
            placeholder:text-text-disabled transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue
            ${error ? 'border-accent-red' : 'border-border-strong'}
            ${props.disabled ? 'bg-bg-tertiary text-text-disabled' : ''}
            ${className}`}
          {...props}
        />
        {error && (
          <span className="text-[12px] text-accent-red">{error}</span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
