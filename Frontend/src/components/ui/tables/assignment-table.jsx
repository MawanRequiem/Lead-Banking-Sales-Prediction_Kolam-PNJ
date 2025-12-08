import React, { useMemo } from "react";
import DataTable from "@/components/ui/tables/data-table";
import { columns } from "@/components/ui/tables/assignment-column";
import ActionCell from "@/components/ui/tables/detail-customer";
import { useAssignments } from "@/hooks/useAssignment";
import NasabahFilter from "../dropdown/nasabah-filter";

export default function AssignmentTable() {
  const cols = useMemo(() => columns, []);
  const {
    data,
    loading,
    total,
    pageCount,
    pagination, setPagination,
    search, setSearch,
    setFilters,
  } = useAssignments();

  const toolbarRight = (<NasabahFilter className="mr-2" onApply={setFilters} />);

  return (
    <DataTable
      columns={cols}
      data={data}
      loading={loading}
      title="Customer List"
      toolbarLeft={<div className="text-lg font-semibold">Customer List</div>}
      toolbarRight={toolbarRight}
      options={{
        pagination,
        total,
        pageCount,
        onPageChange: setPagination,
        search,
        onSearchChange: setSearch,
      }}
      renderRowActions={(row) => <ActionCell nasabah={row.original} />}
    />
  );
}
