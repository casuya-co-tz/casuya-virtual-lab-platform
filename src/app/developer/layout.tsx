import { requireAuth } from '@/lib/auth-guard'
import { redirect } from 'next/navigation'
import { ClientLayout } from './ClientLayout'

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireAuth()
  if (!userId) {
    redirect('/auth')
  }

  return <ClientLayout>{children}</ClientLayout>
}
