import { ColumnDef } from "@tanstack/react-table"

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  searchKey: string
  emptyState?: React.ReactNode
}

export function DataTable<TData>({
  columns,
  data,
  emptyState
}: DataTableProps<TData>) {
  // Basic table implementation - expand with your actual table UI
  return (
    <div className="w-full">
      {/* Add search input here if needed */}
      {data.length === 0 ? emptyState : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.id} className="px-4 py-2 text-left">
                    {/* @ts-expect-error - This is a workaround to avoid type errors */}  
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {columns.map((column) => (
                    <td key={column.id} className="px-4 py-2">
                      {/* @ts-expect-error - This is a workaround to avoid type errors */}  
                      {row[column.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 