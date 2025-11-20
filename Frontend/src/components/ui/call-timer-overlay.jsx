import React, { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { PhoneOff } from 'lucide-react'

/**
 * CallTimerDialog — controlled shadcn Dialog (Radix) implementation.
 * Prevents outside/escape close unless `allowOutsideClose` is true.
 */
export default function CallTimerOverlay({
  open = false,
  onOpenChange,
  onHangup,
  callerName = '',
  callerPhone = '',
  startedAt = null,
  allowOutsideClose = false,
}) {
  const [startedTs, setStartedTs] = useState(null)
  const [now, setNow] = useState(null)

  useEffect(() => {
    if (open) {
      // initialize timestamps asynchronously
      const ts = startedAt ? new Date(startedAt).getTime() : Date.now()
      const id = setTimeout(() => {
        setStartedTs(ts)
        setNow(Date.now())
      }, 0)
      return () => clearTimeout(id)
    }
    const id2 = setTimeout(() => {
      setStartedTs(null)
      setNow(null)
    }, 0)
    return () => clearTimeout(id2)
  }, [open, startedAt])

  useEffect(() => {
    if (!open) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [open])

  const elapsed = useMemo(() => {
    if (!startedTs || !now) return 0
    return Math.max(0, Math.floor((now - startedTs) / 1000))
  }, [now, startedTs])

  function formatElapsed(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  function formatDate(ts) {
    try {
      if (!ts) return ''
      const d = new Date(ts)
      return d.toLocaleString()
    } catch {
      return ''
    }
  }

  // Controlled open change handler: allow opening, but by default ignore close attempts
  function handleOpenChange(value) {
    if (value) {
      if (typeof onOpenChange === 'function') onOpenChange(true)
    } else {
      // only forward close requests when explicitly allowed
      if (allowOutsideClose && typeof onOpenChange === 'function') onOpenChange(false)
    }
  }

  return (
    <Dialog.Dialog open={open} onOpenChange={handleOpenChange}>
      <Dialog.DialogPortal>
        <Dialog.DialogOverlay />

        <Dialog.DialogContent
          // prevent pointer/interaction outside from closing
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            if (!allowOutsideClose) e.preventDefault()
          }}
          // let the Dialog primitive handle centering; keep small padding here
          className="p-6"
        >
          <div className="w-full max-w-md mx-auto text-center rounded-2xl bg-transparent text-white">
            <div className="mb-2">
              <div className="inline-block px-3 py-1 rounded-lg bg-white/10 text-sm font-medium">Timer dinyalakan, dalam panggilan</div>
            </div>

            <div className="text-xs text-muted-foreground mb-6">{formatDate(startedTs)}</div>

            <div className="py-8">
              <div className="text-lg font-bold tracking-wide">{callerName || 'Unknown'}</div>
              <div className="text-sm text-muted-foreground mt-1">{callerPhone || '-'}</div>
              <div className="text-2xl font-extrabold mt-4" aria-live="polite">{formatElapsed(elapsed)}</div>
            </div>

            {/* Buttons for hangup */}
            <div className="pb-8">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  {/* Fungsi yang mengambil data durasi panggilan dan menutup dialog */}
                  if (typeof onHangup === 'function') onHangup({ startedAt: startedTs, durationSec: elapsed })
                  if (typeof onOpenChange === 'function') onOpenChange(false)
                }}
                className="mx-auto bg-red-600 hover:bg-red-700 w-20 h-20 flex items-center justify-center rounded-full"
                aria-label="Hangup"
              >
                <PhoneOff className="w-8 h-8 text-white" aria-hidden />
              </Button>
            </div>
          </div>
        </Dialog.DialogContent>
      </Dialog.DialogPortal>
    </Dialog.Dialog>
  )
}
