import React from "react";
import { Sidebar as AppSidebar } from "./app-sidebar";
import { Sidebar as AdminSidebar } from "./admin-sidebar";
import { useLocation } from "react-router-dom";

// SidebarSelector — choose between AdminSidebar and AppSidebar
// Priority: explicit `role` prop -> localStorage `userRole` -> route heuristic
export default function SidebarSelector({ role }) {
  const location = useLocation();

  const resolvedRole = React.useMemo(() => {
    if (role) return role;
    try {
      const stored =
        typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
      if (stored) return stored;
    } catch (e) {
      // ignore
    }
    // simple route heuristic: if URL contains /admin use admin sidebar
    if (location && location.pathname && location.pathname.startsWith("/admin"))
      return "admin";
    return "app";
  }, [role, location]);

  if (resolvedRole === "admin") return <AdminSidebar />;
  return <AppSidebar />;
}
