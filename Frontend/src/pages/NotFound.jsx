import React from "react";
import { ThemeProvider } from "@/contexts/theme-context";
import { SidebarProvider } from "@/components/ui/sidebar/sidebar";
import { Sidebar } from "@/components/ui/sidebar/app-sidebar";
import { Header } from "@/components/ui/header/header";

export default function NotFound() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme-shadcn-v2">
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-[Inter]">
        <Header />

        <SidebarProvider>
          <Sidebar />
        </SidebarProvider>

        <div className="ml-20">
          <main className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[calc(100vh-var(--app-header-height,4rem))]">
            <div className="text-center p-6 rounded-lg shadow-lg bg-card">
              <h1 className="text-6xl font-extrabold tracking-tight mb-4">404</h1>
              <p className="text-lg text-muted-foreground mb-6">Halaman yang Anda cari tidak ditemukan.</p>
              <div className="flex justify-center gap-3">
                <a
                  href="/"
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
                >
                  Kembali ke Beranda
                </a>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-md border border-border text-foreground hover:bg-muted/20 transition"
                >
                  Muat Ulang
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
