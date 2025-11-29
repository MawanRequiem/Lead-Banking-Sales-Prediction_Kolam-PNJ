import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, UserX, Key, UserCheck } from "lucide-react";
import AdminEditDialog from "@/components/ui/dialogs/admin-edit-dialog";
import AdminConfirmDeactivateDialog from "@/components/ui/dialogs/admin-confirm-deactivate-dialog";
import AdminConfirmDeleteDialog from "@/components/ui/dialogs/admin-confirm-delete-dialog";
import AdminResetPasswordDialog from "@/components/ui/dialogs/admin-reset-password-dialog";

export default function AdminActions({ user, refresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Normalize id and isActive because backend sometimes nests user info
  const normalizedId =
    user?.id ||
    user?.idSales ||
    user?.idUser ||
    user?.idAdmin ||
    user?.id_admin ||
    user?.user?.idUser ||
    user?.user?.idSales ||
    user?.user?.idAdmin ||
    null;

  const normalizedIsActive =
    typeof user?.isActive !== "undefined"
      ? user.isActive
      : typeof user?.user?.isActive !== "undefined"
      ? user.user.isActive
      : null;

  function handleSave(updated) {
    // Call backend to save updates for sales/admin
    (async () => {
      try {
        const id = updated.id;
        // Prepare payload only with allowed fields
        const payload = {
          nama: updated.nama,
          nomorTelepon: updated.nomorTelepon,
          email: updated.email,
          domisili: updated.domisili,
        };

        await axios.put(`/admin/sales/${id}`, payload);
        console.log("Saved admin/sales:", updated);
        if (typeof refresh === "function") refresh();
        else window.dispatchEvent(new CustomEvent("data:changed"));
      } catch (err) {
        console.error("Failed to save:", err);
        alert(err?.response?.data?.message || "Gagal menyimpan data");
      }
    })();
  }

  function handleDeactivate() {
    // Call deactivate endpoint
    (async () => {
      try {
        const id = normalizedId;
        await axios.post(`/admin/sales/${id}/deactivate`);
        if (typeof refresh === "function") refresh();
        else window.dispatchEvent(new CustomEvent("data:changed"));
      } catch (err) {
        console.error("Failed to deactivate:", err);
        alert(err?.response?.data?.message || "Gagal menonaktifkan akun");
      }
    })();
  }

  function handleActivate() {
    (async () => {
      try {
        const id = normalizedId;
        await axios.post(`/admin/sales/${id}/activate`);
        if (typeof refresh === "function") refresh();
        else window.dispatchEvent(new CustomEvent("data:changed"));
      } catch (err) {
        console.error("Failed to activate:", err);
        alert(err?.response?.data?.message || "Gagal mengaktifkan akun");
      }
    })();
  }

  function handleDelete() {
    (async () => {
      try {
        const id = user.id;
        await axios.delete(`/admin/sales/${id}`);
        if (typeof refresh === "function") refresh();
        else window.dispatchEvent(new CustomEvent("data:changed"));
      } catch (err) {
        console.error("Failed to delete:", err);
        alert(err?.response?.data?.message || "Gagal menghapus akun");
      }
    })();
  }

  function handleResetPassword() {
    (async () => {
      try {
        const id = user.id;
        // The endpoint expects { newPassword } in body; here we trigger backend reset flow without client-provided password
        await axios.post(`/admin/sales/${id}/reset-password`, {
          newPassword: "Temporary123!",
        });
        alert("Password telah direset (dev).");
      } catch (err) {
        console.error("Failed to reset password:", err);
        alert(err?.response?.data?.message || "Gagal mereset password");
      }
    })();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setIsOpen(true)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              const action =
                normalizedIsActive === false ? "activate" : "deactivate";
              setPendingAction(action);
              setIsDeactivateOpen(true);
            }}
          >
            {normalizedIsActive === false ? (
              <>
                <UserCheck className="h-4 w-4 mr-2" /> Aktifkan
              </>
            ) : (
              <>
                <UserX className="h-4 w-4 mr-2" /> Nonaktifkan
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteOpen(true)}>
            <UserX className="h-4 w-4 mr-2" /> Hapus
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsResetOpen(true)}>
            <Key className="h-4 w-4 mr-2" /> Reset Password
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdminEditDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        user={user}
        onSave={(payload) => {
          handleSave(payload);
          setIsOpen(false);
        }}
      />

      <AdminConfirmDeactivateDialog
        open={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        user={user}
        mode={normalizedIsActive === false ? "activate" : "deactivate"}
        onConfirm={() => {
          if (pendingAction === "activate") handleActivate();
          else handleDeactivate();
          setPendingAction(null);
          setIsDeactivateOpen(false);
        }}
      />

      <AdminConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        user={user}
        onConfirm={() => {
          handleDelete();
          setIsDeleteOpen(false);
        }}
      />

      <AdminResetPasswordDialog
        open={isResetOpen}
        onOpenChange={setIsResetOpen}
        user={user}
        onConfirm={() => {
          handleResetPassword();
          setIsResetOpen(false);
        }}
      />
    </>
  );
}
