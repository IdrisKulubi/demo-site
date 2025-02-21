'use client';

import { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, type ColumnDef } from '@tanstack/react-table';
import { Table as TableComponent } from '@/components/ui/table';
import useSWR from 'swr';
import { flexRender } from '@tanstack/react-table';

interface UseTableProps<TData> {
  columns: ColumnDef<TData>[];
  endpoint: string;
  keyField: string;
}

export function useTable<TData>({ columns, endpoint, keyField }: UseTableProps<TData>) {
  const [data, setData] = useState<TData[]>([]);
  
  const { data: fetchedData, error } = useSWR(endpoint);

  useEffect(() => {
    if (fetchedData) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const Table = () => (
    <div className="rounded-md border">
      <TableComponent>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={String(row.original[keyField as keyof TData])}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {cell.column.columnDef.cell
                    ? flexRender(cell.column.columnDef.cell, cell.getContext())
                    : cell.getValue() as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </TableComponent>
    </div>
  );

  return {
    Table,
    isLoading: !error && !data,
    isError: error,
  };
}