'use client'
import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-[12px] uppercase text-text-secondary tracking-[0.5px]">{label}</label>
        )}
        <select
          ref={ref}
          className={`rounded-xl h-[clamp(36px,5vw,40px)] px-3 bg-bg-secondary border border-border text-[14px] text-text-primary
            transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue ${className}`}
          {...props}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    )
  }
)
Select.displayName = 'Select'
