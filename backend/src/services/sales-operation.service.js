const salesOpRepo = require('../repositories/sales-operation.repository');
const salesRepo = require('../repositories/sales.repository');
const { NotFoundError } = require('../middlewares/errorHandler.middleware');
const { Parser } = require('json2csv');

/**
 * Dashboard helper: recent call history (default 10)
 */
async function getCallHistoryForDash({ limit = 10, salesId, search } = {}) {
  // Use getCallLog (perubahan dari getCallHistory) — cukup berdasarkan idSales
  if (!salesId) {
    console.warn('No valid salesId found');
    return [];
  }

  const res = await salesOpRepo.getCallHistoryBySales({ search, page: 1, limit, salesId });

  if (!res || !res.data) {return [];}

  return res.data.map(h => ({
    id: h.idHistori || h.id || null,
    namaNasabah: h.nasabah?.nama || h.idNasabah?.nama || '-',
    tanggal: h.tanggalTelepon || h.createdAt || null,
    durasi: h.lamaTelepon || h.durasi || null,
    hasil: h.hasilTelepon || h.hasil || null,
    catatan: h.catatan || null,
  }));
}

/**
 * Dashboard helper: assignment suggestions (default 5)
 */
async function getAssignmentsForDash(salesId, limit = 5) {
  // Accept either user object (from req.user) or direct salesId
  if (!salesId) {
    console.warn('No valid salesId found');
    return [];
  }
  const salesData = await salesOpRepo.getMyLeads(salesId, { page: 1, limit, search: '' });

  return salesData.data.map(item => ({
    id: item.nasabah.idNasabah,
    nama: item.nasabah.nama,
    nomorTelepon: item.nasabah.nomorTelepon,
    pekerjaan: item.nasabah.pekerjaan || '-',
    domisili: item.nasabah.domisili || '-',
    jenisKelamin: item.nasabah.jenisKelaminRel?.namaJenisKelamin || '-',
    statusPernikahan: item.nasabah.statusPernikahan?.namaStatus || '-',
    skor: parseFloat(item.nasabah.skorPrediksi || 0),
    statusTerakhir: item.nasabah.deposito[0]?.statusDeposito || 'PROSPEK',
    lastCall: item.nasabah.historiTelepon[0]?.createdAt || null,
    needFollowUp: item.nasabah.historiTelepon[0]?.nextFollowupDate
      ? new Date(item.nasabah.historiTelepon[0].nextFollowupDate) <= new Date()
      : false,
  }));
}

/**
 * Dashboard helper: deposit conversion aggregates (date_trunc)
 */
