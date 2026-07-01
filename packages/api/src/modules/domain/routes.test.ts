import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { domainRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'domain-test-user';

async function cleanup() {
  await prisma.domain.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Domain Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'domain-test@example.com', password: 'hashed', name: 'Domain Test' },
    });
  });

  beforeEach(async () => {
    await prisma.domain.deleteMany({ where: { userId: USER_ID } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(domainRoutes, { prefix: '/api/domains' });
    return app;
  }

  it('should create a domain', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/domains',
      payload: { name: '职业发展', identifier: 'career', icon: '💼', weight: 2, order: 1 },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.domain.name).toBe('职业发展');
    expect(body.domain.userId).toBe(USER_ID);
  });

  it('should reject invalid domain payload', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/domains',
      payload: { name: '' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toContain('请求参数错误');
  });

  it('should list domains for authenticated user', async () => {
    await prisma.domain.create({
      data: { userId: USER_ID, identifier: 'health', name: '健康', order: 0 },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/domains' });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.domains).toHaveLength(1);
    expect(body.domains[0].name).toBe('健康');
  });

  it('should update a domain', async () => {
    const domain = await prisma.domain.create({
      data: { userId: USER_ID, identifier: 'finance', name: '财务', order: 0 },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/domains/${domain.id}`,
      payload: { name: '财务状况', weight: 3 },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().domain.name).toBe('财务状况');
    expect(response.json().domain.weight).toBe(3);
  });

  it('should return 404 when updating non-existent domain', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/domains/non-existent-id',
      payload: { name: '不存在' },
    });

    expect(response.statusCode).toBe(404);
  });

  it('should delete a domain', async () => {
    const domain = await prisma.domain.create({
      data: { userId: USER_ID, identifier: 'social', name: '社交', order: 0 },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'DELETE', url: `/api/domains/${domain.id}` });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.domain.findUnique({ where: { id: domain.id } });
    expect(deleted).toBeNull();
  });
});
