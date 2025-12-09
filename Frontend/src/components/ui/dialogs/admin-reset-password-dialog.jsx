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
import { useLang } from "@/hooks/useLang";
export default function AdminResetPasswordDialog({
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
            {t("dialog.adminResetPassword.title", "Reset Password")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "dialog.adminResetPassword.description_prefix",
              "Reset password untuk"
            )}{" "}
            <strong>{user.nama}</strong>?{" "}
            {t(
              "dialog.adminResetPassword.description_suffix",
              "Pengguna akan menerima password sementara."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="pt-2" />

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost" onClick={handleCancel}>
              {t("dialog.adminResetPassword.cancel", "Batal")}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleConfirm}>
              {t("dialog.adminResetPassword.confirm", "Reset Password")}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
