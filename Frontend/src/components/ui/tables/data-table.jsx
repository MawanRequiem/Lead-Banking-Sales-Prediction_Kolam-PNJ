import React, { useState, useMemo } from "react";
import { useLang } from "@/hooks/useLang";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import DataTableViewOptions from "./data-table-view-options";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DataTable({
  columns,
  data,
  title,
  toolbarLeft,
  toolbarRight,
  renderRowActions,
  loading = false,
  options = {
    // Should contain pagination options since all our tables use pagination on the backend
  },
  showSearch = true,
  renderViewOptions = null,
}) {
  const { t } = useLang();
  const [sorting, setSorting] = useState([]);
  const memoColumns = useMemo(() => columns || [], [columns]);
  const memoData = useMemo(() => data || [], [data]);

  const table = useReactTable({
    data: memoData,
    columns: memoColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // getPaginationRowModel: getPaginationRowModel(), used for client-side pagination.
    manualPagination: true, // since we are doing server-side pagination
    pageCount: options.pageCount,
    onPaginationChange: options.onPageChange,
    manualFiltering: true,
    // getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination: options.pagination || { pageIndex: 0, pageSize: 10 },
    },
    // initialState: { pagination: { pageIndex: options.pageIndex || 1, pageSize: options.pageSize || 10 } },
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-4">
          {toolbarLeft ? (
            toolbarLeft
          ) : title ? (
            <h2 className="text-lg font-semibold">{title}</h2>
          ) : null}
        </div>

        {/* Ini digunakan untuk halaman History, selain itu tidak digunakan */}
        {/* Dia melakukan cek terhadap renderViewOptions untuk menampilkan DataTableViewOptions */}
        <div className="flex items-center space-x-2">
          {renderViewOptions ? renderViewOptions(table) : null}

          {toolbarRight}

          {showSearch ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("table.searchPlaceholder")}
                  value={options.search || ""}
                  onChange={(e) => options.onSearchChange?.(e.target.value)}
                  className="pl-10"
                />
              </div>
              {!renderViewOptions ? (
                <DataTableViewOptions table={table} />
              ) : null}
            </>
          ) : !renderViewOptions ? (
            <DataTableViewOptions table={table} />
          ) : null}
        </div>
      </div>

      {/** Ini adalah bagian konten tabel */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-background-secondary hover:bg-background-secondary"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
                {renderRowActions ? (
                  <TableHead key="_actions">{t("table.actions")}</TableHead>
                ) : null}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading && (
              <>
                {/* Ini adalah bagian loading tabel */}
                {Array.from({ length: 6 }).map((_, rIndex) => (
                  <TableRow key={`skeleton-${rIndex}`}>
                    {Array.from({
                      length: columns.length + (renderRowActions ? 1 : 0),
                    }).map((__, cIndex) => (
                      <TableCell key={`s-${rIndex}-${cIndex}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}

            {/** Ini adalah bagian isi tabel */}
            {!loading && table.getPaginationRowModel().rows.length
              ? table.getPaginationRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                    {renderRowActions ? (
                      <TableCell>{renderRowActions(row)}</TableCell>
                    ) : null}
                  </TableRow>
                ))
              : null}

            {/** Ini adalah bagian ketika data tidak ditemukan */}
            {!loading && !table.getPaginationRowModel().rows.length ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (renderRowActions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {t("table.noResults")}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {/** Ini adalah bagian footer tabel */}
      <div className="mt-2">
        <div className="flex items-center justify-between">
          {/** Ini adalah bagian pagination tabel */}
          <div className="text-muted-foreground text-sm">
            {t("table.totalPrefix")}{" "}
            {options.total || table.getFilteredRowModel().rows.length}{" "}
            {t("table.totalSuffix")}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </Button>
            <div className="text-sm">
              {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
