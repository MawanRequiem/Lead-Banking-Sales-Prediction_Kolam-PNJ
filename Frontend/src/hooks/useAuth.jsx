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
        const user = data.user || {};

        // Expect backend to set httpOnly cookies for tokens. Still capture user fields for
        // in-memory profile state.
        const userRole = user.role || "";
        const userName = user.nama || user.email || "";
        const userEmail = user.email || "";
        const userPhone = user.nomorTelepon || user.phone || "";
        const userDomisili = user.domisili || user.city || "";

        if (typeof setUser === "function") {
          setUser({
            name: userName,
            email: userEmail,
            role: userRole,
            phone: userPhone,
            domisili: userDomisili,
          });
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
    // Call backend logout (server should clear httpOnly cookies). Also
    // clear any legacy localStorage tokens for migration safety.
    try {
      await axios.post("/logout");
    } catch (e) {
      // ignore network/logout errors; still proceed to clear client state
    }

    if (typeof setUser === "function") setUser(null);
  }, [setUser]);

  return {
    login,
    logout,
    loading,
    error,
  };
}
