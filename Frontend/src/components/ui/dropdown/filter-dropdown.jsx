import React, { useState } from 'react'
import { Sliders } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select'
import DateField from '@/components/ui/dropdown/date-field'

// FilterDropdown uses your Radix-based DropdownMenu primitives.
// Pass a `trigger` prop (React node) to render a custom trigger inside the
// DropdownMenuTrigger. If omitted, a default button is rendered.
export default function FilterDropdown({ className, trigger = null, onApply }) {
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
    const payload = { from, to, grade, status, keyword }
    // NOTE: jika mau berganti ke server-side filtering, ini adalah tempatnya
    // bisa menggunakan (A) panggil backend langsung dari dropdown (kurang
    // direkomendasikan), atau (B) kirim payload ke parent melalui `onApply`
    // (direkomendasikan). Parent kemudian dapat memanggil endpoint API Anda dengan
    // parameter query yang dibangun dari `payload` dan memperbarui data tabel.
    //
    // Example (parent-side fetch):
    // onApply(payload) -> parent builds query string and fetches:
    // const qs = new URLSearchParams(payload).toString()
    // fetch(`/api/calls?${qs}`)
    //   .then(r => r.json())
    //   .then(data => setData(data.rows))
    //
    // Penting untuk mengingat keamanan pada server-side:
    // - Selalu validasi dan sanitasi parameter query di server.
    // - Gunakan query parameterized / placeholder ORM untuk menghindari injeksi.
    // - Terapkan batasan (max `limit`) dan paginasi di backend.

    if (typeof onApply === 'function') onApply(payload)
    if (typeof close === 'function') close()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
            <Sliders className="h-5 w-5" />
            <span className="text-sm font-medium hidden lg:block">Filter</span>
          </Button>
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
            <Select value={grade} onValueChange={(v) => setGrade(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
              </SelectContent>
            </Select>
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
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Semua</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
          </Select>
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
