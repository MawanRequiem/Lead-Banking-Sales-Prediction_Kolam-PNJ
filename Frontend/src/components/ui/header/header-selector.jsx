import React from "react";
import { Header } from "./header";
import { Header as HeaderAdmin } from "./header-admin";
import useProfile from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeaderSelector({ role }) {
  const { user, loading } = useProfile();
  const resolvedRole = role ?? user?.role ?? null;

  let baseName = "unknown";
  let email = "anonymous@example.com";

  if (user) {
    baseName = user.name || user.displayName || user.nama || baseName;
    email = user.email || user.userEmail || email;
  }

  if (resolvedRole === "admin") {
    return loading ? (
      <div className="px-4 py-3 flex items-center gap-3">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
    ) : (
      <>
        {console.debug("HeaderSelector: admin", {
          baseName,
          email,
          resolvedRole,
          user,
        })}
        <HeaderAdmin
          userName={baseName}
          userEmail={email}
          role={resolvedRole}
        />
      </>
    );
  }
  return loading ? (
    <div className="px-4 py-3 flex items-center gap-3">
      <Skeleton className="h-6 w-56" />
      <Skeleton className="h-4 w-40" />
    </div>
  ) : (
    <>
      {console.debug("HeaderSelector: user", {
        baseName,
        email,
        resolvedRole,
        user,
      })}
      <Header userName={baseName} userEmail={email} role={resolvedRole} />
    </>
  );
}
