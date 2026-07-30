import { requireStudentOrAdmin } from '@/lib/auth-guard'
import { redirect } from 'next/navigation'
import { ClientLayout } from './ClientLayout'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireStudentOrAdmin()
  if (!userId) {
    redirect('/auth')
  }

  return <ClientLayout>{children}</ClientLayout>
}
