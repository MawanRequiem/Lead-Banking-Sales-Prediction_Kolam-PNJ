const { prisma } = require('../config/prisma');

function getActiveSales() {
  return prisma.sales.findMany({
    where: {
      user: {
        isActive: true,
        deletedAt: null,
      },
    },
    select: { idSales: true, nama: true },
  });
}

function getEligibleLeads() {
  // Ambil nasabah yang belum 'Closed/Won' (Status Deposito != AKTIF)
  // dan belum dihapus
  return prisma.nasabah.findMany({
    where: {
      deletedAt: null,
      deposito: {
        none: {
          statusDeposito: 'AKTIF',
        },
      },
    },
    select: {
      idNasabah: true,
      skorPrediksi: true,
    },
  });
}

function resetAndBulkAssign(newAssignments) {
  return prisma.$transaction(async (tx) => {
    // 1. Non-aktifkan semua assignment yang sedang aktif (Reset)
    await tx.salesNasabahAssignment.updateMany({
      where: { isActive: true },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    // 2. Insert assignment baru secara bulk (efisien untuk ribuan data)
    // createMany jauh lebih cepat daripada loop create satu per satu
    return tx.salesNasabahAssignment.createMany({
      data: newAssignments,
    });
  });
}

module.exports = {
  getActiveSales,
  getEligibleLeads,
  resetAndBulkAssign,
};
