import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from "sonner"

// Contexts & Providers
import { ThemeProvider } from "./contexts/theme-context"
import { SidebarProvider } from "./components/ui/sidebar/sidebar"

// Layout Components
import { Sidebar } from "./components/ui/sidebar/app-sidebar"
import { Header } from "./components/ui/header/header"

// Pages
import AssignmentsPage from './pages/AssigmentPage'
import NotFound from './pages/NotFound' // Pastikan file ini ada, atau hapus route-nya

// Components untuk Halaman Dashboard (Home)
import AssignmentTable from './components/ui/tables/assignment-table'
import CallHistoryTable from "./components/ui/tables/call-history-table"
import CallHistoryCard from "./components/ui/cards/call-history-card"
import CustomerStatusCard from "./components/ui/cards/customer-status-card"
import SalesBarChartCard from "./components/ui/cards/sales-bar-chart-card"
import DepositPieChartCard from "./components/ui/cards/deposit-pie-chart-card"
import { CategoryBadge } from "./components/ui/badges"
import CustomerOverviewTable from "./components/ui/tables/customers-overview-table"
import OtpForm from "./components/ui/auth/otp-form"
import AdminsTable from "./components/ui/tables/admins-table"

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

      <AdminsTable />

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerStatusCard
          customerId="12345"
          entries={[
            { id: '1', result: 'Terkoneksi' },
            { id: '2', result: 'Voicemail' },
            { id: '3', result: 'Terkoneksi' },
            { id: '4', result: 'Tidak Terangkat' },
            { id: '5', result: 'Terkoneksi' },
          ]}
          className="w-full"
        />
      </div>

      <CustomerOverviewTable />
      <AssignmentTable />
      <CallHistoryTable />
      <CallHistoryCard
        entries={[
          { id: '1', nama: 'Budi Santoso', time: '2025-11-18 10:00', agent: 'Ari', duration: '00:05:23', result: 'Terkoneksi', note: 'Nasabah tertarik dengan produk baru.' },
          { id: '2', nama: 'Siti Aminah', time: '2025-11-18 11:30', agent: 'Budi', duration: '00:02:10', result: 'Voicemail', note: '' },
          { id: '3', nama: 'Andi Wijaya', time: '2025-11-18 12:15', agent: 'Citra', duration: '00:03:45', result: 'Terkoneksi', note: 'Nasabah meminta informasi lebih lanjut via email.' },
        ]}
        onExport={() => alert('Exporting call history...')}
      />
    </div>
  )
}

// --- Main App Component ---
function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme-shadcn-v2">
      <Router>
        {/* SidebarProvider membungkus seluruh layout agar state sidebar bisa diakses Header */}
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background text-foreground font-[Inter]">

            {/* Sidebar Kiri */}
            <Sidebar />

            {/* Area Konten Utama */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

              {/* Header Global */}
              <Header />

              {/* Main Scrollable Area */}
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <Routes>
                  {/* Route Dashboard (Tampilan Lama) */}
                  <Route path="/" element={<Dashboard />} />

                  {/* Route Assignment (Halaman Baru) */}
                  <Route path="/assignments" element={<AssignmentsPage />} />

                  {/* Catch-all 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>

            <Toaster />
          </div>
        </SidebarProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
