import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationButton from "@/components/ui/header/notification-button";
import ProfileDropdown from "@/components/ui/header/profile-dropdown";
import { Input } from "../input";
import logoUrl from "@/assets/Logo Sales.svg";
import useHeaderHeight from "@/hooks/useHeaderHeight";

export function Header({
  userName = "John Doe",
  userEmail = "anonymous@example.com",
  className,
  role = null,
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari..."
            className="w-full pl-10 h-9 bg-muted/50 border-0 focus:ring-primary"
          />
        </div>

        {/* Notifikasi */}
        <NotificationButton className="relative size-8 rounded-full bg-card hover:bg-card/80 p-0 text-foreground" />

        {/* Profil Pengguna */}
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
