import React, { useState } from "react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import CustomerDetailDialog from "@/components/ui/dialogs/customer-detail-dialog";
import { MoreHorizontal, Info, Phone } from "lucide-react";
import CallTimerOverlay from "@/components/ui/dialogs/call-timer-overlay";
import CallResultDialog from "@/components/ui/dialogs/call-result-dialog";

// Component untuk menampilkan tombol aksi pada setiap baris data karyawan
export default function ActionCell({ karyawan }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [lastCall, setLastCall] = useState(null);
  const [timerStart, setTimerStart] = useState(null);

  const handleCallCenter = () => {
    // open controlled call timer dialog
    const ts = Date.now();
    setTimerStart(ts);
    setIsTimerOpen(true);
  };

  function openDialog() {
    if (process.env.NODE_ENV === "development")
      console.debug("[debug] ActionCell openDialog", karyawan?.id);
    setIsDialogOpen(true);
  }

  const hoverCardContent = (
    <div className="space-y-1">
      <p className="text-sm font-semibold">{karyawan.nama}</p>
      <div className="text-xs text-muted-foreground">
        <p>Pekerjaan: {karyawan.pekerjaan}</p>
        <p>Umur: {karyawan.umur} thn</p>
      </div>
      <Button
        variant="default"
        size="sm"
        className="w-full mt-2"
        onClick={openDialog}
      >
        <Info className="h-4 w-4 mr-2" />
        Lihat Detail Lengkap
      </Button>
    </div>
  );

  return (
    <>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon" onClick={openDialog}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent>{hoverCardContent}</HoverCardContent>
      </HoverCard>

      {process.env.NODE_ENV === "development" && (
        <span className="text-xs text-muted-foreground ml-2">
          open:{isDialogOpen ? "1" : "0"}
        </span>
      )}

      <CustomerDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        karyawan={karyawan}
        title="Detail Karyawan"
        subtitle={`Nomor: ${karyawan.nomorTelepon || "-"}`}
        onCall={handleCallCenter}
        rightToolbar={
          <Button variant="outline" size="sm" onClick={handleCallCenter}>
            <Phone className="h-4 w-4 mr-2" />
            Telepon
          </Button>
        }
      />

      {/* Controlled Call Timer (non-dismissible except hangup) */}
      <CallTimerOverlay
        open={isTimerOpen}
        onOpenChange={setIsTimerOpen}
        callerName={karyawan.nama}
        callerPhone={karyawan.nomorTelepon}
        startedAt={timerStart}
        onHangup={({ startedAt, durationSec }) => {
          // close timer and open result dialog
          setIsTimerOpen(false);
          setLastCall({ startedAt, durationSec });
          setIsResultOpen(true);
        }}
      />

      <CallResultDialog
        open={isResultOpen}
        onOpenChange={setIsResultOpen}
        caller={karyawan}
        startedAt={lastCall?.startedAt}
        durationSec={lastCall?.durationSec}
        onSave={(payload) => {
          // payload contains result, note, caller, startedAt, durationSec
          console.log("Call result saved:", payload);
          // close result dialog
          setIsResultOpen(false);
        }}
      />
    </>
  );
}
