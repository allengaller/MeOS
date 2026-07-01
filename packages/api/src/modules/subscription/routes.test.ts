import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { subscriptionRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'sub-test-user';

async function cleanup() {
  const subs = await prisma.subscription.findMany({ where: { userId: USER_ID }, select: { id: true } });
  const subIds = subs.map((s) => s.id);
  if (subIds.length > 0) {
    const usages = await prisma.monthlyUsage.findMany({ where: { subscriptionId: { in: subIds } }, select: { id: true } });
    const usageIds = usages.map((u) => u.id);
    if (usageIds.length > 0) {
      await prisma.quotaUsage.deleteMany({ where: { monthlyUsageId: { in: usageIds } } });
    }
    await prisma.quotaDefinition.deleteMany({ where: { subscriptionId: { in: subIds } } });
    await prisma.monthlyUsage.deleteMany({ where: { subscriptionId: { in: subIds } } });
  }
  await prisma.subscription.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Subscription Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'sub-test@example.com', password: 'hashed', name: 'Sub Test' },
    });
  });

  beforeEach(async () => {
    await cleanup();
    await prisma.user.upsert({
      where: { id: USER_ID },
      update: {},
      create: { id: USER_ID, email: 'sub-test@example.com', password: 'hashed', name: 'Sub Test' },
    });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(subscriptionRoutes, { prefix: '/api/subscriptions' });
    return app;
  }

  it('should create a subscription', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/subscriptions',
      payload: {
        name: 'ChatGPT Plus',
        provider: 'OpenAI',
        billingCycle: 'monthly',
        costPerCycle: 20,
        currency: 'USD',
        startDate: '2026-01-01',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().subscription.name).toBe('ChatGPT Plus');
    expect(response.json().subscription.userId).toBe(USER_ID);
  });

  it('should reject invalid billing cycle', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/subscriptions',
      payload: { name: 'X', provider: 'Y', billingCycle: 'daily', costPerCycle: 1, startDate: '2026-01-01' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should list subscriptions with pagination envelope', async () => {
    await prisma.subscription.create({
      data: { userId: USER_ID, name: 'A', provider: 'P', billingCycle: 'monthly', costPerCycle: 10, startDate: new Date('2026-01-01') },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/subscriptions' });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data).toHaveLength(1);
    expect(body.pagination.total).toBe(1);
  });

  it('should create and list quotas for a subscription', async () => {
    const sub = await prisma.subscription.create({
      data: { userId: USER_ID, name: 'API', provider: 'P', billingCycle: 'monthly', costPerCycle: 5, startDate: new Date('2026-01-01') },
    });
    const app = await createApp();

    const quota = await app.inject({
      method: 'POST',
      url: `/api/subscriptions/${sub.id}/quotas`,
      payload: { name: '请求数', unit: '次', monthlyLimit: 1000 },
    });
    expect(quota.statusCode).toBe(200);
    expect(quota.json().quota.monthlyLimit).toBe(1000);

    const detail = await app.inject({ method: 'GET', url: `/api/subscriptions/${sub.id}` });
    expect(detail.json().subscription.quotas).toHaveLength(1);
  });

  it('should record and read monthly usage', async () => {
    const sub = await prisma.subscription.create({
      data: { userId: USER_ID, name: 'API', provider: 'P', billingCycle: 'monthly', costPerCycle: 5, startDate: new Date('2026-01-01') },
    });
    const quota = await prisma.quotaDefinition.create({
      data: { subscriptionId: sub.id, name: '请求数', unit: '次', monthlyLimit: 1000 },
    });
    const app = await createApp();

    const record = await app.inject({
      method: 'POST',
      url: `/api/subscriptions/${sub.id}/usage/2026/6`,
      payload: { quotaUsages: [{ quotaDefinitionId: quota.id, usedAmount: 450 }] },
    });
    expect(record.statusCode).toBe(200);
    expect(record.json().monthlyUsage.quotaUsages).toHaveLength(1);

    const read = await app.inject({ method: 'GET', url: `/api/subscriptions/${sub.id}/usage/2026/6` });
    expect(read.statusCode).toBe(200);
    expect(read.json().monthlyUsage).not.toBeNull();
  });

  it('should compute dashboard summary with monthly normalized cost', async () => {
    await prisma.subscription.create({
      data: {
        userId: USER_ID,
        name: '年度订阅',
        provider: 'P',
        billingCycle: 'yearly',
        costPerCycle: 120,
        isActive: true,
        startDate: new Date('2026-01-01'),
      },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/subscriptions/dashboard/summary' });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.stats.activeCount).toBe(1);
    expect(body.subscriptions[0].monthlyCost).toBeCloseTo(10, 1);
  });

  it('should delete a subscription', async () => {
    const sub = await prisma.subscription.create({
      data: { userId: USER_ID, name: '待删除', provider: 'P', billingCycle: 'monthly', costPerCycle: 1, startDate: new Date('2026-01-01') },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'DELETE', url: `/api/subscriptions/${sub.id}` });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.subscription.findUnique({ where: { id: sub.id } });
    expect(deleted).toBeNull();
  });
});
