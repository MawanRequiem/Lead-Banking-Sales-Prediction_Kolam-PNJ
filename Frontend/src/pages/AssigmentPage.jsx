import React, { useMemo } from "react";
import AssignmentTable from "@/components/ui/tables/assignment-table";
import CustomerOverviewCard from "@/components/ui/cards/customer-overview-card";
import { useMyLeadOverview } from "@/hooks/useOverview";
import { useLang } from "@/hooks/useLang";

export default function AssignmentsPage() {
  const { data, loading } = useMyLeadOverview();
  const { t } = useLang();

  return (
    <div className="flex flex-col gap-6 px-6 min-h-screen">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("page.assignments.title", "Sales Assignment")}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "page.assignments.description",
            "Daftar nasabah prioritas yang ditugaskan kepada Anda untuk di-follow up hari ini."
          )}
        </p>
      </div>

      {/* 2. Metrics / Overview Cards */}
      {/* Kita reuse CustomerOverviewCard yang sudah Anda punya */}
      <CustomerOverviewCard
        data={data}
        className="shadow-sm border-none"
        isLoading={loading}
      />

      {/* 3. Main Table Section */}
      <div className="bg-background rounded-xl border shadow-sm p-1 overflow-hidden">
        <AssignmentTable />
      </div>
    </div>
  );
}
