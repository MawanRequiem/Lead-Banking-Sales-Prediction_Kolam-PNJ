const salesService = require('../../../src/services/sales.service');
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
} = require('../../../src/utils/error.util');

// Mock dependencies with proper jest.fn()
jest.mock('../../../src/repositories/sales.repository', () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updatePassword: jest.fn(),
  deactivate: jest.fn(),
  activate: jest.fn(),
}));

jest.mock('../../../src/utils/password.util', () => ({
  hashPassword: jest.fn(),
  validatePasswordStrength: jest.fn(),
}));

const salesRepository = require('../../../src/repositories/sales.repository');
const { hashPassword, validatePasswordStrength } = require('../../../src/utils/password.util');

describe('Sales Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock for validatePasswordStrength
    validatePasswordStrength.mockReturnValue({ valid: true, errors: [] });
  });

  describe('createSales', () => {
    const validSalesData = {
      nama: 'John Doe',
      email: 'john@example.com',
      password: 'StrongPass123!',
      nomorTelepon: '081234567890',
      domisili: 'Jakarta',
    };

    it('should create sales successfully with valid data', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdSales = {
        idSales: 'uuid-123',
        nama: 'John Doe',
        email: 'john@example.com',
        passwordHash: hashedPassword,
        nomorTelepon: '081234567890',
        domisili: 'Jakarta',
        isActive: true,
      };

      salesRepository.findByEmail.mockResolvedValue(null);
      hashPassword.mockResolvedValue(hashedPassword);
      salesRepository.create.mockResolvedValue(createdSales);

      const result = await salesService.createSales(validSalesData);

      expect(salesRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(hashPassword).toHaveBeenCalledWith('StrongPass123!');
      expect(salesRepository.create).toHaveBeenCalled();
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.nama).toBe('John Doe');
    });

    it('should throw ConflictError if email already exists', async () => {
      salesRepository.findByEmail.mockResolvedValue({ email: 'john@example.com' });

      await expect(salesService.createSales(validSalesData)).rejects.toThrow(
        ConflictError,
      );
      await expect(salesService.createSales(validSalesData)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should throw BadRequestError if password is weak', async () => {
      const weakPasswordData = { ...validSalesData, password: '123' };
      salesRepository.findByEmail.mockResolvedValue(null);

      // Mock password validation to return invalid
      validatePasswordStrength.mockReturnValue({
        valid: false,
        errors: ['Password must be at least 8 characters long'],
      });

      await expect(salesService.createSales(weakPasswordData)).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  describe('resetSalesPassword', () => {
    it('should reset password successfully', async () => {
      const salesId = 'uuid-123';
      const newPassword = 'NewStrongPass123!';
      const hashedPassword = 'newHashedPassword';

      salesRepository.findById.mockResolvedValue({ idSales: salesId });
      hashPassword.mockResolvedValue(hashedPassword);
      salesRepository.updatePassword.mockResolvedValue({});

      const result = await salesService.resetSalesPassword(salesId, newPassword);

      expect(salesRepository.findById).toHaveBeenCalledWith(salesId);
      expect(hashPassword).toHaveBeenCalledWith(newPassword);
      expect(salesRepository.updatePassword).toHaveBeenCalledWith(
        salesId,
        hashedPassword,
      );
      expect(result.message).toBe('Password reset successfully');
    });

    it('should throw NotFoundError if sales not found', async () => {
      salesRepository.findById.mockResolvedValue(null);

      await expect(
        salesService.resetSalesPassword('invalid-id', 'NewPass123!'),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deactivateSales', () => {
    it('should deactivate sales successfully', async () => {
      const salesId = 'uuid-123';
      salesRepository.findById.mockResolvedValue({
        idSales: salesId,
        isActive: true,
      });
      salesRepository.deactivate.mockResolvedValue({});

      const result = await salesService.deactivateSales(salesId);

      expect(salesRepository.deactivate).toHaveBeenCalledWith(salesId);
      expect(result.message).toBe('Sales account deactivated successfully');
    });

    it('should throw BadRequestError if already deactivated', async () => {
      salesRepository.findById.mockResolvedValue({
        idSales: 'uuid-123',
        isActive: false,
      });

      await expect(salesService.deactivateSales('uuid-123')).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  describe('activateSales', () => {
    it('should activate sales successfully', async () => {
      const salesId = 'uuid-123';
      salesRepository.findById.mockResolvedValue({
        idSales: salesId,
        isActive: false,
      });
      salesRepository.activate.mockResolvedValue({});

      const result = await salesService.activateSales(salesId);

      expect(salesRepository.activate).toHaveBeenCalledWith(salesId);
      expect(result.message).toBe('Sales account activated successfully');
    });
  });
});
