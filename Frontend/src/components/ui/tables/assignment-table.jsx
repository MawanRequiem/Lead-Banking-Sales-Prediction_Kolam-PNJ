import React, { useMemo } from "react";
import DataTable from "@/components/ui/tables/data-table";
import {
  makeAssignmentColumns,
  mockData,
} from "@/components/ui/tables/assignment-column";
import ActionCell from "@/components/ui/tables/detail-customer";
import { useTable } from "@/hooks/useTable";
import { useLang } from "@/hooks/useLang";

export default function AssignmentTable() {
  const { t } = useLang();
  const cols = useMemo(() => makeAssignmentColumns(t), [t]);
  const {
    data,
    loading,
    pagination,
    setPagination,
    pageCount,
    total,
    search,
    setSearch,
  } = useTable({ apiUrl: "/sales/assignments", initial: mockData });

  return (
    <DataTable
      columns={cols}
      data={data || mockData}
      loading={loading}
      title={t("table.assignment.title")}
      toolbarLeft={
        <div className="text-lg font-semibold">
          {t("table.assignment.toolbarTitle")}
        </div>
      }
      options={{
        pagination: pagination,
        total: total,
        pageCount:
          pageCount || Math.ceil((data ? data.length : mockData.length) / 10),
        onPageChange: setPagination,
        search,
        onSearchChange: setSearch,
      }}
      renderRowActions={(row) => <ActionCell nasabah={row.original} />}
    />
  );
}
