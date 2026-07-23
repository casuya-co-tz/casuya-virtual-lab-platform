import { HTMLAttributes, TableHTMLAttributes } from 'react'

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  headers: string[]
}

export function Table({ headers, className = '', children, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full min-w-[600px] border-collapse ${className}`} {...props}>
        <thead>
          <tr className="bg-bg-tertiary">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-[12px] font-bold uppercase text-text-secondary text-left border border-border-DEFAULT">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Tr({ className = '', children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`bg-bg-secondary border-b border-border-DEFAULT hover:bg-bg-hover ${className}`} {...props}>
      {children}
    </tr>
  )
}

export function Td({ className = '', children, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-3 py-2 text-[14px] text-text-primary border border-border-DEFAULT ${className}`} {...props}>
      {children}
    </td>
  )
}
