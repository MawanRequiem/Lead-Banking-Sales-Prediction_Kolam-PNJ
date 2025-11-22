import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * OTP Form
 * Props:
 * - length: number of digits (default 4)
 * - onVerify(codeString) optional callback when user submits
 * - onResend() optional callback when user requests resend
 */
export default function OtpForm({ length = 4, onVerify, onResend }) {
  const [values, setValues] = useState(Array.from({ length }).map(() => ''))
  const inputsRef = useRef([])
  const [secondsLeft, setSecondsLeft] = useState(60)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // focus first input on mount
    inputsRef.current?.[0]?.focus()
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [secondsLeft])

  function handleChange(idx, e) {
    const raw = e.target.value || ''
    const digit = raw.replace(/[^0-9]/g, '').slice(-1)
    setValues(prev => {
      const next = [...prev]
      next[idx] = digit
      return next
    })

    if (digit) {
      const nextIdx = Math.min(length - 1, idx + 1)
      inputsRef.current[nextIdx]?.focus()
    }
  }

  function handleKeyDown(idx, e) {
    const key = e.key
    if (key === 'Backspace') {
      if (values[idx]) {
        // clear current
        setValues(prev => {
          const next = [...prev]
          next[idx] = ''
          return next
        })
      } else {
        // move to previous
        const prevIdx = Math.max(0, idx - 1)
        inputsRef.current[prevIdx]?.focus()
        setValues(prev => {
          const next = [...prev]
          next[prevIdx] = ''
          return next
        })
      }
    } else if (key === 'ArrowLeft') {
      inputsRef.current[Math.max(0, idx - 1)]?.focus()
    } else if (key === 'ArrowRight') {
      inputsRef.current[Math.min(length - 1, idx + 1)]?.focus()
    }
  }

  function handlePaste(e) {
    const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '')
    if (!pasted) return
    const chars = pasted.slice(0, length).split('')
    setValues(() => chars.concat(Array.from({ length: Math.max(0, length - chars.length) }).map(() => '')).slice(0, length))
    // focus last filled
    const focusIdx = Math.min(length - 1, chars.length - 1)
    setTimeout(() => inputsRef.current[focusIdx]?.focus(), 0)
    e.preventDefault()
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    const code = values.join('')
    if (code.length < length) {
      alert('Masukkan kode lengkap')
      return
    }
    setSubmitting(true)
    try {
      if (typeof onVerify === 'function') await onVerify(code)
      else alert(`Verifying ${code}`)
    } finally {
      setSubmitting(false)
    }
  }

  function handleResend() {
    if (secondsLeft > 0) return
    setSecondsLeft(60)
    if (typeof onResend === 'function') onResend()
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl bg-card text-card-foreground">
      <div className="flex flex-col items-center text-center">
        <div className="text-4xl text-purple-500 font-extrabold mb-4">&gt;</div>
        <h3 className="text-2xl font-semibold mb-2">Verifikasi OTP</h3>
        <p className="text-sm text-muted-foreground mb-4">Kami telah mengirimkan kode verifikasi ke alamat email anda.</p>

        <div className="mb-3 text-sm">
          <span className="text-muted-foreground">Tidak menerima kode? </span>
          {secondsLeft > 0 ? (
            <button type="button" onClick={handleResend} disabled className="text-purple-500 font-medium">Kirim ulang dalam {secondsLeft}s</button>
          ) : (
            <button type="button" onClick={handleResend} className="text-purple-500 font-medium">Kirim ulang</button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex justify-center gap-4 mb-6">
            {Array.from({ length }).map((_, i) => (
              <input
                key={i}
                ref={el => (inputsRef.current[i] = el)}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={values[i]}
                onChange={(e) => handleChange(i, e)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="w-14 h-14 rounded-xl border border-white/30 bg-transparent text-xl text-center outline-none focus:border-purple-400"
              />
            ))}
          </div>

          <div className="px-8">
            <Button type="submit" className="w-full rounded-full bg-purple-600 hover:bg-purple-700 text-white" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
