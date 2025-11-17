import React, { useState } from 'react'
import { Sliders } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from './dropdown-menu'
import DateField from './date-field'

// FilterDropdown uses your Radix-based DropdownMenu primitives.
// Pass a `trigger` prop (React node) to render a custom trigger inside the
// DropdownMenuTrigger. If omitted, a default button is rendered.
export default function FilterDropdown({ className, trigger = null }) {
  const [from, setFrom] = useState(() => {
    const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10)
  })
  const [grade, setGrade] = useState('all')
  const [status, setStatus] = useState('any')
  const [keyword, setKeyword] = useState('')

  function resetSection(section) {
    if (section === 'date') {
      const d1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const d2 = new Date()
      setFrom(d1.toISOString().slice(0, 10))
      setTo(d2.toISOString().slice(0, 10))
    } else if (section === 'grade') {
      setGrade('all')
    } else if (section === 'status') {
      setStatus('any')
    } else if (section === 'keyword') {
      setKeyword('')
    }
  }

  function resetAll() {
    resetSection('date')
    resetSection('grade')
    resetSection('status')
    resetSection('keyword')
  }

  function apply(close) {
    console.log({ from, to, grade, status, keyword })
    if (typeof close === 'function') close()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <button aria-label="Open filter" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted">
            <Sliders className="h-5 w-5" />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className={cn('w-80 p-0', className)} sideOffset={8}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="font-medium">Filter</div>
          <button className="text-sm text-foreground underline" onClick={() => resetAll()}>
            Reset Semua
          </button>
        </div>

        <DropdownMenuSeparator />

        {/* Date range */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Rentang Waktu</div>
            <button className="text-xs text-foreground underline" onClick={() => resetSection('date')}>Reset</button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <DateField id="filter-from" value={from} onChange={setFrom} placeholder="From" />
            <DateField id="filter-to" value={to} onChange={setTo} placeholder="To" />
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Grade */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Grade</div>
            <button className="text-xs text-foreground underline" onClick={() => resetSection('grade')}>Reset</button>
          </div>
          <div className="mt-2">
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full rounded-md border px-2 py-1">
              <option value="all">Semua</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Status */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Status</div>
            <button className="text-xs text-foreground underline" onClick={() => resetSection('status')}>Reset</button>
          </div>
          <div className="mt-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border px-2 py-1">
              <option value="any">Semua</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Keyword */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Cari Keyword</div>
            <button className="text-xs text-foreground underline" onClick={() => resetSection('keyword')}>Reset</button>
          </div>
          <div className="mt-2">
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Ketik kata kunci..." className="w-full rounded-md border px-2 py-1" />
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Actions */}
        <div className="px-4 py-3 flex items-center justify-end gap-2">
          <button className="rounded-md px-3 py-1 border" onClick={() => resetAll()}>Reset Semua</button>
          <button className="rounded-md px-3 py-1 bg-primary text-white" onClick={() => apply()}>Terapkan</button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
