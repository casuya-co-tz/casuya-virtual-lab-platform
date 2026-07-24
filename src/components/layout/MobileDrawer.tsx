'use client'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  userRole: 'student' | 'admin' | 'teacher'
}

export function MobileDrawer({ isOpen, onClose, userRole }: MobileDrawerProps) {
  const { lang } = useLanguage()

  if (!isOpen) return null

  const studentItems = [
    { icon: '📊', label: t('nav.dashboard', lang), href: '/student' },
    { icon: '🔬', label: lang === 'sw' ? 'Fizikia' : 'Physics', href: '/student/physics' },
    { icon: '🧪', label: lang === 'sw' ? 'Kemia' : 'Chemistry', href: '/student/chemistry' },
    { icon: '🦠', label: lang === 'sw' ? 'Biolojia' : 'Biology', href: '/student/biology' },
    { icon: '💳', label: t('nav.pricing', lang), href: '/pricing' },
    { icon: '⚙️', label: t('nav.settings', lang), href: '/student/settings' },
  ]

  const adminItems = [
    { icon: '📊', label: t('admin.dashboard', lang), href: '/admin' },
    { icon: '🧪', label: t('admin.labs', lang), href: '/admin/labs' },
    { icon: '👥', label: t('admin.users', lang), href: '/admin/users' },
    { icon: '💬', label: t('admin.reviews', lang), href: '/admin/reviews' },
    { icon: '🚩', label: t('admin.viewReports', lang), href: '/admin/reports' },
    { icon: '💳', label: t('admin.billing', lang), href: '/admin/billing' },
    { icon: '🔑', label: t('admin.apiKeys', lang), href: '/admin/api-keys' },
    { icon: '📄', label: t('admin.docs', lang), href: '/admin/docs' },
    { icon: '🔍', label: t('admin.audit', lang), href: '/admin/audit' },
    { icon: '📈', label: t('admin.analytics', lang), href: '/admin/analytics' },
    { icon: '⚙️', label: t('admin.settings', lang), href: '/admin/settings' },
  ]

  const teacherItems = [
    { icon: '📊', label: t('nav.dashboard', lang), href: '/teacher' },
    { icon: '🔬', label: lang === 'sw' ? 'Fizikia' : 'Physics', href: '/student/physics' },
    { icon: '🧪', label: lang === 'sw' ? 'Kemia' : 'Chemistry', href: '/student/chemistry' },
    { icon: '🦠', label: lang === 'sw' ? 'Biolojia' : 'Biology', href: '/student/biology' },
    { icon: '💳', label: t('nav.pricing', lang), href: '/pricing' },
    { icon: '⚙️', label: t('nav.settings', lang), href: '/student/settings' },
  ]

  const items = userRole === 'admin' ? adminItems : userRole === 'teacher' ? teacherItems : studentItems

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
