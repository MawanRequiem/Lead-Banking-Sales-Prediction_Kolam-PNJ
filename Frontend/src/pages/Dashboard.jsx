import React, { useState, useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ContactPriorityCard from "@/components/ui/cards/contact-priority-card";
import SalesBarChartCard from "@/components/ui/cards/sales-bar-chart-card";
import DepositPieChartCard from "@/components/ui/cards/deposit-pie-chart-card";
import CallHistoryCard from "@/components/ui/cards/call-history-card";
import useDashboardData from "@/hooks/useDashboardData";
import { useLang } from "@/hooks/useLang";

export default function Dashboard() {
  const { t } = useLang();
  const [range, setRange] = useState("month");
  const now = new Date();
  const currentYear = now.getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [wholeYear, setWholeYear] = useState(false);

  // When wholeYear is toggled, force range to 'year'
  React.useEffect(() => {
    if (wholeYear) setRange("year");
    else setRange("month");
  }, [wholeYear]);

  // limit years to current and previous year (1 year window)
  const yearOptions = [currentYear, currentYear - 1];

  // Fetch combined dashboard summary and distribute to cards
  // Determine which key the cards expect: when wholeYear -> monthly buckets (12 months),
  // when range === 'month' we want weekly buckets, otherwise use range as-is.
  const displayKey = wholeYear ? "month" : range === "month" ? "week" : range;

  const backendParams = useMemo(() => {
    if (range === "year") {
      return {
        year: String(year),
        month: undefined,
        wholeYear: true,
        interval: "month",
      };
    } else {
      return {
        year: String(year),
        month: String(month),
        wholeYear: false,
        interval: "week",
      };
    }
  }, [range, year, month]);

  const {
    data: dashboard,
    loading: dashboardLoading,
    error: dashboardError,
    refetch,
  } = useDashboardData(backendParams);

  return (
    <div className="px-6 space-y-6 min-h-[calc(100vh-var(--app-header-height,4rem))]">
      {/* Shared month/year selectors that align with backend filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {t("page.dashboard.year", "Tahun:")}
          </div>
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger size="default" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {t("page.dashboard.month", "Bulan:")}
          </div>
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger size="default" className="w-48" disabled={wholeYear}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{t("months.1", "Januari")}</SelectItem>
              <SelectItem value="2">{t("months.2", "Februari")}</SelectItem>
              <SelectItem value="3">{t("months.3", "Maret")}</SelectItem>
              <SelectItem value="4">{t("months.4", "April")}</SelectItem>
              <SelectItem value="5">{t("months.5", "Mei")}</SelectItem>
              <SelectItem value="6">{t("months.6", "Juni")}</SelectItem>
              <SelectItem value="7">{t("months.7", "Juli")}</SelectItem>
              <SelectItem value="8">{t("months.8", "Agustus")}</SelectItem>
              <SelectItem value="9">{t("months.9", "September")}</SelectItem>
              <SelectItem value="10">{t("months.10", "Oktober")}</SelectItem>
              <SelectItem value="11">{t("months.11", "November")}</SelectItem>
              <SelectItem value="12">{t("months.12", "Desember")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={wholeYear}
            onCheckedChange={(v) => setWholeYear(Boolean(v))}
          />
          <div className="text-sm">
            {t("page.dashboard.wholeYear", "Filter sepanjang tahun")}
          </div>
        </div>
      </div>
      {/* Top cards area: two-column layout
            Left column: stacked ContactPriority + SalesBarChart
            Right column: DepositPieChart spanning the height of the two left cards
        */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-rows-1 gap-6">
          <ContactPriorityCard
            data={dashboard?.assignments}
            loading={dashboardLoading}
          />
          <SalesBarChartCard
            data={dashboard?.callsConversion}
            range={range}
            interval={displayKey}
            month={month}
            year={year}
            loading={dashboardLoading}
          />
        </div>

        <div className="lg:col-span-1">
          {/* Make the deposit card full height to visually span the two left cards */}
          <div className="h-full flex flex-col">
            <DepositPieChartCard
              className="flex-1 h-full"
              data={dashboard?.depositTypes}
              range={range}
              interval={displayKey}
              month={month}
              year={year}
              loading={dashboardLoading}
            />
          </div>
        </div>
      </div>

      {/* Call history below the cards — full width */}
      <div>
        <CallHistoryCard
          data={dashboard?.callHistory}
          loading={dashboardLoading}
        />
      </div>
    </div>
  );
}
