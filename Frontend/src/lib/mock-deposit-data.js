// Mock deposit sales data for pie chart UI previews.
// Each range is an array of { label: depositType, value: count }
export const mockDeposit = {
  week: [
    { label: 'Deposito A', value: 30 },
    { label: 'Deposito B', value: 18 },
    { label: 'Deposito C', value: 12 },
    { label: 'Deposito D', value: 8 },
  ],
  // current month totals by type
  month: [
    { label: 'Deposito A', value: 420 },
    { label: 'Deposito B', value: 300 },
    { label: 'Deposito C', value: 180 },
    { label: 'Deposito D', value: 100 },
  ],
  // previous month total (for percent change calculation)
  monthPreviousTotal: 850, // previous month total across types

  // 12-month totals per type
  year: [
    { label: 'Deposito A', value: 4800 },
    { label: 'Deposito B', value: 3600 },
    { label: 'Deposito C', value: 2100 },
    { label: 'Deposito D', value: 1200 },
  ],
}

export default mockDeposit
