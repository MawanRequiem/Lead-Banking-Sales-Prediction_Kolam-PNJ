import React from 'react'
import { Globe, Key, SunMoon, Info, Bell, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import useProfile from '@/hooks/useProfile'
import { Switch } from './switch'
import { useTheme } from '@/hooks/useTheme'

export default function ProfileDropdown(props) {
  const { user, changeLanguage, changePassword, openPersonalInfo, openNotifications, logout } = useProfile()
  const { theme, setTheme } = useTheme()

  const displayUser = {
    name: props.userName ?? user.name,
    email: props.userEmail ?? user.email,
  }

  return (
    <div className={cn('relative', props.className)}>
      <button
        className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-muted"
        aria-label="Open profile menu"
        onClick={(e) => {
          // toggle simple menu: we'll use a small aria-based approach
          const menu = e.currentTarget.nextElementSibling
          if (menu) menu.classList.toggle('hidden')
        }}
      >
        <span className="text-sm font-medium hidden lg:block">{user.name}</span>
      </button>

      {/* Simple dropdown menu (hidden by default) */}
      <div className="absolute right-0 mt-2 w-56 rounded-md bg-popover text-popover-foreground shadow-lg hidden">
        <div className="px-4 py-3">
          <div className="font-medium">{displayUser.name}</div>
          <div className="text-sm text-muted-foreground">{displayUser.email}</div>
        </div>
        <div className="h-px bg-border" />
        <ul className="py-1">
          <li>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
              onClick={openPersonalInfo}
            >
              <Info className="h-4 w-4" />
              Informasi Personal
            </button>
          </li>
          <li>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
              onClick={changePassword}
            >
              <Key className="h-4 w-4" />
              Ganti Password
            </button>
          </li>
          <li>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
              onClick={() => changeLanguage('id')}
            >
              <Globe className="h-4 w-4" />
              Ganti Bahasa
            </button>
          </li>
          <div className="h-px my-1 bg-border" />
          <li>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
              onClick={openNotifications}
            >
              <Bell className="h-4 w-4" />
              Notifikasi
            </button>
          </li>
          <li className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SunMoon className="h-4 w-4" />
              <span className="text-sm">Ubah Tema</span>
            </div>
            <Switch
              aria-label="Toggle theme"
              checked={theme === 'dark'}
              onCheckedChange={(val) => setTheme(val ? 'dark' : 'light')}
            />
          </li>
          <div className="h-px my-1 bg-border" />
          <li>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
