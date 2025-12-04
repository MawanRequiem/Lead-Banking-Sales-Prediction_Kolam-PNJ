import React, {useEffect} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MarriageBadge,
  DepositStatusBadge,
  DepositTypeBadge,
} from "@/components/ui/badges";
import { formatDisplay, formatSecondsToHHMMSS } from "@/lib/date-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone } from "lucide-react";
import useLeadDetail from "@/hooks/useLeadDetail";

// A focused dialog component for customer details. Keep presentation here
// so callers can simply open/close and pass `karyawan` data.
export default function CustomerDetailDialog({
  open,
  onOpenChange,
  nasabah = {},
  title = "Detail Karyawan",
  subtitle = "",
  rightToolbar = null,
  footerActions = null,
  openLogDialog, // optional handler for call action
}) {
  const { data } = useLeadDetail(nasabah.id, open); //data has profil, metrik, and history

  // fallback to nasabah while loading
  const profil = data?.profil ?? {
    nama: nasabah.nama,
    pekerjaan: nasabah.pekerjaan,
    umur: nasabah.umur,
    domisili: nasabah.domisili,
    jenisKelamin: nasabah.jenisKelamin,
    statusPernikahan: nasabah.statusPernikahan
  };
  //data.history contains deposito[], telepon[]
  const deposito = data?.history?.deposito ?? [];
  const telepon = data?.history?.telepon ?? [];

  function handleCallClick() {
    if (typeof openLogDialog === "function") openLogDialog();
  }

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        "[debug] CustomerDetailDialog open=",
        open,
        "id=",
        karyawan?.id
      );
    }
  }, [open, karyawan?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[70vw] max-w-[95vw]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <DialogHeader>
              <DialogTitle>
                {title}: {profil.nama}
              </DialogTitle>
              {subtitle ? (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              ) : null}
            </DialogHeader>
            <DialogDescription className="sr-only">
              Detail informasi customer.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {rightToolbar ? (
              rightToolbar
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCallClick}
                title={"Log Call"}
              >
                <Phone className="h-4 w-4 mr-2" />
                {"Log Call"}
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
                        {profil.id}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">
                        Pekerjaan
                      </div>
                      <div className="text-foreground font-medium">
                        {profil.pekerjaan}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">
                        Jenis Kelamin
                      </div>
                      <div className="text-foreground font-medium">
                        {profil.jenisKelamin}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Umur</div>
                      <div className="text-foreground font-medium">
                        {profil.umur} tahun
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">
                        Domisili
                      </div>
                      <div className="text-foreground font-medium">
                        {profil.domisili}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">
                        Status Pernikahan
                      </div>
                      <div className="text-foreground font-medium">
                        <MarriageBadge value={profil.statusPernikahan} />
                      </div>
                    </div>
                  </div>
                </section>
              </ScrollArea>
            </div>

            <div className="w-px bg-border hidden sm:block" />

            {/* Middle: call history (fixed small, flexible on sm) */}
            <div className="w-md sm:flex-1 min-w-0">
              <ScrollArea className="h-full rounded-md border p-4">
                <section>
                  <h3 className="text-sm font-semibold mb-2">
                    Riwayat Telepon Terakhir
                  </h3>
                  {telepon.length ? (
                    <div className="space-y-3 text-sm pr-2">
                      {telepon.map((c, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-md bg-background-secondary/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <div className="text-muted-foreground text-xs">
                                { formatDisplay(c.tanggal) || "-"}
                              </div>
                              <div className="text-foreground font-medium">
                                {c.hasil || "Panggilan"}
                              </div>
                            </div>
                            <div className="text-muted-foreground text-xs ml-4">
                              { formatSecondsToHHMMSS(c.durasi) || "" }
                            </div>
                          </div>
                          {c.catatan ? (
                            <div className="text-sm text-muted-foreground mt-2">
                              {c.catatan}
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
                  {deposito.length ? (
                    <ScrollArea className="h-full">
                      {deposito.map((d, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-md bg-background-secondary/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">

                              <div className="mt-2 text-xs text-muted-foreground">
                                Jenis Deposito
                              </div>
                              <div className="mt-1">
                                <DepositTypeBadge
                                  type={d.jenis}
                                />
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="mt-2">
                                <DepositStatusBadge
                                  status={
                                    d.status
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
