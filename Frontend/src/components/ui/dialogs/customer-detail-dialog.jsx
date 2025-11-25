import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { MarriageBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { DepositStatusBadge, DepositTypeBadge } from "@/components/ui/badges";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone } from "lucide-react";

// A focused dialog component for customer details. Keep presentation here
// so callers can simply open/close and pass `karyawan` data.
export default function CustomerDetailDialog({
  open,
  onOpenChange,
  karyawan = {},
  title = "Detail Karyawan",
  subtitle = "",
  rightToolbar = null,
  footerActions = null,
  onCall, // optional handler for call action
}) {
  const deposits = karyawan.deposits || [];
  // detect if there's an active call for this karyawan
  const calls = Array.isArray(karyawan.calls) ? karyawan.calls : [];
  const activeCall = calls.some((c) => {
    // common shapes: { status: 'in_call' }, { active: true }, or startedAt without duration
    if (c == null) return false;
    if (c.status === "in_call" || c.status === "in-progress") return true;
    if (c.active === true || c.isActive === true) return true;
    if (c.startedAt && (c.duration == null || c.duration === undefined))
      return true;
    return false;
  });

  function handleCallClick() {
    if (activeCall) return;
    if (typeof onCall === "function") onCall();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[70vw] max-w-[95vw]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <DialogHeader>
              <DialogTitle>
                {title}: {karyawan.nama}
              </DialogTitle>
              {subtitle ? (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              ) : null}
            </DialogHeader>
          </div>

          <div className="flex items-center gap-2">
            {rightToolbar ? (
              rightToolbar
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCallClick}
                disabled={activeCall}
                title={activeCall ? "Nomor sedang dalam panggilan" : "Telepon"}
              >
                <Phone className="h-4 w-4 mr-2" />
                {activeCall ? "Sedang Panggilan" : "Telepon"}
              </Button>
            )}
          </div>
        </div>

        <div className="my-4 border-t border-border" />

        {/* Scrollable row: horizontal scroll on small screens, normal layout on sm+ */}
        <div className="overflow-x-auto">
          <div className="flex gap-6 max-h-[70vh] pr-2 min-w-max">
            {/* Left: personal info (fixed small, proportional on sm) */}
            <div className="w-[18rem] sm:w-1/3 min-w-0">
              <ScrollArea className="h-full whitespace-nowrap ps-px">
                <section className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">Informasi Diri</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">ID</div>
                      <div className="text-foreground font-medium">
                        {karyawan.id}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">
                        Pekerjaan
                      </div>
                      <div className="text-foreground font-medium">
                        {karyawan.pekerjaan}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">
                        Jenis Kelamin
                      </div>
                      <div className="text-foreground font-medium">
                        {karyawan.jenisKelamin}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Umur</div>
                      <div className="text-foreground font-medium">
                        {karyawan.umur} tahun
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">
                        Domisili
                      </div>
                      <div className="text-foreground font-medium">
                        {karyawan.domisili}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">
                        Status Pernikahan
                      </div>
                      <div className="text-foreground font-medium">
                        <MarriageBadge value={karyawan.statusPernikahan} />
                      </div>
                    </div>
                  </div>
                </section>
              </ScrollArea>
            </div>

            <div className="w-px bg-border hidden sm:block" />

            {/* Middle: call history (fixed small, flexible on sm) */}
            <div className="w-[28rem] sm:flex-1 min-w-0">
              <ScrollArea className="h-full rounded-md border p-4">
                <section>
                  <h3 className="text-sm font-semibold mb-2">
                    Riwayat Telepon Terakhir
                  </h3>
                  {Array.isArray(karyawan.calls) && karyawan.calls.length ? (
                    <div className="space-y-3 text-sm pr-2">
                      {karyawan.calls.map((c, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-md bg-background-secondary/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <div className="text-muted-foreground text-xs">
                                {c.date}
                              </div>
                              <div className="text-foreground font-medium">
                                {c.result || c.type || "Panggilan"}
                              </div>
                            </div>
                            <div className="text-muted-foreground text-xs ml-4">
                              {c.duration || ""}
                            </div>
                          </div>
                          {c.note ? (
                            <div className="text-sm text-muted-foreground mt-2">
                              {c.note}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Tidak ada riwayat telepon.
                    </div>
                  )}
                </section>
              </ScrollArea>
            </div>

            {/* Divider (visible on sm+) */}
            <div className="w-px bg-border hidden sm:block" />

            {/* Right: deposits */}
            <div className="w-[18rem] sm:w-80 min-w-[18rem]">
              <section>
                <h3 className="text-sm font-semibold mb-2">Daftar Deposito</h3>
                <div className="space-y-2">
                  {deposits.length ? (
                    <ScrollArea className="h-full">
                      {deposits.map((d, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-md bg-background-secondary/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <div className="text-muted-foreground text-xs">
                                Produk
                              </div>
                              <div className="text-foreground font-medium">
                                {d.product}
                              </div>

                              <div className="mt-2 text-xs text-muted-foreground">
                                Jenis Deposito
                              </div>
                              <div className="mt-1">
                                <DepositTypeBadge
                                  type={d.type || d.productType || `Type`}
                                />
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm text-foreground">
                                {d.amount}
                              </div>
                              <div className="mt-2">
                                <DepositStatusBadge
                                  status={
                                    d.status ||
                                    d.state ||
                                    (d.active ? "Active" : "Inactive")
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Tidak ada deposito.
                    </div>
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
            <Button variant="warning" className="w-full">
              Tutup
            </Button>
          </DialogClose>
          {footerActions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
