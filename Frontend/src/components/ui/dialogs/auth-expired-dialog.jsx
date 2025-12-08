import React from "react";
import * as Dialog from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/theme-context.jsx";

export default function AuthExpiredDialog({ open = false, onOpenChange }) {
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogPortal>
        <Dialog.DialogOverlay />
        <Dialog.DialogContent className="w-full max-w-md">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>
              {t("dialog.authExpired.title", "Sesi Berakhir")}
            </Dialog.DialogTitle>
            <Dialog.DialogDescription>
              {t(
                "dialog.authExpired.description",
                "Sesi Anda telah berakhir. Silakan masuk kembali untuk melanjutkan."
              )}
            </Dialog.DialogDescription>
          </Dialog.DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                try {
                  if (typeof onOpenChange === "function") onOpenChange(false);
                } catch (e) {}
                navigate("/login", { replace: true });
              }}
            >
              {t("dialog.authExpired.openLogin", "Buka Halaman Login")}
            </Button>
          </div>
        </Dialog.DialogContent>
      </Dialog.DialogPortal>
    </Dialog.Dialog>
  );
}
