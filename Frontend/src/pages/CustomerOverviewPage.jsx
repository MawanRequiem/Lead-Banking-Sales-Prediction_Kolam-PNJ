import React, { useMemo } from "react";
import CustomerOverviewCard from "@/components/ui/cards/customer-overview-card";
import CustomersOverviewTable from "@/components/ui/tables/customers-overview-table";
import { useTable } from "@/hooks/useTable";

export default function CustomerOverviewPage() {
  const { data, loading } = useTable({ apiUrl: "/sales/leads" });
  const memberStatuses = ["AKTIF", "JATUH_TEMPO", "DICAIRKAN"];

  const stats = useMemo(() => {
    if (!data) return null;

    const total = data.length;
    const members = data.filter((d) =>
      memberStatuses.includes(d.statusTerakhir)
    ).length;
    const activeDeposits = data.filter(
      (d) => d.statusTerakhir === "AKTIF"
    ).length;

    return {
      totalCustomers: total,
      totalChange: 0, // Bisa diisi logic perbandingan bulan lalu jika ada API-nya
      totalDirection: "neutral",

      depositoMembers: members,
      depositoMembersChange: 0,
      depositoMembersDirection: "neutral",

      depositoActive: activeDeposits, // Reuse field card untuk 'High Score'
      depositoActiveChange: 0,
      depositoActiveDirection: "up",
    };
  }, [data]);

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
        data={stats}
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
