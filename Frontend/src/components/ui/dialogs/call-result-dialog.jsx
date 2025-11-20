import React, { useState } from 'react'
import * as Dialog from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export default function CallResultDialog({ open, onOpenChange, onSave, caller, startedAt, durationSec }) {
  const [result, setResult] = useState('Terkoneksi')
  const [note, setNote] = useState('')

  function handleSave() {
    const payload = { result, note, caller, startedAt, durationSec }
    if (typeof onSave === 'function') onSave(payload)
    if (typeof onOpenChange === 'function') onOpenChange(false)
  }

return (
    <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
        <Dialog.DialogPortal>
            <Dialog.DialogOverlay />
            <Dialog.DialogContent className="w-full max-w-md">
                <Dialog.DialogHeader>
                    <Dialog.DialogTitle>Catatan Hasil Telepon</Dialog.DialogTitle>
                    <Dialog.DialogDescription>Catat hasil panggilan dan tambahkan catatan singkat.</Dialog.DialogDescription>
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
                                <SelectItem value="Tidak Terangkat">Tidak Terangkat</SelectItem>
                                <SelectItem value="Tidak Tertarik">Tidak Tertarik</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Catatan</label>
                        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis catatan singkat..." />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button onClick={handleSave}>Simpan</Button>
                    </div>
                </div>
            </Dialog.DialogContent>
        </Dialog.DialogPortal>
    </Dialog.Dialog>
)
}
