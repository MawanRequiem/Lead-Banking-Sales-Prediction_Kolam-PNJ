import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import loginPic from "@/assets/login.png";

export default function ChangePasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const passedToken = location?.state?.verificationToken || null;
  const [verificationToken, setVerificationToken] = useState(passedToken);
  const [step, setStep] = useState(passedToken ? 2 : 1);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function verifyCurrent() {
    setLoading(true);
    setErrors({});
    try {
      const res = await axios.post("/verify-current", { currentPassword });
      const verificationToken =
        res?.data?.data?.verificationToken || res?.data?.verificationToken;
      if (verificationToken) {
        // place token into history state so page can read it if reloaded
        window.history.replaceState({ verificationToken }, document.title);
        setVerificationToken(verificationToken);
      }
      setStep(2);
      toast.success("Current password verified — please enter new password");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Verification failed";
      setErrors({ currentPassword: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function submitChange() {
    setLoading(true);
    setErrors({});
    try {
      const tokenToUse = verificationToken || passedToken;
      const payload = tokenToUse
        ? { verificationToken: tokenToUse, newPassword, confirmPassword }
        : { currentPassword, newPassword, confirmPassword };
      const res = await axios.post("/change-password", payload);
      // Force re-authentication after password change: redirect user to login
      // Tokens are stored in httpOnly cookies; no localStorage cleanup needed.
      navigate("/login", { replace: true });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStep(1);
    } catch (err) {
      const data = err?.response?.data;
      if (data && data.errors) {
        const next = {};
        data.errors.forEach((e) => {
          if (e && e.message && e.path) next[e.path[0]] = e.message;
        });
        setErrors(next);
      }
      const msg = data?.message || err.message || "Change password failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background md:bg-muted/10">
      {/* Left: illustration (hidden on small) — image on left for ChangePassword */}
      <div className="hidden md:flex items-center justify-center h-screen overflow-hidden w-1/2">
        <div className="min-w-xl w-full overflow-hidden">
          <img
            src={loginPic}
            alt="Illustration"
            className="w-full h-auto object-cover block"
          />
        </div>
      </div>

      {/* Right: form (50%) */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full p-8 max-w-lg">
          <h1 className="text-3xl font-bold text-primary mb-6">
            Change Password
          </h1>

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan Password Milikmu di Sini"
                  />
                  <button
                    type="button"
                    aria-label={showCurrent ? "Hide password" : "Show password"}
                    onClick={() => setShowCurrent((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showCurrent ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors.currentPassword}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={verifyCurrent}
                  disabled={loading || !currentPassword}
                >
                  {loading ? "Memverifikasi..." : "Verify"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan Password Baru di Sini"
                  />
                  <button
                    type="button"
                    aria-label={showNew ? "Hide password" : "Show password"}
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showNew ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors.newPassword}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Masukkan Password Baru di Sini"
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button onClick={() => setStep(1)} variant="ghost">
                  Back
                </Button>
                <Button
                  onClick={submitChange}
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading ? "Menyimpan..." : "Change Password"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
