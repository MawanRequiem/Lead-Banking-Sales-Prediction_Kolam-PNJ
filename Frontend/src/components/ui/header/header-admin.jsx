import React from "react";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/Logo Sales.svg";
import useHeaderHeight from "@/hooks/useHeaderHeight";
import ProfileDropdown from "@/components/ui/header/profile-dropdown";

export function Header({
  userName = "John Doe",
  userEmail = "anonymous@example.com",
  className,
  role,
}) {
  const headerRef = useHeaderHeight();

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between h-16 w-full px-8 shadow-sm transition-colors duration-300",
        "bg-background text-foreground border-b border-border",
        className
      )}
    >
      {/* KIRI: Logo dan Nama Aplikasi */}
      <div className="flex items-center space-x-4">
        <img src={logoUrl} alt="Lead Banking Logo" className="h-8 w-8" />
        <h1 className="text-xl font-semibold text-foreground hidden sm:block">
          Lead Banking App
        </h1>
      </div>

      {/* TENGAH: Search Bar */}
      <div className="flex-1 max-w-sm mx-4 hidden md:block"></div>

      {/* KANAN: Notifikasi, Tema, dan Profil */}
      <div className="flex items-center space-x-4">
        {/* Profil Pengguna */}

        {/* Role badge (optional) */}
        {role ? (
          <div className="hidden sm:flex items-center mr-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
              {role === "admin" ? "Admin" : role}
            </span>
          </div>
        ) : null}
        <ProfileDropdown
          className="cursor-pointer"
          userName={userName}
          userEmail={userEmail}
          userRole={role}
        />
      </div>
    </header>
  );
}
