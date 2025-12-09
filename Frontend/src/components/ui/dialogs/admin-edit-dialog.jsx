import React, { useEffect, useState, useRef, startTransition } from "react";
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AdminEditDialog({
  open = false,
  onOpenChange,
  user = {},
  onSave,
}) {
  const { t } = useLang();
  const [form, setForm] = useState({
    nama: "",
    nomorTelepon: "",
    email: "",
    domisili: "",
  });

  // track previous open state so we only reset the form when dialog opens
  const prevOpen = useRef(false);
  useEffect(() => {
    const shouldReset = open && !prevOpen.current;
    prevOpen.current = open;
    if (!shouldReset) return;

    const nextForm = {
      nama: user.nama || "",
      nomorTelepon: user.nomorTelepon || user.phone || "",
      email: user.email || "",
      domisili: user.domisili || "",
      // role/status intentionally omitted: cannot be edited via this dialog
    };

    startTransition(() => setForm(nextForm));
  }, [open, user]);

  function handleChange(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function handleConfirm() {
    if (typeof onSave === "function") onSave({ ...user, ...form });
    if (typeof onOpenChange === "function") onOpenChange(false);
  }

  function handleCancel() {
    if (typeof onOpenChange === "function") onOpenChange(false);
  }

  // prevent outside/escape close by swallowing close requests
  function handleOpenChange(value) {
    if (value && typeof onOpenChange === "function") onOpenChange(true);
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
          <Dialog.DialogTitle>
            {t("dialog.adminEdit.title", "Edit Admin")}
          </Dialog.DialogTitle>
          <Dialog.DialogDescription>
            {t(
              "dialog.adminEdit.description",
              "Ubah data admin. Tutup hanya dengan Simpan atau Batal."
            )}
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <div className="grid gap-3 py-4">
          <div>
            <label className="text-sm text-muted-foreground">
              {t("dialog.adminEdit.fields.nama", "Nama")}
            </label>
            <Input
              value={form.nama}
              onChange={(e) => handleChange("nama", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              {t("dialog.adminEdit.fields.nomorTelepon", "No. Telepon")}
            </label>
            <Input
              value={form.nomorTelepon}
              onChange={(e) => handleChange("nomorTelepon", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              {t("dialog.adminEdit.fields.email", "Email")}
            </label>
            <Input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              {t("dialog.adminEdit.fields.domisili", "Domisili")}
            </label>
            <Input
              value={form.domisili}
              onChange={(e) => handleChange("domisili", e.target.value)}
            />
          </div>

          {/* Role and status are not editable here; managed by admin endpoints separately */}
        </div>

        <Dialog.DialogFooter>
          <Button variant="ghost" onClick={handleCancel}>
            {t("dialog.adminEdit.cancel", "Batal")}
          </Button>
          <Button onClick={handleConfirm}>
            {t("dialog.adminEdit.save", "Simpan")}
          </Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
}
