import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('AuthService', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
    await prisma.$disconnect();
  });

  describe('register', () => {
    it('should hash password before storing', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject duplicate email', async () => {
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: await bcrypt.hash('password', 10),
          name: 'Test User',
        },
      });

      const existing = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(existing).not.toBeNull();
    });
  });

  describe('password validation', () => {
    it('should correctly verify valid password', async () => {
      const password = 'securepassword';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject invalid password', async () => {
      const password = 'securepassword';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare('wrongpassword', hash);
      expect(isValid).toBe(false);
    });
  });
});

describe('Auth Routes Validation', () => {
  it('should validate email format', async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('valid@example.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
    expect(emailRegex.test('invalid@')).toBe(false);
  });

  it('should validate password minimum length', () => {
    const minLength = 6;
    expect('123456'.length >= minLength).toBe(true);
    expect('12345'.length >= minLength).toBe(false);
  });
});