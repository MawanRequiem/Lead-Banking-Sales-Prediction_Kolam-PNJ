import React, { useState } from "react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import CustomerDetailDialog from "@/components/ui/dialogs/customer-detail-dialog";
import { MoreHorizontal, Info, Phone } from "lucide-react";
import CallResultDialog from "@/components/ui/dialogs/call-result-dialog";

// Component untuk menampilkan tombol aksi pada setiap baris data nasabah
export default function ActionCell({ nasabah }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const handleCallLog = () => {
    setIsResultOpen(true);
  };

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const hoverCardContent = (
    <div className="space-y-1">
      <p className="text-sm font-semibold">{nasabah.nama}</p>
      <div className="text-xs text-muted-foreground">
        <p>Pekerjaan: {nasabah.pekerjaan}</p>
        <p>Umur: {nasabah.umur} thn</p>
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

      <CustomerDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        nasabah={nasabah}
        title="Detail Nasabah"
        subtitle={`Nomor: ${nasabah.nomorTelepon || "-"}`}
        openLogDialog={handleCallLog}
        rightToolbar={
          <Button variant="outline" size="sm" onClick={handleCallLog}>
            <Phone className="h-4 w-4 mr-2" />
            Telepon
          </Button>
        }
      />

      <CallResultDialog
        open={isResultOpen}
        onOpenChange={setIsResultOpen}
        nasabah={nasabah}
        onSave={(payload) => {
          // payload contains hasilTelepon, catatan, nasabahId, lamaTelepon, nextFollowupDate
          console.log("Call result saved:", payload);
          // close result dialog
          setIsResultOpen(false);
        }}
      />
    </>
  );
}
