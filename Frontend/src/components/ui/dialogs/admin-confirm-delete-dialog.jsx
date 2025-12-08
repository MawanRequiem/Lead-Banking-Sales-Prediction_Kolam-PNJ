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
import { useLang } from "@/contexts/theme-context.jsx";

export default function AdminConfirmDeleteDialog({
  open = false,
  onOpenChange,
  user = {},
  onConfirm,
}) {
  const { t } = useLang();
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
          <AlertDialogTitle>
            {t("dialog.adminDelete.title", "Hapus Pengguna")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("dialog.adminDelete.description_prefix", "Anda akan")}{" "}
            <strong>
              {t("dialog.adminDelete.description_action", "menghapus")}
            </strong>{" "}
            {t("dialog.adminDelete.description_account", "akun")}{" "}
            <strong>{user.nama || user.email}</strong>.{" "}
            {t(
              "dialog.adminDelete.description_suffix",
              "Aksi ini akan menandai akun sebagai terhapus (soft delete) dan tidak dapat dilihat pada daftar publik. Lanjutkan?"
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="pt-2" />

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost" onClick={handleCancel}>
              {t("dialog.adminDelete.cancel", "Batal")}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleConfirm}>
              {t("dialog.adminDelete.confirm", "Hapus")}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
