import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Contexts & Providers
import { ThemeProvider } from "./contexts/theme-context";
import { SidebarProvider } from "./components/ui/sidebar/sidebar";
import { LangProvider } from "./contexts/lang-context";

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

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme-shadcn-v2">
      <LangProvider storageKey="app_lang" defaultLang="id">
        <SidebarProvider>
          {/* Dev debug badge: shows current pathname and login branch (only in dev) */}
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
      </LangProvider>
    </ThemeProvider>
  );
}

export default App;
