import React from "react";
import CallHistoryTable from "@/components/ui/tables/call-history-table";

export default function CallHistoryPage() {
  return (
    <div className="flex flex-col gap-6 px-6 min-h-screen">
      <h1 className="text-2xl font-bold tracking-tight">Riwayat Telepon</h1>
      <p className="text-muted-foreground">
        Riwayat panggilan nasabah yang tercatat.
      </p>
      <CallHistoryTable />
    </div>
  );
}
