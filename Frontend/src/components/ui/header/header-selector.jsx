import React from "react";
import { Header } from "./header";
import { Header as HeaderAdmin } from "./header-admin";
import useProfile from "@/hooks/useProfile";

export default function HeaderSelector(props) {
  const { user } = useProfile();

  // Prefer role from user object; fallback to localStorage if present
  const role =
    user?.role ??
    (typeof window !== "undefined"
      ? window.localStorage.getItem("userRole")
      : null);

  const baseName =
    user?.name ??
    (typeof window !== "undefined"
      ? window.localStorage.getItem("userName")
      : null) ??
    "User";
  const displayName = baseName;

  if (role === "admin") {
    return <HeaderAdmin userName={displayName} role={role} {...props} />;
  }

  return <Header userName={displayName} {...props} />;
}
