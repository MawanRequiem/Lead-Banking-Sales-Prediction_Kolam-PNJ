import React from "react";
import * as Dialog from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AdminImportResultsDialog({
  open = false,
  onOpenChange,
  result,
}) {
  // result may be null when dialog is mounted before data arrives; guard with fallback
  const safeResult = result || {};
  const created = safeResult.created || [];
  const failed = safeResult.failed || [];

  return (
    <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogContent className="max-w-2xl">
        <Dialog.DialogHeader>
          <Dialog.DialogTitle>Import Results</Dialog.DialogTitle>
          <Dialog.DialogDescription>
            Ringkasan import — total {safeResult.total ?? 0}. {created.length}{" "}
            berhasil, {failed.length} gagal.
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <div className="py-2">
          {failed.length > 0 ? (
            <div className="mb-4">
              <div className="font-medium mb-2">Failures</div>
              <div className="border rounded-md max-h-64 overflow-auto p-2 bg-background-secondary">
                {failed.map((f, i) => (
                  <div key={i} className="mb-2 text-sm">
                    <div className="font-semibold">
                      Row {f.rowNumber ?? f.row ?? i + 1}
                    </div>
                    <div className="text-red-600">
                      {f.reason || f.message || JSON.stringify(f)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 text-sm text-green-700">No failures.</div>
          )}

          {created.length > 0 && (
            <div>
              <div className="font-medium mb-2">Created</div>
              <div className="border rounded-md max-h-48 overflow-auto p-2 bg-white text-sm">
                {created.map((c, i) => (
                  <div key={i} className="mb-1">
                    {c.email || c.idSales || JSON.stringify(c)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Dialog.DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
}
