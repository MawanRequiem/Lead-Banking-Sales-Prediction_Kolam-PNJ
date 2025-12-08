import React from "react";
import CallHistoryTable from "@/components/ui/tables/call-history-table";
import { useLang } from "@/hooks/useLang";

export default function CallHistoryPage() {
  const { t } = useLang();
  return (
    <div className="flex flex-col gap-6 px-6 min-h-screen">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("page.callHistory.title", "Riwayat Telepon")}
      </h1>
      <p className="text-muted-foreground">
        {t(
          "page.callHistory.subtitle",
          "Riwayat panggilan nasabah yang tercatat."
        )}
      </p>
      <div className="bg-background rounded-xl border shadow-sm p-1 overflow-hidden">
        <CallHistoryTable />
      </div>
    </div>
  );
}
