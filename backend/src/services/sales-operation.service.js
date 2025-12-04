const salesOpRepo = require('../repositories/sales-operation.repository');
const salesRepo = require('../repositories/sales.repository');
const { NotFoundError } = require('../middlewares/errorHandler.middleware');
const { Parser } = require('json2csv');

/**
 * Dashboard helper: recent call history (default 10)
 */
async function getCallHistoryForDash({ limit = 10, user, search } = {}) {
  // Use getCallLog (perubahan dari getCallHistory) — cukup berdasarkan idSales

  let salesId;
  if (typeof user === 'string') {
    salesId = user;
  } else if (user && typeof user === 'object') {
    salesId = user.id || user.salesId || user.userId;
  }

  if (!salesId) {
    console.warn('No valid salesId found');
    return [];
  }

  const res = await salesOpRepo.getCallHistoryBySales({ search, page: 1, limit, salesId });

  if (!res || !res.data) {return [];}

  return res.data.map(h => ({
    id: h.idHistori || h.id || null,
    namaNasabah: h.idNasabah?.nama || h.namaNasabah || '-',
    tanggal: h.tanggalTelepon || h.createdAt || null,
    durasi: h.lamaTelepon || h.durasi || null,
    hasil: h.hasilTelepon || h.hasil || null,
    catatan: h.catatan || null,
  }));
}

/**
 * Dashboard helper: assignment suggestions (default 5)
 */
async function getAssignmentsForDash(user, limit = 5) {
  // Accept either user object (from req.user) or direct salesId

  let salesId;
  if (typeof user === 'string') {
    salesId = user;
  } else if (user && typeof user === 'object') {
    salesId = user. id || user.salesId || user.userId;
  }

  if (!salesId) {
    console.warn('No valid salesId found');
    return [];
  }
  const salesData = await salesOpRepo.getMyLeads(salesId, { page: 1, limit, search: '' });

  if (! salesData || ! salesData.data || ! Array.isArray(salesData.data)) {
    return [];
  }

  return salesData.data.map(item => ({
    id: item.nasabah.idNasabah,
    nama: item.nasabah.nama,
    nomorTelepon: item.nasabah.nomorTelepon,
    lastCall: item.historiTelepon.historiTelepon[0]?.createdAt || null,
    assignmentId: item.idAssignment,
    skorPrediksi: item.nasabah.skorPrediksi,
  }));
}

/**
 * Dashboard helper: deposit conversion aggregates (date_trunc)
 */
async function getDepositConversionForDash({ startDate, endDate, interval = 'month', status = 'AKTIF', user } = {}) {
  // Delegate DB query to repository layer: conversion = successful calls in histori_telepon
  const defaultSuccessSet = 'TERKONEKSI';
  const successSet = (typeof status === 'string' && status.trim().length > 0)
    ? status.trim().toUpperCase()
    : defaultSuccessSet.toUpperCase();

  let salesId;
  if (typeof user === 'string') {
    salesId = user;
  } else if (user && typeof user === 'object') {
    salesId = user. id || user.salesId || user.userId;
  }

  if (!salesId) {
    console.warn('No valid salesId found');
    return [];
  }

  const rows = await salesOpRepo.getCallConversionByBucket({ startDate, endDate, interval, successSet, salesId });
  if (!rows) {return [];}

  // map hasil agar konsisten dan memungkinkan penggunaan async
  return rows.map(r => ({
    bucket: r.bucket ?? r.interval ?? r.tanggal ?? r.date ?? null,
    count: Number(r.count ?? r.jumlah ?? 0),
    totalDeposits: Number(r.totalDeposits ?? r.total ?? 0),
    value: r.value !== undefined ? Number(r.value) : undefined,
    raw: r, // simpan raw jika butuh referensi asli
  }));
}

/**
 * Dashboard helper: deposit types counts within range
 */
async function getDepositTypesForDash({ startDate, endDate, status } = {}) {
  // Delegate deposit-type aggregation to repository
  const rows = await salesOpRepo.getDepositTypesAggregate({ startDate, endDate, status });

  if (!rows || rows.length === 0) {
    return [];
  }

  const mapped = rows.map((t) => ({
    type: t. jenisDeposito,
    count: Number(t.count || 0),
    percent: Number(t.percent || 0),
    raw: t,
  }));

  return mapped;
}

