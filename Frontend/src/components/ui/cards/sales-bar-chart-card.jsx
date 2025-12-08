import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { mockSales } from "@/lib/mock-sales-data";
import {
  getChartTitle,
  getChartSubtitle,
  sortOptions,
} from "@/lib/chart-strings";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart as ReBarChart,
  Bar as ReBar,
  XAxis as ReXAxis,
  YAxis as ReYAxis,
  CartesianGrid as ReCartesianGrid,
} from "recharts";

function formatLabel(label) {
  return String(label);
}

// Recharts-based responsive bar chart will be rendered inside ChartContainer

export default function SalesBarChartCard({
  data = null,
  className,
  range, // optional external range (week/month/year)
  interval, // display interval (week/month/year) coming from Dashboard
  month,
  year,
  loading = false,
}) {
  const [sortKey, setSortKey] = useState("value_desc");

  // If parent provides `range`, treat as external; otherwise keep local state
  const [internalRange, setInternalRange] = useState(range || "month");
  const externalRange = typeof range !== "undefined" && range !== null;
  const currentRange = externalRange ? range : internalRange;

  // Helper: format label from backend bucket/date
  function formatLabelFromBucket(bucket) {
    if (!bucket) return "-";
    if (typeof bucket === "string") {
      // try ISO date
      const d = new Date(bucket);
      if (!Number.isNaN(d.getTime())) {
        // interval is either 'week' or 'month'
        if (interval === "month") {
          // monthly buckets: show month abbreviation (e.g. 'Jan')
          return d.toLocaleString(undefined, { month: "short" });
        }
        if (interval === "week") {
          // weekly buckets: compute week number within the selected month/year
          // require `month` and `year` props from parent Dashboard
          if (month) {
            const wk = getWeekOfMonthUTC(
              d,
              Number(month),
              Number(year || d.getUTCFullYear())
            );
            return `W${wk}`;
          }
          // fallback: show start-of-week day-month
          return d.toLocaleString(undefined, {
            day: "2-digit",
            month: "short",
          });
        }
        // default: show ISO date (fallback)
        return d.toLocaleDateString();
      }
      // fallback: use raw string
      return bucket;
    }
    return String(bucket);
  }

  function getWeekOfMonthUTC(d, monthParam, yearParam) {
    // d: Date instance (local or UTC) -> convert to UTC date values
    const date = new Date(d);
    const utcDay = date.getUTCDate();
    const utcMonth = date.getUTCMonth() + 1; // 1-based
    const utcYear = date.getUTCFullYear();
    // if the bucket's month/year differ from requested month/year, still compute relative week
    const start = new Date(Date.UTC(yearParam, monthParam - 1, 1));
    const diffMs =
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const weekIndex = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    return weekIndex + 1;
  }

  const series = useMemo(() => {
    const src = Array.isArray(data) ? data : [];

    // normalize backend items into { label, success, total, value, pct }
    const normalized = src.map((it, idx) => {
      const success = Number(
        it.count ?? it.success ?? it.success_count ?? it.successCount ?? 0
      );
      const total = Number(
        it.total ?? it.totalCalls ?? it.totalPanggilan ?? it.total_calls ?? 0
      );
      const value = Number(
        it.count ?? it.totalDeposits ?? it.totalPanggilan ?? it.value ?? 0
      );
      const pct =
        total > 0 ? Math.round((success / total) * 100) : success > 0 ? 100 : 0;
      const label =
        it.label ||
        it.type ||
        formatLabelFromBucket(
          it.bucket ?? it.date ?? it.tanggal ?? it.interval ?? idx
        );

      return { ...it, label, success, total, value, pct };
    });

    const sorted = normalized.sort((a, b) => {
      switch (sortKey) {
        case "time":
          // attempt chronological sort by parsing label as date
          const da = new Date(a.label);
          const db = new Date(b.label);
          if (!Number.isNaN(da.getTime()) && !Number.isNaN(db.getTime()))
            return da - db;
          return 0;
        case "value_asc":
          return a.value - b.value;
        case "value_desc":
          return b.value - a.value;
        case "pct_asc":
          return a.pct - b.pct;
        case "pct_desc":
          return b.pct - a.pct;
        default:
          return b.value - a.value;
      }
    });

    return sorted.map((it) => ({ ...it, __fill: "white" }));
  }, [data, interval, sortKey]);

  // Chart tooltip is handled by ChartTooltip + ChartTooltipContent

  // Range options
  const ranges = [
    { key: "month", label: "Sebulan" },
    { key: "year", label: "Tahunan" },
  ];

  // build chartConfig for ChartStyle (color mapping)
  const palette = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const chartConfig = {};
  series.forEach((it, idx) => {
    chartConfig[it.label] = {
      label: it.label,
      color: palette[idx % palette.length],
    };
  });

  // data passed to Recharts should be plain array with label + value
  const chartData = series.map((it) => ({ ...it }));
  const isDataEmpty = series.length === 0;

  return (
    <Card className={cn("p-3", className)}>
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-col">
            <div className="text-sm font-semibold">{getChartTitle(range)}</div>
            <div className="text-xs text-muted-foreground">
              {getChartSubtitle(range)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Range selector as dropdown (hidden if parent provides range) */}
            {!externalRange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-sm px-3 py-1 rounded-md border bg-transparent text-muted-foreground"
                  >
                    {ranges.find((r) => r.key === range)?.label || "Periode"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={6}>
                  <DropdownMenuRadioGroup
                    value={range}
                    onValueChange={(v) => setRange(v)}
                  >
                    {ranges.map((r) => (
                      <DropdownMenuRadioItem key={r.key} value={r.key}>
                        {r.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-sm px-3 py-1 rounded-md border bg-transparent text-muted-foreground"
                >
                  Sort
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={6}>
                {sortOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onSelect={() => setSortKey(opt.value)}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="relative">
          {loading ? (
            <div className="h-56 flex items-center justify-center">
              <Skeleton className="h-48 w-full" />
            </div>
          ) : isDataEmpty ? (
            <div className="h-56 flex items-center justify-center">
              {" "}
              <p className="text-center text-muted-foreground">
                Tidak ada Riwayat Keberhasilan konversi{" "}
              </p>{" "}
            </div>
          ) : (
            <ChartContainer
              id="sales-bar"
              className="w-full"
              config={chartConfig}
            >
              <ReBarChart
                data={chartData}
                margin={{ top: 8, right: 12, left: 0, bottom: 24 }}
              >
                <ReCartesianGrid strokeDasharray="3 3" vertical={false} />
                <ReXAxis dataKey="label" tick={{ fontSize: 12 }} />
                <ReYAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReBar
                  dataKey="value"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                />
              </ReBarChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
