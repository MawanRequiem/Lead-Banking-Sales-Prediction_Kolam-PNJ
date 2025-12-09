import React, { useEffect, useState } from "react";
import * as Dialog from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useProfile from "@/hooks/useProfile";
import axios from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/hooks/useLang";

export default function ProfileDialog({ open: openProp, onOpenChange } = {}) {
  const { t } = useLang();
  const { user } = useProfile();
  const [open, setOpen] = useState(Boolean(openProp));

  // Support both controlled (prop) and uncontrolled usage. If `openProp` is provided,
  // treat this component as controlled. Otherwise, manage internal state and listen
  // for global `open-profile-dialog` events dispatched by `useProfile`.
  useEffect(() => {
    if (typeof openProp !== "undefined") {
      setOpen(Boolean(openProp));
      return;
    }

    function handleOpen() {
      setOpen(true);
    }

    window.addEventListener("open-profile-dialog", handleOpen);
    return () => window.removeEventListener("open-profile-dialog", handleOpen);
  }, [openProp]);

  function handleOpenChange(next) {
    if (typeof onOpenChange === "function") {
      onOpenChange(next);
    }
    if (typeof openProp === "undefined") setOpen(next);
  }

  // Prefer localized profile (useProfile/localStorage) for UI responsiveness.
  // This dialog will fetch the authoritative profile from the server when opened
  // so we display phone/domisi from the response rather than relying on localStorage.
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      if (!open) return;
      setLoading(true);
      try {
        const res = await axios.get("/me");
        if (!cancelled) setRemote(res.data.data.user || null);
      } catch (e) {
        // ignore; fallback to local user
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const src = remote || user || {};
  const displayName = src?.nama || src?.name || src?.displayName || "-";
  const email = src?.email || src?.userEmail || "-";
  const phone =
    src?.nomorTelepon || src?.phone || src?.nomorTeleponMasked || null;
  const domisili = src?.domisili || src?.city || null;
  const role = src?.role || src?.userRole || "-";

  const extraAdminFields = [];
  if (role === "admin") {
    if (src.emailRecovery) {
      extraAdminFields.push({
        label: "Recovery Email",
        value: src.emailRecovery,
      });
    } else {
      extraAdminFields.push({
        label: "Recovery Email",
        value: "-",
      });
    }
  }

  const rows = [
    { key: "name", label: t("dialog.profile.fields.nama"), value: displayName },
    { key: "email", label: t("dialog.profile.fields.email"), value: email },
  ];

  if (phone)
    rows.push({
      key: "phone",
      label: t("dialog.profile.fields.phone"),
      value: phone,
    });
  if (domisili)
    rows.push({
      key: "domisili",
      label: t("dialog.profile.fields.domisili"),
      value: domisili,
    });
  if (role)
    rows.push({
      key: "role",
      label: t("dialog.profile.fields.role"),
      value: role,
    });
  // Append any extra admin-specific fields
  if (extraAdminFields.length)
    rows.push(
      ...extraAdminFields.map((f, i) => ({
        key: `admin_${i}`,
        label: f.label || t("dialog.profile.fields.recoveryEmail"),
        value: f.value,
      }))
    );

  return (
    <Dialog.Dialog open={open} onOpenChange={handleOpenChange}>
      <Dialog.DialogContent>
        <Dialog.DialogHeader>
          <Dialog.DialogTitle>{t("dialog.profile.title")}</Dialog.DialogTitle>
          <Dialog.DialogDescription>
            {t("dialog.profile.description")}
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-5 w-4/5" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {rows.map((r) => (
                <div key={r.key}>
                  <div className="text-muted-foreground text-xs">{r.label}</div>
                  <div className="text-foreground font-medium">
                    {r.value ?? "-"}
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  {t("dialog.profile.noInfo")}
                </div>
              )}
            </div>
          )}
        </div>

        <Dialog.DialogFooter>
          <Button onClick={() => handleOpenChange(false)}>
            {t("dialog.profile.close")}
          </Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
}
