import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import DateField from '@/components/ui/dropdown/date-field'
import { getQuickRange } from '@/lib/date-utils'
import { Separator } from '@/components/ui/separator'

export default function ExportDialog({ open, onOpenChange, data = [], onApply }) {
  const [from, setFrom] = useState(() => getQuickRange('week').from)
  const [to, setTo] = useState(() => getQuickRange('week').to)
  const [selectedRange, setSelectedRange] = useState('week')
  const [limit, setLimit] = useState(100)

  function setQuickRange(kind) {
    const { from: f, to: t } = getQuickRange(kind)
    setFrom(f)
    setTo(t)
    setSelectedRange(kind)
  }

  function apply() {
    if (typeof onApply === 'function') onApply({ from, to, limit })
    if (typeof onOpenChange === 'function') onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <div className="text-sm text-muted-foreground">Pilih rentang tanggal untuk mengekspor ({data.length} baris tersedia)</div>
        </DialogHeader>
        <Separator className="my-2" />
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {/* Button untuk quick range tanggal */}
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded-md border ${selectedRange === 'week' ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-foreground border-border'}`}
              onClick={() => setQuickRange('week')}
            >
              Seminggu
            </button>

            <button
              type="button"
              className={`text-xs px-2 py-1 rounded-md border ${selectedRange === 'month' ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-foreground border-border'}`}
              onClick={() => setQuickRange('month')}
            >
              Sebulan
            </button>

            <button
              type="button"
              className={`text-xs px-2 py-1 rounded-md border ${selectedRange === 'quarter' ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-foreground border-border'}`}
              onClick={() => setQuickRange('quarter')}
            >
              Quarter
            </button>

            <button
              type="button"
              className={`text-xs px-2 py-1 rounded-md border ${selectedRange === 'year' ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-foreground border-border'}`}
              onClick={() => setQuickRange('year')}
            >
              Setahun
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <DateField id="export-from" value={from} onChange={setFrom} placeholder="Dari" />
            <DateField id="export-to" value={to} onChange={setTo} placeholder="Sampai" />
          </div>
        </div>
        <Separator className="my-1" />
        <div className="px-4 py-2">
          <label className="text-xs text-muted-foreground">Jumlah baris yang akan diunduh</label>
            <div className="mt-1">
              <Select value={String(limit)} onValueChange={(v) => setLimit(v === 'all' ? 'all' : Number(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih jumlah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                  <SelectItem value="all">Semua</SelectItem>
                </SelectContent>
            </Select>
            </div>
          </div>
        <Separator className="my-4" />
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={apply}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
