'use client'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { MobileDrawer } from '@/components/layout/MobileDrawer'
import { Sidebar } from '@/components/layout/Sidebar'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <button
            className="md:hidden mb-4 p-2 border border-border-strong hover:bg-bg-secondary"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {children}
        </main>
      </div>
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userRole="student"
      />
    </div>
  )
}
