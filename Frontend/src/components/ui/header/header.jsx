import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileDropdown from "@/components/ui/header/profile-dropdown";
import { Input } from "../input";
import logoUrl from "@/assets/Logo Sales.svg";
import useHeaderHeight from "@/hooks/useHeaderHeight";

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
        <h1 className="text-xl font-semibold text-primary hidden sm:block">
          SalesCRM
        </h1>
      </div>

      {/* TENGAH: Search Bar */}
      <div className="flex-1 max-w-sm mx-4 hidden md:block"></div>

      {/* KANAN: Notifikasi, Tema, dan Profil */}
      <div className="flex items-center space-x-4">
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
