const salesOpRepo = require('../repositories/sales-operation.repository');
const { NotFoundError } = require('../middlewares/errorHandler.middleware');
const { Parser } = require('json2csv');

/**
 * Get Sales Dashboard (List Nasabah)
 * Scalable: Returns paginated data + metadata
 */
async function getMyDashboard(salesId, query) {
  // 1. Panggil Repo yang sudah Scalable
  const result = await salesOpRepo.getMyLeads(salesId, query);

  const transformedData = result.data.map(item => ({
    assignmentId: item.idAssignment,
    nasabah: {
      id: item.nasabah.idNasabah,
      nama: item.nasabah.nama,
      skor: parseFloat(item.nasabah.skorPrediksi || 0),
      statusTerakhir: item.nasabah.deposito[0]?.statusDeposito || 'PROSPEK',
      lastCall: item.nasabah.historiTelepon[0]?.createdAt || null,
      needFollowUp: item.nasabah.historiTelepon[0]?.nextFollowupDate
        ? new Date(item.nasabah.historiTelepon[0].nextFollowupDate) <= new Date()
        : false,
    },
  }));

  return {
    leads: transformedData,
    pagination: result.meta,
  };
}

/**
 * Log Activity (Telepon)
 */
async function logActivity(salesId, data) {
  const lead = await salesOpRepo.getLeadDetail(salesId, data.nasabahId);
  if (!lead) {
    throw new NotFoundError('Nasabah not found or not assigned to you');
  }

  return salesOpRepo.createCallLog({
    ...data,
    idNasabah: data.nasabahId,
    idSales: salesId,
  });
}

/**
 * Export Work Report (CSV)
 * Performance Note: Dibatasi max 5000 row untuk mencegah Server Hang.
 * Jika butuh >5000, harus pakai Background Job (Queue).
 */
async function exportWorkReport(salesId) {
  const result = await salesOpRepo.getMyLeads(salesId, {
    limit: 5000,
    page: 1,
  });

  const leads = result.data;

  if (leads.length === 0) {
    throw new NotFoundError('No data to export');
  }

  const reportData = leads.map(l => ({
    'Nama Nasabah': l.nasabah.nama,
    'Skor AI': parseFloat(l.nasabah.skorPrediksi || 0).toFixed(2),
    'Status': l.nasabah.deposito[0]?.statusDeposito || 'PROSPEK',
    'Total Telepon': l.nasabah.historiTelepon.length || 0,
    'Telepon Terakhir': l.nasabah.historiTelepon[0]?.createdAt
      ? new Date(l.nasabah.historiTelepon[0].createdAt).toLocaleDateString('id-ID')
      : '-',
    'Hasil Terakhir': l.nasabah.historiTelepon[0]?.hasilTelepon || '-',
  }));

  // 3. Generate CSV String
  const parser = new Parser();
  return parser.parse(reportData);
}

/**
 * Update Deposito Status
 */
async function updateLeadStatus(salesId, data) {
  const lead = await salesOpRepo.getLeadDetail(salesId, data.nasabahId);
  if (!lead) {
    throw new NotFoundError('Nasabah not found or not assigned to you');
  }

  return salesOpRepo.updateDepositoStatus(salesId, data.nasabahId, data.status);
}

module.exports = {
  getMyDashboard,
  logActivity,
  exportWorkReport,
  updateLeadStatus,
};
