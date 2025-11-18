// src/components/sidebar-provider.jsx
import React, { useState } from "react";
import { navItems, footerItem, SidebarContext } from "./sidebar-consts";

export function SidebarProvider({ children, defaultActiveId = 'home', ...props }) {
  const [activeItem, setActiveItem] = useState(defaultActiveId);

  const contextValue = React.useMemo(() => ({
    activeItem,
    setActiveItem,
    navItems,
    footerItem
  }), [activeItem, setActiveItem]);

  return (
    <SidebarContext.Provider value={contextValue} {...props}>
      {children}
    </SidebarContext.Provider>
  );
}