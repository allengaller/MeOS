import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { healthRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'health-test-user';

async function cleanup() {
  await prisma.healthRecord.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Health Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'health-test@example.com', password: 'hashed', name: 'Health Test' },
    });
  });

  beforeEach(async () => {
    await prisma.healthRecord.deleteMany({ where: { userId: USER_ID } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(healthRoutes, { prefix: '/api/health' });
    return app;
  }

  it('should create a health record', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/health',
      payload: { type: 'sleep', value: 7.5, unit: 'hours', note: '睡得不错' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().record.value).toBe(7.5);
    expect(response.json().record.userId).toBe(USER_ID);
  });

  it('should reject invalid type', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/health',
      payload: { type: 'heart-rate', value: 60, unit: 'bpm' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should list records filtered by type', async () => {
    await prisma.healthRecord.create({ data: { userId: USER_ID, type: 'sleep', value: 7, unit: 'hours' } });
    await prisma.healthRecord.create({ data: { userId: USER_ID, type: 'weight', value: 65, unit: 'kg' } });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/health?type=sleep' });

    expect(response.statusCode).toBe(200);
    expect(response.json().records).toHaveLength(1);
    expect(response.json().records[0].type).toBe('sleep');
  });

  it('should compute summary aggregates by type', async () => {
    await prisma.healthRecord.create({ data: { userId: USER_ID, type: 'sleep', value: 7, unit: 'hours' } });
    await prisma.healthRecord.create({ data: { userId: USER_ID, type: 'sleep', value: 8, unit: 'hours' } });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/health/summary?days=30' });

    expect(response.statusCode).toBe(200);
    const sleep = response.json().summary.sleep;
    expect(sleep.count).toBe(2);
    expect(sleep.avg).toBe(7.5);
  });

  it('should delete a record', async () => {
    const record = await prisma.healthRecord.create({
      data: { userId: USER_ID, type: 'mood', value: 4, unit: 'score' },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'DELETE', url: `/api/health/${record.id}` });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.healthRecord.findUnique({ where: { id: record.id } });
    expect(deleted).toBeNull();
  });
});
