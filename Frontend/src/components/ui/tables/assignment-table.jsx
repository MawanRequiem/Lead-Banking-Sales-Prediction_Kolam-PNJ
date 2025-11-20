import React, { useMemo } from 'react'
import DataTable from '@/components/ui/tables/data-table'
import { columns, mockData } from '@/components/ui/tables/assignment-column'
import ActionCell from '@/components/ui/tables/detail-customer'
import useTable from '@/hooks/useTable'

export default function AssignmentTable() {
  const { data, loading } = useTable({ initial: mockData })

  const cols = useMemo(() => columns, [])

  return (
    <DataTable
      columns={cols}
      data={data}
      loading={loading}
      title="Customer List"
      toolbarLeft={<div className="text-lg font-semibold">Customer List</div>}
      renderRowActions={(row) => <ActionCell karyawan={row.original} />}
    />
  )
}
