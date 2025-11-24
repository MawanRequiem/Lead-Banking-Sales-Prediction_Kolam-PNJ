import React from 'react';
import AdminsTable from '@/components/ui/tables/admins-table';

export default function AdminPage() {
  return (
  <div className="flex flex-col gap-8 p-6 min-h-screen bg-muted/10">

      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-medium text-foreground/70">
            Selamat Datang, Admin
          </h2>
          <h1 className="text-3xl font-bold text-foreground">
            Manajemen Pengguna
          </h1>
        </div>

        {/* TODO: Search Bar */}
        <div className="flex items-center w-full max-w-sm relative">
          <input />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card rounded-xl shadow-sm p-4 border">
        <AdminsTable />
      </div>

    </div>
  );
}
