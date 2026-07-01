import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { mindsetRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'mindset-test-user';

async function cleanup() {
  await prisma.mindsetSlogan.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Mindset Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'mindset-test@example.com', password: 'hashed', name: 'Mindset Test' },
    });
  });

  beforeEach(async () => {
    await prisma.mindsetSlogan.deleteMany({ where: { userId: USER_ID } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(mindsetRoutes, { prefix: '/api/mindsets' });
    return app;
  }

  it('should create a mindset slogan', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/mindsets',
      payload: { content: '少即是多', category: '生活' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().slogan.content).toBe('少即是多');
    expect(response.json().slogan.userId).toBe(USER_ID);
  });

  it('should reject invalid category', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/mindsets',
      payload: { content: '测试', category: '不存在的分类' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should list slogans ordered by category and order', async () => {
    await prisma.mindsetSlogan.create({ data: { userId: USER_ID, content: 'A', category: '工作', order: 1 } });
    await prisma.mindsetSlogan.create({ data: { userId: USER_ID, content: 'B', category: '生活', order: 0 } });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/mindsets' });

    expect(response.statusCode).toBe(200);
    expect(response.json().slogans).toHaveLength(2);
  });

  it('should update a slogan', async () => {
    const slogan = await prisma.mindsetSlogan.create({
      data: { userId: USER_ID, content: '旧', category: '工作', order: 0 },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/mindsets/${slogan.id}`,
      payload: { content: '新内容', order: 5 },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().slogan.content).toBe('新内容');
    expect(response.json().slogan.order).toBe(5);
  });

  it('should delete a slogan', async () => {
    const slogan = await prisma.mindsetSlogan.create({
      data: { userId: USER_ID, content: '待删除', category: '工作', order: 0 },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'DELETE', url: `/api/mindsets/${slogan.id}` });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.mindsetSlogan.findUnique({ where: { id: slogan.id } });
    expect(deleted).toBeNull();
  });
});
