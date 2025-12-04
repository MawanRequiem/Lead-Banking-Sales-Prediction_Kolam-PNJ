import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { mockDeposit } from "@/lib/mock-deposit-data";
import {
  getDepositChartTitle,
  getDepositChartSubtitle,
  sortOptions,
} from "@/lib/chart-strings";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartStyle,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Label } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function DepositPieChartCard({
  className,
  data = null,
  range,
  interval,
  month,
  year,
  loading = false,
}) {
  // month/year/wholeYear props are provided by parent Dashboard to align with backend filters
  const [sortKey, setSortKey] = useState("value_desc");
  const [activeIndex, setActiveIndex] = useState(null);
  const wrapperRef = useRef(null);

  const series = useMemo(() => {
    const rawData = Array.isArray(data)
      ? data.map((item) => ({
          label: item.type || "Unknown",
          value: item.count || 0,
          pct: item.percent || 0,
        }))
      : [];

    const sorted = rawData.sort((a, b) => {
      switch (sortKey) {
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

    const total = sorted.reduce((s, it) => s + (it.value || 0), 0);
    return { items: sorted, total };
  }, [data, sortKey]);

  // color palette read from CSS variables
  const palette = useMemo(
    () => [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ],
    []
  );

  // chartConfig consumed by ChartStyle and ChartTooltipContent
  const chartConfig = useMemo(() => {
    const cfg = {};
    const items = series.items || [];
    items.forEach((it, idx) => {
      cfg[it.label] = { label: it.label, color: palette[idx % palette.length] };
    });
    return cfg;
  }, [series, palette]);

  return (
    <Card className={cn("p-3", className)}>
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-col  mr-2">
            <div className="text-sm font-semibold">
              {getDepositChartTitle(range)}
            </div>
            <div className="text-xs text-muted-foreground">
              {getDepositChartSubtitle(range)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm px-3 py-1 rounded-md border bg-transparent text-muted-foreground">
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

        <div
          ref={wrapperRef}
          className="flex flex-col items-center gap-3 relative"
        >
          {loading ? (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="mx-auto w-full max-w-[260px] aspect-square flex items-center justify-center">
                <Skeleton className="h-48 w-full" />
              </div>

              <div className="w-full max-w-[260px]">
                <div className="flex items-center justify-center">
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>

              <div className="w-full grid grid-cols-1 gap-2 max-w-[320px]">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-sm" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ChartContainer
              id="deposit-pie"
              className="mx-auto w-full max-w-[260px] aspect-square"
              config={chartConfig}
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={series.items}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={50}
                  outerRadius={90}
                  onMouseEnter={(d, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {series.items.map((it, idx) => (
                    <Cell key={it.label} fill={palette[idx % palette.length]} />
                  ))}
                  <Label
                    // center label via render function
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        const active =
                          typeof activeIndex === "number"
                            ? series.items[activeIndex]
                            : null;
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {active
                                ? active.value.toLocaleString()
                                : series.total.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              {active ? active.label : "Total"}
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          )}

          {series.total > 0 && (
            <div className="text-sm font-medium">
              Total: {series.total.toLocaleString()}
            </div>
          )}

          {series.items.length === 0 && !loading && (
            <div className="text-sm text-muted-foreground py-8">
              Tidak ada data untuk periode ini
            </div>
          )}

          {series.items.length > 0 && (
            <div className="w-full grid grid-cols-1 gap-2">
              {series.items.map((it, idx) => (
                <div
                  key={it.label}
                  className="flex items-center justify-between gap-2 p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        background: palette[idx % palette.length],
                        display: "inline-block",
                        borderRadius: 4,
                      }}
                    />
                    <div className="text-sm font-medium">{it.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {it.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {it.pct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
