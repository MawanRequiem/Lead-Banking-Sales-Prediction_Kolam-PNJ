const { prisma } = require('../config/prisma');

/**
 * Get Assigned Leads for a specific Sales (Now with Pagination!)
 */
function getMyLeads(salesId, filters = {}) {
  // 1. Ambil parameter pagination (Default: Page 1, Limit 20)
  const {
    search,
    sortBy = 'skorPrediksi',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
    grade,
  } = filters;

  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  let actualSalesId = salesId;
  if (typeof salesId === 'object' && salesId !== null) {
    actualSalesId = salesId.id || salesId.salesId || salesId.userId;
    console.log('Extracted actualSalesId:', actualSalesId);
  }

  if (!actualSalesId || typeof actualSalesId !== 'string') {
    throw new Error('Valid salesId string is required');
  }

  const where = {
    idSales: actualSalesId,
    isActive: true,
    nasabah: {
      is: {
        deletedAt: null,
        ...(search && {
          OR: [
            { nama: { contains: search, mode: 'insensitive' } },
            { pekerjaan: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
    },
  };

  if (grade) {
    let skorCondition;
    if (grade === 'A') {skorCondition = { gte: 0.75 };}
    if (grade === 'B') {skorCondition = { gte: 0.5, lt: 0.75 };}
    if (grade === 'C') {skorCondition = { lt: 0.5 };}

    where.nasabah.is = {
      ...where.nasabah.is,
      skorPrediksi: skorCondition,
    };
  }

  // 2. Jalankan Query Utama (Data) dan Count (Total Data) secara paralel
  return Promise.all([
    // Query 1: Ambil Data
    prisma.salesNasabahAssignment.findMany({
      where,
      skip,
      take,
      include: {
        nasabah: {
          include: {
            jenisKelaminRel: true,
            statusPernikahan: true,
            deposito: {
              orderBy: { createdAt: 'desc' },
              take: 1, // Optimization: Cuma ambil 1 status terakhir
            },
            historiTelepon: {
              orderBy: { createdAt: 'desc' },
              take: 1, // Optimization: Cuma ambil 1 history terakhir
            },
          },
        },
      },
      orderBy: {
        nasabah: {
          [sortBy]: sortOrder,
        },
      },
    }),

    // Query 2: Hitung Total (untuk pagination)
    prisma.salesNasabahAssignment.count({ where }),
  ]).then(([data, total]) => ({
    data,
    meta: {
      total,
      page: parseInt(page),
      lastPage: Math.ceil(total / take),
    },
  }));
}

/**
 * Get all leads.
*/
function getAllLeads(filters = {}) {
  const {
    search,
    sortBy = 'skorPrediksi',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
    grade,
  } = filters;

  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  const where = {
    deletedAt: null,
    ...(search && {
      OR: [
        { nama: { contains: search, mode: 'insensitive' } },
        { pekerjaan: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  switch (grade) {
    case 'A':
      where.skorPrediksi = { gte: 0.75 };
      break;
    case 'B':
      where.skorPrediksi = { gte: 0.5, lt: 0.75 };
      break;
    case 'C':
      where.skorPrediksi = { lt: 0.5 };
      break;
    default:
      // No grade filter
      break;
  }

  return Promise.all([
    prisma.nasabah.findMany({
      where,
      skip,
      take,
      include: {
        jenisKelaminRel: true,
        statusPernikahan: true,
        deposito: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        historiTelepon: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        assignments: {
          where: { isActive: true },
          take: 1,
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    // Count total leads
    prisma.nasabah.count({ where }),
  ]).then(([data, total]) => ({
    data,
    meta: {
      total,
      page: parseInt(page),
      lastPage: Math.ceil(total / take),
    },
  }));
}

/**
 * Get Full Detail of a Lead
 */
function getLeadDetail(nasabahId) {
  return prisma.nasabah.findFirst({
    where: {
      idNasabah: nasabahId,
    },
    include: {
      deposito: { orderBy: { createdAt: 'desc' } },
      historiTelepon: { orderBy: { createdAt: 'desc' } },
      statusPernikahan: true,
      jenisKelaminRel: true,
    },
  });
}

function createCallLog(data) {
  return prisma.$transaction(async (tx) => {
    // 1. Hitung history sebelumnya (untuk urutan)
    const previousCallsCount = await tx.historiTelepon.count({
      where: {
        idNasabah: data.idNasabah,
        idSales: data.idSales,
      },
    });

    // 2. Create Log Telepon (INSERT)
    const log = await tx.historiTelepon.create({
      data: {
        idNasabah: data.idNasabah,
        idSales: data.idSales,
        lamaTelepon: data.lamaTelepon,
        hasilTelepon: data.hasilTelepon,
        catatan: data.catatan,
        nextFollowupDate: data.nextFollowupDate ? new Date(data.nextFollowupDate) : null,
        jumlahTelepon: previousCallsCount + 1,
      },
    });

    // 3. Update Status Deposito (UPDATE - Jika diminta)
    // Frontend harus kirim: { updateStatusDeposito: true, newStatus: 'TERTARIK' }
    if (data.updateStatusDeposito && data.newStatus) {

      // Cari deposito terakhir milik nasabah ini
      const lastDeposito = await tx.deposito.findFirst({
        where: { idNasabah: data.idNasabah },
        orderBy: { createdAt: 'desc' },
      });

      if (lastDeposito) {
        // Update yang sudah ada
        await tx.deposito.update({
          where: { idDeposito: lastDeposito.idDeposito },
          data: { statusDeposito: data.newStatus },
        });
      } else {
        // Atau buat baru jika belum ada (Safety net)
        await tx.deposito.create({
          data: {
            idNasabah: data.idNasabah,
            jenisDeposito: 'General',
            statusDeposito: data.newStatus,
          },
        });
      }
    }

    return log;
  });
}

function getCallHistoryBySales(filter = {}) {
  const {
    search,
    page = 1,
    limit = 10,
    salesId,
    sortBy = 'tanggalTelepon',
    sortOrder = 'desc',
    startDate,
    endDate,
  } = filter;

  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  let actualSalesId = salesId;
  if (typeof salesId === 'object' && salesId !== null) {
    actualSalesId = salesId.id || salesId.salesId || salesId.userId;
    console.log('Extracted actualSalesId:', actualSalesId);
  }

  if (!actualSalesId || typeof actualSalesId !== 'string') {
    throw new Error('Valid salesId string is required');
  }

  const where = {};
  if (actualSalesId) { where.idSales = actualSalesId; }

  // Optional date range filter
  if (startDate || endDate) {
    where.tanggalTelepon = {};
    if (startDate) {where.tanggalTelepon.gte = new Date(startDate);}
    if (endDate) {where.tanggalTelepon.lte = new Date(endDate);}
  }

  if (search) {
    where.OR = [
      { nasabah: { nama: { contains: search, mode: 'insensitive' } } },
      { hasilTelepon: { contains: search, mode: 'insensitive' } },
      { catatan: { contains: search, mode: 'insensitive' } },
    ];
  }

  return Promise.all([
    prisma.historiTelepon.findMany({
      where,
      skip,
      take,
      include: {
        // gunakan select (bersarang) untuk memilih field nasabah dan relasi deposito
        nasabah: {
          select: {
            nama: true,
            nomorTelepon: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.historiTelepon.count({ where }),
  ]).then(([data, total]) => ({
    data,
    meta: {
      total,
      page: parseInt(page),
      lastPage: Math.ceil(total / take),
    },
  }));
}

function getCallHistory(filters = {}) {
  const {
    search,
    nasabahId,
    sortBy = 'tanggalTelepon',
    sortOrder = 'desc',
    page = 1, // default is for call-history page but for peeks request should give smaller limits.
    limit = 10,
    from,
    to,
    grade,
  } = filters;

  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  const where = {};
  if (nasabahId) {
    where.idNasabah = nasabahId;
  }
  if (search) {
    where.OR = [
      { hasilTelepon: { contains: search, mode: 'default' } },
      { catatan: { contains: search, mode: 'insensitive' } },
      { sales:
        { nama: { contains: search, mode: 'insensitive' } },
      },
      { nasabah:
        { nama: { contains: search, mode: 'insensitive' } },
      },
    ];
  }
  // Optional date range filter
  if (from || to) {
    where.tanggalTelepon = {};
    if (from) {where.tanggalTelepon.gte = new Date(from);}
    if (to) {where.tanggalTelepon.lte = new Date(to);}
  }

  if (grade) {
    let skorCondition;
    if (grade === 'A') {skorCondition = { gte: 0.75 };}
    if (grade === 'B') {skorCondition = { gte: 0.5, lt: 0.75 };}
    if (grade === 'C') {skorCondition = { lt: 0.5 };}

    where.nasabah = {
      ...where.nasabah,
      skorPrediksi: skorCondition,
    };
  }

  return Promise.all([
    prisma.historiTelepon.findMany({
      where,
      skip,
      take,
      include: {
        nasabah: {
          select: {
            nama: true,
            nomorTelepon: true,
            skorPrediksi: true,
          },
        },
        sales: {
          select: {
            nama: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    // Count for pagination 'total' meta data.
    prisma.historiTelepon.count({ where }),
  ]).then(([data, total]) => ({
    data,
    meta: {
      total,
      page: parseInt(page),
      lastPage: Math.ceil(total / take),
    },
  }));
}

async function updateDepositoStatus(salesId, nasabahId, newStatus) {
  const assignment = await prisma.salesNasabahAssignment.findFirst({
    where: { idSales: salesId, idNasabah: nasabahId, isActive: true },
  });
  if (!assignment) {
    throw new Error('Unauthorized access to this lead');
  }

  const lastDeposito = await prisma.deposito.findFirst({
    where: { idNasabah: nasabahId },
    orderBy: { createdAt: 'desc' },
  });

  if (lastDeposito) {
    return prisma.deposito.update({
      where: { idDeposito: lastDeposito.idDeposito },
      data: { statusDeposito: newStatus },
    });
  }

  return prisma.deposito.create({
    data: {
      idNasabah: nasabahId,
      jenisDeposito: 'General',
      statusDeposito: newStatus,
    },
  });
}

/**
 * Get conversion (successful calls) aggregated by time bucket from histori_telepon
 * successSet: array of strings (e.g. ['SUKSES','DEPOSIT'])
 */
async function getCallConversionByBucket({ startDate, endDate, interval = 'month', successSet, salesId } = {}) {
  // Use Prisma to fetch matching historiTelepon rows, then aggregate into buckets
  // Supported intervals: 'day' | 'week' | 'month' | 'year'
  const allowed = { day: 'day', week: 'week', month: 'month', year: 'year' };
  const trunc = allowed[interval] || 'month';

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const end = endDate ? new Date(endDate) : new Date();

  let actualSalesId = salesId;
  if (typeof salesId === 'object' && salesId !== null) {
    actualSalesId = salesId.id || salesId.salesId || salesId.userId;
    console.log('Extracted actualSalesId:', actualSalesId);
  }

  if (!actualSalesId || typeof actualSalesId !== 'string') {
    throw new Error('Valid salesId string is required');
  }

  if (!Array.isArray(successSet)) {
    successSet = typeof successSet === 'string' && successSet.trim().length > 0
      ? [successSet.trim().toUpperCase()]
      : ['TERTARIK'];
    console.log('Normalized successSet to array:', successSet);
  }

  const where = {
    tanggalTelepon: { gte: start, lte: end },
    hasilTelepon: { in: successSet },
  };
  if (actualSalesId) {where.idSales = actualSalesId;}
  // Fetch minimal fields required for aggregation
  const rows = await prisma.historiTelepon.findMany({
    where,
    select: {
      tanggalTelepon: true,
      hasilTelepon: true,
    },
    orderBy: { tanggalTelepon: 'asc' },
  });

  const successLookup = new Set((successSet || []).map((s) => String(s).toUpperCase()));

  // Helper: compute bucket start (as ISO string) for a given Date
  function bucketKeyForDate(d) {
    const date = new Date(d);
    switch (trunc) {
      case 'day': {
        const b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return b.toISOString();
      }
      case 'week': {
        const date = new Date(d);
        // 1. Hitung Nomor Minggu (Week of Month)
        const dayOfMonth = date.getDate(); // 1 hingga 31
        const weekNumber = Math.ceil(dayOfMonth / 7);
        // 2. Buat Kunci: Gabungkan Tahun, Bulan, dan Nomor Minggu
        const yearMonth = date.toISOString().substring(0, 7); // Ambil YYYY-MM
        return `${yearMonth}-W${weekNumber}`;
      }
      case 'month': {
        const b = new Date(date.getFullYear(), date.getMonth(), 1);
        return b.toISOString();
      }
      case 'year': {
        const b = new Date(date.getFullYear(), 0, 1);
        return b.toISOString();
      }
      default: {
        const b = new Date(date.getFullYear(), date.getMonth(), 1);
        return b.toISOString();
      }
    }
  }

  const buckets = new Map();

  for (const r of rows) {
    if (!r || !r.tanggalTelepon) {continue;}
    const key = bucketKeyForDate(r.tanggalTelepon);
    const cur = buckets.get(key) || { success_count: 0, total_calls: 0 };
    cur.total_calls += 1;
    if (r.hasilTelepon && successLookup.has(String(r.hasilTelepon).toUpperCase())) {cur.success_count += 1;}
    buckets.set(key, cur);
  }
  function generateAllBuckets(start, end, trunc) {
    const keys = [];
    let currentDate = new Date(start);
    const endTimeMs = end.getTime();
    // Helper untuk mendapatkan TANGGAL AWAL BUCKET (Date Object)
    const getBucketStartDate = (d) => {
      if (trunc === 'month' || trunc === 'year' || trunc === 'day') {
        return new Date(bucketKeyForDate(d, trunc)); // Ini masih ISO valid
      }
      if (trunc === 'week') {
        // Jika W1, ambil tanggal 1. Jika W2, ambil tanggal 8, dst.
        const dayOfMonth = d.getDate();
        const weekNumber = Math.ceil(dayOfMonth / 7);
        // Hitung tanggal awal periode 7 hari ini
        const startDay = (weekNumber - 1) * 7 + 1;
        return new Date(d.getFullYear(), d.getMonth(), startDay, 0, 0, 0);
      }
      return d;
    };
    // 1. Inisialisasi: Atur tanggal awal ke awal bucket yang valid
    currentDate = getBucketStartDate(currentDate);

    while (currentDate.getTime() <= endTimeMs) {
      // 2. Ambil Kunci untuk Output (e.g., '2025-01-W1')
      const key = bucketKeyForDate(currentDate, trunc);
      keys.push(key);

      // 3. Pindah ke Tanggal Berikutnya
      const nextDate = new Date(currentDate);
      switch (trunc) {
        case 'day': nextDate.setDate(nextDate.getDate() + 1); break;
        case 'week': nextDate.setDate(nextDate.getDate() + 7); break; // Pindah 7 hari
        case 'month': nextDate.setMonth(nextDate.getMonth() + 1); break;
        case 'year': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
        default: return keys;
      }
      // 4. Set 'currentDate' ke awal bucket berikutnya
      currentDate = getBucketStartDate(nextDate);
      if (keys.length > 500) {break;} // Safety net
    }
    return keys;
  }

  // 1. Generate semua kunci bucket yang diharapkan
  const allKeys = generateAllBuckets(start, end, trunc);
  // 2. Isi Map dengan data kosong (0) untuk kunci yang hilang
  const zeroFilledBuckets = new Map();

  // Iterasi melalui SEMUA kunci yang diharapkan
  for (const key of allKeys) {
    // Jika Map asli memiliki data, gunakan data tersebut.
    // Jika tidak, gunakan nilai default { success_count: 0, total_calls: 0 }.
    const data = buckets.get(key) || { success_count: 0, total_calls: 0 };
    zeroFilledBuckets.set(key, data);
  }

  // --- ZERO-FILLING LOGIC END ---

  // 3. Konversi map zeroFilledBuckets -> sorted array
  // Gunakan zeroFilledBuckets, bukan buckets Map asli
  const result = Array.from(zeroFilledBuckets.entries())
    .map(([period, { success_count, total_calls }]) => ({
      bucket: period,
      count: success_count,
      total: total_calls,
      raw: { period, success_count, total_calls },
    }))
  // Pastikan pengurutan berdasarkan tanggal (kunci ISO)
    .sort((a, b) => new Date(a.bucket) - new Date(b.bucket));

  return result;
}

/**
 * Get deposit types counts and percent within range
 */
async function getDepositTypesAggregate({ startDate, endDate, status } = {}) {
  const where = {};

  // Filter tanggal
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {where.createdAt.gte = new Date(startDate);}
    if (endDate) {where.createdAt.lte = new Date(endDate);}
  }

  // Default ke status AKTIF
  where.statusDeposito = status || 'AKTIF';

  // Prefer doing aggregation in DB via parameterized raw SQL for performance
  const finalStatus = status || 'AKTIF';
  let rows;

  if (startDate && endDate) {
    rows = await prisma.$queryRaw`
      SELECT "jenis_deposito" AS "jenisDeposito", COUNT(*)::int AS "count"
      FROM "deposito"
      WHERE "status_deposito" = ${finalStatus}
        AND "created_at" >= ${new Date(startDate)}
        AND "created_at" <= ${new Date(endDate)}
      GROUP BY "jenisDeposito"
      ORDER BY "count" DESC`;
  } else if (startDate) {
    rows = await prisma.$queryRaw`
      SELECT "jenis_deposito" AS "jenisDeposito", COUNT(*)::int AS "count"
      FROM "deposito"
      WHERE "status_deposito" = ${finalStatus}
        AND "created_at" >= ${new Date(startDate)}
      GROUP BY "jenisDeposito"
      ORDER BY "count" DESC`;
  } else if (endDate) {
    rows = await prisma.$queryRaw`
      SELECT "jenis_deposito" AS "jenisDeposito", COUNT(*)::int AS "count"
      FROM "deposito"
      WHERE "status_deposito" = ${finalStatus}
        AND "created_at" <= ${new Date(endDate)}
      GROUP BY "jenisDeposito"
      ORDER BY "count" DESC`;
  } else {
    rows = await prisma.$queryRaw`
      SELECT "jenis_deposito" AS "jenisDeposito", COUNT(*)::int AS "count"
      FROM "deposito"
      WHERE "status_deposito" = ${finalStatus}
      GROUP BY "jenisDeposito"
      ORDER BY "count" DESC`;
  }

  const total = rows.reduce((s, r) => s + (Number(r.count) || 0), 0) || 0;

  return rows.map((r) => ({
    jenisDeposito: r.jenisDeposito,
    count: Number(r.count) || 0,
    percent: total > 0 ? +(Number(r.count) / total * 100).toFixed(2) : 0,
  }));
}

async function getAllLeadsOverview({ month, year } = {}) {
  const now = new Date();
  const m = month ? Number(month) : now.getMonth() + 1;
  const y = year ? Number(year) : now.getFullYear();
  const cutoff = new Date(y, m - 1, 0);

  const current = await prisma.nasabah.findMany({
    where: {
      deletedAt: null,
    },
    include: { deposito: true },
  });
  const last = await prisma.nasabah.findMany({
    where: {
      createdAt: { lte: cutoff },
      deletedAt: null,
    },
    include: {
      deposito: true,
    },
  });

  return { current, last };
}

async function getMyLeadsOverview(salesId, { month, year } = {}) {
  const now = new Date();
  const m = month ? Number(month) : now.getMonth() + 1;
  const y = year ? Number(year) : now.getFullYear();
  const cutoff = new Date(y, m - 1, 0);

  const current = await prisma.salesNasabahAssignment.findMany({
    where: {
      idSales: salesId,
      nasabah: {
        deletedAt: null,
      },
    },
    include: {
      nasabah: {
        include: {
          deposito: true,
        },
      },
    },
  });

  const last = await prisma.salesNasabahAssignment.findMany({
    where: {
      idSales: salesId,
      createdAt: { lte: cutoff },
      nasabah: {
        deletedAt: null,
      },
    },
    include: {
      nasabah: {
        include: {
          deposito: true,
        },
      },
    },
  });

  return { current, last };
}

async function updateSalesAssignmentActiveStatus(nasabahId, salesId, isActive) {
  const result = await prisma.salesNasabahAssignment.updateMany({
    where: {
      idNasabah: nasabahId,
      idSales: salesId,
      isActive: true,
    },
    data: {
      isActive,
    },
  });
  return result;
}

module.exports = {
  getMyLeads,
  getAllLeads,
  getLeadDetail,
  createCallLog,
  getCallHistoryBySales,
  getCallConversionByBucket,
  getDepositTypesAggregate,
  getCallHistory,
  updateDepositoStatus,
  getAllLeadsOverview,
  getMyLeadsOverview,
  updateSalesAssignmentActiveStatus,
};
