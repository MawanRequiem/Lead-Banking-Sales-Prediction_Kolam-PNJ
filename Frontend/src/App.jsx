import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Contexts & Providers
import { ThemeProvider } from "./contexts/theme-context";
import { SidebarProvider } from "./components/ui/sidebar/sidebar";

// Layout Components
import MainLayout from "./components/ui/layout/main-layout";

// Pages
import DashboardPage from "./pages/Dashboard";
import AssignmentsPage from "./pages/AssigmentPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import AddUserPage from "./pages/AddUserPager";
import ChangePasswordPage from "./pages/ChangePassword";
import CustomerOverviewPage from "./pages/CustomerOverviewPage";
import CallHistoryPage from "./pages/CallHistoryPage";

// Components untuk Halaman Dashboard (Home)
import AssignmentTable from "./components/ui/tables/assignment-table";
import CallHistoryTable from "./components/ui/tables/call-history-table";
import CallHistoryCard from "./components/ui/cards/call-history-card";
import CustomerStatusCard from "./components/ui/cards/customer-status-card";
import SalesBarChartCard from "./components/ui/cards/sales-bar-chart-card";
import DepositPieChartCard from "./components/ui/cards/deposit-pie-chart-card";
import { CategoryBadge } from "./components/ui/badges";
import CustomerOverviewTable from "./components/ui/tables/customers-overview-table";
import OtpForm from "./components/ui/auth/otp-form";
import AdminsTable from "./components/ui/tables/admins-table";

// --- Komponen Halaman Home (Dashboard Lama Anda) ---
// Saya pindahkan isi main lama ke sini agar App.jsx lebih bersih
function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <CategoryBadge category="A" />
        <CategoryBadge category="B" />
        <CategoryBadge category="C" />
      </div>

      {/* Simple login form (email + password) */}
      <OtpForm />

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesBarChartCard />
        <DepositPieChartCard />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerStatusCard
          customerId="12345"
          entries={[
            { id: "1", result: "Terkoneksi" },
            { id: "2", result: "Voicemail" },
            { id: "3", result: "Terkoneksi" },
            { id: "4", result: "Tidak Terangkat" },
            { id: "5", result: "Terkoneksi" },
          ]}
          className="w-full"
        />
      </div>

      <CustomerOverviewTable />
      <AssignmentTable />
      <CallHistoryTable />
      <CallHistoryCard
        entries={[
          {
            id: "1",
            nama: "Budi Santoso",
            time: "2025-11-18 10:00",
            agent: "Ari",
            duration: "00:05:23",
            result: "Terkoneksi",
            note: "Nasabah tertarik dengan produk baru.",
          },
          {
            id: "2",
            nama: "Siti Aminah",
            time: "2025-11-18 11:30",
            agent: "Budi",
            duration: "00:02:10",
            result: "Voicemail",
            note: "",
          },
          {
            id: "3",
            nama: "Andi Wijaya",
            time: "2025-11-18 12:15",
            agent: "Citra",
            duration: "00:03:45",
            result: "Terkoneksi",
            note: "Nasabah meminta informasi lebih lanjut via email.",
          },
        ]}
        onExport={() => alert("Exporting call history...")}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme-shadcn-v2">
      <SidebarProvider>
        {/* Dev debug badge: shows current pathname and login branch (only in dev) */}
        {process.env.NODE_ENV !== "production" ? (
          <div className="fixed top-3 right-3 z-50 text-xs px-2 py-1 rounded bg-white/80 text-black shadow">
            {location.pathname}
          </div>
        ) : null}
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route element={<MainLayout />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/add-user" element={<AddUserPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomerOverviewPage />} />
            <Route path="/history" element={<CallHistoryPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
