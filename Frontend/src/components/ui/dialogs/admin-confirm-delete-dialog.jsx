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

export default function AdminConfirmDeleteDialog({
  open = false,
  onOpenChange,
  user = {},
  onConfirm,
}) {
  function handleConfirm() {
    if (typeof onConfirm === "function") onConfirm(user);
    if (typeof onOpenChange === "function") onOpenChange(false);
  }

  function handleCancel() {
    if (typeof onOpenChange === "function") onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan <strong>menghapus</strong> akun{" "}
            <strong>{user.nama || user.email}</strong>. Aksi ini akan menandai
            akun sebagai terhapus (soft delete) dan tidak dapat dilihat pada
            daftar publik. Lanjutkan?
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
            <Button variant="destructive" onClick={handleConfirm}>
              Hapus
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
