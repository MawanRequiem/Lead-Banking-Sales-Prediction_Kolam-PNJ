const cron = require('node-cron');
const assignmentService = require('../services/assignment.service');
const logger = require('../config/logger');

function initCronJobs() {
  // Jadwal: Tanggal 1 setiap bulan, jam 01:00 pagi
  // Format: Minute Hour DayMonth Month DayWeek
  cron.schedule('0 1 1 * *', async () => {
    logger.info('Starting scheduled monthly lead distribution...');
    try {
      await assignmentService.distributeLeads();
      logger.info('Scheduled distribution completed successfully');
    } catch (error) {
      logger.error('Scheduled distribution failed', error);
    }
  });

  logger.info('Scheduler initialized');
}

module.exports = {
  initCronJobs,
};
