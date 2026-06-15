import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { goalRoutes } from './routes.js';

const prisma = new PrismaClient();

async function cleanup() {
  await prisma.keyResult.deleteMany({ where: { goal: { userId: 'goal-test-user' } } });
  await prisma.goal.deleteMany({ where: { userId: 'goal-test-user' } });
  await prisma.domain.deleteMany({ where: { userId: 'goal-test-user' } });
  await prisma.user.deleteMany({ where: { id: 'goal-test-user' } });
}

describe('Goal Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: {
        id: 'goal-test-user',
        email: 'goal-test@example.com',
        password: 'hashed',
        name: 'Goal Test',
      },
    });
    await prisma.domain.create({
      data: {
        id: 'test-domain-1',
        userId: 'goal-test-user',
        identifier: 'career',
        name: '职业',
        order: 0,
      },
    });
  });

  beforeEach(async () => {
    await prisma.goal.deleteMany({ where: { userId: 'goal-test-user' } });
    await prisma.keyResult.deleteMany({ where: { goal: { userId: 'goal-test-user' } } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: 'goal-test-user' });
    await app.register(goalRoutes, { prefix: '/api/goals' });
    return app;
  }

  it('should create a goal', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/goals',
      payload: {
        title: '成为高级工程师',
        domainId: 'test-domain-1',
        status: 'active',
        priority: 'high',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.goal.title).toBe('成为高级工程师');
    expect(body.goal.userId).toBe('goal-test-user');
  });

  it('should reject invalid goal payload', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/goals',
      payload: { title: '' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toContain('请求参数错误');
  });

  it('should list goals for authenticated user', async () => {
    await prisma.goal.create({
      data: {
        userId: 'goal-test-user',
        domainId: 'test-domain-1',
        title: '阅读 12 本书',
        status: 'active',
        priority: 'medium',
      },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/goals',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.goals).toHaveLength(1);
    expect(body.goals[0].title).toBe('阅读 12 本书');
  });

  it('should get a goal by id', async () => {
    const goal = await prisma.goal.create({
      data: {
        userId: 'goal-test-user',
        domainId: 'test-domain-1',
        title: '健身计划',
        status: 'planned',
        priority: 'low',
      },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'GET',
      url: `/api/goals/${goal.id}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().goal.id).toBe(goal.id);
  });

  it('should update a goal', async () => {
    const goal = await prisma.goal.create({
      data: {
        userId: 'goal-test-user',
        domainId: 'test-domain-1',
        title: '旧标题',
        status: 'planned',
        priority: 'low',
      },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/goals/${goal.id}`,
      payload: { title: '新标题', status: 'active' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().goal.title).toBe('新标题');
    expect(response.json().goal.status).toBe('active');
  });

  it('should delete a goal', async () => {
    const goal = await prisma.goal.create({
      data: {
        userId: 'goal-test-user',
        domainId: 'test-domain-1',
        title: '待删除目标',
        status: 'planned',
        priority: 'low',
      },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/goals/${goal.id}`,
    });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.goal.findUnique({ where: { id: goal.id } });
    expect(deleted).toBeNull();
  });
});
