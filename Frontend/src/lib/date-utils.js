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

export function formatDateTime(ts) {
  if (!ts) return ''
  try {
    const d = typeof ts === 'number' ? new Date(ts) : typeof ts === 'string' ? new Date(ts) : ts
    if (!d || isNaN(d.getTime())) return ''
    return d.toLocaleString()
  } catch {
    return ''
  }
}

export function formatDurationSec(s) {
  if (s == null || isNaN(s)) return ''
  const sec = Math.max(0, Math.floor(Number(s)))
  const mm = String(Math.floor(sec / 60)).padStart(2, '0')
  const ss = String(sec % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export function parseDurationToSeconds(str) {
  if (!str) return 0;

  const parts = str.split(":");

  // Only HH:MM:SS allowed
  if (parts.length !== 3) return 0;

  const [h, m, s] = parts.map(Number);

  if (isNaN(h) || isNaN(m) || isNaN(s)) return 0;

  return h * 3600 + m * 60 + s;
}

export function formatSecondsToHHMMSS(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds)) return "00:00:00";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(h)}:${pad(m)}:${pad(s)}`;
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
