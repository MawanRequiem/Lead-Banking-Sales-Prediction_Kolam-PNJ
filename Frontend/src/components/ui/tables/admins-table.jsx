import React, { useMemo } from "react";
import DataTable from "@/components/ui/tables/data-table";
import columns, { mockData } from "@/components/ui/tables/admins-columns";
import AdminActions from "@/components/ui/tables/admins-actions";
import { useAdmins } from "@/hooks/useAdmins";

export default function AdminsTable() {
  const { data, loading, refetch, pagination, setPagination, search, setSearch } = useAdmins();
  const cols = useMemo(() => columns, []);

  return (
    <DataTable
      columns={cols}
      data={data && data.length ? data : mockData}
      loading={loading}
      title="Administrators"
      toolbarLeft={
        <div className="text-xl font-semibold">Manajemen Pengguna</div>
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
