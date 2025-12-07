import React, { useMemo } from "react";
import AssignmentTable from "@/components/ui/tables/assignment-table";
import CustomerOverviewCard from "@/components/ui/cards/customer-overview-card";
import { useAssignments } from "@/hooks/useAssignment";

export default function AssignmentsPage() {
  // Kita panggil hook di level Page untuk mendapatkan data
  // agar bisa dihitung untuk statistik Card di atas
  const { data, loading } = useAssignments();

  // Hitung Statistik Sederhana dari Data yang ada
  const stats = useMemo(() => {
    if (!data) return null;

    const total = data.length;
    const married = data.filter((d) => d.statusPernikahan === "Menikah").length;
    // Contoh logika: Anggap nasabah dengan skor prediksi tinggi sebagai "High Priority"
    const highPriority = data.filter(
      (d) => parseFloat(d.skorPrediksi || 0) > 0.7
    ).length;

    return {
      totalCustomers: total,
      totalChange: 0, // Bisa diisi logic perbandingan bulan lalu jika ada API-nya
      totalDirection: "neutral",

      depositoMembers: married, // Reuse field card untuk 'Menikah' (Contoh)
      depositoMembersChange: 0,
      depositoMembersDirection: "neutral",

      depositoActive: highPriority, // Reuse field card untuk 'High Score'
      depositoActiveChange: 0,
      depositoActiveDirection: "up",
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-6 px-6 min-h-screen">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Sales Assignment</h1>
        <p className="text-muted-foreground">
          Daftar nasabah prioritas yang ditugaskan kepada Anda untuk di-follow
          up hari ini.
        </p>
      </div>

      {/* 2. Metrics / Overview Cards */}
      {/* Kita reuse CustomerOverviewCard yang sudah Anda punya */}
      <CustomerOverviewCard
        data={stats}
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
