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

// FilterDropdown uses your Radix-based DropdownMenu primitives.
// Pass a `trigger` prop (React node) to render a custom trigger inside the
// DropdownMenuTrigger. If omitted, a default button is rendered.
export default function NasabahFilter({ className, trigger = null, onApply }) {
  const [grade, setGrade] = useState('all')
  const [search, setSearch] = useState('')

  function resetSection(section) {
    if (section === 'grade') {
      setGrade('all')
    } else if (section === 'keyword') {
      setSearch('')
    }
  }

  function resetAll() {
    resetSection('grade')
    resetSection('keyword')
  }

  function apply(close) {
    const payload = { grade, search }
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

        {/* Keyword */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Cari Keyword</div>
            <button className="text-xs text-foreground underline" onClick={() => resetSection('keyword')}>Reset</button>
          </div>
          <div className="mt-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ketik kata kunci..." className="w-full rounded-md border px-2 py-1" />
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
