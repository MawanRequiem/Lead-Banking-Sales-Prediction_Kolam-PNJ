import React, { useState } from "react";
import * as Dialog from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatDateTime, formatDurationSec } from "@/lib/date-utils";

export default function CallResultDialog({
  open,
  onOpenChange,
  onSave,
  // legacy `caller` prop supported, prefer explicit `callerName` and `callerPhone`
  caller: callerPhoneProp,
  callerName = "",
  callerPhone = undefined,
  callId = undefined,
  startedAt,
  durationSec,
}) {
  const [result, setResult] = useState("Terkoneksi");
  const [note, setNote] = useState("");

  const effectivePhone = callerPhone || callerPhoneProp || "";

  function handleSave() {
    const payload = { result, note, caller, startedAt, durationSec };
    if (typeof onSave === "function") onSave(payload);
    if (typeof onOpenChange === "function") onOpenChange(false);
  }

  return (
    <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogPortal>
        <Dialog.DialogOverlay />
        <Dialog.DialogContent className="w-full max-w-md">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>Catatan Hasil Telepon</Dialog.DialogTitle>
            <Dialog.DialogDescription>
              Catat hasil panggilan dan tambahkan catatan singkat.
            </Dialog.DialogDescription>

            <div className="mt-3 text-sm text-muted-foreground">
              {callId ? (
                <div>
                  <strong>ID:</strong> {callId}
                </div>
              ) : null}
              <div>
                <strong>Nomor:</strong> {effectivePhone || "-"}
                {callerName ? ` — ${callerName}` : ""}
              </div>
              <div>
                <strong>Waktu Mulai:</strong> {formatDateTime(startedAt) || "-"}
              </div>
              <div>
                <strong>Durasi:</strong> {formatDurationSec(durationSec) || "-"}
              </div>
            </div>
          </Dialog.DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm mb-1">Hasil Panggilan</label>

              <Select value={result} onValueChange={setResult}>
                <SelectTrigger className="w-full rounded-md border bg-transparent px-3 py-2">
                  <SelectValue placeholder="Pilih hasil..." />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Terkoneksi">Terkoneksi</SelectItem>
                  <SelectItem value="Voicemail">Voicemail</SelectItem>
                  <SelectItem value="Tidak Terangkat">
                    Tidak Terangkat
                  </SelectItem>
                  <SelectItem value="Tidak Tertarik">Tidak Tertarik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm mb-1">Catatan</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tulis catatan singkat..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </Dialog.DialogContent>
      </Dialog.DialogPortal>
    </Dialog.Dialog>
  );
}
