import React from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import useNotifications from "@/hooks/useNotifications"

function NotificationItem({ notification, onDelete }) {
  const { id, title, time } = notification

  return (
    <div
      onClick={() => onDelete(id)}
      className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/5 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onDelete(id)}
    >
      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-accent/10 text-accent-foreground">
        <Bell className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        {time && <div className="text-xs text-muted-foreground">{time}</div>}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(id)
        }}
        className="ml-2 p-1 rounded hover:bg-muted/10"
        aria-label="Hapus notifikasi"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function NotificationButton({ className }) {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    deleteNotification,
    markAllRead,
  } = useNotifications()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button variant="ghost" size="icon" className={cn("w-10 h-10 rounded-full", className)}>
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-destructive text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={8} className="w-80 max-h-64 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Notifikasi</h3>
          <button
            onClick={() => markAllRead()}
            className="text-xs text-muted-foreground"
            aria-label="Tandai semua sudah dibaca"
          >
            Bersihkan
          </button>
        </div>

        {loading ? (
          <div className="p-4">Loading…</div>
        ) : error ? (
          <div className="p-4 text-sm text-destructive">
            Terjadi kesalahan: {error}
            <div>
              <button
                className="mt-2 text-sm text-foreground"
                onClick={() => fetchNotifications()}
              >
                Coba lagi
              </button>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">Belum ada notifikasi</div>
        ) : (
          <div className="flex flex-col gap-1">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onDelete={deleteNotification} />
            ))}
          </div>
        )}

        <div className="mt-3 text-center">
          <a className="text-sm text-foreground hover:underline" href="#">Lihat semua notifikasi</a>
        </div>
      </PopoverContent>
    </Popover>
  )
}
