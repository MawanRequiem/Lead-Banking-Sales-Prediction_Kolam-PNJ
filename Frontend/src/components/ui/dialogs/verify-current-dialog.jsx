import React, { useEffect, useState } from "react";
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function VerifyCurrentDialog({
  open: openProp,
  onOpenChange,
} = {}) {
  const [open, setOpen] = useState(Boolean(openProp));
  const [password, setPassword] = useState("");
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
      setOpen(true);
    }
    window.addEventListener("open-verify-current", handle);
    return () => window.removeEventListener("open-verify-current", handle);
  }, [openProp]);

  function handleOpenChange(next) {
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
          "Password verified — redirecting to change password page"
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
        msg = "User tidak ditemukan, silahkan coba kembalia";
      } else if (status >= 500 && status < 600) {
        msg = "Terjadi masalah, silahkan coba beberapa saat lagi";
      } else if (serverMsg) {
        msg = serverMsg;
      } else {
        msg = e?.message || "Verification failed";
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
            Verifikasi Kata Sandi Saat Ini
          </Dialog.DialogTitle>
          <Dialog.DialogDescription>
            Masukkan kata sandi saat ini untuk melanjutkan ke halaman
            penggantian kata sandi.
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <div className="py-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Kata Sandi Saat Ini
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
          </div>
        </div>

        <Dialog.DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={verify} disabled={loading || !password}>
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
}
