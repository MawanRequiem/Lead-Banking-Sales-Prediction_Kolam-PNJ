import React, { useMemo } from "react";
import DataTable from "@/components/ui/tables/data-table";
import {
  columns,
  mockData,
} from "@/components/ui/tables/customers-overview-column";
import ActionCell from "@/components/ui/tables/detail-customer";
import { useTable } from "@/hooks/useTable";

// Accept `data` and `loading` as props (page can pass API results). If not
// provided, fall back to internal hook with mockData (useful for isolated storybook/tests).
export default function CustomersOverviewTable({
  data: externalData = null,
  loading: externalLoading = null,
}) {
  // If parent didn't pass data, use local hook to fetch `/sales/leads` (fallback)
  const { data: fetchedData, loading: fetchedLoading } = useTable({
    apiUrl: "/sales/leads",
    initial: mockData,
  });

  const data = externalData ?? fetchedData;
  const loading = externalLoading ?? fetchedLoading;

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
      renderRowActions={(row) => <ActionCell karyawan={row.original} />}
    />
  );
}
