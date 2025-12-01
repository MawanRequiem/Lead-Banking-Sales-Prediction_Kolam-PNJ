import React from "react";
import ContactPriorityCard from "@/components/ui/cards/contact-priority-card";
import SalesBarChartCard from "@/components/ui/cards/sales-bar-chart-card";
import DepositPieChartCard from "@/components/ui/cards/deposit-pie-chart-card";
import CallHistoryCard from "@/components/ui/cards/call-history-card";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Top cards area: two-column layout
          Left column: stacked ContactPriority + SalesBarChart
          Right column: DepositPieChart spanning the height of the two left cards
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-rows-2 gap-6">
          <ContactPriorityCard />
          <SalesBarChartCard />
        </div>

        <div className="lg:col-span-1">
          {/* Make the deposit card full height to visually span the two left cards */}
          <div className="h-full flex flex-col">
            <DepositPieChartCard className="flex-1 h-full" />
          </div>
        </div>
      </div>

      {/* Call history below the cards — full width */}
      <div>
        <CallHistoryCard entries={[]} />
      </div>
    </div>
  );
}
