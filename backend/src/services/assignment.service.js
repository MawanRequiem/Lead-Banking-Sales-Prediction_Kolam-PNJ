const assignmentRepo = require('../repositories/assignment.repository');
const logger = require('../config/logger');
const { BadRequestError } = require('../middlewares/errorHandler.middleware');

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Distribute Leads using Stratified Round-Robin
 */
async function distributeLeads() {
  const salesAgents = await assignmentRepo.getActiveSales();
  const leads = await assignmentRepo.getEligibleLeads();

  if (salesAgents.length === 0) {
    throw new BadRequestError('No active sales agents available');
  }
  if (leads.length === 0) {
    throw new BadRequestError('No eligible leads found');
  }

  // Bucketing berdasarkan Skor AI
  const buckets = {
    platinum: [], // Skor >= 0.8
    gold: [],     // Skor 0.5 - 0.79
    silver: [],   // Skor < 0.5
  };

  leads.forEach((lead) => {
    const score = parseFloat(lead.skorPrediksi) || 0;
    if (score >= 0.8) {
      buckets.platinum.push(lead.idNasabah);
    } else if (score >= 0.5) {
      buckets.gold.push(lead.idNasabah);
    } else {
      buckets.silver.push(lead.idNasabah);
    }
  });

  // Acak urutan dalam bucket agar tidak pola tertentu
  shuffleArray(buckets.platinum);
  shuffleArray(buckets.gold);
  shuffleArray(buckets.silver);

  const newAssignments = [];
  let agentIndex = 0;

  // Fungsi distribusi round-robin
  const distributeBucket = (leadIds) => {
    leadIds.forEach((nasabahId) => {
      const agent = salesAgents[agentIndex];

      newAssignments.push({
        idSales: agent.idSales,
        idNasabah: nasabahId,
        isActive: true,
        tanggalAssignment: new Date(),
      });

      agentIndex = (agentIndex + 1) % salesAgents.length;
    });
  };

  // Distribusi berjenjang: Prioritas tinggi duluan
  distributeBucket(buckets.platinum);
  distributeBucket(buckets.gold);
  distributeBucket(buckets.silver);

  // Commit ke database
  await assignmentRepo.resetAndBulkAssign(newAssignments);

  logger.audit('Leads distributed', {
    totalLeads: leads.length,
    totalAgents: salesAgents.length,
    assigned: newAssignments.length,
  });

  return {
    message: 'Distribution completed successfully',
    stats: {
      total_leads: leads.length,
      total_agents: salesAgents.length,
      distribution: {
        platinum: buckets.platinum.length,
        gold: buckets.gold.length,
        silver: buckets.silver.length,
      },
    },
  };
}

module.exports = {
  distributeLeads,
};
