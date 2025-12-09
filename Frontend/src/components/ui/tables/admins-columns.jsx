import React from "react";
import DataTableColumnHeader from "@/components/ui/tables/data-table-header";

export const columns = (t) => [
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t("table.admin.columns.nama")}
      />
    ),
  },
  {
    accessorKey: "email",
    header: t("table.admin.columns.email"),
  },
  {
    accessorKey: "role",
    header: t("table.admin.columns.role"),
    cell: ({ row }) => {
      const r = row.original;
      return <span className="capitalize">{r.role}</span>;
    },
  },
  {
    accessorKey: "status",
    header: t("table.admin.columns.status"),
    cell: ({ row }) => {
      const s = row.original.status;
      return (
        <span
          className={
            s === "active"
              ? "text-green-600 font-medium"
              : "text-muted-foreground"
          }
        >
          {s === "active"
            ? t("table.admin.status.active")
            : t("table.admin.status.inactive")}
        </span>
      );
    },
  },
];

// export mock data convenience (can be overridden by a hook)
export const mockData = [];

export default columns;
