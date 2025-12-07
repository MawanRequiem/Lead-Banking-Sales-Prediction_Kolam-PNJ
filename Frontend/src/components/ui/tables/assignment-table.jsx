import React, { useMemo } from "react";
import DataTable from "@/components/ui/tables/data-table";
import { columns } from "@/components/ui/tables/assignment-column";
import ActionCell from "@/components/ui/tables/detail-customer";
import { useAssignments } from "@/hooks/useAssignment";

export default function AssignmentTable() {
  const cols = useMemo(() => columns, []);
  const {
    data,
    loading,
    pagination, setPagination,
    search, setSearch
  } = useAssignments();

  return (
    <DataTable
      columns={cols}
      data={data}
      loading={loading}
      title="Customer List"
      toolbarLeft={<div className="text-lg font-semibold">Customer List</div>}
      options={{
        pagination: pagination,
        total: pagination.total,
        pageCount: pagination.pageCount,
        onPageChange: setPagination,
        search,
        onSearchChange: setSearch,
      }}
      renderRowActions={(row) => <ActionCell nasabah={row.original} />}
    />
  );
}
