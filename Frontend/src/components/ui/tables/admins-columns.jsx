import React from 'react'
import DataTableColumnHeader from '@/components/ui/tables/data-table-header'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, UserX, Key } from 'lucide-react'
import AdminEditDialog from '@/components/ui/dialogs/admin-edit-dialog'

export const columns = [
  {
    accessorKey: 'nama',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const r = row.original
      return <span className="capitalize">{r.role}</span>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.original.status
      return (
        <span className={s === 'active' ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
          {s === 'active' ? 'Aktif' : 'Nonaktif'}
        </span>
      )
    },
  },
]
 

// export mock data convenience (can be overridden by a hook)
export const mockData = []

export default columns
