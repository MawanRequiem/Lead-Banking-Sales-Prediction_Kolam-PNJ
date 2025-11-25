import AdminBulkAddTable from "@/components/ui/tables/admin-bulk-add-table";
import React from "react";

const AddUserPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-[Inter]">
      <main className="p-4 ml-6 sm:ml-12 sm:p-6 lg:p-8 min-h-[calc(100vh-var(--app-header-height,4rem))]">
        {/* Welcome header for admin */}
        <div className="mb-6">
          <h2 className="text-4xl font-semibold">Tambah Pengguna Baru</h2>
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
