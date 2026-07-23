import { requireAdmin } from '@/lib/auth-guard'
import { redirect } from 'next/navigation'
import { ClientLayout } from './ClientLayout'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireAdmin()
  if (!userId) {
    redirect('/auth')
  }

  return <ClientLayout>{children}</ClientLayout>
}
