import AdminsTable from "@/components/ui/tables/admins-table";
import React from "react";
import useProfile from "@/hooks/useProfile";

const AdminPage = () => {
  const { user } = useProfile();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-[Inter]">
      <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-var(--app-header-height,4rem))]">
        {/* Welcome header for admin */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">
            Selamat Datang, {user?.name ?? "Admin"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Kelola akun admin dan pengaturan di sini.
          </p>
        </div>

        {/* Admins table should be allowed to use full width of the content area */}
        <div className="w-full">
          <AdminsTable />
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
