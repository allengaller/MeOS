import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { reflectionRoutes } from './routes.js';

const prisma = new PrismaClient();

async function cleanup() {
  await prisma.reflection.deleteMany({ where: { userId: 'reflection-test-user' } });
  await prisma.user.deleteMany({ where: { id: 'reflection-test-user' } });
}

describe('Reflection Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: {
        id: 'reflection-test-user',
        email: 'reflection-test@example.com',
        password: 'hashed',
        name: 'Reflection Test',
      },
    });
  });

  beforeEach(async () => {
    await prisma.reflection.deleteMany({ where: { userId: 'reflection-test-user' } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: 'reflection-test-user' });
    await app.register(reflectionRoutes, { prefix: '/api/reflections' });
    return app;
  }

  it('should create a daily reflection', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/reflections',
      payload: {
        celebrations: ['完成了一项重要任务'],
        improvements: ['需要更早睡觉'],
        tomorrow: '明天开始运动',
        mood: '开心',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.reflection.celebrations).toBe('["完成了一项重要任务"]');
    expect(body.reflection.type).toBe('daily');
  });

  it('should list reflections with pagination', async () => {
    await prisma.reflection.create({
      data: {
        userId: 'reflection-test-user',
        date: new Date(),
        type: 'daily',
        celebrations: '[]',
        improvements: '[]',
      },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/reflections?type=daily',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.reflections).toHaveLength(1);
    expect(body.pagination.total).toBe(1);
  });

  it('should get a reflection by id', async () => {
    const reflection = await prisma.reflection.create({
      data: {
        userId: 'reflection-test-user',
        date: new Date(),
        type: 'daily',
        celebrations: '[]',
        improvements: '[]',
        content: '今天的反思内容',
      },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'GET',
      url: `/api/reflections/${reflection.id}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().reflection.content).toBe('今天的反思内容');
  });

  it('should update a reflection', async () => {
    const reflection = await prisma.reflection.create({
      data: {
        userId: 'reflection-test-user',
        date: new Date(),
        type: 'daily',
        celebrations: '[]',
        improvements: '[]',
      },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/reflections/${reflection.id}`,
      payload: { content: '更新后的内容' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().reflection.content).toBe('更新后的内容');
  });

  it('should delete a reflection', async () => {
    const reflection = await prisma.reflection.create({
      data: {
        userId: 'reflection-test-user',
        date: new Date(),
        type: 'daily',
        celebrations: '[]',
        improvements: '[]',
      },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/reflections/${reflection.id}`,
    });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.reflection.findUnique({ where: { id: reflection.id } });
    expect(deleted).toBeNull();
  });
});
