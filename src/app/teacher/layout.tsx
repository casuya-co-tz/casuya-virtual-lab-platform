import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { requireTeacher } from '@/lib/auth-guard'
import { redirect } from 'next/navigation'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireTeacher()
  if (!userId) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </div>
      <Footer />
    </div>
  )
}
