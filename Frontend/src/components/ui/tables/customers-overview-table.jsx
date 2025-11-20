import React, { useMemo } from 'react'
import DataTable from '@/components/ui/tables/data-table'
import { columns, mockData } from '@/components/ui/tables/customers-overview-column'
import ActionCell from '@/components/ui/tables/detail-customer'
import { useCustomersOverview } from '@/hooks/useCustomersOverview'

export default function CustomersOverviewTable() {
  const { data, loading } = useCustomersOverview()

  const cols = useMemo(() => columns, [])

  return (
    <DataTable
      columns={cols}
      data={data || mockData}
      loading={loading}
      title="Customers Overview"
      toolbarLeft={<div className="text-lg font-semibold">Customers Overview</div>}
      renderRowActions={(row) => <ActionCell karyawan={row.original} />}
    />
  )
}
