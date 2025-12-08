import React, { useMemo } from "react";
import CustomerOverviewCard from "@/components/ui/cards/customer-overview-card";
import CustomersOverviewTable from "@/components/ui/tables/customers-overview-table";
import useLeadOverview from "@/hooks/useLeadOverview";

export default function CustomerOverviewPage() {
  const { data, loading } = useLeadOverview();
  const memberStatuses = ["AKTIF", "JATUH_TEMPO", "DICAIRKAN"];

  return (
    <div className="flex flex-col gap-6 px-6 min-h-screen">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Customer Overview</h1>
        <p className="text-muted-foreground">
          Ringkasan dan daftar lengkap nasabah yang dikelola.
        </p>
      </div>

      {/* 2. Metrics / Overview Cards */}
      <CustomerOverviewCard
        data={data}
        className="shadow-sm border-none"
        isLoading={loading}
      />

      {/* 3. Main Table Section */}
      <div className="bg-background rounded-xl border shadow-sm p-1 overflow-hidden">
        <CustomersOverviewTable />
      </div>
    </div>
  );
}
