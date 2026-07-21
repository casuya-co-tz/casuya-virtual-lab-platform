import { useState } from 'react'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  userRole: 'student' | 'admin'
}

export function MobileDrawer({ isOpen, onClose, userRole }: MobileDrawerProps) {
  if (!isOpen) return null

  const studentItems = [
    { icon: '📊', label: 'Dashboard', href: '/student' },
    { icon: '🔬', label: 'Physics', href: '/student/physics' },
    { icon: '🧪', label: 'Chemistry', href: '/student/chemistry' },
    { icon: '🦠', label: 'Biology', href: '/student/biology' },
    { icon: '⚙️', label: 'Settings', href: '/student/settings' },
  ]

  const adminItems = [
    { icon: '📊', label: 'Dashboard', href: '/admin' },
    { icon: '🧪', label: 'Labs', href: '/admin/labs' },
    { icon: '👥', label: 'Users', href: '/admin/users' },
    { icon: '💳', label: 'Billing', href: '/admin/billing' },
    { icon: '🔑', label: 'API Keys', href: '/admin/api-keys' },
    { icon: '📄', label: 'Docs', href: '/admin/docs' },
    { icon: '⚙️', label: 'Settings', href: '/admin/settings' },
  ]

  const items = userRole === 'student' ? studentItems : adminItems

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-72 bg-bg-tertiary border-r border-border-strong p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-blue/20 rounded flex items-center justify-center">
              <span className="text-accent-blue font-bold">CAS</span>
            </div>
            <span className="text-xl font-bold text-text-primary">Casuya</span>
          </div>
          <button onClick={onClose} className="p-2 rounded border border-border-strong hover:bg-bg-secondary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-1">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded border border-border-strong hover:bg-bg-secondary transition-all"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[14px] font-medium text-text-primary">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
