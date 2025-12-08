import { useState } from "react";
import { Globe, Key, SunMoon, Info, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import useProfile from "@/hooks/useProfile";
import { Switch } from "../switch";
import { useTheme } from "@/hooks/useTheme";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLang } from "@/hooks/useLang";

export default function ProfileDropdown(props) {
  const {
    user,
    changeLanguage,
    changePassword,
    openPersonalInfo,
    openNotifications,
  } = useProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();

  function logoutHandler() {
    try {
      logout();
      navigate("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  const displayUser = {
    name: props.userName ?? user.name,
    email: props.userEmail ?? user.email,
  };

  return (
    <div className={cn("relative", props.className)}>
      <button
        className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-muted"
        aria-label={t(
          "header.profileDropdown.openMenuAria",
          "Open profile menu"
        )}
        onClick={(e) => {
          // toggle simple menu: we'll use a small aria-based approach
          const menu = e.currentTarget.nextElementSibling;
          if (menu) menu.classList.toggle("hidden");
        }}
      >
        <span className="text-sm font-medium hidden lg:block">
          {displayUser.name}
        </span>
      </button>

      {/* Simple dropdown menu (hidden by default) */}
      <div className="absolute right-0 mt-2 w-56 rounded-md bg-popover text-popover-foreground shadow-lg hidden">
        <div className="px-4 py-3">
          <div className="font-medium">{displayUser.name}</div>
          <div className="text-sm text-muted-foreground">
            {displayUser.email}
          </div>
        </div>
        <div className="h-px bg-border" />
        <ul className="py-1">
          <li>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
              onClick={openPersonalInfo}
            >
              <Info className="h-4 w-4" />
              {t("header.profileDropdown.personalInfo", "Informasi Personal")}
            </button>
          </li>
          <li className="px-4 py-2 flex items-center justify-between">
            {" "}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />{" "}
              <span className="text-sm">
                {t(
                  "header.profileDropdown.changeLanguage",
                  "Ganti Bahasa (ID/EN)"
                )}
              </span>{" "}
            </div>{" "}
            <Switch
              aria-label={t(
                "header.profileDropdown.toggleLanguageAria",
                "Toggle language"
              )}
              checked={lang === "en"}
              onCheckedChange={(val) => {
                const nextLang = val ? "en" : "id";
                setLang(nextLang);
              }}
            />{" "}
          </li>
          <li className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SunMoon className="h-4 w-4" />
              <span className="text-sm">
                {t("header.profileDropdown.changeTheme", "Ubah Tema")}
              </span>
            </div>
            <Switch
              aria-label={t(
                "header.profileDropdown.toggleThemeAria",
                "Toggle theme"
              )}
              checked={theme === "dark"}
              onCheckedChange={(val) => setTheme(val ? "dark" : "light")}
            />
          </li>
          <div className="h-px my-1 bg-border" />
          <li>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
              onClick={logoutHandler}
            >
              <LogOut className="h-4 w-4" />
              {t("header.profileDropdown.logout", "Logout")}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
