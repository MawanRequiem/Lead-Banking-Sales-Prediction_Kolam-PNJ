import { useCallback, useState } from "react";
import axios from "@/lib/axios";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/login", { email, password });
      const data = res.data.data || {};

      const user = data.user || {};

      const userRole = user.role || "";
      const userName = user.nama || user.email || "";
      const userEmail = user.email || "";
      const userPhone = user.nomorTelepon || user.phone || "";
      const userDomisili = user.domisili || user.city || "";

      // Do not modify global profile here; return user to caller to let
      // the caller decide whether to persist it in context/local state.

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
  }, []);

  const logout = useCallback(async () => {
    // best-effort: call backend logout endpoint
    try {
      await axios.post("/logout");
    } catch (e) {
      // ignore errors
    }
    try {
      navigate("/login", { replace: true });
    } catch (e) {
      // ignore navigation errors
    }
  }, []);

  return {
    login,
    logout,
    loading,
    error,
  };
}
