import { useCallback, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios";
import { useProfileContext } from "@/contexts/profile-context";

// Profile hook: prefer ProfileContext when available (single fetch). Fallback
// to local behavior for components not wrapped by provider.
export default function useProfile(initial = null) {
  const ctx = useProfileContext();
  if (ctx) return ctx;

  const navigate = useNavigate();

  const [user, setUserState] = useState(initial);
  const [loading, setLoading] = useState(false);

  // On mount, attempt to fetch authoritative profile from backend.
  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      setLoading(true);
      try {
        const res = await axios.get("/me");
        if (!mounted) return;
        const data = res.data && res.data.data ? res.data.data : res.data;
        if (data) {
          setUserState({
            name: data.nama || data.name || null,
            email: data.email || null,
            role: data.role || null,
            phone: data.nomorTelepon || data.phone || null,
            domisili: data.domisili || null,
          });
        }
      } catch (e) {
        // ignore; leave user as-is (null or initial)
      } finally {
        if (mounted) setLoading(false);
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
    // dispatch a custom event so NotificationButton or other listeners can react
    try {
      window.dispatchEvent(new CustomEvent("open-notifications"));
    } catch (e) {
      console.log("Open notifications error", e);
    }
  }, []);

  // Do not persist profile to localStorage. Keep profile in-memory only.
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

  return {
    user,
    loading,
    setUser,
    changeLanguage,
    changePassword,
    openPersonalInfo,
    openNotifications,
  };
}
