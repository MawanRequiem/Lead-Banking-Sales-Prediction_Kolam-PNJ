import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/useProfile";

export default function LoginForm({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const { setUser } = useProfile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        const userRole = result.user.role;
        // Set profile context immediately for instant UI update
        try {
          setUser && setUser(result.user);
        } catch (e) {
          console.debug("Failed to set profile after login", e);
        }
        if (userRole === "admin") {
          navigate("/admin");
        } else if (userRole === "sales") {
          navigate("/dashboard");
        } else {
          // Unknown or unauthorized role — do not navigate, remain on login
          console.warn("Login succeeded but role is not authorized:", userRole);
          alert("Anda tidak memiliki otorisasi untuk mengakses aplikasi ini.");
          setLoading(false);
          return;
        }
      } else {
        console.error("Login failed", result.error);
        alert(result.error?.response?.data?.message || "Login Gagal");
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert(err?.response?.data?.message || "Login Gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md bg-transparent">
      <h2 className="text-xl font-semibold mb-4">Selamat Datang!</h2>

      <div className="space-y-6 px-2 mb-6">
        <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan Email Milikmu di Sini"
          />
        </div>

        <div className="mb-12 relative">
          <label className="block text-sm mb-1">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan Password Milikmu di Sini"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
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
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Button
          type="submit"
          variant="default"
          className="flex-1 rounded-full"
          disabled={loading}
        >
          {loading ? "Signing..." : "Sign In"}
        </Button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Lupa Password akun?{" "}
          <a
            href="/forgot-password"
            className="text-primary hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            <span className="text-primary">Ajukan Reset Password</span>
          </a>
        </p>
      </div>
    </form>
  );
}
