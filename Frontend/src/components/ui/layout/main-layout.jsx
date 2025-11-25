import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import useProfile from "@/hooks/useProfile";
import useAuth from "@/hooks/useAuth";
import SidebarSelector from "../sidebar/sidebar-selector";
import HeaderSelector from "../header/header-selector";
import AuthExpiredDialog from "../dialogs/auth-expired-dialog";
import { Toaster } from "sonner";

export default function MainLayout() {
  // read profile for role so SidebarSelector can be driven by role claim
    const { user } = useProfile();
    const { logout } = useAuth();
    const [showReauth, setShowReauth] = useState(false);

    useEffect(() => {
      function onExpired() {
        // Clear client state and open re-auth dialog
        try {
          logout();
        } catch (e) {}
        setShowReauth(true);
      }

      window.addEventListener("auth:expired", onExpired);
      return () => window.removeEventListener("auth:expired", onExpired);
    }, [logout]);

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground font-[Inter]">
      <SidebarSelector role={user?.role} />

      <div className="flex-1 flex flex-col">
        <HeaderSelector />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <Toaster />
      <AuthExpiredDialog open={showReauth} onOpenChange={setShowReauth} />
    </div>
  );
}
