import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Profile hook backed by localStorage. Reads stored `user` (or `userName`/`userEmail`/`userRole`) and
// keeps it in state. `setUser` persists to localStorage. `logout` clears tokens and redirects to `/login`.
export default function useProfile(initial = null) {
  const navigate = useNavigate();

  function readStoredUser() {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      // ignore parse errors
    }

    // Fallback to legacy keys
    try {
      const name = localStorage.getItem("userName");
      const email = localStorage.getItem("userEmail");
      const role = localStorage.getItem("userRole");
      if (name || email || role) {
        return { name: name || null, email: email || null, role: role || null };
      }
    } catch (e) {}

    return initial;
  }

  const [user, setUserState] = useState(readStoredUser());

  useEffect(() => {
    // Keep state in sync if localStorage changed elsewhere
    function onStorage() {
      setUserState(readStoredUser());
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const changeLanguage = useCallback((lang) => {
    // stub: replace with real implementation
    console.log("Change language to", lang);
  }, []);

  const changePassword = useCallback(() => {
    // stub: open change-password modal or route
    console.log("Open change password");
  }, []);

  const openPersonalInfo = useCallback(() => {
    // stub: navigate to profile page or open modal
    console.log("Open personal info");
  }, []);

  const openNotifications = useCallback(() => {
    // dispatch a custom event so NotificationButton or other listeners can react
    try {
      window.dispatchEvent(new CustomEvent("open-notifications"));
    } catch (e) {
      console.log("Open notifications error", e);
    }
  }, []);

  const setUser = useCallback(
    (next) => {
      try {
        // accept either object or function
        const resolved = typeof next === "function" ? next(user) : next;
        if (resolved) {
          localStorage.setItem("user", JSON.stringify(resolved));
          // also keep legacy keys in sync
          try {
            if (resolved.name) localStorage.setItem("userName", resolved.name);
            if (resolved.email)
              localStorage.setItem("userEmail", resolved.email);
            if (resolved.role) localStorage.setItem("userRole", resolved.role);
          } catch (e) {}
        } else {
          localStorage.removeItem("user");
        }
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
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
    } catch (e) {}

    setUserState(null);
    try {
      navigate("/login", { replace: true });
    } catch (e) {}
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
