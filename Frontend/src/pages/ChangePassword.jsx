import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import loginPic from "@/assets/login.png";
import { useLang } from "@/hooks/useLang";

export default function ChangePasswordPage() {
  const { t } = useLang();
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

  // Password requirements: ≥12 chars, uppercase, lowercase, number, special char
  const pwdPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;
  const passwordRequirementMessage = t(
    "page.changePassword.passwordRequirements",
    "Kata sandi minimal 12 karakter dan mengandung huruf besar, huruf kecil, angka, dan simbol"
  );

  function validateNewPasswordInputs() {
    const next = {};
    if (!pwdPattern.test(newPassword)) {
      next.newPassword = passwordRequirementMessage;
    }
    if (confirmPassword !== newPassword) {
      next.confirmPassword = t(
        "page.changePassword.mismatch",
        "Konfirmasi kata sandi harus sama dengan kata sandi baru"
      );
    }
    setErrors(next);
    if (Object.keys(next).length) {
      const firstMsg = Object.values(next)[0];
      toast.error(firstMsg);
      return false;
    }
    return true;
  }

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
      toast.success(
        t(
          "page.changePassword.verifiedRedirect",
          "Current password verified — please enter new password"
        )
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        t("page.changePassword.errorDefault", "Verification failed");
      setErrors({ currentPassword: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function submitChange() {
    // Client-side validation before hitting the server
    setErrors({});
    const ok = validateNewPasswordInputs();
    if (!ok) {
      return;
    }
    setLoading(true);
    try {
      const tokenToUse = verificationToken || passedToken;
      const payload = tokenToUse
        ? { verificationToken: tokenToUse, newPassword, confirmPassword }
        : { currentPassword, newPassword, confirmPassword };
      const res = await axios.post("/change-password", payload);
      // Force re-authentication after password change: redirect user to login
      // Tokens are stored in httpOnly cookies; no localStorage cleanup needed.
      navigate("/login", { replace: true });
      toast.success(
        t("page.changePassword.success", "Password changed successfully")
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStep(1);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 422 && data && Array.isArray(data.errors)) {
        const next = {};
        data.errors.forEach((e) => {
          const key = (e && (e.field || (e.path && e.path[0]))) || "general";
          const message =
            (e && e.message) ||
            t("page.changePassword.failed", "Change password failed");
          next[key] = message;
        });
        setErrors(next);
        const firstMsg = Object.values(next)[0];
        toast.error(firstMsg);
      } else {
        const msg =
          data?.message ||
          data?.detail ||
          err.message ||
          t("page.changePassword.failed", "Change password failed");
        toast.error(msg);
      }
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
            {t("page.changePassword.title", "Change Password")}
          </h1>

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  {t("page.changePassword.currentLabel", "Current Password")}
                </label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t(
                      "page.changePassword.currentPlaceholder",
                      "Enter your current password"
                    )}
                  />
                  <button
                    type="button"
                    aria-label={
                      showCurrent
                        ? t("page.changePassword.hidePassword", "Hide password")
                        : t("page.changePassword.showPassword", "Show password")
                    }
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
                  {loading
                    ? t("page.changePassword.verifying", "Verifying...")
                    : t("page.changePassword.verify", "Verify")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  {t("page.changePassword.newLabel", "New Password")}
                </label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t(
                      "page.changePassword.newPlaceholder",
                      "Enter your new password"
                    )}
                  />
                  <button
                    type="button"
                    aria-label={
                      showNew
                        ? t("page.changePassword.hidePassword", "Hide password")
                        : t("page.changePassword.showPassword", "Show password")
                    }
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
                {/* Helper: password requirements */}
                <div className="text-xs text-muted-foreground mt-1">
                  {passwordRequirementMessage}
                </div>
                {errors.newPassword && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors.newPassword}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  {t("page.changePassword.confirmLabel", "Confirm Password")}
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t(
                      "page.changePassword.confirmPlaceholder",
                      "Confirm your new password"
                    )}
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirm
                        ? t("page.changePassword.hidePassword", "Hide password")
                        : t("page.changePassword.showPassword", "Show password")
                    }
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
                  {t("page.changePassword.back", "Back")}
                </Button>
                <Button
                  onClick={submitChange}
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading
                    ? t("page.changePassword.saving", "Saving...")
                    : t("page.changePassword.submit", "Change Password")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
