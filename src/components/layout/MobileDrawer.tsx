'use client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  userRole: 'student' | 'admin' | 'teacher' | 'developer'
}

export function MobileDrawer({ isOpen, onClose, userRole }: MobileDrawerProps) {
  const { lang } = useLanguage()
  const router = useRouter()

  if (!isOpen) return null

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    onClose()
    router.push('/')
    router.refresh()
  }

  const base = `/${userRole}`

  const studentItems = [
    { icon: '📊', label: t('nav.dashboard', lang), href: '/student' },
    { icon: '🔬', label: lang === 'sw' ? 'Fizikia' : 'Physics', href: `${base}/physics` },
    { icon: '🧪', label: lang === 'sw' ? 'Kemia' : 'Chemistry', href: `${base}/chemistry` },
    { icon: '🦠', label: lang === 'sw' ? 'Biolojia' : 'Biology', href: `${base}/biology` },
    { icon: '🔍', label: t('nav.search', lang), href: '/search' },
    { icon: '📝', label: lang === 'sw' ? 'Majaribio ya Zamani' : 'Past Papers', href: `${base}/past-papers` },
    { icon: '📈', label: lang === 'sw' ? 'Maendeleo' : 'Progress', href: `${base}/progress` },
    { icon: '💬', label: t('nav.reviews', lang), href: `${base}/reviews` },
    { icon: '💳', label: t('nav.pricing', lang), href: '/pricing' },
    { icon: '⚙️', label: t('nav.settings', lang), href: `${base}/settings` },
  ]

  const adminItems = [
    { icon: '📊', label: t('admin.dashboard', lang), href: '/admin' },
    { icon: '📚', label: t('admin.curriculum', lang), href: '/admin/curriculum' },
    { icon: '🧪', label: t('admin.labs', lang), href: '/admin/labs' },
    { icon: '👥', label: t('admin.users', lang), href: '/admin/users' },
    { icon: '💬', label: t('admin.reviews', lang), href: '/admin/reviews' },
    { icon: '🚩', label: t('admin.viewReports', lang), href: '/admin/reports' },
    { icon: '💳', label: t('admin.billing', lang), href: '/admin/billing' },
    { icon: '🔑', label: t('admin.apiKeys', lang), href: '/admin/api-keys' },
    { icon: '📄', label: t('admin.docs', lang), href: '/admin/docs' },
    { icon: '🔍', label: t('admin.audit', lang), href: '/admin/audit' },
    { icon: '📈', label: t('admin.analytics', lang), href: '/admin/analytics' },
    { icon: '🛠️', label: t('admin.support', lang), href: '/admin/support' },
    { icon: '⚙️', label: t('admin.settings', lang), href: '/admin/settings' },
  ]

  const teacherItems = [
    { icon: '📊', label: t('nav.dashboard', lang), href: '/teacher' },
    { icon: '👥', label: lang === 'sw' ? 'Madarasa' : 'Classrooms', href: '/teacher/classrooms' },
    { icon: '🔍', label: t('nav.search', lang), href: '/search' },
    { icon: '📝', label: lang === 'sw' ? 'Majaribio ya Zamani' : 'Past Papers', href: `${base}/past-papers` },
    { icon: '💬', label: t('nav.reviews', lang), href: `${base}/reviews` },
    { icon: '💳', label: t('nav.pricing', lang), href: '/pricing' },
    { icon: '⚙️', label: t('nav.settings', lang), href: `${base}/settings` },
  ]

  const developerItems = [
    { icon: '📊', label: t('nav.dashboard', lang), href: '/developer' },
    { icon: '🔬', label: lang === 'sw' ? 'Fizikia' : 'Physics', href: `${base}/physics` },
    { icon: '🧪', label: lang === 'sw' ? 'Kemia' : 'Chemistry', href: `${base}/chemistry` },
    { icon: '🦠', label: lang === 'sw' ? 'Biolojia' : 'Biology', href: `${base}/biology` },
    { icon: '💬', label: t('nav.reviews', lang), href: `${base}/reviews` },
    { icon: '📄', label: 'Docs', href: '/developer/docs' },
    { icon: '📈', label: lang === 'sw' ? 'Uchambuzi' : 'Analytics', href: '/developer/analytics' },
    { icon: '⚙️', label: t('nav.settings', lang), href: '/developer/settings' },
  ]

  const items = userRole === 'admin' ? adminItems : userRole === 'teacher' ? teacherItems : userRole === 'developer' ? developerItems : studentItems

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-72 bg-bg-tertiary border-r border-border-strong p-2 relative flex flex-col">
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

        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded border border-border-strong hover:bg-bg-secondary transition-all"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[14px] font-medium text-text-primary">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border-strong bg-bg-tertiary">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[13px] font-medium text-accent-red border border-accent-red/30 hover:bg-accent-red/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
