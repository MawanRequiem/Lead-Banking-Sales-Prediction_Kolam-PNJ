import React from "react";
import * as Dialog from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AuthExpiredDialog({ open = false, onOpenChange }) {
  const navigate = useNavigate();

  return (
    <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogPortal>
        <Dialog.DialogOverlay />
        <Dialog.DialogContent className="w-full max-w-md">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>Sesi Berakhir</Dialog.DialogTitle>
            <Dialog.DialogDescription>
              Sesi Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.
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
              Buka Halaman Login
            </Button>
          </div>
        </Dialog.DialogContent>
      </Dialog.DialogPortal>
    </Dialog.Dialog>
  );
}
