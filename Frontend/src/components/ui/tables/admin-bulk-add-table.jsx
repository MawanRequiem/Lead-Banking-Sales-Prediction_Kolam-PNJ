import React, { useState, useEffect, startTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import AdminImportDialog from "@/components/ui/dialogs/admin-import-dialog";
import AdminImportResultsDialog from "@/components/ui/dialogs/admin-import-results-dialog";
import axios from "@/lib/axios";
import useProfile from "@/hooks/useProfile";
import { Import, Plus } from "lucide-react";
import { toast } from "sonner";

function emptyRow() {
  return { nama: "", email: "", role: "sales", domisili: "", nomorTelepon: "" };
}

export default function AdminBulkAddTable() {
  const [rows, setRows] = useState([emptyRow()]);
  const [countInput, setCountInput] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [importResultOpen, setImportResultOpen] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useProfile();

  function setCell(i, key, value) {
    setRows((r) => {
      const copy = [...r];
      // sanitize phone input on change
      if (key === "nomorTelepon") {
        // remove spaces, parentheses, dots, dashes
        const sanitized = String(value || "").replace(/[\s().-]/g, "");
        copy[i] = { ...copy[i], [key]: sanitized };
      } else {
        copy[i] = { ...copy[i], [key]: value };
      }
      // clear error for this cell when user types
      setErrors((prev) => {
        if (!prev || !prev.length) return prev;
        const p = [...prev];
        p[i] = { ...(p[i] || {}) };
        if (p[i][key]) delete p[i][key];
        return p;
      });
      return copy;
    });
  }

  // Validate phone locally: returns error message or null
  function validatePhoneLocal(phone) {
    if (!phone) return null;
    const s = String(phone);
    if (s.startsWith("+")) {
      if (!/^\+\d+$/.test(s)) return 'Hanya angka diperbolehkan setelah "+"';
      if (s.length > 14) return "Nomor internasional maksimal 14 karakter";
      return null;
    }
    if (s.startsWith("0")) {
      if (!/^0\d+$/.test(s)) return "Format tidak valid; setelah 0 hanya angka";
      if (s.length > 12) return "Nomor lokal maksimal 12 digit jika diawali 0";
      return null;
    }
    // other: digits allowed, max 14
    if (!/^\+?\d+$/.test(s))
      return 'Hanya angka atau "+" di depan diperbolehkan';
    if (s.length > 14) return "Nomor maksimal 14 karakter";
    return null;
  }

  // keep rows length in sync with countInput
  useEffect(() => {
    const n = Math.max(1, Number(countInput) || 1);
    const nextRows = (prev) => {
      if (prev.length === n) return prev;
      if (prev.length < n)
        return [
          ...prev,
          ...Array.from({ length: n - prev.length }).map(() => emptyRow()),
        ];
      return prev.slice(0, n);
    };

    startTransition(() => setRows((prev) => nextRows(prev)));
  }, [countInput]);

  function handleAddUsers() {
    // validate required fields for every row
    const required = ["nama", "email", "role", "domisili", "nomorTelepon"];
    const nextErrors = rows.map((row) => {
      const e = {};
      required.forEach((k) => {
        if (!String(row[k] ?? "").trim()) e[k] = true;
      });
      return e;
    });

    const hasAnyError = nextErrors.some((e) => Object.keys(e).length > 0);
    if (hasAnyError) {
      setErrors(nextErrors);
      toast.error(
        "Terdapat kolom kosong. Isi semua kolom yang wajib sebelum menambahkan user."
      );
      return;
    }

    // Only allow admins to call admin endpoints
    if (!user || user.role !== "admin") {
      toast.error("Hanya admin yang dapat menambahkan user melalui API");
      return;
    }

    (async () => {
      setSubmitting(true);
      try {
        // Validate phone numbers before sending
        const phoneErrs = rows
          .map((row, idx) => {
            const err = validatePhoneLocal(row.nomorTelepon || "");
            return err ? { idx, message: err } : null;
          })
          .filter(Boolean);

        if (phoneErrs.length) {
          const nextErrors = rows.map(() => ({}));
          phoneErrs.forEach((pe) => {
            nextErrors[pe.idx] = {
              ...(nextErrors[pe.idx] || {}),
              nomorTelepon: true,
            };
          });
          setErrors(nextErrors);
          toast.error(`Terdapat ${phoneErrs.length} nomor telepon tidak valid`);
          setSubmitting(false);
          return;
        }
        // Use a temporary password for created users (dev behavior)
        const tempPassword = "Temporary123!";

        const promises = rows.map((r) => {
          const payload = {
            nama: r.nama,
            email: r.email,
            password: tempPassword,
            nomorTelepon: r.nomorTelepon,
            domisili: r.domisili,
          };

          return axios.post("/admin/sales", payload);
        });

        const results = await Promise.allSettled(promises);

        const successes = results.filter(
          (res) => res.status === "fulfilled"
        ).length;
        const failures = results
          .map((res, idx) => ({ res, row: rows[idx] }))
          .filter((x) => x.res.status === "rejected");

        if (successes) toast.success(`Added ${successes} users`);
        if (failures.length) {
          toast.error(`${failures.length} row(s) failed to add`);
          console.error("Bulk add failures", failures);
        }

        // Reset only when all succeeded
        if (failures.length === 0) {
          setRows([emptyRow()]);
          setErrors([]);
        }
      } catch (e) {
        console.error("Bulk add error", e);
        toast.error("Terjadi kesalahan saat menambahkan users");
      } finally {
        setSubmitting(false);
      }
    })();
  }

  function handleImport(file) {
    (async () => {
      if (!file) {
        toast.error("No file selected");
        return;
      }

      // Only allow admins to call import
      if (!user || user.role !== "admin") {
        toast.error("Hanya admin yang dapat melakukan import");
        return;
      }

      setSubmitting(true);
      try {
        const form = new FormData();
        form.append("file", file);

        const res = await axios.post("/admin/sales/import", form, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) {
              const pct = Math.round((e.loaded * 100) / e.total);
              // optionally show progress
              // console.log('upload', pct);
            }
          },
        });

        const result = res?.data?.data || res?.data;

        // store and show results dialog for detailed failures
        setImportResult(result);
        setImportResultOpen(true);

        // result expected: { total, created: [...], failed: [...] }
        const createdCount = (result.created && result.created.length) || 0;
        const failedCount = (result.failed && result.failed.length) || 0;

        if (createdCount > 0) {
          toast.success(
            `Import selesai: ${createdCount} berhasil, ${failedCount} gagal`
          );
          // Reset local rows if import created users
          setRows([emptyRow()]);
          setErrors([]);
        } else if (failedCount > 0) {
          toast.error(
            `Import selesai: ${createdCount} berhasil, ${failedCount} gagal`
          );
        } else {
          toast.success("Import selesai");
        }
      } catch (err) {
        console.error("Import error", err);
        const msg =
          err?.response?.data?.message || err.message || "Import failed";
        toast.error(msg);
      } finally {
        setSubmitting(false);
        setImportOpen(false);
      }
    })();
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            title="Import users"
            onClick={() => setImportOpen(true)}
          >
            <Import className="w-4 h-4 mr-2" /> Import
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="text-sm font-medium mr-3">Jumlah Baris:</div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCountInput((c) => Math.max(1, Number(c) - 1))}
              >
                -
              </Button>
              <Input
                type="number"
                min={1}
                value={countInput}
                onChange={(e) => {
                  const v = Math.max(1, Number(e.target.value) || 1);
                  setCountInput(v);
                }}
                className="w-16 text-center mx-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCountInput((c) => Number(c) + 1)}
              >
                +
              </Button>
            </div>
          </div>

          <Button onClick={handleAddUsers} className="ml-2">
            Tambah User
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left">
              <th className="p-2 border-b">Nama</th>
              <th className="p-2 border-b">Email</th>
              <th className="p-2 border-b">Role</th>
              <th className="p-2 border-b">Domisili</th>
              <th className="p-2 border-b">No. Telepon</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="align-top">
                <td className="p-2 border-b">
                  <Input
                    value={row.nama}
                    onChange={(e) => setCell(i, "nama", e.target.value)}
                    className={errors[i]?.nama ? "border-red-500" : ""}
                  />
                </td>
                <td className="p-2 border-b">
                  <Input
                    value={row.email}
                    onChange={(e) => setCell(i, "email", e.target.value)}
                    className={errors[i]?.email ? "border-red-500" : ""}
                  />
                </td>
                <td className="p-2 border-b">
                  <Select
                    value={row.role}
                    onValueChange={(v) => setCell(i, "role", v)}
                  >
                    <SelectTrigger
                      className={errors[i]?.role ? "border-red-500" : ""}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2 border-b">
                  <Input
                    value={row.domisili}
                    onChange={(e) => setCell(i, "domisili", e.target.value)}
                    className={errors[i]?.domisili ? "border-red-500" : ""}
                  />
                </td>
                <td className="p-2 border-b">
                  <Input
                    value={row.nomorTelepon}
                    onChange={(e) => setCell(i, "nomorTelepon", e.target.value)}
                    className={errors[i]?.nomorTelepon ? "border-red-500" : ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
      />
      <AdminImportResultsDialog
        open={importResultOpen}
        onOpenChange={setImportResultOpen}
        result={importResult}
      />
    </div>
  );
}
