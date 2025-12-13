const ExcelJS = require('exceljs');
const { Readable } = require('stream'); // Diperlukan untuk CSV parsing
// Asumsi successResponse dan salesService tersedia

/**
 * Utility: Menormalkan nilai cell dari ExcelJS (menangani richText, formula, date, dll.)
 * @param {*} v - Nilai cell dari ExcelJS
 * @returns {string} - Nilai cell yang dinormalisasi sebagai string
 */
function normalizeCellValue(v) {
  if (v === null || v === undefined) { return ''; }

  // 1. Handle Object Values (RichText, Formula, Date, Hyperlink)
  if (typeof v === 'object' && v !== null) {
    // richText: array of {text: '...'}
    if (Array.isArray(v.richText)) {
      return v.richText.map(r => (r && r.text) ? String(r.text) : String(r)).join('');
    }
    // General text/value extraction (Hyperlink text, etc.)
    if (v.text) { return String(v.text); }
    // Formula result
    if (v.result) { return String(v.result); }
    // Date objects returned by ExcelJS
    if (v instanceof Date) { return v.toISOString(); } // Format ke ISO string atau format tanggal lain yang Anda inginkan

    // 2. Fallback untuk nilai yang kompleks lainnya
    try {
      if (typeof v.valueOf === 'function') {
        const val = v.valueOf();
        if (val !== v) { return String(val); }
      }
    } catch (e) {
      // Ignore error in valueOf
    }

    // Final fallback for complex objects
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }

  // 3. Simple value (string, number, boolean)
  return String(v);
}


/**
 * Utility: Memproses data dari file XLSX/XLS
 * @param {Buffer} buffer - Buffer file dari Multer
 * @returns {Array<Object>} Array of raw data rows
 */
const parseXlsxData = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) { throw new Error('No worksheet found in XLSX file'); }

  const headerRow = worksheet.getRow(1).values.slice(1);
  const rows = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) { return; } // skip header

    const values = row.values.slice(1);
    const obj = {};

    for (let i = 0; i < headerRow.length; i++) {
      const key = String(headerRow[i] || '').trim();
      if (!key) { continue; }
      // Menerapkan normalizeCellValue pada setiap nilai cell
      obj[key] = normalizeCellValue(values[i]).trim();
    }
    obj.__rowNumber = rowNumber;
    rows.push(obj);
  });

  return rows;
};

/**
 * Utility: Memproses data dari file CSV
 * @param {Buffer} buffer - Buffer file dari Multer
 * @returns {Array<Object>} Array of raw data rows
 */
const parseCsvData = async (buffer) => {
  const workbook = new ExcelJS.Workbook();

  // Mengubah buffer menjadi stream agar ExcelJS dapat membacanya
  const stream = Readable.from(buffer);
  await workbook.csv.read(stream);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) { throw new Error('No worksheet found in CSV file'); }

  // CSV parser ExcelJS mungkin mengembalikan header sebagai array values di row 1
  const headerRow = worksheet.getRow(1).values;
  const rows = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) { return; } // skip header

    const values = row.values;
    const obj = {};

    // Iterasi dimulai dari index 1 karena index 0 biasanya null/kosong di ExcelJS
    for (let i = 1; i < headerRow.length; i++) {
      const key = String(headerRow[i] || '').trim();
      if (!key) { continue; }
      // Menerapkan normalizeCellValue pada setiap nilai cell
      obj[key] = normalizeCellValue(values[i]).trim();
    }
    obj.__rowNumber = rowNumber;
    rows.push(obj);
  });

  return rows;
};

module.exports = {
  normalizeCellValue,
  parseXlsxData,
  parseCsvData,
};
