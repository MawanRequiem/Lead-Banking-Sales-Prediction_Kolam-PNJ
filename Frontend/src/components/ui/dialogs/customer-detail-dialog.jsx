import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'

// A focused dialog component for customer details. Keep presentation here
// so callers can simply open/close and pass `karyawan` data.
export default function CustomerDetailDialog({
  open,
  onOpenChange,
  karyawan = {},
  title = 'Detail Karyawan',
  subtitle = '',
  rightToolbar = null,
  footerActions = null,
  onCall, // optional handler for call action
}) {
  const deposits = karyawan.deposits || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[70vw] max-w-[95vw]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <DialogHeader>
              <DialogTitle>{title}: {karyawan.nama}</DialogTitle>
              {subtitle ? <p className="text-sm text-muted-foreground mt-1">{subtitle}</p> : null}
            </DialogHeader>
          </div>

          <div className="flex items-center gap-2">
            {rightToolbar ? (
              rightToolbar
            ) : (
              <Button variant="outline" size="sm" onClick={onCall}>
                <Phone className="h-4 w-4 mr-2" />Telepon
              </Button>
            )}
          </div>
        </div>

        <div className="my-4 border-t border-border" />

        {/* Scrollable row: horizontal scroll on small screens, normal layout on sm+ */}
        <div className="overflow-x-auto">
          <div className="flex gap-6 max-h-[70vh] pr-2 min-w-max">
            {/* Left: personal info (fixed small, proportional on sm) */}
            <div className="w-[18rem] sm:w-1/3 min-w-0 overflow-auto">
              <section className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Informasi Diri</h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">ID</div>
                    <div className="text-foreground font-medium">{karyawan.id}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Pekerjaan</div>
                    <div className="text-foreground font-medium">{karyawan.pekerjaan}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Jenis Kelamin</div>
                    <div className="text-foreground font-medium">{karyawan.jenisKelamin}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Umur</div>
                    <div className="text-foreground font-medium">{karyawan.umur} tahun</div>
                  </div>
                </div>
              </section>
            </div>

            <div className="w-px bg-border hidden sm:block" />

            {/* Middle: call history (fixed small, flexible on sm) */}
            <div className="w-[28rem] sm:flex-1 min-w-0 overflow-auto">
              <section>
                <h3 className="text-sm font-semibold mb-2">Riwayat Telepon</h3>
                {Array.isArray(karyawan.calls) && karyawan.calls.length ? (
                  <ul className="space-y-2 text-sm">
                    {karyawan.calls.map((c, i) => (
                      <li key={i} className="flex items-start justify-between">
                        <div>
                          <div className="text-muted-foreground text-xs">{c.date}</div>
                          <div className="text-foreground">{c.note || c.type || 'Panggilan'}</div>
                        </div>
                        <div className="text-muted-foreground text-xs">{c.duration || ''}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">Tidak ada riwayat telepon.</div>
                )}
              </section>
            </div>

            {/* Divider (visible on sm+) */}
            <div className="w-px bg-border hidden sm:block" />

            {/* Right: deposits */}
            <div className="w-[18rem] sm:w-80 min-w-[18rem] max-h-[70vh] overflow-auto">
              <section>
                <h3 className="text-sm font-semibold mb-2">Daftar Deposito</h3>
                <div className="space-y-2">
                  {deposits.length ? (
                    deposits.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-md bg-background-secondary/50">
                        <div>
                          <div className="text-muted-foreground text-xs">Produk</div>
                          <div className="text-foreground font-medium">{d.product}</div>
                        </div>
                        <div className="text-sm text-foreground">{d.amount}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">Tidak ada deposito.</div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="my-4 border-t border-border" />

        {/* Full-width warning close button (prominent) */}
        <DialogFooter className="mb-4">
          <DialogClose asChild>
            <Button variant="warning" className="w-full">Tutup</Button>
          </DialogClose>
          {footerActions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}