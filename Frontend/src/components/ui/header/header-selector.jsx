import React from "react";
import { Header } from "./header";
import { Header as HeaderAdmin } from "./header-admin";
import useProfile from "@/hooks/useProfile";

export default function HeaderSelector(props) {
  const { user } = useProfile();
  const { role } = props;

  let baseName = "unknown";
  let email = "anonymous@example.com";

  if (user) {
    baseName = user.name ?? baseName;
    email = user.email ?? email;
  }

  if (role === "admin") {
    return (
      <HeaderAdmin
        userName={baseName}
        userEmail={email}
        role={role}
        {...props}
      />
    );
  }

  return <Header userName={baseName} userEmail={email} {...props} />;
}
