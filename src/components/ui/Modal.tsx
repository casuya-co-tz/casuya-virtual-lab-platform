'use client'
import { HTMLAttributes, memo, useEffect, useRef } from 'react'

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
  title?: string
}

export const Modal = memo(function Modal({ open, onClose, onConfirm, title, className = '', children, ...props }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className={`bg-bg-secondary border-2 border-border-strong w-[min(90vw,800px)] max-h-[90vh] overflow-y-auto ${className}`}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
            <h2 className="text-[16px] font-bold text-text-primary">{title}</h2>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary text-[20px] leading-none">x</button>
          </div>
        )}
        <div className="px-4 sm:px-6 py-4">{children}</div>
        <div className="flex justify-end gap-2 px-4 sm:px-6 py-4 bg-bg-tertiary border-t border-border">
          <button onClick={onClose} className="h-10 px-4 text-[14px] text-text-secondary border border-border-strong">Cancel</button>
          <button onClick={onConfirm || onClose} className="h-10 px-4 text-[14px] text-white bg-accent-blue border border-accent-blue">Confirm</button>
        </div>
      </div>
    </div>
  )
})