/**
 * Get List Nasabah
 * Returns paginated data + metadata
 */
async function getAllLeads(query) {
  const result = await salesOpRepo.getAllLeads(query);

  const transformedData = result.data.map(item => ({
    id: item.idNasabah,
    nama: item.nama,
    nomorTelepon: item.nomorTelepon,
    umur: item.umur,
    pekerjaan: item.pekerjaan || '-',
    domisili: item.domisili || '-',
    jenisKelamin: item.jenisKelaminRel?.namaJenisKelamin || '-',
    statusPernikahan: item.statusPernikahan?.namaStatus || '-',
    skor: parseFloat(item.skorPrediksi || 0),
    statusTerakhir: item.deposito[0]?.statusDeposito || 'PROSPEK',
    lastCall: item.historiTelepon[0]?.createdAt || null,
    needFollowUp: item.historiTelepon[0]?.nextFollowupDate
      ? new Date(item.historiTelepon[0].nextFollowupDate) <= new Date()
      : false,
  }));

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
  const lead = await salesOpRepo.getLeadDetail(data.nasabahId);
  if (!lead) {
    throw new NotFoundError('Nasabah not found');
  }

  return salesOpRepo.createCallLog({
    ...data,
    idNasabah: data.nasabahId, // why are we mangling this?
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
  const lead = await salesOpRepo.getLeadDetail( data.nasabahId);
  if (!lead) {
    throw new NotFoundError('Nasabah not found');
  }

  return salesOpRepo.updateDepositoStatus(salesId, data.nasabahId, data.status);
}

/**
 * Get Lead Detail
 * Termasuk history telepon & status deposito
 */
async function getLeadDetail(nasabahId) {
  const lead = await salesOpRepo.getLeadDetail(nasabahId);

  if (!lead) {
    throw new NotFoundError('Nasabah not found');
  }

  // Formatting response agar lebih bersih

  return {
    id: lead.idNasabah,
    profil: {
      nama: lead.nama,
      nomorTelepon: lead.nomorTelepon,
      pekerjaan: lead.pekerjaan,
      domisili: lead.domisili,
      umur: lead.umur,
      gaji: parseFloat(lead.gaji || 0),
      statusPernikahan: lead.statusPernikahan?.namaStatus || '-',
      jenisKelamin: lead.jenisKelaminRel?.namaJenisKelamin || '-',
    },
    metrik: {
      skorAI: parseFloat(lead.skorPrediksi || 0),
      totalTelepon: lead.historiTelepon.length,
    },
    history: {
      deposito: lead.deposito.map(d => ({
        id: d.idDeposito,
        status: d.statusDeposito,
        jenis: d.jenisDeposito,
        tanggal: d.createdAt,
      })),
      telepon: lead.historiTelepon.map(h => ({
        id: h.idHistori,
        tanggal: h.tanggalTelepon,
        durasi: h.lamaTelepon,
        hasil: h.hasilTelepon,
        catatan: h.catatan,
      })),
    },
  };
}

async function getMyAssignments(userId, query) {
  const salesData = await salesRepo.findByUserId(userId);

  if (!salesData) {
    throw new NotFoundError('Sales profile not found');
  }

  const { assignments, pagination } = await salesOpRepo.getAssignedLeads(salesData.idSales, query);

  const mappedData = assignments.map((item) => ({
    id: item.nasabah.idNasabah,
    nama: item.nasabah.nama,
    pekerjaan: item.nasabah.pekerjaan || '-',
    nomorTelepon: item.nasabah.nomorTelepon || '-',
    jenisKelamin: item.nasabah.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    umur: item.nasabah.umur,
    domisili: item.nasabah.domisili || '-',
    statusPernikahan: item.nasabah.statusPernikahan?.namaStatus || 'Unknown',
    assignmentId: item.idAssignment,
    skorPrediksi: item.nasabah.skorPrediksi,
  }));

  return {
    assignments: mappedData,
    pagination,
  };
}

module.exports = {
  getAllLeads,
  getCallHistory,
  logActivity,
  exportWorkReport,
  updateLeadStatus,
  getLeadDetail,
  getMyAssignments,
  // Dashboard helpers
  getCallHistoryForDash,
  getAssignmentsForDash,
  getDepositConversionForDash,
  getDepositTypesForDash,
};


