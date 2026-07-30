import { requireTeacher } from '@/lib/auth-guard'
import { redirect } from 'next/navigation'
import { ClientLayout } from './ClientLayout'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireTeacher()
  if (!userId) {
    redirect('/auth')
  }

  return <ClientLayout>{children}</ClientLayout>
}
