import { ThemeProvider } from "./contexts/theme-context"
import { Sidebar } from "./components/ui/sidebar/app-sidebar"
import { SidebarProvider } from "./components/ui/sidebar/sidebar"
import { Header } from "./components/ui/header/header"
import AssignmentTable from './components/ui/tables/assignment-table'
import CallHistoryTable from "./components/ui/tables/call-history-table"
import CallHistoryCard from "./components/ui/cards/call-history-card"
import CustomerStatusCard from "./components/ui/cards/customer-status-card"
import SalesBarChartCard from "./components/ui/cards/sales-bar-chart-card"
import DepositPieChartCard from "./components/ui/cards/deposit-pie-chart-card"
import { CategoryBadge } from "./components/ui/badges"
import CustomerOverviewTable from "./components/ui/tables/customers-overview-table"
import LoginForm from './components/ui/auth/login-form'
import OtpForm from "./components/ui/auth/otp-form"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme-shadcn-v2">
      {/* Min-h-screen agar background mengisi seluruh tinggi halaman */}
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-[Inter]">

        {/* Header */}
        <Header />
        <div>
          {/* Sidebar di sebelah kiri, lebar 20 (w-20) */}
        <SidebarProvider>
          <Sidebar />
        </SidebarProvider>
    
        {/* Konten Utama (Bergeser ke kanan sebanyak lebar sidebar) */}
        <div className="ml-20"> 
          <main className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <CategoryBadge category="A" />
              <CategoryBadge category="B" />
              <CategoryBadge category="C" />
            </div>

            {/* Simple login form (email + password) */}
            <OtpForm />
            <div className="my-4 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesBarChartCard />
              <DepositPieChartCard />
            </div>
            <div className="my-4 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
              <CustomerStatusCard 
                customerId="12345" 
                // entries bisa diisi dengan data riwayat telepon aktual
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
            <CallHistoryCard entries={[
              { id: '1', nama: 'Budi Santoso', time: '2025-11-18 10:00', agent: 'Ari', duration: '00:05:23', result: 'Terkoneksi', note: 'Nasabah tertarik dengan produk baru.' },
              { id: '2', nama: 'Siti Aminah', time: '2025-11-18 11:30', agent: 'Budi', duration: '00:02:10', result: 'Voicemail', note: '' },
              { id: '3', nama: 'Andi Wijaya', time: '2025-11-18 12:15', agent: 'Citra', duration: '00:03:45', result: 'Terkoneksi', note: 'Nasabah meminta informasi lebih lanjut via email.' },
            ]} onExport={() => alert('Exporting call history...')} />
          </main>
        </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App