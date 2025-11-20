export function toIso(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function isoToDate(iso) {
  if (!iso) return undefined
  const d = new Date(iso)
  return isNaN(d.getTime()) ? undefined : d
}

export function formatDisplay(date) {
  const d = typeof date === 'string' ? isoToDate(date) : date
  if (!d) return ''
  return d.toLocaleDateString()
}

// returns { from, to } as ISO strings for common ranges
export function getQuickRange(kind) {
  const now = new Date()
  let start = new Date(now)

  switch (kind) {
    case 'week':
      start.setDate(now.getDate() - 7)
      break
    case 'month':
      start.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      start.setMonth(now.getMonth() - 3)
      break
    case 'year':
      start.setFullYear(now.getFullYear() - 1)
      break
    default:
      start = new Date(now)
  }

  return { from: toIso(start), to: toIso(now) }
}

export default { toIso, isoToDate, formatDisplay, getQuickRange }
