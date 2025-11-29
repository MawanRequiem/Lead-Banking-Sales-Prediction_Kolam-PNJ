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

      // derive needFollowUp from backend field if present, otherwise from lastCall.nextFollowupDate
      let needFollowUp = false;
      if (typeof row.original.needFollowUp === "boolean") {
        needFollowUp = row.original.needFollowUp;
      } else if (lastCall && lastCall.nextFollowupDate) {
        try {
          needFollowUp = new Date(lastCall.nextFollowupDate) <= new Date();
        } catch (e) {
          needFollowUp = false;
        }
      }

      // If no call ever, show available
      if (!lastCall)
        return <div className="text-sm text-muted-foreground">Tersedia</div>;

      // Detect in-call / active call states (support multiple shapes)
      const isInCall =
        typeof lastCall === "object" &&
        (lastCall.status === "in_call" ||
          lastCall.status === "in-progress" ||
          lastCall.active === true ||
          lastCall.isActive === true);

      if (isInCall)
        return <div className="text-sm text-rose-600">Dalam Panggilan</div>;

      // If needFollowUp flagged, show 'Tindak Lanjut'
      if (needFollowUp)
        return <div className="text-sm text-amber-600">Tindak Lanjut</div>;

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
