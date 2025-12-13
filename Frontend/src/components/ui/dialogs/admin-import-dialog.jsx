import React, { useState } from "react";
import * as Dialog from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/hooks/useLang";

export default function AdminImportDialog({
  open = false,
  onOpenChange,
  onImport,
}) {
  const { t } = useLang();
  const [file, setFile] = useState(null);

  function handleFile(e) {
    setFile(e.target.files?.[0] ?? null);
  }

  function handleImport() {
    if (!file) return;
    // For now, call the callback with the file and close
    if (typeof onImport === "function") onImport(file);
    if (typeof onOpenChange === "function") onOpenChange(false);
    setFile(null);
  }

  return (
    <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogContent>
        <Dialog.DialogHeader>
          <Dialog.DialogTitle>
            {t("dialog.adminImport.title", "Import Users")}
          </Dialog.DialogTitle>
          <Dialog.DialogDescription>
            {t(
              "dialog.adminImport.description",
              "Unggah file CSV atau Excel berisi daftar user (kolom: nama,email,role,domisili,nomorTelepon)."
            )}
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <div className="py-4">
          <Input type="file" accept=".csv,.xls,.xlsx" onChange={handleFile} />
          {file ? (
            <div className="mt-2 text-sm">
              {t("dialog.adminImport.selected", "Selected:")} {file.name}
            </div>
          ) : null}
        </div>

        <Dialog.DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              if (typeof onOpenChange === "function") onOpenChange(false);
              setFile(null);
            }}
          >
            {t("dialog.adminImport.cancel", "Batal")}
          </Button>
          <Button onClick={handleImport} disabled={!file}>
            {t("dialog.adminImport.confirm", "Import")}
          </Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
}
