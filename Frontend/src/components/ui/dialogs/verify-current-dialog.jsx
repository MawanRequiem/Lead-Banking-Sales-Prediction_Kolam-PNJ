import React, { useEffect, useState } from "react";
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useLang } from "@/contexts/theme-context.jsx";

export default function VerifyCurrentDialog({
  open: openProp,
  onOpenChange,
} = {}) {
  const { t } = useLang();
  const [open, setOpen] = useState(Boolean(openProp));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Support both controlled and uncontrolled (listens for global event)
  useEffect(() => {
    if (typeof openProp !== "undefined") {
      setOpen(Boolean(openProp));
      return;
    }
    function handle() {
      console.log("✅ VerifyCurrentDialog: Received open-verify-current event");
      setOpen(true);
    }
    window.addEventListener("open-verify-current", handle);
    return () => window.removeEventListener("open-verify-current", handle);
  }, [openProp]);

  function handleOpenChange(next) {
    console.log("VerifyCurrentDialog: Open state changing to:", next);
    if (typeof onOpenChange === "function") onOpenChange(next);
    if (typeof openProp === "undefined") setOpen(next);
    if (!next) {
      setPassword("");
      setError(null);
      setLoading(false);
    }
  }

  async function verify() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/verify-current", {
        currentPassword: password,
      });
      // Accept both shapes: { data: { verificationToken } } or { verificationToken }
      const verificationToken =
        res?.data?.data?.verificationToken || res?.data?.verificationToken;
      if (!verificationToken) {
        toast.success(
          t(
            "dialog.verifyCurrent.verifiedRedirect",
            "Password verified — redirecting to change password page"
          )
        );
        handleOpenChange(false);
        navigate("/change-password");
        return;
      }

      // Close dialog and navigate, pass token in navigation state (not URL)
      handleOpenChange(false);
      navigate("/change-password", { state: { verificationToken } });
    } catch (e) {
      const status = e?.response?.status;
      const serverMsg = e?.response?.data?.message;
      let msg;

      if (status === 400) {
        msg = t(
          "dialog.verifyCurrent.errorWrongPassword",
          "Kata sandi salah, silahkan coba lagi"
        );
      } else if (status >= 500 && status < 600) {
        msg = t(
          "dialog.verifyCurrent.errorServer",
          "Terjadi masalah, silahkan coba beberapa saat lagi"
        );
      } else if (serverMsg) {
        msg = serverMsg;
      } else {
        msg =
          e?.message ||
          t("dialog.verifyCurrent.errorDefault", "Verification failed");
      }

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Dialog open={open} onOpenChange={handleOpenChange}>
      <Dialog.DialogContent>
        <Dialog.DialogHeader>
          <Dialog.DialogTitle>
            {t("dialog.verifyCurrent.title", "Verifikasi Kata Sandi Saat Ini")}
          </Dialog.DialogTitle>
          <Dialog.DialogDescription>
            {t(
              "dialog.verifyCurrent.description",
              "Masukkan kata sandi saat ini untuk melanjutkan ke halaman penggantian kata sandi."
            )}
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <div className="py-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              {t(
                "dialog.verifyCurrent.currentPasswordLabel",
                "Kata Sandi Saat Ini"
              )}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={
                  showPassword
                    ? t("dialog.verifyCurrent.hidePassword", "Hide password")
                    : t("dialog.verifyCurrent.showPassword", "Show password")
                }
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
          </div>
        </div>

        <Dialog.DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            {t("dialog.verifyCurrent.cancel", "Batal")}
          </Button>
          <Button onClick={verify} disabled={loading || !password}>
            {loading
              ? t("dialog.verifyCurrent.verifying", "Memverifikasi...")
              : t("dialog.verifyCurrent.verify", "Verifikasi")}
          </Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
}
