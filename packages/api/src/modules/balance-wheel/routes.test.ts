import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { balanceWheelRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'bw-test-user';
const DOMAIN_ID = 'bw-test-domain-1';

async function cleanup() {
  await prisma.balanceWheelScore.deleteMany({ where: { userId: USER_ID } });
  await prisma.domain.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Balance Wheel Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'bw-test@example.com', password: 'hashed', name: 'BW Test' },
    });
    await prisma.domain.create({
      data: { id: DOMAIN_ID, userId: USER_ID, identifier: 'career', name: '职业', order: 0 },
    });
  });

  beforeEach(async () => {
    await prisma.balanceWheelScore.deleteMany({ where: { userId: USER_ID } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(balanceWheelRoutes, { prefix: '/api/balance-wheel' });
    return app;
  }

  it('should submit scores', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/balance-wheel/scores',
      payload: { scores: [{ domainId: DOMAIN_ID, score: 8, note: '还不错' }] },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().scores).toHaveLength(1);
    expect(response.json().scores[0].score).toBe(8);
  });

  it('should reject out-of-range score', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/balance-wheel/scores',
      payload: { scores: [{ domainId: DOMAIN_ID, score: 15 }] },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should get score history', async () => {
    await prisma.balanceWheelScore.create({
      data: { userId: USER_ID, domainId: DOMAIN_ID, score: 7 },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/balance-wheel/history' });

    expect(response.statusCode).toBe(200);
    expect(response.json().scores).toHaveLength(1);
    expect(response.json().scores[0].domain).toBeDefined();
  });

  it('should get a score by id', async () => {
    const score = await prisma.balanceWheelScore.create({
      data: { userId: USER_ID, domainId: DOMAIN_ID, score: 6 },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: `/api/balance-wheel/scores/${score.id}` });

    expect(response.statusCode).toBe(200);
    expect(response.json().score.id).toBe(score.id);
  });

  it('should update a score', async () => {
    const score = await prisma.balanceWheelScore.create({
      data: { userId: USER_ID, domainId: DOMAIN_ID, score: 5 },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/balance-wheel/scores/${score.id}`,
      payload: { scores: [{ domainId: DOMAIN_ID, score: 9, note: '进步了' }] },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().score.score).toBe(9);
  });

  it('should delete a score', async () => {
    const score = await prisma.balanceWheelScore.create({
      data: { userId: USER_ID, domainId: DOMAIN_ID, score: 5 },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'DELETE', url: `/api/balance-wheel/scores/${score.id}` });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.balanceWheelScore.findUnique({ where: { id: score.id } });
    expect(deleted).toBeNull();
  });
});
