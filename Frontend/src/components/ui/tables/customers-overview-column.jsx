import React from "react";
import DataTableColumnHeader from "@/components/ui/tables/data-table-header";
import { mockData } from "@/hooks/useTable";

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
    header: "Status Telepon",
    cell: ({ row }) => {
      // Prefer explicit fields from API
      const lastCall =
        row.original.lastCall ||
        (row.original.historiTelepon && row.original.historiTelepon[0]) ||
        null;
      const needFollowUp = row.original.needFollowUp || false;

      if (!lastCall)
        return <div className="text-sm text-muted-foreground">Available</div>;

      // If needFollowUp flagged, show 'Follow Up'
      if (needFollowUp)
        return <div className="text-sm text-amber-600">Follow Up</div>;

      // If there's a last call and no follow up due, consider 'Aman'
      return <div className="text-sm text-green-600">Aman</div>;
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
