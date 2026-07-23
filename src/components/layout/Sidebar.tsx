'use client'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

interface SidebarProps {
  userRole?: 'student' | 'admin'
}

export function Sidebar({ userRole: overrideRole }: SidebarProps) {
  const pathname = usePathname()
  const { lang } = useLanguage()
  const userRole = overrideRole || (pathname.startsWith('/admin') ? 'admin' : 'student')

  const subjectItems = [
    { icon: '🔬', label: lang === 'sw' ? 'Fizikia' : 'Physics', href: '/student/physics', active: pathname.startsWith('/student/physics') },
    { icon: '🧪', label: lang === 'sw' ? 'Kemia' : 'Chemistry', href: '/student/chemistry', active: pathname.startsWith('/student/chemistry') },
    { icon: '🦠', label: lang === 'sw' ? 'Biolojia' : 'Biology', href: '/student/biology', active: pathname.startsWith('/student/biology') },
  ]

  const studentItems = [
    { icon: '📊', label: t('nav.dashboard', lang), href: '/student', active: pathname === '/student' },
    ...subjectItems,
    { icon: '⚙️', label: t('nav.settings', lang), href: '/student/settings', active: pathname === '/student/settings' },
  ]

  const adminItems = [
    { icon: '📊', label: t('admin.dashboard', lang), href: '/admin', active: pathname === '/admin' },
    { icon: '📚', label: t('admin.curriculum', lang), href: '/admin/curriculum', active: pathname.startsWith('/admin/curriculum') },
    { icon: '🧪', label: t('admin.labs', lang), href: '/admin/labs', active: pathname.startsWith('/admin/labs') },
    { icon: '👥', label: t('admin.users', lang), href: '/admin/users', active: pathname === '/admin/users' },
    { icon: '💳', label: t('admin.billing', lang), href: '/admin/billing', active: pathname === '/admin/billing' },
    { icon: '🔑', label: t('admin.apiKeys', lang), href: '/admin/api-keys', active: pathname === '/admin/api-keys' },
    { icon: '📄', label: t('admin.docs', lang), href: '/admin/docs', active: pathname === '/admin/docs' },
    { icon: '🔍', label: t('admin.audit', lang), href: '/admin/audit', active: pathname === '/admin/audit' },
    { icon: '📈', label: t('admin.analytics', lang), href: '/admin/analytics', active: pathname === '/admin/analytics' },
    { icon: '⚙️', label: t('admin.settings', lang), href: '/admin/settings', active: pathname === '/admin/settings' },
  ]

  const items = userRole === 'student' ? studentItems : adminItems

  return (
    <aside className="w-64 bg-bg-tertiary flex flex-col border-r border-border-strong hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-accent-blue/20 flex items-center justify-center">
            <span className="text-accent-blue font-bold">CAS</span>
          </div>
          <span className="text-xl font-bold text-text-primary">Casuya</span>
        </div>

        <nav className="space-y-1">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 border transition-all ${
                item.active
                  ? 'bg-bg-secondary text-text-primary border-accent-blue'
                  : 'border-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[14px] font-medium">{item.label}</span>
              {item.active && (
                <div className="ml-auto w-1.5 h-1.5 bg-accent-blue" />
              )}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}
