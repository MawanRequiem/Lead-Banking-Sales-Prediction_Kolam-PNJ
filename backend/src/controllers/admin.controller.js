const adminService = require('../services/admin.service');
const salesService = require('../services/sales.service');
const { parseXlsxData, parseCsvData } = require('../utils/normalizeCellValue');
const {
  successResponse,
  createdResponse,
} = require('../utils/response.util');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

/**
 * Create Admin Account
 */
const createAdmin = asyncHandler(async (req, res) => {
  const adminData = req.body;
  const admin = await adminService.createAdmin(adminData);

  return successResponse(res, admin, 'Admin account created successfully', 201);
});

/**
 * Create Sales Account
 * POST /api/admin/sales
 */
const createSales = asyncHandler(async (req, res) => {
  const result = await salesService.createSales(req.body);

  return createdResponse(
    res,
    result,
    'Sales account created successfully',
    `/api/admin/sales/${result.idSales}`,
  );
});

/**
 * Get All Sales
 * GET /api/admin/sales
 */
const getAllSales = asyncHandler(async (req, res) => {
  const { sales, pagination } = await salesService.getAllSales(req.query);

  return successResponse(
    res,
    { sales },
    'Sales list retrieved successfully',
    { pagination },
  );
});

/**
 * Get Sales By ID
 * GET /api/admin/sales/:id
 */
const getSalesById = asyncHandler(async (req, res) => {
  const sales = await salesService.getSalesById(req.params.id);

  return successResponse(
    res,
    sales,
    'Sales details retrieved successfully',
  );
});

/**
 * Update Sales
 * PUT /api/admin/sales/:id
 */
const updateSales = asyncHandler(async (req, res) => {
  const updated = await salesService.updateSales(req.params.id, req.body);

  return successResponse(
    res,
    updated,
    'Sales account updated successfully',
  );
});

/**
 * Reset Sales Password
 * POST /api/admin/sales/:id/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const result = await salesService.resetSalesPassword(
    req.params.id,
    req.body.newPassword,
  );

  return successResponse(
    res,
    result,
    'Password reset successfully',
  );
});

/**
 * Deactivate Sales
 * POST /api/admin/sales/:id/deactivate
 */
const deactivateSales = asyncHandler(async (req, res) => {
  const result = await salesService.deactivateSales(req.params.id);

  return successResponse(
    res,
    result,
    'Sales account deactivated successfully',
  );
});

/**
 * Activate Sales
 * POST /api/admin/sales/:id/activate
 */
const activateSales = asyncHandler(async (req, res) => {
  const result = await salesService.activateSales(req.params.id);

  return successResponse(
    res,
    result,
    'Sales account activated successfully',
  );
});

/**
 * Delete Sales (Soft Delete)
 * DELETE /api/admin/sales/:id
 */
const deleteSales = asyncHandler(async (req, res) => {
  const result = await salesService.deleteSales(req.params.id);

  return successResponse(
    res,
    result,
    'Sales account deleted successfully',
  );
});

/**
 * Import Sales from Excel
 */
const importSales = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, message: 'File is required' });
  }

  const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
  let rawRows;

  // --- Validator Tipe File & Parsing ---
  try {
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      rawRows = await parseXlsxData(req.file.buffer);
    } else if (fileExtension === 'csv') {
      rawRows = await parseCsvData(req.file.buffer);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file type. Please use .xlsx, .xls, or .csv.' });
    }
  } catch (error) {
    console.error('File parsing error:', error);
    return res.status(400).json({ success: false, message: `Error processing file: ${error.message}` });
  }

  if (!rawRows || rawRows.length === 0) {
    return res.status(400).json({ success: false, message: 'File processed successfully but no data rows were found.' });
  }

  // --- Logika Normalisasi Data Akhir ---
  // Logika pemetaan nama kolom fleksibel (flexible column mapping)
  const normalized = rawRows.map(r => ({
    rowNumber: r.__rowNumber,
    // Contoh: Mencari key yang mungkin (nama, Nama, full_name, name)
    nama: r['nama'] || r['Nama'] || r['full_name'] || r['name'] || '',
    email: r['email'] || r['Email'] || '',
    nomorTelepon: r['nomorTelepon'] || r['nomor_telepon'] || r['phone'] || '',
    domisili: r['domisili'] || r['Domisili'] || r['city'] || '',
    password: r['password'] || null, // Mungkin ini tidak ada di Excel
  }));

  // --- Logika Bisnis (Simpan ke DB) ---
  const result = await salesService.importFromExcel(normalized, { importedBy: req.user?.userId });

  return successResponse(res, result, 'Import processed', 200);
});

module.exports = {
  createAdmin,
  createSales,
  getAllSales,
  getSalesById,
  updateSales,
  resetPassword,
  deactivateSales,
  activateSales,
  deleteSales,
  importSales,
};
