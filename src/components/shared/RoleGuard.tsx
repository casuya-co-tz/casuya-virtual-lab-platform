'use client'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useAuth'

interface RoleGuardProps {
  role: 'admin' | 'student' | 'developer'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ role, children, fallback }: RoleGuardProps) {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()

  const loading = authLoading || profileLoading

  if (loading) return null
  if (!user) return fallback ?? <p className="text-[14px] text-text-secondary">Access denied. Please login.</p>
  if (profile && profile.role !== role) {
    return fallback ?? <p className="text-[14px] text-text-secondary">Access denied. Required role: {role}.</p>
  }
  return <>{children}</>
}
