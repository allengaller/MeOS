import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { habitRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'habit-test-user';

async function cleanup() {
  await prisma.habitLog.deleteMany({ where: { habit: { userId: USER_ID } } });
  await prisma.habit.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Habit Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'habit-test@example.com', password: 'hashed', name: 'Habit Test' },
    });
  });

  beforeEach(async () => {
    await prisma.habitLog.deleteMany({ where: { habit: { userId: USER_ID } } });
    await prisma.habit.deleteMany({ where: { userId: USER_ID } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(habitRoutes, { prefix: '/api/habits' });
    return app;
  }

  it('should create a habit', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/habits',
      payload: { title: '晨跑', frequency: 'daily', targetPerWeek: 5, color: '#22c55e' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().habit.title).toBe('晨跑');
    expect(response.json().habit.userId).toBe(USER_ID);
  });

  it('should reject invalid frequency', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/habits',
      payload: { title: 'X', frequency: 'hourly' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should list active habits with today logs', async () => {
    await prisma.habit.create({
      data: { userId: USER_ID, title: '阅读', frequency: 'daily', isActive: true, order: 0 },
    });
    await prisma.habit.create({
      data: { userId: USER_ID, title: '归档习惯', frequency: 'daily', isActive: false, order: 1 },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/habits' });

    expect(response.statusCode).toBe(200);
    const habits = response.json().habits;
    expect(habits).toHaveLength(1);
    expect(habits[0].title).toBe('阅读');
  });

  it('should toggle a habit log (check-in then check-out)', async () => {
    const habit = await prisma.habit.create({
      data: { userId: USER_ID, title: '冥想', frequency: 'daily', isActive: true, order: 0 },
    });
    const today = new Date().toISOString();

    const app = await createApp();
    const checkin = await app.inject({
      method: 'POST',
      url: `/api/habits/${habit.id}/log`,
      payload: { date: today },
    });
    expect(checkin.statusCode).toBe(200);
    expect(checkin.json().logged).toBe(true);

    const checkout = await app.inject({
      method: 'POST',
      url: `/api/habits/${habit.id}/log`,
      payload: { date: today },
    });
    expect(checkout.json().logged).toBe(false);
  });

  it('should update a habit', async () => {
    const habit = await prisma.habit.create({
      data: { userId: USER_ID, title: '旧', frequency: 'daily', isActive: true, order: 0 },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/habits/${habit.id}`,
      payload: { title: '新标题', isActive: false },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().habit.title).toBe('新标题');
    expect(response.json().habit.isActive).toBe(false);
  });

  it('should delete a habit', async () => {
    const habit = await prisma.habit.create({
      data: { userId: USER_ID, title: '待删除', frequency: 'daily', isActive: true, order: 0 },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'DELETE', url: `/api/habits/${habit.id}` });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.habit.findUnique({ where: { id: habit.id } });
    expect(deleted).toBeNull();
  });
});
