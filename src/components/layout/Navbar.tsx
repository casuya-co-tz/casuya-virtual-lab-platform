'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
interface NavbarProps {
  onSidebarToggle?: () => void
}

export function Navbar({ onSidebarToggle }: NavbarProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ id: string; full_name: string; role: string } | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { lang, toggle } = useLanguage()

  useEffect(() => {
    fetch('/api/profile')
      .then(r => { if (r.ok) return r.json(); throw new Error() })
      .then(data => setUser(data))
      .catch(() => {
        setUser(null)
        if (typeof window !== 'undefined') {
          const path = window.location.pathname
          if (path.startsWith('/admin') || path.startsWith('/student') || path.startsWith('/developer')) {
            fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
              window.location.href = '/auth'
            })
          }
        }
      })
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const dashboardHref = user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/teacher' : '/student'

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 border-b border-border-default bg-bg-primary/80 backdrop-blur-md transition-colors duration-300">
      <a href="/" className="text-[18px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-purple tracking-tight">CASUYA</a>

      <div className="hidden md:flex items-center gap-6">
        {user && (
          <a href={dashboardHref} className="text-[14px] text-text-secondary hover:border-b hover:border-border-strong pb-1">
            {t('nav.dashboard', lang)}
          </a>
        )}
        {(!user || user.role === 'student' || user.role === 'admin' || user.role === 'teacher') && (
          <a href="/student" className="text-[14px] text-text-secondary hover:border-b hover:border-border-strong pb-1">
            {t('nav.subjects', lang)}
          </a>
        )}
        <a href="/search" className="text-[14px] text-text-secondary hover:border-b hover:border-border-strong pb-1">
          {t('nav.search', lang)}
        </a>
        <a href="/developer" suppressHydrationWarning className="text-[14px] text-text-secondary hover:border-b hover:border-border-strong pb-1">
          {t('nav.developer', lang)}
        </a>
      </div>

      <div className="flex items-center gap-3">
        <LanguageToggle lang={lang} onToggle={toggle} />
        {user ? (
          <div className="hidden md:flex items-center gap-3">
            <a href={dashboardHref} className="text-[14px] text-text-primary font-bold">
              {user.full_name}
            </a>
            <button onClick={handleLogout} className="text-[12px] text-accent-blue underline">Logout</button>
          </div>
        ) : (
          <Button variant="primary" onClick={() => router.push('/auth')}>{t('nav.login', lang)}</Button>
        )}
        <button 
          className="md:hidden text-[24px] text-text-primary" 
          onClick={() => onSidebarToggle ? onSidebarToggle() : setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {menuOpen && !onSidebarToggle && (
        <div className="fixed top-0 right-0 h-full w-72 bg-bg-secondary border-l border-border-strong z-50 p-6">
          <button className="text-[20px] text-text-primary mb-6" onClick={() => setMenuOpen(false)}>x</button>
          <div className="flex flex-col gap-4">
            {user && <a href={dashboardHref} className="text-[14px] text-text-secondary">{t('nav.dashboard', lang)}</a>}
            {(!user || user.role === 'student' || user.role === 'admin' || user.role === 'teacher') && (
              <a href="/student" className="text-[14px] text-text-secondary">{t('nav.subjects', lang)}</a>
            )}
            <a href="/search" className="text-[14px] text-text-secondary">{t('nav.search', lang)}</a>
            <a href="/developer" suppressHydrationWarning className="text-[14px] text-text-secondary">{t('nav.developer', lang)}</a>
            <LanguageToggle lang={lang} onToggle={toggle} />
            {user ? (
              <>
                <a href={dashboardHref} className="text-[14px] text-text-primary font-bold">{user.full_name}</a>
                <button onClick={handleLogout} className="text-[12px] text-accent-blue underline text-left">Logout</button>
              </>
            ) : (
              <Button variant="primary" className="w-full" onClick={() => router.push('/auth')}>{t('nav.login', lang)}</Button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
