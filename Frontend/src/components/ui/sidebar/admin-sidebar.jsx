import React from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import { adminNavItems, footerItem } from '@/components/ui/sidebar/sidebar-consts';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { activeItem, setActiveItem } = useSidebar();

  const verticalMargin = '0.5rem'

  return (
    <div
      className={cn(
        "fixed left-0 w-14 flex flex-col justify-between items-center py-6 ml-4 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden",
        "text-card-foreground rounded-full bg-background-secondary"
      )}
      style={{
        top: `calc(var(--app-header-height, 4rem) + ${verticalMargin})`,
        height: `calc(100vh - var(--app-header-height, 4rem) - 2 * ${verticalMargin})`
      }}
    >
      
      {/* Header/Logo */}
      {/* <div className="mb-8 mt-2 text-2xl font-bold">
        <LayoutGrid className="h-8 w-8 text-primary" />
      </div> */}

      {/* Content (Menu Utama) */}
      <nav className="flex flex-col pl-2 w-full space-y-0 flex-grow overflow-auto pt-6">
        {adminNavItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
            onClick={() => setActiveItem(item.id)}
          />
        ))}
      </nav>

      {/* Footer (LogOut Icon) */}
      <div className="mt-auto w-full pl-2 pt-4 border-t border-card-foreground/20">
        <SidebarItem
          item={footerItem}
          isActive={activeItem === footerItem.id}
          onClick={() => {
            setActiveItem(footerItem.id);
            console.log("User logged out.");
          }}
        />
      </div>
    </div>
  );
}

function SidebarItem({ item, isActive, onClick }) {
  const Icon = item.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "h-12 w-full cursor-pointer relative transition-all duration-300 group mb-1",
        "flex items-center pl-2", 
        isActive ? "text-primary sidebar-item-active" : "text-card-foreground/70 hover:text-primary"
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 right-0 w-full z-0 bg-background rounded-l-4xl transition-all duration-300 transform",
          isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
        )}
      >
        <div className="sidebar-active-line" />
      </div>
      
      {/* Ikon */}
      <Icon className={cn("h-6 w-6 z-20 transition-colors duration-300 mr-auto", !isActive && "group-hover:text-primary")} />
      <span className="sr-only">{item.tooltip}</span>
    </div>
  );
}