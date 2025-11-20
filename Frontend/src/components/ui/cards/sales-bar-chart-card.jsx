import React, { useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { mockSales } from '@/lib/mock-sales-data'
import { getChartTitle, getChartSubtitle, sortOptions } from '@/lib/chart-strings'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

function formatLabel(label) {
  return String(label)
}

function BarChart({ series = [], height = 160, onHover }) {
  const max = Math.max(1, ...series.map(s => (typeof s.value === 'number' ? s.value : 0)))
  // increase padding and gap to make bars wider and more separated
  const padding = 10
  const barGap = 10
  const bars = series.length
  const barWidth = bars > 0 ? Math.max(10, Math.floor((100 - padding * 2 - barGap * (bars - 1)) / bars)) : 12

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full h-[160px]">
      {series.map((s, i) => {
        const x = padding + i * (barWidth + barGap)
        const value = typeof s.value === 'number' ? s.value : 0
        const barHeight = Math.round((value / max) * (height - 30))
        const y = height - barHeight - 18
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="2"
              fill={s.__fill || 'white'}
              stroke="var(--border)"
              style={{ transition: 'fill 150ms ease, transform 120ms ease' }}
              onMouseEnter={e => {
                // use the exact bar DOM rect so tooltip centers correctly
                const barRect = e.currentTarget.getBoundingClientRect()
                const centerX = barRect.left + barRect.width / 2
                const topY = barRect.top
                onHover && onHover(i, { clientX: centerX, clientY: topY, barRect })
              }}
              onMouseMove={e => {
                const barRect = e.currentTarget.getBoundingClientRect()
                const centerX = barRect.left + barRect.width / 2
                const topY = barRect.top
                onHover && onHover(i, { clientX: centerX, clientY: topY, barRect })
              }}
              onMouseLeave={() => onHover && onHover(null, null)}
            />
            <text x={x + barWidth / 2} y={height - 6} fontSize="6" fill="var(--muted-foreground, #9ca3af)" textAnchor="middle">
              {formatLabel(s.label)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function SalesBarChartCard({ data = null, className }) {
  const [range, setRange] = useState('week') // 'week' | 'month' | 'year'
  const [sortKey, setSortKey] = useState('value_desc')
  const [hovered, setHovered] = useState(null)
  const [tooltip, setTooltip] = useState({ left: 0, top: 0, visible: false, content: '' })
  const wrapperRef = useRef(null)
  const tooltipRef = useRef(null)

  // Use deterministic mock data for UI preview. Parent can pass real `data` later.
  const sample = mockSales

  // Choose source: prefer provided `data`, otherwise `sample` for UI
  const source = data && typeof data === 'object' ? data : sample

  // current series for selected range. We attach a temporary __fill to each bar
  // so BarChart can read it; hovered state will update the fill accordingly.
  const series = useMemo(() => {
    const s = Array.isArray(source?.[range]) ? [...source[range]] : []
    // attach pct to allow sorting by percentage
    const withPct = s.map(it => {
      const success = Number(it.success || 0)
      const total = Number(it.total || 0)
      const pct = total > 0 ? Math.round((success / total) * 100) : 0
      return { ...it, pct }
    })

    const sorted = withPct.sort((a, b) => {
      switch (sortKey) {
        case 'time': {
          // chronological sort depending on current range
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          function idx(label) {
            if (range === 'week') return Math.max(0, days.indexOf(label))
            if (range === 'month') return Math.max(0, months.indexOf(label))
            if (range === 'year') return Number(label) || 0
            return 0
          }
          return idx(a.label) - idx(b.label)
        }
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

    return sorted.map(it => ({ ...it, __fill: 'white' }))
  }, [source, range, sortKey])

  // hover handler for SVG bars
  const handleHover = (index, hoverPos) => {
    if (index === null) {
      setHovered(null)
      setTooltip(t => ({ ...t, visible: false }))
      return
    }

    const item = series[index]
    const success = Number(item.success || 0)
    const total = Number(item.total || 0)
    const pct = total > 0 ? Math.round((success / total) * 100) : 0

    const wrap = wrapperRef.current
    if (wrap && hoverPos && hoverPos.clientX != null) {
      const rect = wrap.getBoundingClientRect()
      let left = hoverPos.clientX - rect.left

      const tip = tooltipRef.current
      const tipWidth = tip ? tip.offsetWidth : 140
      const tipHeight = tip ? tip.offsetHeight : 32

      left = left - tipWidth / 2
      
      let top = hoverPos.clientY - rect.top - tipHeight - 8
      const minLeft = 8
      const maxLeft = Math.max(8, rect.width - tipWidth - 8)
      left = Math.min(maxLeft, Math.max(minLeft, left))

      const minTop = 4
      top = Math.max(minTop, top)

      setTooltip({ left, top, visible: true, content: `${pct}% berhasil (${success}/${total})` })
    }

    setHovered(index)
  }

  // Range options
  const ranges = [
    { key: 'week', label: 'Seminggu' },
    { key: 'month', label: 'Sebulan' },
    { key: 'year', label: 'Tahunan' },
  ]

  return (
    <Card className={cn('p-3', className)}>
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-col">
            <div className="text-sm font-semibold">{getChartTitle(range)}</div>
            <div className="text-xs text-muted-foreground">{getChartSubtitle(range)}</div>
          </div>

          <div className="flex items-center gap-2">
            {/* Range selector as dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-sm px-3 py-1 rounded-md border bg-transparent text-muted-foreground"
                >
                  {ranges.find(r => r.key === range)?.label || 'Periode'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={6}>
                <DropdownMenuRadioGroup value={range} onValueChange={v => setRange(v)}>
                  {ranges.map(r => (
                    <DropdownMenuRadioItem key={r.key} value={r.key}>{r.label}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="text-sm px-3 py-1 rounded-md border bg-transparent text-muted-foreground">
                  Sort
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={6}>
                {sortOptions.map(opt => (
                  <DropdownMenuItem key={opt.value} onSelect={() => setSortKey(opt.value)}>
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

          <div ref={wrapperRef} className="relative">
            <BarChart
              series={series.map((it, i) => (i === hovered ? { ...it, __fill: 'var(--primary)' } : it))}
              onHover={handleHover}
            />

            {(
              <div
                ref={tooltipRef}
                className={cn(
                  'absolute z-50 pointer-events-none bg-popover text-popover-foreground text-sm rounded-md px-2 py-1 shadow transition-opacity duration-150 transform-gpu',
                  tooltip.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                )}
                style={{ left: tooltip.left, top: tooltip.top }}
                aria-hidden={!tooltip.visible}
              >
                {tooltip.content}
              </div>
            )}
          </div>

        {/* placeholder for tooltip spacing */}
        {/* Menampilkan data sementara di sini */}
        <div className="mt-2 text-xs text-muted-foreground">Data pada chart adalah contoh UI. Ganti prop <code>data</code> dengan data server untuk produksi.</div>
      </CardContent>
    </Card>
  )
}
