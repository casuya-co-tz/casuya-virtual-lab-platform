'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { useUser } from '@/contexts/UserContext'

interface NavbarProps {
  onSidebarToggle?: () => void
}

export function Navbar({ onSidebarToggle }: NavbarProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, loading, mounted } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const { lang, toggle, mounted: langMounted } = useLanguage()
  const isMounted = mounted && langMounted

  useEffect(() => {
    if (!loading && !user) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname
        if (path.startsWith('/admin') || path.startsWith('/student') || path.startsWith('/developer')) {
          fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
            window.location.href = '/auth'
          })
        }
      }
    }
  }, [loading, user, pathname])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const dashboardHref = user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/teacher' : '/student'

  return (
    <>
      <nav className="sticky top-0 z-40 flex items-center justify-between h-14 px-3 border-b border-border bg-bg-primary/90 backdrop-blur-md">
        <a href="/" className="text-[clamp(15px,2.5vw,18px)] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-purple tracking-tight">
          CASUYA
        </a>

        <div className="hidden md:flex items-center gap-5" suppressHydrationWarning>
          {user && (
            <a href={dashboardHref} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">
              {t('nav.dashboard', isMounted ? lang : 'en')}
            </a>
          )}
          {(!user || user.role === 'student' || user.role === 'admin') && (
            <a href={user ? '/student' : '/auth'} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">
              {t('nav.subjects', isMounted ? lang : 'en')}
            </a>
          )}
          <a href="/search" className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">
            {t('nav.search', isMounted ? lang : 'en')}
          </a>
          <a href="/blog" className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">
            Blog
          </a>
          <a href="/pricing" className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">
            {t('nav.pricing', isMounted ? lang : 'en')}
          </a>
          {(!user || user.role === 'admin') && (
            <a href={user ? '/developer' : '/auth'} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">
              {t('nav.developer', isMounted ? lang : 'en')}
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle lang={isMounted ? lang : 'en'} onToggle={toggle} />
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <a href={dashboardHref} className="text-[13px] text-text-primary font-bold truncate max-w-[100px]">
                {user.full_name}
              </a>
              <button onClick={handleLogout} className="h-8 px-2 text-[11px] text-accent-blue underline">Logout</button>
            </div>
          ) : (
            <Button variant="primary" className="hidden md:block !h-9 !px-4 !text-[12px]" onClick={() => router.push('/auth')}>{t('nav.login', isMounted ? lang : 'en')}</Button>
          )}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-text-primary"
            onClick={() => onSidebarToggle ? onSidebarToggle() : setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      {menuOpen && !onSidebarToggle && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      {menuOpen && !onSidebarToggle && (
        <div className="fixed top-0 right-0 h-full w-72 bg-bg-primary border-l border-border z-50 md:hidden flex flex-col animate-slide-in-right">
          <div className="flex items-center justify-between h-14 px-4 border-b border-border">
            <span className="text-[15px] font-bold text-text-primary">Menu</span>
            <button
              className="w-10 h-10 flex items-center justify-center text-text-primary"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {user && (
              <a href={dashboardHref} onClick={() => setMenuOpen(false)} className="flex items-center h-12 px-4 text-[14px] text-text-primary font-bold border-b border-border">
                {user.full_name}
              </a>
            )}
            <div className="py-2" suppressHydrationWarning>
              {user && (
                <a href={dashboardHref} onClick={() => setMenuOpen(false)} className="flex items-center h-11 px-4 text-[13px] text-text-secondary hover:bg-bg-secondary transition-colors">
                  {t('nav.dashboard', isMounted ? lang : 'en')}
                </a>
              )}
              {(!user || user.role === 'student' || user.role === 'admin') && (
                <a href={user ? '/student' : '/auth'} onClick={() => setMenuOpen(false)} className="flex items-center h-11 px-4 text-[13px] text-text-secondary hover:bg-bg-secondary transition-colors">
                  {t('nav.subjects', isMounted ? lang : 'en')}
                </a>
              )}
              <a href="/search" onClick={() => setMenuOpen(false)} className="flex items-center h-11 px-4 text-[13px] text-text-secondary hover:bg-bg-secondary transition-colors">
                {t('nav.search', isMounted ? lang : 'en')}
              </a>
              <a href="/pricing" onClick={() => setMenuOpen(false)} className="flex items-center h-11 px-4 text-[13px] text-text-secondary hover:bg-bg-secondary transition-colors">
                {t('nav.pricing', isMounted ? lang : 'en')}
              </a>
              <a href="/blog" onClick={() => setMenuOpen(false)} className="flex items-center h-11 px-4 text-[13px] text-text-secondary hover:bg-bg-secondary transition-colors">
                Blog
              </a>
              {(!user || user.role === 'admin') && (
                <a href={user ? '/developer' : '/auth'} onClick={() => setMenuOpen(false)} className="flex items-center h-11 px-4 text-[13px] text-text-secondary hover:bg-bg-secondary transition-colors">
                  {t('nav.developer', isMounted ? lang : 'en')}
                </a>
              )}
            </div>

            <div className="border-t border-border py-2 px-4">
              <LanguageToggle lang={isMounted ? lang : 'en'} onToggle={toggle} />
            </div>
          </div>

          <div className="border-t border-border p-4">
            {user ? (
              <div className="flex flex-col gap-2">
                <a href={dashboardHref} onClick={() => setMenuOpen(false)} className="text-[13px] text-text-secondary hover:text-text-primary text-center">
                  {t('nav.dashboard', isMounted ? lang : 'en')}
                </a>
                <button onClick={handleLogout} className="h-10 w-full text-[13px] border border-accent-red text-accent-red hover:bg-accent-red/10 transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <Button variant="primary" className="w-full !h-10" onClick={() => { setMenuOpen(false); router.push('/auth') }}>
                {t('nav.login', isMounted ? lang : 'en')}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
