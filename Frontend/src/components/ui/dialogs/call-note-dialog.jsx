import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";

export default function CallNoteDialog({
  open,
  onOpenChange,
  note = "",
  title,
}) {
  const { t } = useLang();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title || t("dialog.callNote.title")}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 text-sm text-muted-foreground">
          {note ? (
            <div className="whitespace-pre-wrap">{note}</div>
          ) : (
            <div>{t("dialog.callNote.empty")}</div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button>{t("dialog.callNote.close")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
