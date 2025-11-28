const salesOpRepo = require('../repositories/sales-operation.repository');
const { decryptSensitiveFields } = require('../utils/prismaEncryption.util');
const { NotFoundError } = require('../middlewares/errorHandler.middleware');
const { Parser } = require('json2csv');
const { prisma } = require('../config/prisma');

/**
 * Get Sales Dashboard (List Nasabah)
 * Scalable: Returns paginated data + metadata
 */
async function getMyDashboard(salesId, query) {
  // 1. Panggil Repo yang sudah Scalable
  const result = await salesOpRepo.getMyLeads(salesId, query);

  const transformedData = result.data.map(item => {
    const nasabah = decryptSensitiveFields(item.nasabah);
    return {
      assignmentId: item.idAssignment,
      nasabah: {
        id: nasabah.idNasabah,
        nama: nasabah.nama,
        nomorTelepon: nasabah.nomorTelepon,
        umur: nasabah.umur,
        pekerjaan: nasabah.pekerjaan || '-',
        jenisKelamin: nasabah.jenisKelaminRel?.namaJenisKelamin || '-',
        statusPernikahan: nasabah.statusPernikahan?.namaStatus || '-',
        skor: parseFloat(nasabah.skorPrediksi || 0),
        statusTerakhir: nasabah.deposito[0]?.statusDeposito || 'PROSPEK',
        lastCall: nasabah.historiTelepon[0]?.createdAt || null,
        needFollowUp: nasabah.historiTelepon[0]?.nextFollowupDate
          ? new Date(nasabah.historiTelepon[0].nextFollowupDate) <= new Date()
          : false,
      },
    };
  });

  return {
    leads: transformedData,
    pagination: result.meta,
  };
}

/**
 * Get List Nasabah
 * Returns paginated data + metadata
 */
async function getAllLeads(query) {
  const result = await salesOpRepo.getAllLeads(query);

  const transformedData = result.data.map(item => {
    const nasabah = decryptSensitiveFields(item);
    return {
      id: nasabah.idNasabah,
      nama: nasabah.nama,
      nomorTelepon: nasabah.nomorTelepon,
      umur: nasabah.umur,
      pekerjaan: nasabah.pekerjaan || '-',
      jenisKelamin: nasabah.jenisKelaminRel?.namaJenisKelamin || '-',
      statusPernikahan: nasabah.statusPernikahan?.namaStatus || '-',
      skor: parseFloat(nasabah.skorPrediksi || 0),
      statusTerakhir: nasabah.deposito[0]?.statusDeposito || 'PROSPEK',
      lastCall: nasabah.historiTelepon[0]?.createdAt || null,
      needFollowUp: nasabah.historiTelepon[0]?.nextFollowupDate
        ? new Date(nasabah.historiTelepon[0].nextFollowupDate) <= new Date()
        : false,
    };
  });

  return {
    leads: transformedData,
    pagination: result.meta,
  };
}

/**
 * Get History (Telepon)
 */
async function getCallHistory(query) {
  const result = await salesOpRepo.getCallHistory(query);

  return {
    history: result.data,
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

/**
 * Get Lead Detail
 * Termasuk history telepon & status deposito
 */
async function getLeadDetail(salesId, nasabahId) {
  const lead = await salesOpRepo.getLeadDetail(salesId, nasabahId);

  if (!lead) {
    throw new NotFoundError('Nasabah not found or not assigned to you');
  }

  // Formatting response agar lebih bersih (decrypt sensitive fields)
  const decryptedLead = decryptSensitiveFields(lead);

  return {
    id: decryptedLead.idNasabah,
    profil: {
      nama: decryptedLead.nama,
      nomorTelepon: decryptedLead.nomorTelepon,
      pekerjaan: decryptedLead.pekerjaan,
      domisili: decryptedLead.domisili,
      umur: decryptedLead.umur,
      gaji: parseFloat(decryptedLead.gaji || 0),
      statusPernikahan: decryptedLead.statusPernikahan?.namaStatus || '-',
      jenisKelamin: decryptedLead.jenisKelaminRel?.namaJenisKelamin || '-',
    },
    metrik: {
      skorAI: parseFloat(decryptedLead.skorPrediksi || 0),
      totalTelepon: decryptedLead.historiTelepon.length,
    },
    history: {
      deposito: decryptedLead.deposito.map(d => ({
        id: d.idDeposito,
        status: d.statusDeposito,
        jenis: d.jenisDeposito,
        tanggal: d.createdAt,
      })),
      telepon: decryptedLead.historiTelepon.map(h => ({
        id: h.idHistori,
        tanggal: h.tanggalTelepon,
        durasi: h.lamaTelepon,
        hasil: h.hasilTelepon,
        catatan: h.catatan,
      })),
    },
  };
}

async function getMyAssignments(user, query) {
  const salesData = await prisma.sales.findFirst({ where: { idUser: user.id } });

  if (!salesData) {
    throw new Error('Sales profile not found');
  }

  const { page, limit, search } = query;

  const { count, assignments } = await salesOpRepo.getAssignedLeads(
    salesData.idSales,
    { page: parseInt(page), limit: parseInt(limit), search },
  );

  const mappedData = assignments.map((item) => {
    const nasabah = decryptSensitiveFields(item.nasabah);
    return {
      id: nasabah.idNasabah,
      nama: nasabah.nama,
      pekerjaan: nasabah.pekerjaan || '-',
      nomorTelepon: nasabah.nomorTelepon || '-',
      jenisKelamin: nasabah.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      umur: nasabah.umur,
      statusPernikahan: nasabah.statusPernikahanRef?.namaStatus || 'Unknown',
      assignmentId: item.idAssignment,
      skorPrediksi: nasabah.skorPrediksi,
    };
  });

  return {
    data: mappedData,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

module.exports = {
  getMyDashboard,
  getAllLeads,
  getCallHistory,
  logActivity,
  exportWorkReport,
  updateLeadStatus,
  getLeadDetail,
  getMyAssignments,
};
