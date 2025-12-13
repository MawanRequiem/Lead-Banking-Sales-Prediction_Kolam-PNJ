import React from "react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  NotepadText,
  History,
  LogOut,
} from "lucide-react";

// Data Navigasi
export const navItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    tooltip: "Dashboard",
    path: "/dashboard",
  },
  { id: "list", icon: Users, tooltip: "Customer List", path: "/customers" },
  {
    id: "Assignment",
    icon: NotepadText,
    tooltip: "Assignment",
    path: "/assignments",
  },
  { id: "History", icon: History, tooltip: "History", path: "/history" },
];

export const adminNavItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    tooltip: "Dashboard",
    path: "/admin",
  },
  { id: "add", icon: UserPlus, tooltip: "Add User", path: "/add-user" },
];

export const footerItem = { id: "logout", icon: LogOut, tooltip: "Keluar" };

export const SidebarContext = React.createContext(null);
