import React, { useMemo } from "react";
import DataTable from "@/components/ui/tables/data-table";
import columns, { mockData } from "@/components/ui/tables/admins-columns";
import AdminActions from "@/components/ui/tables/admins-actions";
import { useAdmins } from "@/hooks/useAdmins";
import { useLang } from "@/hooks/useLang";

export default function AdminsTable() {
  const {
    data,
    loading,
    refetch,
    pagination,
    setPagination,
    search,
    setSearch,
  } = useAdmins();
  const { t } = useLang();
  const cols = useMemo(() => columns(t), [t]);

  return (
    <DataTable
      columns={cols}
      data={data && data.length ? data : mockData}
      loading={loading}
      title={t("table.admin.title")}
      toolbarLeft={
        <div className="text-xl font-semibold">
          {t("table.admin.toolbarTitle")}
        </div>
      }
      options={{
        pagination: pagination,
        total: pagination.total,
        pageCount: pagination.pageCount,
        onPageChange: setPagination,
        search: search,
        onSearchChange: setSearch,
      }}
      renderRowActions={(row) => (
        <AdminActions user={row.original} refresh={refetch} />
      )}
    />
  );
}
