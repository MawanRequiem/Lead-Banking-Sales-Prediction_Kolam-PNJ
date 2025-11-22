// Mock sales data used for UI development and previews.
// Shape: { week: [{label, value}], month: [...], year: [...] }
export const mockSales = {
  // Each item has: label, value (sales), success, total
  week: [
    { label: 'Mon', value: 120, success: 90, total: 120 },
    { label: 'Tue', value: 160, success: 120, total: 160 },
    { label: 'Wed', value: 90, success: 45, total: 90 },
    { label: 'Thu', value: 200, success: 150, total: 200 },
    { label: 'Fri', value: 140, success: 100, total: 140 },
    { label: 'Sat', value: 60, success: 30, total: 60 },
    { label: 'Sun', value: 30, success: 10, total: 30 },
  ],
  // 12 months, deterministic values for consistent UI
  month: [
    { label: 'Jan', value: 1200, success: 900, total: 1200 },
    { label: 'Feb', value: 980, success: 720, total: 980 },
    { label: 'Mar', value: 1450, success: 1100, total: 1450 },
    { label: 'Apr', value: 1350, success: 980, total: 1350 },
    { label: 'May', value: 1600, success: 1240, total: 1600 },
    { label: 'Jun', value: 1280, success: 920, total: 1280 },
    { label: 'Jul', value: 1500, success: 1120, total: 1500 },
    { label: 'Aug', value: 1700, success: 1360, total: 1700 },
    { label: 'Sep', value: 1420, success: 1060, total: 1420 },
    { label: 'Oct', value: 1580, success: 1180, total: 1580 },
    { label: 'Nov', value: 1660, success: 1260, total: 1660 },
    { label: 'Dec', value: 1900, success: 1500, total: 1900 },
  ],
  // last 5 years
  year: [
    { label: '2021', value: 12000, success: 9000, total: 12000 },
    { label: '2022', value: 15000, success: 11200, total: 15000 },
    { label: '2023', value: 17000, success: 12800, total: 17000 },
    { label: '2024', value: 20000, success: 15600, total: 20000 },
    { label: '2025', value: 22000, success: 17600, total: 22000 },
  ],
}
