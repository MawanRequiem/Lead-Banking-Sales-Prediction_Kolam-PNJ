import React, { useState, useMemo } from "react";
import DataTable from "@/components/ui/tables/data-table";
import DataTableViewOptions from "./data-table-view-options";
import { Button } from "@/components/ui/button";
import ExportDialog from "@/components/ui/dialogs/export-dialog";
import useCallHistory from "@/hooks/useCallHistory";
import axios from "@/lib/axios";
import FilterDropdown from "../dropdown/filter-dropdown";
import CallNoteDialog from "@/components/ui/dialogs/call-note-dialog";
import { CategoryBadge } from "../badges";
import { useLang } from "@/hooks/useLang";

const historyColumns = (t, onOpenNote) => [
  {
    accessorKey: "idHistori",
    header: t("table.call_History.columns.idHistori"),
  },
  {
    accessorKey: "tanggalTelepon",
    header: t("table.call_History.columns.tanggalTelepon"),
    cell: ({ row }) =>
      row.original.tanggalTelepon
        ? new Date(row.original.tanggalTelepon).toLocaleString()
        : "—",
  },
  {
    accessorKey: "nasabah",
    header: t("table.call_History.columns.nasabah"),
    cell: ({ row }) => row.original.nasabah?.nama,
  },
  {
    accessorKey: "skorPrediksi",
    header: t("table.call_History.columns.kategori"),
    cell: ({ row }) => {
      const [showRaw, setShowRaw] = useState(false);
      const s = row.original.nasabah?.skorPrediksi ?? 0;

      return (
        <div
          onClick={() => setShowRaw(!showRaw)}
          style={{ cursor: "pointer" }}
        >
          {showRaw ? parseFloat(s).toFixed(2) : <CategoryBadge category={s} />}
        </div>
      );
    },
  },
  {
    accessorKey: "hasilTelepon",
    header: t("table.call_History.columns.hasilTelepon"),
    cell: ({ row }) =>
      row.original.hasilTelepon ? row.original.hasilTelepon : "—",
  },
  {
    id: "keterangan",
    header: t("table.call_History.columns.keterangan"),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onOpenNote(row.original)}
        >
          {t("table.call_History.actions.view")}
        </Button>
      </div>
    ),
  },
];

export default function CallHistoryTable() {
  const { t } = useLang();
  const [openExport, setOpenExport] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [openNote, setOpenNote] = useState(false);

  const {
    data,
    loading,
    setFilters,
    pagination,
    setPagination,
    pageCount,
    total,
  } = useCallHistory({ apiUrl: "/sales/call-history" });

  const cols = useMemo(
    () =>
      historyColumns(t, (call) => {
        setSelectedCall(call);
        setOpenNote(true);
      }),
    [t]
  );

  const toolbarRight = (
    <>
      <FilterDropdown className="mr-2" onApply={setFilters} />
      <Button onClick={() => setOpenExport(true)}>
        {t("table.call_History.actions.export")}
      </Button>
    </>
  );

  return (
    <>
      <DataTable
        columns={cols}
        data={data}
        loading={loading}
        title={t("table.call_History.title")}
        showSearch={false}
        renderViewOptions={(table) => <DataTableViewOptions table={table} />}
        toolbarLeft={
          <div className="text-lg font-semibold">
            {t("table.call_History.toolbarTitle")}
          </div>
        }
        toolbarRight={toolbarRight}
        options={{
          pagination,
          onPageChange: setPagination,
          pageCount,
          total,
        }}
      />

      <ExportDialog
        open={openExport}
        onOpenChange={(v) => setOpenExport(v)}
        data={data}
        onApply={async ({ from, to, limit }) => {
          try {
            const res = await axios.get("/sales/export", {
              params: { from, to, limit },
              responseType: "blob",
            });
            const blob = res.data;
            // get filename from headers if provided
            const cd =
              res.headers &&
              (res.headers["content-disposition"] ||
                res.headers["Content-Disposition"]);
            let filename = `call-history-${
              new Date().toISOString().split("T")[0]
            }.csv`;
            if (cd) {
              const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/.exec(
                cd
              );
              if (m) filename = decodeURIComponent(m[1] || m[2]);
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          } catch (err) {
            console.error("Server-side export failed", err);
          }
        }}
      />

      <CallNoteDialog
        open={openNote}
        onOpenChange={(v) => setOpenNote(v)}
        note={selectedCall?.note}
      />
    </>
  );
}
