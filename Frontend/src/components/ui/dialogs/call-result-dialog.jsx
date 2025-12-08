import React, { useState, useEffect } from "react";
import axios from "@/lib/axios";
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
import { parseDurationToSeconds } from "@/lib/date-utils";
import DateField from "../dropdown/date-field";

export default function CallResultDialog({
  open,
  onOpenChange,
  onSave,
  nasabah,
}) {
  const [result, setResult] = useState("");
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState(""); // HH:MM:SS
  const [ durationSec, setDurationSec ] = useState(0); // seconds integer
  const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().slice(0, 10));


  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open]);

  function handleDurationChange (e) {
    const value = e.target.value;
    setDuration(value);

    // Only parse if matches basic HH:MM:SS pattern
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      const sec = parseDurationToSeconds(value);
      setDurationSec(sec);
    }
  }

  async function handleSave() {
    const payload = {
      hasilTelepon: result,
      catatan: note,
      nasabahId: nasabah.id,
      lamaTelepon: durationSec,
      nextFollowupDate: followUpDate
    };
    try {
      const res = await axios.post("/sales/log-call", payload);
      // OPTIONAL: handle success (toast, etc.)
    } catch (err) {
      console.error("Failed to save call result:", err);
      // OPTIONAL: show error toast or message
    }
    if (typeof onSave === "function") onSave(payload);
    if (typeof onOpenChange === "function") onOpenChange(false);
  }

  function resetForm() {
    setResult(null);
    setNote("");
    setDuration("");
    setDurationSec(0);
    setFollowUpDate(null);
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
          </Dialog.DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm mb-1">Hasil Panggilan</label>

              <Select value={result} onValueChange={setResult}>
                <SelectTrigger className="w-full rounded-md border bg-transparent px-3 py-2">
                  <SelectValue placeholder="Pilih hasil..." />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Tertarik">Tertarik</SelectItem>
                  <SelectItem value="Tidak Tertarik">Tidak Tertarik</SelectItem>
                  <SelectItem value="Voicemail">Voicemail</SelectItem>
                  <SelectItem value="Tidak Terangkat">
                    Tidak Terangkat
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm mb-1">Durasi (HH:MM:SS)</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded-md"
                placeholder="00:00:00"
                value={duration}
                onChange={handleDurationChange}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Tanggal Follow-up</label>
              <DateField value={followUpDate} onChange={setFollowUpDate}/>
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
