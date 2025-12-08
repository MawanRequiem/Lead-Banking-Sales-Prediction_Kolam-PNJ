import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function AdminConfirmDeactivateDialog({
  open = false,
  onOpenChange,
  user = {},
  onConfirm,
  mode = "deactivate",
}) {
  function handleConfirm() {
    if (typeof onConfirm === "function") onConfirm(user);
    if (typeof onOpenChange === "function") onOpenChange(false);
  }

  function handleCancel() {
    if (typeof onOpenChange === "function") onOpenChange(false);
  }

  // simple confirm dialog — allow outside close by default
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {mode === "activate"
              ? "Konfirmasi Aktivasi"
              : "Konfirmasi Nonaktifkan"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {mode === "activate" ? (
              <>
                Anda akan mengaktifkan akun <strong>{user.nama}</strong>.
                Pengguna akan dapat masuk kembali.
              </>
            ) : (
              <>
                Anda akan menonaktifkan akun <strong>{user.nama}</strong>. Aksi
                ini dapat dibatalkan oleh admin.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="pt-2" />

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost" onClick={handleCancel}>
              Batal
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={mode === "activate" ? "default" : "destructive"}
              onClick={handleConfirm}
            >
              {mode === "activate" ? "Aktifkan" : "Nonaktifkan"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
