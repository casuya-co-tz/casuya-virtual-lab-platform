import { Table, Tr, Td } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'

interface User {
  id: string
  full_name: string
  email: string
  role: string
  language: string
  created_at: string
}

interface UserTableProps {
  users: User[]
  onToggleRole: (id: string, currentRole: string) => void
}

export function UserTable({ users, onToggleRole }: UserTableProps) {
  return (
    <Table headers={['Name', 'Email', 'Role', 'Language', 'Joined', 'Actions']}>
      {users.map(u => (
        <Tr key={u.id}>
          <Td>{u.full_name}</Td>
          <Td>{u.email}</Td>
          <Td><Badge variant={u.role === 'admin' ? 'info' : 'neutral'}>{u.role}</Badge></Td>
          <Td>{u.language?.toUpperCase()}</Td>
          <Td>{new Date(u.created_at).toLocaleDateString()}</Td>
          <Td>
            <button onClick={() => onToggleRole(u.id, u.role)} className="text-[12px] text-accent-blue underline">
              Make {u.role === 'admin' ? 'Student' : 'Admin'}
            </button>
          </Td>
        </Tr>
      ))}
    </Table>
  )
}
