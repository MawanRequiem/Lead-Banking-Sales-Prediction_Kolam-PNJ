// Small strings map for chart header text. This is intentionally simple
const rangeLabels = {
  week: 'Mingguan',
  month: 'Bulanan',
  year: 'Tahunan',
}

// Membuat judul chart berdasarkan range yang dipilih
export function getChartTitle(rangeKey) {
  const label = rangeLabels[rangeKey] || 'Periode'
  return `Konversi tiap ${label}`
}

// Membuat subtitle chart berdasarkan range yang dipilih
export function getChartSubtitle(rangeKey) {
  switch (rangeKey) {
    case 'week':
      return 'Konversi harian selama seminggu terakhir'
    case 'month':
      return 'Ringkasan konversi setiap bulan'
    case 'year':
      return 'Ringkasan tahunan konversi'
    default:
      return 'Ringkasan konversi'
  }
}

// Deposit titles
export function getDepositChartTitle() {
  return `Penjualan Tipe Deposito`
}

//Mendapatkan subtitle chart deposit berdasarkan range yang dipilih
export function getDepositChartSubtitle(rangeKey) {
  switch (rangeKey) {
    case 'month':
      return 'Distribusi penjualan bulan ini'
    case 'year':
      return 'Distribusi penjualan tahun ini'
    default:
      return 'Distribusi penjualan per tipe'
  }
}

export const sortOptions = [
  { value: 'time', label: 'Urutan Waktu' },
  { value: 'value_desc', label: 'Jumlah (Desc)' },
  { value: 'value_asc', label: 'Jumlah (Asc)' },
  { value: 'pct_desc', label: 'Persentase Keberhasilan (Desc)' },
  { value: 'pct_asc', label: 'Persentase Keberhasilan (Asc)' },
]

export default { getChartTitle, getChartSubtitle, sortOptions }
