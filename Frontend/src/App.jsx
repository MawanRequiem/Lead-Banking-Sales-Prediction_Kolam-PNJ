import ModeToggle from "@/components/ui/theme-toogle"
import { ThemeProvider } from "./contexts/theme-context"
import { Sidebar } from "./components/ui/app-sidebar"
import { SidebarProvider } from "./components/ui/sidebar"
import { Header } from "./components/ui/header"
import FilterDropdown from "./components/ui/filter-dropdown"
import { Sliders } from 'lucide-react'

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
          </main>
        </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App