import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DateField from "@/components/ui/dropdown/date-field";
import { getQuickRange } from "@/lib/date-utils";
import { Separator } from "@/components/ui/separator";
import { useLang } from "@/hooks/useLang";

export default function ExportDialog({
  open,
  onOpenChange,
  data = [],
  onApply,
}) {
  const { t } = useLang();
  const [from, setFrom] = useState(() => getQuickRange("week").from);
  const [to, setTo] = useState(() => getQuickRange("week").to);
  const [selectedRange, setSelectedRange] = useState("week");
  const [limit, setLimit] = useState(100);

  function setQuickRange(kind) {
    const { from: f, to: t } = getQuickRange(kind);
    setFrom(f);
    setTo(t);
    setSelectedRange(kind);
  }

  function apply() {
    if (typeof onApply === "function") onApply({ from, to, limit });
    if (typeof onOpenChange === "function") onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialog.export.title")}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {t("dialog.export.subtitle", String(data.length)).replace(
              "{count}",
              String(data.length)
            )}
          </div>
        </DialogHeader>
        <Separator className="my-2" />
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {/* Button untuk quick range tanggal */}
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded-md border ${
                selectedRange === "week"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/50 text-foreground border-border"
              }`}
              onClick={() => setQuickRange("week")}
            >
              {t("dialog.export.ranges.week")}
            </button>

            <button
              type="button"
              className={`text-xs px-2 py-1 rounded-md border ${
                selectedRange === "month"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/50 text-foreground border-border"
              }`}
              onClick={() => setQuickRange("month")}
            >
              {t("dialog.export.ranges.month")}
            </button>

            <button
              type="button"
              className={`text-xs px-2 py-1 rounded-md border ${
                selectedRange === "quarter"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/50 text-foreground border-border"
              }`}
              onClick={() => setQuickRange("quarter")}
            >
              {t("dialog.export.ranges.quarter")}
            </button>

            <button
              type="button"
              className={`text-xs px-2 py-1 rounded-md border ${
                selectedRange === "year"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/50 text-foreground border-border"
              }`}
              onClick={() => setQuickRange("year")}
            >
              {t("dialog.export.ranges.year")}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <DateField
              id="export-from"
              value={from}
              onChange={setFrom}
              placeholder={t("dialog.export.dateFrom")}
            />
            <DateField
              id="export-to"
              value={to}
              onChange={setTo}
              placeholder={t("dialog.export.dateTo")}
            />
          </div>
        </div>
        <Separator className="my-1" />
        <div className="px-4 py-2">
          <label className="text-xs text-muted-foreground">
            {t("dialog.export.limitLabel")}
          </label>
          <div className="mt-1">
            <Select
              value={String(limit)}
              onValueChange={(v) => setLimit(v === "all" ? "all" : Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("dialog.export.limitPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="1000">1000</SelectItem>
                <SelectItem value="all">
                  {t("dialog.export.limitAll")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator className="my-4" />
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">{t("dialog.export.cancel")}</Button>
          </DialogClose>
          <Button onClick={apply}>{t("dialog.export.export")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
