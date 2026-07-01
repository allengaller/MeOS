import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { visionRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'vision-test-user';

async function cleanup() {
  await prisma.vision.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Vision Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'vision-test@example.com', password: 'hashed', name: 'Vision Test' },
    });
  });

  beforeEach(async () => {
    await prisma.vision.deleteMany({ where: { userId: USER_ID } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(visionRoutes, { prefix: '/api/visions' });
    return app;
  }

  it('should create a vision and deactivate previous active ones', async () => {
    await prisma.vision.create({
      data: { userId: USER_ID, content: '旧愿景', version: 1, isActive: true },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/visions',
      payload: { content: '成为更好的自己' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.vision.content).toBe('成为更好的自己');
    expect(body.vision.version).toBe(2);
    expect(body.vision.isActive).toBe(true);

    const active = await prisma.vision.count({ where: { userId: USER_ID, isActive: true } });
    expect(active).toBe(1);
  });

  it('should reject empty content', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/visions',
      payload: { content: '' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should get the active vision', async () => {
    await prisma.vision.create({
      data: { userId: USER_ID, content: '活跃愿景', version: 1, isActive: true },
    });
    await prisma.vision.create({
      data: { userId: USER_ID, content: '历史愿景', version: 0, isActive: false },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/visions' });

    expect(response.statusCode).toBe(200);
    expect(response.json().vision.content).toBe('活跃愿景');
  });

  it('should list vision history', async () => {
    await prisma.vision.create({ data: { userId: USER_ID, content: 'v1', version: 1, isActive: false } });
    await prisma.vision.create({ data: { userId: USER_ID, content: 'v2', version: 2, isActive: true } });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/visions/history' });

    expect(response.statusCode).toBe(200);
    const visions = response.json().visions;
    expect(visions).toHaveLength(2);
    expect(visions[0].version).toBe(2);
  });

  it('should activate a vision and deactivate others', async () => {
    const v1 = await prisma.vision.create({
      data: { userId: USER_ID, content: '当前', version: 1, isActive: true },
    });
    const v2 = await prisma.vision.create({
      data: { userId: USER_ID, content: '候选', version: 2, isActive: false },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/visions/${v2.id}`,
      payload: { isActive: true },
    });

    expect(response.statusCode).toBe(200);
    const refreshedV1 = await prisma.vision.findUnique({ where: { id: v1.id } });
    expect(refreshedV1?.isActive).toBe(false);
  });
});
