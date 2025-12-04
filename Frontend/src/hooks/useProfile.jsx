import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios";

// Profile hook: authoritative profile is fetched from the server and kept
// in-memory. This hook does NOT read or write localStorage.
export default function useProfile(initial = null) {
  const navigate = useNavigate();
  const [user, setUserState] = useState(initial);

  // Fetch authoritative profile on mount. If the request fails (401), leave
  // `user` as null; callers can react to `auth:expired` events from axios.
  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const res = await axios.get("/me");
        if (!mounted) return;
        const data = res.data && res.data.data ? res.data.data : res.data;
        if (data) {
          setUserState({
            name: data.nama || data.name || data.email || null,
            email: data.email || null,
            role: data.role || null,
            phone: data.nomorTelepon || data.phone || null,
            domisili: data.domisili || null,
          });
        } else {
          setUserState(null);
        }
      } catch (e) {
        // don't throw; keep user null so callers show unauthenticated view
        setUserState(null);
      }
    }
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const changeLanguage = useCallback((lang) => {
    // stub: replace with real implementation
    console.log("Change language to", lang);
  }, []);

  const changePassword = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent("open-verify-current"));
    } catch (e) {
      console.error("Failed to dispatch open-verify-current", e);
    }
  }, []);

  const openPersonalInfo = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent("open-profile-dialog"));
    } catch (e) {
      console.error("Failed to dispatch open-profile-dialog", e);
    }
  }, []);

  const openNotifications = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent("open-notifications"));
    } catch (e) {
      // ignore
    }
  }, []);

  // Keep profile in-memory only. Accept either a value or an updater function.
  const setUser = useCallback(
    (next) => {
      try {
        const resolved = typeof next === "function" ? next(user) : next;
        setUserState(resolved);
        return resolved;
      } catch (e) {
        console.error("Failed to set user", e);
        return null;
      }
    },
    [user]
  );

  const logout = useCallback(() => {
    (async () => {
      try {
        await axios.post("/logout");
      } catch (e) {
        // ignore network/logout errors
      }

      // Clear in-memory profile and navigate to login. Emit an event so other
      // parts of the app can react (e.g., clear stores, close dialogs).
      setUserState(null);
      try {
        window.dispatchEvent(new CustomEvent("auth:expired"));
      } catch (e) {
        // ignore
      }
      try {
        navigate("/login", { replace: true });
      } catch (e) {
        // ignore
      }
    })();
  }, [navigate]);

  return {
    user,
    setUser,
    changeLanguage,
    changePassword,
    openPersonalInfo,
    openNotifications,
    logout,
  };
}
