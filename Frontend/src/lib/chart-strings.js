// The functions below accept an optional translator `t` to localize strings.
// If `t` is not provided, they fall back to Indonesian defaults.

export function getChartTitle(rangeKey, t) {
  const label = t
    ? t(`chart.range.${rangeKey}`, t('chart.range.month', 'Bulanan'))
    : ({ week: 'Mingguan', month: 'Bulanan', year: 'Tahunan' }[rangeKey] || 'Periode')
  const prefix = t ? t('chart.sales.titlePrefix', 'Konversi tiap') : 'Konversi tiap'
  return `${prefix} ${label}`
}

export function getChartSubtitle(rangeKey, t) {
  if (t) {
    const key =
      rangeKey === 'week'
        ? 'chart.sales.subtitle.week'
        : rangeKey === 'month'
        ? 'chart.sales.subtitle.month'
        : rangeKey === 'year'
        ? 'chart.sales.subtitle.year'
        : 'chart.sales.subtitle.default'
    return t(key, 'Ringkasan konversi')
  }
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

export function getDepositChartTitle(t) {
  return t ? t('chart.deposit.title', 'Penjualan Tipe Deposito') : 'Penjualan Tipe Deposito'
}

export function getDepositChartSubtitle(rangeKey, t) {
  if (t) {
    const key =
      rangeKey === 'month'
        ? 'chart.deposit.subtitle.month'
        : rangeKey === 'year'
        ? 'chart.deposit.subtitle.year'
        : 'chart.deposit.subtitle.default'
    return t(key, 'Distribusi penjualan per tipe')
  }
  switch (rangeKey) {
    case 'month':
      return 'Distribusi penjualan bulan ini'
    case 'year':
      return 'Distribusi penjualan tahun ini'
    default:
      return 'Distribusi penjualan per tipe'
  }
}

export function getSortOptions(t) {
  return [
    { value: 'time', label: t ? t('chart.sort.time', 'Urutan Waktu') : 'Urutan Waktu' },
    { value: 'value_desc', label: t ? t('chart.sort.valueDesc', 'Jumlah (Desc)') : 'Jumlah (Desc)' },
    { value: 'value_asc', label: t ? t('chart.sort.valueAsc', 'Jumlah (Asc)') : 'Jumlah (Asc)' },
    { value: 'pct_desc', label: t ? t('chart.sort.pctDesc', 'Persentase Keberhasilan (Desc)') : 'Persentase Keberhasilan (Desc)' },
    { value: 'pct_asc', label: t ? t('chart.sort.pctAsc', 'Persentase Keberhasilan (Asc)') : 'Persentase Keberhasilan (Asc)' },
  ]
}

export default { getChartTitle, getChartSubtitle, getSortOptions, getDepositChartTitle, getDepositChartSubtitle }
