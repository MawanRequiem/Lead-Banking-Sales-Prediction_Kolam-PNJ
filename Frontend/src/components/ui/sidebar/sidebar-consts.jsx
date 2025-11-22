import React from "react"
import { LayoutDashboard, Users, UserPlus, NotepadText, History, LogOut } from 'lucide-react'

// Data Navigasi
export const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, tooltip: 'Dashboard' },
  { id: 'list', icon: Users, tooltip: 'Customer List' },
  { id: 'Notes', icon: NotepadText, tooltip: 'Notes' },
  { id: 'History', icon: History, tooltip: 'History' },
]

export const adminNavItems = [
  { id: 'dashboard', icon: LayoutDashboard, tooltip: 'Dashboard' },
  { id: 'add', icon: UserPlus, tooltip: 'Add User' },
]

export const footerItem = { id: 'logout', icon: LogOut, tooltip: 'Keluar' }

export const SidebarContext = React.createContext(null)
