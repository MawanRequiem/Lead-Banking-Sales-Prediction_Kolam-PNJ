const { prisma } = require('../config/prisma');
const logger = require('../config/logger');

/**
 * Find users that are either admin or sales (join)
 * Supports basic pagination and isActive filter
 */
async function findUsersWithRoles({ where = {}, take = 50, skip = 0 } = {}) {
  try {
    // Build relation filter: users that have admin or sales relation
    const relationFilter = {
      OR: [
        { admin: { some: {} } },
        { sales: { some: {} } },
      ],
    };

    // Merge provided where with relationFilter
    const finalWhere = Object.keys(where).length ? { AND: [relationFilter, where] } : relationFilter;

    const users = await prisma.user.findMany({
      where: finalWhere,
      include: {
        admin: { include: { user: true } },
        sales: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    return users;
  } catch (error) {
    logger.error('Error finding users with roles:', error);
    throw error;
  }
}

async function countUsersWithRoles(where = {}) {
  try {
    const relationFilter = {
      OR: [
        { admin: { some: {} } },
        { sales: { some: {} } },
      ],
    };

    const finalWhere = Object.keys(where).length ? { AND: [relationFilter, where] } : relationFilter;

    const total = await prisma.user.count({ where: finalWhere });
    return total;
  } catch (error) {
    logger.error('Error counting users with roles:', error);
    throw error;
  }
}

module.exports = {
  findUsersWithRoles,
  countUsersWithRoles,
};
