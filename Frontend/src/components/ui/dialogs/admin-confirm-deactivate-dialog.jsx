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

export default function AdminConfirmDeactivateDialog({
  open = false,
  onOpenChange,
  user = {},
  onConfirm,
  mode = "deactivate",
}) {
  const { t } = useLang();
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
              ? t("dialog.adminDeactivate.titleActivate", "Konfirmasi Aktivasi")
              : t(
                  "dialog.adminDeactivate.titleDeactivate",
                  "Konfirmasi Nonaktifkan"
                )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {mode === "activate" ? (
              <>
                {t(
                  "dialog.adminDeactivate.activate_prefix",
                  "Anda akan mengaktifkan akun"
                )}{" "}
                <strong>{user.nama}</strong>.{" "}
                {t(
                  "dialog.adminDeactivate.activate_suffix",
                  "Pengguna akan dapat masuk kembali."
                )}
              </>
            ) : (
              <>
                {t(
                  "dialog.adminDeactivate.deactivate_prefix",
                  "Anda akan menonaktifkan akun"
                )}{" "}
                <strong>{user.nama}</strong>.{" "}
                {t(
                  "dialog.adminDeactivate.deactivate_suffix",
                  "Aksi ini dapat dibatalkan oleh admin."
                )}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="pt-2" />

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost" onClick={handleCancel}>
              {t("dialog.adminDeactivate.cancel", "Batal")}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={mode === "activate" ? "default" : "destructive"}
              onClick={handleConfirm}
            >
              {mode === "activate"
                ? t("dialog.adminDeactivate.confirmActivate", "Aktifkan")
                : t("dialog.adminDeactivate.confirmDeactivate", "Nonaktifkan")}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
