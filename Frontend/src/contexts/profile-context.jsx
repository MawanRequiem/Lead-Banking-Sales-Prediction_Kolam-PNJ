import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "@/lib/axios";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Internal ref to skip the next /me fetch (used when we already setUser after login)
  const skipNextFetchRef = useRef(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const changeLanguage = useCallback((lang) => {
    console.log("Change language to", lang);
  }, []);

  const changePassword = useCallback(() => {
    console.log("🔑 ProfileContext.changePassword: Called");
    try {
      console.log("🔑 ProfileContext.changePassword: Dispatching event");
      window.dispatchEvent(new CustomEvent("open-verify-current"));
      console.log(
        "🔑 ProfileContext.changePassword: Event dispatched successfully"
      );
    } catch (e) {
      console.error("🔑 ProfileContext.changePassword: Failed to dispatch", e);
    }
  }, []);

  const openPersonalInfo = useCallback(() => {
    console.log("👤 ProfileContext.openPersonalInfo: Called");
    try {
      window.dispatchEvent(new CustomEvent("open-profile-dialog"));
      console.log(
        "👤 ProfileContext.openPersonalInfo: Event dispatched successfully"
      );
    } catch (e) {
      console.error(
        "👤 ProfileContext.openPersonalInfo: Failed to dispatch",
        e
      );
    }
  }, []);

  const openNotifications = useCallback(() => {
    console.log("🔔 ProfileContext.openNotifications: Called");
    try {
      window.dispatchEvent(new CustomEvent("open-notifications"));
    } catch (e) {
      console.log("🔔 ProfileContext.openNotifications: Error", e);
    }
  }, []);

  const setUserEnhanced = useCallback(
    (next) => {
      try {
        const resolved = typeof next === "function" ? next(user) : next;
        // If caller sets a user (e.g. after login), skip the next /me fetch
        if (resolved) {
          skipNextFetchRef.current = true;
        }
        setUser(resolved);
        return resolved;
      } catch (e) {
        console.error("Failed to set user", e);
        return null;
      }
    },
    [user]
  );

  const value = {
    user,
    loading,
    setUser: setUserEnhanced,
    changeLanguage,
    changePassword,
    openPersonalInfo,
    openNotifications,
  };

  useEffect(() => {
    let mounted = true;

    // Skip fetching on login/anonymous routes
    const skipPaths = ["/login", "/forgot-password", "/change-password"];
    if (skipPaths.includes(location.pathname)) {
      setLoading(false);
      return undefined;
    }

    // If setUser was just called with a non-null value, skip the next /me request
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      setLoading(false);
      return undefined;
    }

    async function loadProfile() {
      setLoading(true);
      try {
        const res = await axios.get("/me");
        console.debug("ProfileProvider: /me response", {
          status: res.status,
          headers: res.headers,
        });
        if (!mounted) return;
        const data = res.data && res.data.data ? res.data.data : res.data;
        console.debug("ProfileProvider: parsed profile", data);
        if (data && data.user) {
          setUserEnhanced({
            name: data.user.nama || data.user.name || data.user.email || null,
            email: data.user.email || null,
            role: data.user.role || null,
            phone: data.user.nomorTelepon || data.user.phone || null,
            domisili: data.user.domisili || null,
            id: data.user.userId || data.user.id,
          });
        } else if (data) {
          // older response shape
          setUserEnhanced({
            name: data.nama || data.name || data.email || null,
            email: data.email || null,
            role: data.role || null,
            phone: data.nomorTelepon || data.phone || null,
            domisili: data.domisili || null,
            id: data.userId || data.id,
          });
        }
      } catch (e) {
        console.debug(
          "ProfileProvider: /me error",
          e && e.response
            ? { status: e.response.status, data: e.response.data }
            : e
        );
        // ignore errors (unauthenticated)
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfileContext() {
  return useContext(ProfileContext);
}

export default ProfileContext;
