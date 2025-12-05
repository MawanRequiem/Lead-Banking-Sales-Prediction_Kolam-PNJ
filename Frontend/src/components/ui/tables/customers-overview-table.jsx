import React, { useMemo } from "react";
import DataTable from "@/components/ui/tables/data-table";
import {
  columns,
  mockData,
} from "@/components/ui/tables/customers-overview-column";
import ActionCell from "@/components/ui/tables/detail-customer";
import { useTable } from "@/hooks/useTable";
import { set } from "date-fns";

// Accept `data` and `loading` as props (page can pass API results). If not
// provided, fall back to internal hook with mockData (useful for isolated storybook/tests).
export default function CustomersOverviewTable() {
  // If parent didn't pass data, use local hook to fetch `/sales/leads` (fallback)
  const { data, loading, pagination, setPagination, pageCount, total } = useTable({apiUrl: '/sales/leads', initial: mockData });

  const cols = useMemo(() => columns, []);

  return (
    <DataTable
      columns={cols}
      data={data || mockData}
      loading={loading}
      title="Customers Overview"
      toolbarLeft={
        <div className="text-lg font-semibold">Customers Overview</div>
      }
      options={{
        pageIndex: pagination.pageIndex || 0,
        pageSize: pagination.pageSize || 10,
        pageCount: pageCount || Math.ceil((data ? data.length : mockData.length) / 10),
        total: total,
        onPageChange: (updater) => {
          const next = typeof updater === 'function' ? updater(pagination) : updater;
          setPagination((old) => ({...old, pageIndex: next.pageIndex, pageSize: next.pageSize }));
        },
      }}
      renderRowActions={(row) => <ActionCell nasabah={row.original} />}
    />
  );
}
