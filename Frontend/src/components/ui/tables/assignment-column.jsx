import React from "react"
import DataTableColumnHeader from '@/components/ui/tables/data-table-header'
import { mockData } from "@/hooks/useTable"

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
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.original.statusPernikahan === 'Menikah' ? 'bg-green-100 text-green-700' : 
            row.original.statusPernikahan === 'Lajang' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
        }`}>
            {row.original.statusPernikahan}
        </span>
    ),
  },
    // Note: action cell is rendered by the DataTable via `renderRowActions`.
    // If you prefer the action column to be defined here, remove the
    // `renderRowActions` prop from the wrapper `CustomersTable` instead.
]

// Ekspor data mock agar komponen DataTable bisa menggunakannya
export { mockData }
