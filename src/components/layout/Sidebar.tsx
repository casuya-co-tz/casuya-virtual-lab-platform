'use client'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

interface SidebarProps {
  userRole?: 'student' | 'admin' | 'teacher' | 'developer'
}

export function Sidebar({ userRole: overrideRole }: SidebarProps) {
  const pathname = usePathname()
  const { lang } = useLanguage()
  const userRole = overrideRole || (pathname.startsWith('/admin') ? 'admin' : pathname.startsWith('/teacher') ? 'teacher' : pathname.startsWith('/developer') ? 'developer' : 'student')

  const base = `/${userRole}`

  const subjectItems = [
    { icon: '🔬', label: lang === 'sw' ? 'Fizikia' : 'Physics', href: `${base}/physics`, active: pathname.startsWith(`${base}/physics`) },
    { icon: '🧪', label: lang === 'sw' ? 'Kemia' : 'Chemistry', href: `${base}/chemistry`, active: pathname.startsWith(`${base}/chemistry`) },
    { icon: '🦠', label: lang === 'sw' ? 'Biolojia' : 'Biology', href: `${base}/biology`, active: pathname.startsWith(`${base}/biology`) },
  ]

  const studentItems = [
    { icon: '📊', label: t('nav.dashboard', lang), href: '/student', active: pathname === '/student' },
    ...subjectItems,
    { icon: '🔍', label: t('nav.search', lang), href: '/search', active: pathname === '/search' },
    { icon: '📝', label: lang === 'sw' ? 'Majaribio ya Zamani' : 'Past Papers', href: '/student/past-papers', active: pathname === '/student/past-papers' },
    { icon: '📈', label: lang === 'sw' ? 'Maendeleo' : 'Progress', href: '/student/progress', active: pathname === '/student/progress' },
    { icon: '💳', label: t('nav.pricing', lang), href: '/pricing', active: pathname === '/pricing' },
    { icon: '⚙️', label: t('nav.settings', lang), href: '/student/settings', active: pathname === '/student/settings' },
  ]

  const adminItems = [
    { icon: '📊', label: t('admin.dashboard', lang), href: '/admin', active: pathname === '/admin' },
    { icon: '📚', label: t('admin.curriculum', lang), href: '/admin/curriculum', active: pathname.startsWith('/admin/curriculum') },
    { icon: '🧪', label: t('admin.labs', lang), href: '/admin/labs', active: pathname.startsWith('/admin/labs') },
    { icon: '👥', label: t('admin.users', lang), href: '/admin/users', active: pathname === '/admin/users' },
    { icon: '💬', label: t('admin.reviews', lang), href: '/admin/reviews', active: pathname === '/admin/reviews' },
    { icon: '🚩', label: t('admin.viewReports', lang), href: '/admin/reports', active: pathname === '/admin/reports' },
    { icon: '💳', label: t('admin.billing', lang), href: '/admin/billing', active: pathname === '/admin/billing' },
    { icon: '🔑', label: t('admin.apiKeys', lang), href: '/admin/api-keys', active: pathname === '/admin/api-keys' },
    { icon: '📄', label: t('admin.docs', lang), href: '/admin/docs', active: pathname === '/admin/docs' },
    { icon: '🔍', label: t('admin.audit', lang), href: '/admin/audit', active: pathname === '/admin/audit' },
    { icon: '📈', label: t('admin.analytics', lang), href: '/admin/analytics', active: pathname === '/admin/analytics' },
    { icon: '📝', label: t('admin.pastPapers', lang), href: '/admin/past-papers', active: pathname === '/admin/past-papers' },
    { icon: '🛠️', label: t('admin.support', lang), href: '/admin/support', active: pathname === '/admin/support' },
    { icon: '⚙️', label: t('admin.settings', lang), href: '/admin/settings', active: pathname === '/admin/settings' },
  ]

  const teacherItems = [
    { icon: '📊', label: t('nav.dashboard', lang), href: '/teacher', active: pathname === '/teacher' },
    { icon: '👥', label: lang === 'sw' ? 'Madarasa' : 'Classrooms', href: '/teacher/classrooms', active: pathname.startsWith('/teacher/classrooms') },
    { icon: '🔍', label: t('nav.search', lang), href: '/search', active: pathname === '/search' },
    { icon: '📝', label: lang === 'sw' ? 'Majaribio ya Zamani' : 'Past Papers', href: '/teacher/past-papers', active: pathname === '/teacher/past-papers' },
    { icon: '💳', label: t('nav.pricing', lang), href: '/pricing', active: pathname === '/pricing' },
    { icon: '⚙️', label: t('nav.settings', lang), href: '/teacher/settings', active: pathname === '/teacher/settings' },
  ]

  const developerItems = [
    { icon: '📊', label: t('nav.dashboard', lang), href: '/developer', active: pathname === '/developer' },
    { icon: '🔬', label: lang === 'sw' ? 'Fizikia' : 'Physics', href: `${base}/physics`, active: pathname.startsWith(`${base}/physics`) },
    { icon: '🧪', label: lang === 'sw' ? 'Kemia' : 'Chemistry', href: `${base}/chemistry`, active: pathname.startsWith(`${base}/chemistry`) },
    { icon: '🦠', label: lang === 'sw' ? 'Biolojia' : 'Biology', href: `${base}/biology`, active: pathname.startsWith(`${base}/biology`) },
    { icon: '📄', label: lang === 'sw' ? 'Docs' : 'Docs', href: '/developer/docs', active: pathname === '/developer/docs' },
    { icon: '📈', label: lang === 'sw' ? 'Uchambuzi' : 'Analytics', href: '/developer/analytics', active: pathname === '/developer/analytics' },
    { icon: '⚙️', label: t('nav.settings', lang), href: '/developer/settings', active: pathname === '/developer/settings' },
  ]

  const items = userRole === 'admin' ? adminItems : userRole === 'teacher' ? teacherItems : userRole === 'developer' ? developerItems : studentItems

  return (
    <aside className="w-64 bg-bg-tertiary flex flex-col border-r border-border-strong hidden md:flex overflow-y-auto">
      <div className="p-2">
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
              <span className="text-xl" suppressHydrationWarning>{item.icon}</span>
              <span className="text-[14px] font-medium" suppressHydrationWarning>{item.label}</span>
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
