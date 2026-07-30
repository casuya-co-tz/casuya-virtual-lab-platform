'use client'
import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { MobileDrawer } from '@/components/layout/MobileDrawer'
import { Sidebar } from '@/components/layout/Sidebar'
import { UserProvider } from '@/contexts/UserContext'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <UserProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar onSidebarToggle={() => setDrawerOpen(true)} />
          <main className="flex-1 p-1 md:p-2">
            {children}
          </main>
        </div>
        <MobileDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          userRole="developer"
        />
      </div>
    </UserProvider>
  )
}
