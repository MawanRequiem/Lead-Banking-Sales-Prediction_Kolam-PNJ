// src/components/sidebar-provider.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  navItems,
  adminNavItems,
  footerItem,
  SidebarContext,
} from "./sidebar-consts";

export function SidebarProvider({
  children,
  defaultActiveId = "dashboard",
  ...props
}) {
  const [activeItem, setActiveItem] = useState(defaultActiveId);
  const location = useLocation();

  useEffect(() => {
    if (!location || !location.pathname) return;

    const path = location.pathname;

    // Try to match navItems first
    const match = navItems.concat(adminNavItems).find((item) => {
      if (!item.path) return false;
      return (
        path === item.path ||
        path.startsWith(item.path + "/") ||
        path.startsWith(item.path + "?")
      );
    });

    if (match && match.id && match.id !== activeItem) {
      setActiveItem(match.id);
    }
  }, [location]);

  const contextValue = React.useMemo(
    () => ({
      activeItem,
      setActiveItem,
      navItems,
      footerItem,
    }),
    [activeItem, setActiveItem]
  );

  return (
    <SidebarContext.Provider value={contextValue} {...props}>
      {children}
    </SidebarContext.Provider>
  );
}
