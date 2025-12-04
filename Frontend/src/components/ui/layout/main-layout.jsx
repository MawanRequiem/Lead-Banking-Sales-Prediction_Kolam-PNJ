import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import useProfile from "@/hooks/useProfile";
import { ProfileProvider } from "@/contexts/profile-context";
import useAuth from "@/hooks/useAuth";
import SidebarSelector from "../sidebar/sidebar-selector";
import HeaderSelector from "../header/header-selector";
import AuthExpiredDialog from "../dialogs/auth-expired-dialog";
import ProfileDialog from "../dialogs/profile-dialog";
import VerifyCurrentDialog from "../dialogs/verify-current-dialog";
import { Toaster } from "sonner";

export default function MainLayout() {
  return (
    <ProfileProvider>
      <LayoutInner />
    </ProfileProvider>
  );
}

function LayoutInner() {
  // Consumers run inside provider
  const { user } = useProfile();
  const { logout } = useAuth();
  const [showReauth, setShowReauth] = useState(false);

  useEffect(() => {
    function onExpired() {
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
        <HeaderSelector role={user?.role} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <Toaster />
      <AuthExpiredDialog open={showReauth} onOpenChange={setShowReauth} />
      <ProfileDialog />
      <VerifyCurrentDialog />
    </div>
  );
}
