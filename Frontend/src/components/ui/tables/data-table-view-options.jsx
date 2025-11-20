import React from 'react'
import { Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// DataTableViewOptions component, mengatur opsi tampilan tabel seperti kolom yang ditampilkan
export function DataTableViewOptions({ table }) {
  if (!table) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
          <Settings2 />
          View
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Kolom-kolom yang dapat dihilangkan */}
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            const label =
              typeof column.columnDef.header === 'string'
                ? column.columnDef.header
                : column.id

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
              >
                {label}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DataTableViewOptions
