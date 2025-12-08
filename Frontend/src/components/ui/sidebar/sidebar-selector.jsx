import React from "react";
import { Sidebar as AdminSidebar } from "./admin-sidebar";
import { Sidebar as SalesSidebar } from "./app-sidebar";
import { useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/useProfile";

// SidebarSelector — choose between AdminSidebar and AppSidebar
// Priority: explicit `role` prop -> localStorage `userRole` -> route heuristic
export default function SidebarSelector({ role }) {
  const { user: authUser } = useAuth();
  const { user: profileUser } = useProfile();
  const loc = useLocation();

  const path = loc.pathname || "";

  // fallback heuristic: some routes imply admin
  const adminRoutes = ["/admin", "/add-user"];
  const routeIsAdmin = adminRoutes.some((r) => path.startsWith(r));

  // Prefer explicit `role` prop, then authoritative profile role, then auth user, then route heuristic
  const resolvedRole =
    role ??
    profileUser?.role ??
    authUser?.role ??
    (routeIsAdmin ? "admin" : "sales");

  if (resolvedRole === "admin") return <AdminSidebar />;
  return <SalesSidebar />;
}
