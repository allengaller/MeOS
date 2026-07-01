import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { readingRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'reading-test-user';

async function cleanup() {
  await prisma.readingItem.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Reading Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'reading-test@example.com', password: 'hashed', name: 'Reading Test' },
    });
  });

  beforeEach(async () => {
    await prisma.readingItem.deleteMany({ where: { userId: USER_ID } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(readingRoutes, { prefix: '/api/reading' });
    return app;
  }

  it('should create a reading item', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/reading',
      payload: { title: '原则', author: '瑞·达利欧', type: 'book', rating: 5 },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().item.title).toBe('原则');
    expect(response.json().item.userId).toBe(USER_ID);
  });

  it('should reject invalid type', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/reading',
      payload: { title: 'X', type: 'magazine' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should list reading items filtered by status', async () => {
    await prisma.readingItem.create({ data: { userId: USER_ID, title: 'A', status: 'want' } });
    await prisma.readingItem.create({ data: { userId: USER_ID, title: 'B', status: 'reading' } });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/reading?status=reading' });

    expect(response.statusCode).toBe(200);
    expect(response.json().items).toHaveLength(1);
    expect(response.json().items[0].title).toBe('B');
  });

  it('should auto-set startDate when status becomes reading', async () => {
    const item = await prisma.readingItem.create({
      data: { userId: USER_ID, title: '开始读', status: 'want' },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/reading/${item.id}`,
      payload: { status: 'reading' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().item.startDate).not.toBeNull();
  });

  it('should update rating', async () => {
    const item = await prisma.readingItem.create({
      data: { userId: USER_ID, title: '评分书', status: 'want' },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/reading/${item.id}`,
      payload: { rating: 4 },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().item.rating).toBe(4);
  });

  it('should delete a reading item', async () => {
    const item = await prisma.readingItem.create({
      data: { userId: USER_ID, title: '待删除', status: 'want' },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'DELETE', url: `/api/reading/${item.id}` });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.readingItem.findUnique({ where: { id: item.id } });
    expect(deleted).toBeNull();
  });
});
