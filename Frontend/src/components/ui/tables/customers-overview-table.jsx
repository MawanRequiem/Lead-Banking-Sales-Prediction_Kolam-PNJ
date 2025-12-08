import React, { useMemo } from "react";
import DataTable from "@/components/ui/tables/data-table";
import {
  columns,
  mockData,
} from "@/components/ui/tables/customers-overview-column";
import ActionCell from "@/components/ui/tables/detail-customer";
import { useTable } from "@/hooks/useTable";
import NasabahFilter from "../dropdown/nasabah-filter";

// Accept `data` and `loading` as props (page can pass API results). If not
// provided, fall back to internal hook with mockData (useful for isolated storybook/tests).
export default function CustomersOverviewTable() {
  // If parent didn't pass data, use local hook to fetch `/sales/leads` (fallback)
  const {
    data,
    loading,
    pagination, setPagination,
    pageCount,
    total,
    search, setSearch,
    setFilters,
  } = useTable({apiUrl: '/sales/leads', initial: mockData });

  const cols = useMemo(() => columns, []);

  const toolbarRight = (<NasabahFilter className="mr-2" onApply={setFilters} />);

  return (
    <DataTable
      columns={cols}
      data={data || mockData}
      loading={loading}
      title="Customers Overview"
      toolbarLeft={
        <div className="text-lg font-semibold">Customers Overview</div>
      }
      toolbarRight={toolbarRight}
      options={{
        pagination,
        pageCount: pageCount || Math.ceil((data ? data.length : mockData.length) / 10),
        total,
        onPageChange: setPagination,
        search,
        onSearchChange: setSearch,
      }}
      renderRowActions={(row) => <ActionCell nasabah={row.original} />}
    />
  );
}
