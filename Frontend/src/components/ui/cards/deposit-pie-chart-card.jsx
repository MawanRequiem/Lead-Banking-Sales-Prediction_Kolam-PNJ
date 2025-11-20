import React, { useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { mockDeposit } from '@/lib/mock-deposit-data'
import { getDepositChartTitle, getDepositChartSubtitle, sortOptions } from '@/lib/chart-strings'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartStyle } from '@/components/ui/chart'
import { PieChart, Pie, Cell, Label } from 'recharts'

export default function DepositPieChartCard({ data = null, className }) {
  const [range, setRange] = useState('month')
  const [sortKey, setSortKey] = useState('value_desc')
  const [activeIndex, setActiveIndex] = useState(null)
  const wrapperRef = useRef(null)

  const source = data && typeof data === 'object' ? data : mockDeposit

  const series = useMemo(() => {
    const arr = Array.isArray(source?.[range]) ? [...source[range]] : []
    const total = arr.reduce((s, it) => s + (it.value || 0), 0)
    const withPct = arr.map(it => ({ ...it, pct: total > 0 ? (it.value / total) * 100 : 0 }))

    const sorted = withPct.sort((a, b) => {
      switch (sortKey) {
        case 'value_asc':
          return a.value - b.value
        case 'value_desc':
          return b.value - a.value
        case 'pct_asc':
          return a.pct - b.pct
        case 'pct_desc':
          return b.pct - a.pct
        default:
          return b.value - a.value
      }
    })
    return { items: sorted, total }
  }, [source, range, sortKey])

  // percent change vs previous month (only meaningful for month range)
  const pctChange = useMemo(() => {
    if (range !== 'month') return null
    const total = series.total || 0
    const prev = Number(source?.monthPreviousTotal || 0)
    if (!prev) return null
    const diff = total - prev
    return Math.round((diff / prev) * 100)
  }, [range, series, source])
  
  // color palette read from CSS variables
  const palette = useMemo(
    () => ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'],
    []
  )

  // chartConfig consumed by ChartStyle and ChartTooltipContent
  const chartConfig = useMemo(() => {
    const cfg = {}
    const items = series.items || []
    items.forEach((it, idx) => {
      cfg[it.label] = { label: it.label, color: palette[idx % palette.length] }
    })
    return cfg
  }, [series, palette])

  // compute 12-month share per type when available
  const yearShares = useMemo(() => {
    const yearArr = Array.isArray(source?.year) ? source.year : []
    const total = yearArr.reduce((s, it) => s + (it.value || 0), 0)
    const map = {}
    yearArr.forEach(it => {
      map[it.label] = total > 0 ? (it.value / total) * 100 : 0
    })
    return map
  }, [source])

  return (
    <Card className={cn('p-3', className)}>
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-col  mr-2">
            <div className="text-sm font-semibold">{getDepositChartTitle(range)}</div>
            <div className="text-xs text-muted-foreground">{getDepositChartSubtitle(range)}</div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm px-3 py-1 rounded-md border bg-transparent text-muted-foreground">{range === 'week' ? 'Mingguan' : range === 'month' ? 'Bulanan' : 'Tahunan'}</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={6}>
                <DropdownMenuItem onSelect={() => setRange('week')}>Mingguan</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setRange('month')}>Bulanan</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setRange('year')}>Tahunan</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm px-3 py-1 rounded-md border bg-transparent text-muted-foreground">Sort</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={6}>
                {sortOptions.map(opt => (
                  <DropdownMenuItem key={opt.value} onSelect={() => setSortKey(opt.value)}>{opt.label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div ref={wrapperRef} className="flex flex-col items-center gap-3 relative">
          <ChartContainer id="deposit-pie" className="mx-auto w-full max-w-[260px] aspect-square" config={chartConfig}>
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
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      const active = typeof activeIndex === 'number' ? series.items[activeIndex] : null
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                            {active ? active.value.toLocaleString() : series.total.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                            {active ? active.label : 'Total'}
                          </tspan>
                        </text>
                      )
                    }
                    return null
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="text-sm font-medium">Total: {series.total}</div>

          {pctChange !== null && (
            <div className={cn('text-xs', pctChange >= 0 ? 'text-green-600' : 'text-red-600')}>
              {pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`} dari bulan sebelumnya
            </div>
          )}

          <div className="w-full grid grid-cols-1 gap-2">
            {series.items.map((it, idx) => (
              <div key={it.label} className="flex items-center justify-between gap-2 p-2 rounded border rounded-lg">
                <div className="flex items-center gap-2">
                  <span style={{ width: 12, height: 12, background: palette[idx % palette.length], display: 'inline-block', borderRadius: 4 }} />
                  <div className="text-sm">
                    <div>{it.label}</div>
                    {yearShares[it.label] != null && (
                      <div className="text-xs text-muted-foreground">12 bulan: {Math.round(yearShares[it.label])}%</div>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium">{Math.round(it.pct)}%</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
