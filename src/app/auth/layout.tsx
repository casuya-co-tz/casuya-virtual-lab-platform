import { requireAuth, requireAdmin } from '@/lib/auth-guard'
import { redirect } from 'next/navigation'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireAuth()
  if (userId) {
    const adminId = await requireAdmin()
    if (adminId) {
      redirect('/admin')
    } else {
      redirect('/student')
    }
  }

  return <>{children}</>
}
