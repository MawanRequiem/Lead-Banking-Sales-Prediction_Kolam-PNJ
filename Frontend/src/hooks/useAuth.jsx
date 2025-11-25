import { useCallback, useState } from "react";
import axios from "@/lib/axios";
import useProfile from "./useProfile";

export default function useAuth() {
  const { setUser } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post("/login", { email, password });
        const data = res.data.data || {};

        const accessToken = data.accessToken;
        const refreshToken = data.refreshToken;
        const user = data.user || {};

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        const userRole = user.role || "";
        const userName = user.nama || user.email || "";
        const userEmail = user.email || "";

        try {
          localStorage.setItem("userRole", userRole);
          localStorage.setItem("userName", userName);
          localStorage.setItem("userEmail", userEmail);
        } catch (e) {
          // ignore storage errors
        }

        if (typeof setUser === "function") {
          setUser({ name: userName, email: userEmail, role: userRole });
        }

        setLoading(false);
        return {
          success: true,
          user: { name: userName, role: userRole, email: userEmail },
        };
      } catch (err) {
        setError(err);
        setLoading(false);
        return { success: false, error: err };
      }
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    // best-effort: call backend logout endpoint if available
    try {
      const rt = localStorage.getItem("refreshToken");
      if (rt) {
        await axios.post("/logout", { refreshToken: rt });
      }
    } catch (e) {
      // ignore
    }

    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
    } catch (e) {}

    if (typeof setUser === "function") setUser(null);
  }, [setUser]);

  return {
    login,
    logout,
    loading,
    error,
  };
}
