import React, { useState } from 'react'
import * as Dialog from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminImportDialog({ open = false, onOpenChange, onImport }) {
  const [file, setFile] = useState(null)

  function handleFile(e) {
    setFile(e.target.files?.[0] ?? null)
  }

  function handleImport() {
    if (!file) return
    // For now, call the callback with the file and close
    if (typeof onImport === 'function') onImport(file)
    if (typeof onOpenChange === 'function') onOpenChange(false)
    setFile(null)
  }

  return (
    <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogContent>
        <Dialog.DialogHeader>
          <Dialog.DialogTitle>Import Users</Dialog.DialogTitle>
          <Dialog.DialogDescription>Unggah file CSV berisi daftar user (kolom: nama,email,role,domisili,nomorTelepon).</Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <div className="py-4">
          <Input type="file" accept=".csv" onChange={handleFile} />
          {file ? <div className="mt-2 text-sm">Selected: {file.name}</div> : null}
        </div>

        <Dialog.DialogFooter>
          <Button variant="ghost" onClick={() => { if (typeof onOpenChange === 'function') onOpenChange(false); setFile(null) }}>Batal</Button>
          <Button onClick={handleImport} disabled={!file}>Import</Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  )
}
