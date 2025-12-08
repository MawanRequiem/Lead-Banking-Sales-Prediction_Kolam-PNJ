import React from "react";
import DataTableColumnHeader from "@/components/ui/tables/data-table-header";
import { mockData } from "@/hooks/useTable";

import { formatDisplay } from "@/lib/date-utils";
import { StatusBadge, CategoryBadge } from "@/components/ui/badges";

export const makeCustomersOverviewColumns = (t) => [
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t("table.customersOverview.columns.nama")}
      />
    ),
  },
  {
    accessorKey: "nomorTelepon",
    header: t("table.customersOverview.columns.nomorTelepon"),
    cell: ({ row }) => {
      const phone =
        row.original.nomorTelepon ||
        row.original.nasabah?.nomorTelepon ||
        row.original.profil?.nomorTelepon ||
        null;
      return phone ? (
        <div className="text-sm text-foreground">{phone}</div>
      ) : (
        <div className="text-sm text-muted-foreground">-</div>
      );
    },
  },
  {
    accessorKey: "jenisKelamin",
    header: t("table.customersOverview.columns.jenisKelamin"),
  },
  {
    accessorKey: "statusTelepon",
    header: t("table.customersOverview.columns.statusTelepon"),
    cell: ({ row }) => {
      const lastCall = row.original.lastCall;
      if (!lastCall) {
        return <div className="text-sm text-muted-foreground">-</div>;
      }
      return (
        <div className="text-sm text-muted-foreground">
          {formatDisplay(lastCall)}
        </div>
      );
    },
  },
  {
    accessorKey: "assignment",
    header: t("table.customersOverview.columns.assignment"),
    cell: ({ row }) => {
      const isAssigned = !!(
        row.original.assignmentId ||
        row.original.idAssignment ||
        row.original.isAssigned
      );
      return isAssigned ? (
        <StatusBadge
          status={t("table.customersOverview.columns.assignedLabel")}
        />
      ) : (
        <div className="text-sm text-muted-foreground">
          {t("table.customersOverview.columns.notAssignedLabel")}
        </div>
      );
    },
  },
  {
    accessorKey: "skor",
    header: t("table.customersOverview.columns.skor"),
    cell: ({ row }) => {
      const s = parseFloat(row.original.skor || row.original.skorPrediksi || 0);
      const cat = s >= 0.75 ? "A" : s >= 0.5 ? "B" : "C";
      return <CategoryBadge category={cat} />;
    },
  },
];

// re-export mock data for convenience
export { mockData };

export default makeCustomersOverviewColumns;
