import React from "react";
import DataTableColumnHeader from "@/components/ui/tables/data-table-header";
import { mockData } from "@/hooks/useTable";
import { MarriageBadge } from "@/components/ui/badges";

// kolom kolom yang digunakan di DataTable untuk Customers
export const makeAssignmentColumns = (t) => [
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t("table.assignment.columns.nama")}
      />
    ),
  },
  {
    accessorKey: "pekerjaan",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t("table.assignment.columns.pekerjaan")}
      />
    ),
  },
  {
    accessorKey: "nomorTelepon",
    header: t("table.assignment.columns.nomorTelepon"),
  },
  {
    accessorKey: "jenisKelamin",
    header: t("table.assignment.columns.jenisKelamin"),
  },
  {
    accessorKey: "umur",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t("table.assignment.columns.umur")}
      />
    ),
    cell: ({ row }) => (
      <div className="text-left">
        {row.getValue("umur")} {t("table.assignment.columns.umurSuffix")}
      </div>
    ),
  },
  {
    accessorKey: "statusPernikahan",
    header: t("table.assignment.columns.status"),
    cell: ({ row }) => (
      <div>
        <MarriageBadge value={row.original.statusPernikahan} />
      </div>
    ),
  },
  // Note: action cell is rendered by the DataTable via `renderRowActions`.
];

// Ekspor data mock agar komponen DataTable bisa menggunakannya
export { mockData };
