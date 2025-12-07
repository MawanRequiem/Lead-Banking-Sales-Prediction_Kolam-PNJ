import { useCallback, useState } from "react";
import axios from "@/lib/axios";
import useProfile from "@/hooks/useProfile";

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useProfile();

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post("/login", { email, password });
        const data = res.data.data || {};

        const user = data.user || {};
        const userData = {
          role: user.role || "",
          name: user.nama || user.email || "",
          email: user.email || "",
          phone: user.nomorTelepon || user.phone || "",
          domisili: user.domisili || user.city || "",
        };

        setUser(userData);
        setLoading(false);
        return {
          success: true,
          user: userData,
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
    // best-effort: call backend logout endpoint
    try {
      await axios.post("/logout");
    } catch (e) {
      // ignore errors
    }
    setUser(null);
  }, [setUser]);

  return {
    login,
    logout,
    loading,
    error,
  };
}
