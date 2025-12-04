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
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  const where = {
    idSales: salesId,
    isActive: true,
    nasabah: {
      deletedAt: null,
      ...(search && {
        OR: [
          { nama: { contains: search, mode: 'insensitive' } },
          { pekerjaan: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
  };

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
    limit = 20,
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

function getCallHistory(filters = {}) {
  const {
    search,
    nasabahId,
    sortBy = 'tanggalTelepon',
    sortOrder = 'desc',
    page = 1, // default is for call-history page but for peeks request should give smaller limits.
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  const where = {};
  if (nasabahId) {
    where.idNasabah = nasabahId;
  }
  if (search) {
    where.OR = [
      { hasilTelepon: { contains: search, mode: 'sensitive' } },
      { catatan: { contains: search, mode: 'insensitive' } },
      { sales:
        { nama: { contains: search, mode: 'insensitive' } },
      },
      { nasabah:
        { nama: { contains: search, mode: 'insensitive' } },
      },
    ];
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

async function getAssignedLeads(salesId, query) {
  const { page = 1, limit = 10, search = '' } = query;
  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  const whereCondition = {
    idSales: salesId,
    isActive: true, // Hanya ambil assignment yang aktif
    nasabah: {
      deletedAt: null,
      nama: {
        contains: search,
        mode: 'insensitive',
      },
    },
  };

  const [count, assignments] = await prisma.$transaction([
    prisma.salesNasabahAssignment.count({ where: whereCondition }),
    prisma.salesNasabahAssignment.findMany({
      where: whereCondition,
      skip,
      take,
      orderBy: { tanggalAssignment: 'desc' },
      include: {
        nasabah: {
          include: {
            statusPernikahan: true,
          },
        },
      },
    }),
  ]);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total: count,
    totalPages: Math.ceil(count / limit),
  };

  return { assignments, pagination };
}

module.exports = {
  getMyLeads,
  getAllLeads,
  getLeadDetail,
  createCallLog,
  getCallHistory,
  updateDepositoStatus,
  getAssignedLeads,
};
