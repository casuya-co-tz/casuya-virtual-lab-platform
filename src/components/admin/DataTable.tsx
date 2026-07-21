import { Table, Tr, Td } from '@/components/ui/Table'

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: string
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, keyField }: DataTableProps<T>) {
  return (
    <Table headers={columns.map(c => c.label)}>
      {data.map(row => (
        <Tr key={String(row[keyField])}>
          {columns.map(col => (
            <Td key={col.key}>
              {col.render ? col.render(row) : String(row[col.key] ?? '')}
            </Td>
          ))}
        </Tr>
      ))}
    </Table>
  )
}
