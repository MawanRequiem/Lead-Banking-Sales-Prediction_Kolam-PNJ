const request = require('supertest');
const { prisma } = require('../../src/config/prisma');
const { hashPassword } = require('../../src/utils/password.util');
const { generateToken } = require('../../src/utils/token.util');

// Mock app instead of importing to avoid server startup
let app;

beforeAll(async () => {
  // Create express app manually for testing
  const express = require('express');
  app = express();

  app.use(express.json());

  // Import routes
  const adminRoutes = require('../../src/routes/admin.routes');
  app.use('/api/admin', adminRoutes);

  // Add error handler
  app.use((err, req, res, next) => {
    console.error('Test error:', err);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });
});

describe('Admin Routes - Sales Management', () => {
  let adminToken;
  let adminId;
  let salesId;

  beforeAll(async () => {
    // Clean up first
    await prisma.sales.deleteMany({
      where: { email: { contains: 'test' } },
    });
    await prisma.admin.deleteMany({
      where: { email: 'admin.test@example.com' },
    });

    // Create admin for testing
    const passwordHash = await hashPassword('Admin123!');
    const admin = await prisma.admin.create({
      data: {
        email: 'admin.test@example.com',
        passwordHash,
        isActive: true,
      },
    });

    adminId = admin.idAdmin;
    adminToken = generateToken({ id: adminId, role: 'admin' });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.sales.deleteMany({
      where: { email: { contains: 'test' } },
    });
    await prisma.admin.deleteMany({
      where: { email: 'admin.test@example.com' },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/admin/sales - Create Sales', () => {
    it('should create sales with valid admin token', async () => {
      const response = await request(app)
        .post('/api/admin/sales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Test Sales',
          email: 'sales.test@example.com',
          password: 'SalesPass123!',
          nomorTelepon: '081234567890',
          domisili: 'Jakarta',
        });

      console.log('Create sales response:', response.body);
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('idSales');
      expect(response.body.data.email).toBe('sales.test@example.com');
      expect(response.body.data).not.toHaveProperty('passwordHash');

      salesId = response.body.data.idSales;
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/admin/sales')
        .send({
          nama: 'Test Sales',
          email: 'another@example.com',
          password: 'SalesPass123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/admin/sales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Duplicate Sales',
          email: 'sales.test@example.com',
          password: 'SalesPass123!',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already registered');
    });

    it('should return 422 for invalid data', async () => {
      const response = await request(app)
        .post('/api/admin/sales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nama: 'Invalid Sales',
          email: 'invalid-email',
          password: '123',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/admin/sales/:id/reset-password - Reset Password', () => {
    it('should return 422 for weak password (validation error)', async () => {
      // Skip if salesId not created
      if (!salesId) {
        console.log('Skipping test - salesId not available');
        return;
      }

      const response = await request(app)
        .post(`/api/admin/sales/${salesId}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newPassword: '123',
        });

      // Should be 422 for validation error, not 400
      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  // Add more tests as needed, but fix expectations
});
