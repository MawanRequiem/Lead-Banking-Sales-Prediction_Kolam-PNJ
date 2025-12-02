import React from "react";
import DataTableColumnHeader from "@/components/ui/tables/data-table-header";
import { mockData } from "@/hooks/useTable";

import { formatDisplay } from "@/lib/date-utils";
import { StatusBadge, CategoryBadge } from "@/components/ui/badges";

export const columns = [
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
  },
  {
    accessorKey: "nomorTelepon",
    header: "Nomor Telepon",
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
    header: "Jenis Kelamin",
  },
  {
    accessorKey: "statusTelepon",
    header: "Panggilan Terakhir",
    cell: ({ row }) => {
      const lastCall = row.original.lastCall
      if (!lastCall) {
        return <div className="text-sm text-muted-foreground">-</div>;
      }
      return <div className="text-sm text-muted-foreground">{formatDisplay(lastCall)}</div>;
    },
  },
  {
    accessorKey: "assignment",
    header: "Status Penugasan",
    cell: ({ row }) => {
      // Jika API menyertakan tanda assignment, gunakan itu untuk menentukan status
      const isAssigned = !!(
        row.original.assignmentId ||
        row.original.idAssignment ||
        row.original.isAssigned
      );
      return isAssigned ? (
        <StatusBadge status={"Ditugaskan"} />
      ) : (
        <div className="text-sm text-muted-foreground">Belum Ditugaskan</div>
      );
    },
  },
  {
    // Kategori isn't provided by API; derive from `skor` (skorPrediksi)
    accessorKey: "skor",
    header: "Kategori",
    cell: ({ row }) => {
      const s = parseFloat(row.original.skor || row.original.skorPrediksi || 0);
      const cat = s >= 0.75 ? "A" : s >= 0.5 ? "B" : "C";
      return <CategoryBadge category={cat} />;
    },
  },
];

// re-export mock data for convenience
export { mockData };

export default columns;
