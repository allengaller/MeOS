import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { insightRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'insight-test-user';

async function cleanup() {
  await prisma.insightNote.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Insight Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'insight-test@example.com', password: 'hashed', name: 'Insight Test' },
    });
  });

  beforeEach(async () => {
    await prisma.insightNote.deleteMany({ where: { userId: USER_ID } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(insightRoutes, { prefix: '/api/insights' });
    return app;
  }

  it('should create an insight note with tags', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/insights',
      payload: { title: '复利效应', content: '小步快跑', tags: ['成长', '思维'], category: '认知' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.insight.title).toBe('复利效应');
    expect(body.insight.tags).toBe(JSON.stringify(['成长', '思维']));
    expect(body.insight.userId).toBe(USER_ID);
  });

  it('should reject missing title', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/insights',
      payload: { content: '无标题' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should list insights with pagination', async () => {
    await prisma.insightNote.create({ data: { userId: USER_ID, title: 'A', content: 'a' } });
    await prisma.insightNote.create({ data: { userId: USER_ID, title: 'B', content: 'b' } });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/insights?page=1&limit=10' });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.insights).toHaveLength(2);
    expect(body.pagination.total).toBe(2);
  });

  it('should filter by search keyword', async () => {
    await prisma.insightNote.create({ data: { userId: USER_ID, title: '深度工作', content: 'c' } });
    await prisma.insightNote.create({ data: { userId: USER_ID, title: '其他', content: 'd' } });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/insights?search=深度' });

    expect(response.statusCode).toBe(200);
    expect(response.json().insights).toHaveLength(1);
    expect(response.json().insights[0].title).toBe('深度工作');
  });

  it('should update an insight', async () => {
    const insight = await prisma.insightNote.create({
      data: { userId: USER_ID, title: '原标题', content: 'c' },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/insights/${insight.id}`,
      payload: { title: '新标题' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().insight.title).toBe('新标题');
  });

  it('should delete an insight', async () => {
    const insight = await prisma.insightNote.create({
      data: { userId: USER_ID, title: '待删除', content: 'c' },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'DELETE', url: `/api/insights/${insight.id}` });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.insightNote.findUnique({ where: { id: insight.id } });
    expect(deleted).toBeNull();
  });
});
