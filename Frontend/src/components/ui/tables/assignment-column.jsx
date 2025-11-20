import React from "react"
import DataTableColumnHeader from '@/components/ui/tables/data-table-header'
import { mockData } from "@/hooks/useTable"
import { MarriageBadge } from '@/components/ui/badges'

// kolom kolom yang digunakan di DataTable untuk Customers
export const columns = [
  {
    accessorKey: 'nama',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
  },
  {
    accessorKey: 'pekerjaan',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Pekerjaan" />,
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
    accessorKey: 'umur',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Umur" />,
    cell: ({ row }) => <div className="text-left">{row.getValue('umur')} tahun</div>,
  },
  {
    accessorKey: 'statusPernikahan',
    header: 'Status',
    cell: ({ row }) => (
      <div>
        <MarriageBadge value={row.original.statusPernikahan} />
      </div>
    ),
  },
    // Note: action cell is rendered by the DataTable via `renderRowActions`.
    // If you prefer the action column to be defined here, remove the
    // `renderRowActions` prop from the wrapper `CustomersTable` instead.
]

// Ekspor data mock agar komponen DataTable bisa menggunakannya
export { mockData }
