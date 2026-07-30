'use client'
import { createContext, useContext, useEffect, useState } from 'react'

interface UserProfile {
  id: string
  full_name: string
  role: string
}

interface UserContextValue {
  user: UserProfile | null
  loading: boolean
}

const UserContext = createContext<UserContextValue>({ user: null, loading: true })

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => { if (r.ok) return r.json(); throw new Error() })
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
