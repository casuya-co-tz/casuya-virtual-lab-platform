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
        className={`p-4 bg-bg-secondary border border-border-DEFAULT transition-all duration-120 ease-out
          ${hover ? 'hover:border-border-strong hover:bg-bg-tertiary' : ''}
          ${selected ? 'border-accent-blue bg-bg-tertiary' : ''}
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
