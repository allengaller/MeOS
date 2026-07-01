import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { reviewRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'review-test-user';

async function cleanup() {
  await prisma.periodicReview.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Review Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'review-test@example.com', password: 'hashed', name: 'Review Test' },
    });
  });

  beforeEach(async () => {
    await prisma.periodicReview.deleteMany({ where: { userId: USER_ID } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(reviewRoutes, { prefix: '/api/reviews' });
    return app;
  }

  const weekStart = '2026-06-01T00:00:00.000Z';
  const weekEnd = '2026-06-07T23:59:59.000Z';

  it('should create a periodic review', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/reviews',
      payload: {
        period: 'week',
        startDate: weekStart,
        endDate: weekEnd,
        achievements: ['完成方案设计', '上线订阅功能'],
        challenges: ['时间分配不均'],
        insights: '聚焦是稀缺资源',
        nextFocus: ['推进测试覆盖'],
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.review.period).toBe('week');
    expect(body.review.userId).toBe(USER_ID);
    expect(body.review.achievements).toBe(JSON.stringify(['完成方案设计', '上线订阅功能']));
  });

  it('should reject invalid period', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/reviews',
      payload: { period: 'decade', startDate: weekStart, endDate: weekEnd },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should list reviews filtered by period', async () => {
    await prisma.periodicReview.create({
      data: { userId: USER_ID, period: 'week', startDate: new Date(weekStart), endDate: new Date(weekEnd) },
    });
    await prisma.periodicReview.create({
      data: {
        userId: USER_ID,
        period: 'month',
        startDate: new Date('2026-06-01T00:00:00.000Z'),
        endDate: new Date('2026-06-30T23:59:59.000Z'),
      },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/reviews?period=week' });

    expect(response.statusCode).toBe(200);
    expect(response.json().reviews).toHaveLength(1);
    expect(response.json().reviews[0].period).toBe('week');
  });

  it('should get a review by id', async () => {
    const review = await prisma.periodicReview.create({
      data: { userId: USER_ID, period: 'week', startDate: new Date(weekStart), endDate: new Date(weekEnd) },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: `/api/reviews/${review.id}` });

    expect(response.statusCode).toBe(200);
    expect(response.json().review.id).toBe(review.id);
  });

  it('should update a review', async () => {
    const review = await prisma.periodicReview.create({
      data: { userId: USER_ID, period: 'week', startDate: new Date(weekStart), endDate: new Date(weekEnd) },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/reviews/${review.id}`,
      payload: { insights: '更新后的洞察' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().review.insights).toBe('更新后的洞察');
  });

  it('should delete a review', async () => {
    const review = await prisma.periodicReview.create({
      data: { userId: USER_ID, period: 'week', startDate: new Date(weekStart), endDate: new Date(weekEnd) },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'DELETE', url: `/api/reviews/${review.id}` });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.periodicReview.findUnique({ where: { id: review.id } });
    expect(deleted).toBeNull();
  });
});
