import AdminBulkAddTable from "@/components/ui/tables/admin-bulk-add-table";
import React from "react";
import { useLang } from "@/hooks/useLang";

const AddUserPage = () => {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-[Inter]">
      <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-var(--app-header-height,4rem))]">
        {/* Welcome header for admin */}
        <div className="mb-6">
          <h2 className="text-4xl font-semibold">
            {t("page.addUser.title", "Tambah Pengguna Baru")}
          </h2>
        </div>

        {/* Admins table should be allowed to use full width of the content area */}
        <div className="w-full">
          <AdminBulkAddTable />
        </div>
      </main>
    </div>
  );
};

export default AddUserPage;