async function getCallsConversionForDash({ startDate, endDate, interval = 'month', successSet = 'TERTARIK', salesId } = {}) {
  // Delegate DB query to repository layer: conversion = successful calls in histori_telepon
  const defaultSuccessSet = 'TERTARIK';
  const finalsuccessSet = (typeof successSet === 'string' && successSet.trim().length > 0)
    ? successSet.trim().toUpperCase()
    : defaultSuccessSet.toUpperCase();

  if (!salesId) {
    console.warn('No valid salesId found');
    return [];
  }

  const rows = await salesOpRepo.getCallConversionByBucket(
    { startDate, endDate, interval, successSet: finalsuccessSet, salesId },
  );

  // map hasil agar konsisten dan memungkinkan penggunaan async
  return rows.map(r => ({
    bucket: r.bucket ?? r.interval ?? r.tanggal ?? r.date ?? null,
    count: Number(r.count ?? r.jumlah ?? 0),
    totalPanggilan: Number(r.totalPanggilan ?? r.total ?? 0),
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
    isAssigned: item.assignments.length > 0 ? true : false,
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

  //This just deactivate assignment between that sales and nasabah
  await salesOpRepo.updateSalesAssignmentActiveStatus(lead.idNasabah, salesId, false);

  return salesOpRepo.createCallLog({
    ...data,
    idNasabah: data.nasabahId,
    idSales: salesId,
  });
}

/**
 * Export Call History CSV for a sales user with optional date range and limit
 */
async function exportCallHistory(salesId, { startDate, endDate, limit = 1000 } = {}) {
  if (!salesId) {
    throw new NotFoundError('No salesId provided');
  }

  // enforce sensible maximum to avoid memory OOM
  const maxLimit = 5000;
  let finalLimit = limit === 'all' ? maxLimit : Number(limit) || 1000;
  if (finalLimit > maxLimit) {finalLimit = maxLimit;}

  const res = await salesOpRepo.getCallHistoryBySales({ page: 1, limit: finalLimit, salesId, startDate, endDate });

  const rows = res && res.data ? res.data : [];
  if (!rows || rows.length === 0) {
    throw new NotFoundError('No call history to export');
  }

  const reportData = rows.map((r) => ({
    'Histori Panggilan': r.idHistori || r.id || '',
    'Tanggal': r.tanggalTelepon || r.createdAt || '',
    'Nama Nasabah': r.nasabah?.nama || '',
    'Nomor Telepon': r.nasabah?.nomorTelepon || '',
    'Durasi': r.lamaTelepon || r.durasi || '-',
    'Hasil': r.hasilTelepon || r.hasil || '-',
    'Catatan': r.catatan || '-',
  }));

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

  const result = await salesOpRepo.getMyLeads(salesData.idSales, query);

  const mappedData = result.data.map((item) => ({
    id: item.nasabah.idNasabah,
    nama: item.nasabah.nama,
    pekerjaan: item.nasabah.pekerjaan || '-',
    nomorTelepon: item.nasabah.nomorTelepon || '-',
    jenisKelamin: item.nasabah.jenisKelaminRel?.namaJenisKelamin,
    umur: item.nasabah.umur,
    domisili: item.nasabah.domisili || '-',
    statusPernikahan: item.nasabah.statusPernikahan?.namaStatus || 'Unknown',
    assignmentId: item.idAssignment,
    skor: item.nasabah.skorPrediksi,
    lastCall: item.nasabah.historiTelepon[0]?.createdAt || null,
    needFollowUp: item.nasabah.historiTelepon[0]?.nextFollowupDate
      ? new Date(item.nasabah.historiTelepon[0].nextFollowupDate) <= new Date()
      : false,
  }));

  return {
    assignments: mappedData,
    pagination: result.meta,
  };
}

async function getAllLeadsOverview(query) {
  const { current, last } = await salesOpRepo.getAllLeadsOverview(query);

  const countDepositoMembers = (list) =>
    list.filter((n) => n.deposito && n.deposito.length > 0).length;

  const countActiveDeposits = (list) =>
    list.filter((n) => n.deposito?.some((d) => String(d.statusDeposito).toUpperCase() === 'AKTIF')).length;

  const calcChange = (current, last) => {
    const diff = current - last;
    let direction = 'neutral';

    if (diff > 0) {direction = 'up';}
    else if (diff < 0) {direction = 'down';}

    return {
      value: Math.abs(diff),
      direction,
    };
  };

  const totalCurrent = current.length;
  const totalLast = last.length;
  const totalChange = calcChange(totalCurrent, totalLast);

  const depositoMembersCurrent = countDepositoMembers(current);
  const depositoMembersLast = countDepositoMembers(last);
  const depositoMembersChange = calcChange(
    depositoMembersCurrent,
    depositoMembersLast,
  );

  const activeDepositsCurrent = countActiveDeposits(current);
  const activeDepositsLast = countActiveDeposits(last);
  const activeDepositsChange = calcChange(
    activeDepositsCurrent,
    activeDepositsLast,
  );

  return {
    totalCustomers: totalCurrent,
    totalChange: totalChange.value,
    totalDirection: totalChange.direction,

    depositoMembers: depositoMembersCurrent,
    depositoMembersChange: depositoMembersChange.value,
    depositoMembersDirection: depositoMembersChange.direction,

    depositoActive: activeDepositsCurrent,
    depositoActiveChange: activeDepositsChange.value,
    depositoActiveDirection: activeDepositsChange.direction,
  };
}

async function getMyLeadsOverview(salesId, query) {
  const { current, last } = await salesOpRepo.getMyLeadsOverview(salesId, query);

  // current/last are arrays of assignments; each item has `nasabah` with `deposito`
  const currentList = Array.isArray(current) ? current : [];
  const lastList = Array.isArray(last) ? last : [];

  const countDepositoMembers = (list) =>
    list.filter((a) => a?.nasabah?.deposito && a.nasabah.deposito.length > 0).length;

  const countActiveDeposits = (list) =>
    list.filter((a) => a?.nasabah?.deposito?.some((d) => String(d.statusDeposito).toUpperCase() === 'AKTIF')).length;

  const calcChange = (currentCount, lastCount) => {
    const diff = currentCount - lastCount;
    let direction = 'neutral';
    let percentage = 0;

    if (lastCount > 0) {
      percentage = (diff / lastCount) * 100;
    } else if (currentCount > 0 && lastCount === 0) {
      percentage = 100;
    }

    if (diff > 0) { direction = 'up'; }
    else if (diff < 0) { direction = 'down'; }

    return {
      value: Math.abs(diff),
      direction,
      percentage: Math.round(Math.abs(percentage)),
    };
  };

  const totalCurrent = currentList.length;
  const totalLast = lastList.length;
  const totalChange = calcChange(totalCurrent, totalLast);

  const depositoMembersCurrent = countDepositoMembers(currentList);
  const depositoMembersLast = countDepositoMembers(lastList);
  const depositoMembersChange = calcChange(
    depositoMembersCurrent,
    depositoMembersLast,
  );

  const activeDepositsCurrent = countActiveDeposits(currentList);
  const activeDepositsLast = countActiveDeposits(lastList);
  const activeDepositsChange = calcChange(
    activeDepositsCurrent,
    activeDepositsLast,
  );

  return {
    totalCustomers: totalCurrent,
    totalChange: totalChange.value,
    totalDirection: totalChange.direction,

    depositoMembers: depositoMembersCurrent,
    depositoMembersChange: depositoMembersChange.value,
    depositoMembersDirection: depositoMembersChange.direction,

    depositoActive: activeDepositsCurrent,
    depositoActiveChange: activeDepositsChange.value,
    depositoActiveDirection: activeDepositsChange.direction,
  };
}

module.exports = {
  getAllLeads,
  getCallHistory,
  logActivity,
  exportCallHistory,
  updateLeadStatus,
  getLeadDetail,
  getMyAssignments,
  getAllLeadsOverview,
  getMyLeadsOverview,
  // Dashboard helpers
  getCallHistoryForDash,
  getAssignmentsForDash,
  getCallsConversionForDash,
  getDepositTypesForDash,
};


