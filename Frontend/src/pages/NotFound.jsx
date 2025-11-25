import React from "react";
import { ThemeProvider } from "@/contexts/theme-context";
import { SidebarProvider } from "@/components/ui/sidebar/sidebar";
import { Sidebar } from "@/components/ui/sidebar/app-sidebar";
import { Header } from "@/components/ui/header/header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-[Inter]">
      <main className="p-4 ml-6 sm:ml-12 sm:p-6 lg:p-8 min-h-[calc(100vh-var(--app-header-height,4rem))]">
        <div className="text-center p-6 rounded-lg shadow-lg bg-card">
          <h1 className="text-6xl font-extrabold tracking-tight mb-4">404</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Halaman yang Anda cari tidak ditemukan.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              Kembali ke dashboard
            </Button>
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
  );
}
