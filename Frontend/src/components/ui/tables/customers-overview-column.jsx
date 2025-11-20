import React from 'react'
import DataTableColumnHeader from '@/components/ui/tables/data-table-header'
import { mockData } from '@/hooks/useTable'


import { StatusBadge, CategoryBadge } from '@/components/ui/badges'

export const columns = [
  {
    accessorKey: 'nama',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
  },
  {
    accessorKey: 'nomorTelepon',
    header: 'Nomor Telepon',
  },
  {
    accessorKey: 'jenisKelamin',
    header: 'Jenis Kelamin',
  },
  {
    accessorKey: 'statusNasabah',
    header: 'Status Nasabah',
    cell: ({ row }) => <StatusBadge status={row.original.statusNasabah} />,
  },
  {
    accessorKey: 'kategori',
    header: 'Kategori',
    cell: ({ row }) => <CategoryBadge category={row.original.kategori} />,
  },
]

// re-export mock data for convenience
export { mockData }

export default columns
