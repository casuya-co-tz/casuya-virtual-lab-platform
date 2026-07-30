'use client'
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  selected?: boolean
  interactive?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover, selected, interactive, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-2 sm:p-4 md:p-5 bg-bg-primary border border-border rounded-2xl shadow-sm transition-all duration-300 ease-out
          ${hover ? 'hover:border-border-strong hover:shadow-md hover:-translate-y-1' : ''}
          ${selected ? 'border-accent-blue ring-1 ring-accent-blue/50' : ''}
          ${interactive ? 'cursor-pointer' : ''}
          ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'
