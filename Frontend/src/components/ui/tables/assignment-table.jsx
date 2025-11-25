import React, { useMemo } from "react";
import DataTable from "@/components/ui/tables/data-table";
import { columns } from "@/components/ui/tables/assignment-column";
import ActionCell from "@/components/ui/tables/detail-customer";

export default function AssignmentTable({ data, loading }) {
  const cols = useMemo(() => columns, []);

  return (
    <DataTable
      columns={cols}
      data={data || []}
      loading={loading}
      title="Customer List"
      toolbarLeft={<div className="text-lg font-semibold">Customer List</div>}
      renderRowActions={(row) => <ActionCell karyawan={row.original} />}
    />
  );
}
