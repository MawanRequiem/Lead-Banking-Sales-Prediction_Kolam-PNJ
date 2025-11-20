import React, { useEffect, useState, useRef, startTransition } from 'react'
import * as Dialog from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export default function AdminEditDialog({ open = false, onOpenChange, user = {}, onSave }) {
  const [form, setForm] = useState({
    nama: '',
    nomorTelepon: '',
    email: '',
    domisili: '',
    role: 'sales',
    status: 'active',
  })

  // track previous open state so we only reset the form when dialog opens
  const prevOpen = useRef(false)
  useEffect(() => {
    const shouldReset = open && !prevOpen.current
    prevOpen.current = open
    if (!shouldReset) return

    const nextForm = {
      nama: user.nama || '',
      nomorTelepon: user.nomorTelepon || user.phone || '',
      email: user.email || '',
      domisili: user.domisili || '',
      role: user.role || 'sales',
      status: user.status || 'active',
    }

    startTransition(() => setForm(nextForm))
  }, [open, user])
  
  function handleChange(key, value) {
    setForm((s) => ({ ...s, [key]: value }))
  }

  function handleConfirm() {
    if (typeof onSave === 'function') onSave({ ...user, ...form })
    if (typeof onOpenChange === 'function') onOpenChange(false)
  }

  function handleCancel() {
    if (typeof onOpenChange === 'function') onOpenChange(false)
  }

  // prevent outside/escape close by swallowing close requests
  function handleOpenChange(value) {
    if (value && typeof onOpenChange === 'function') onOpenChange(true)
    // ignore automatic close requests from outside interactions
  }

  return (
    <Dialog.Dialog open={open} onOpenChange={handleOpenChange}>
      <Dialog.DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <Dialog.DialogHeader>
          <Dialog.DialogTitle>Edit Admin</Dialog.DialogTitle>
          <Dialog.DialogDescription>Ubah data admin. Tutup hanya dengan Simpan atau Batal.</Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <div className="grid gap-3 py-4">
          <div>
            <label className="text-sm text-muted-foreground">Nama</label>
            <Input value={form.nama} onChange={(e) => handleChange('nama', e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">No. Telepon</label>
            <Input value={form.nomorTelepon} onChange={(e) => handleChange('nomorTelepon', e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <Input value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Domisili</label>
            <Input value={form.domisili} onChange={(e) => handleChange('domisili', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <Select value={form.role} onValueChange={(v) => handleChange('role', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Dialog.DialogFooter>
          <Button variant="ghost" onClick={handleCancel}>Batal</Button>
          <Button onClick={handleConfirm}>Simpan</Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  )
}
