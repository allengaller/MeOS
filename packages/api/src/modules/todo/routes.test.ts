import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { todoRoutes } from './routes.js';

const prisma = new PrismaClient();

async function cleanup() {
  await prisma.todo.deleteMany({ where: { userId: 'todo-test-user' } });
  await prisma.user.deleteMany({ where: { id: 'todo-test-user' } });
}

describe('Todo Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: {
        id: 'todo-test-user',
        email: 'todo-test@example.com',
        password: 'hashed',
        name: 'Todo Test',
      },
    });
  });

  beforeEach(async () => {
    await prisma.todo.deleteMany({ where: { userId: 'todo-test-user' } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: 'todo-test-user' });
    await app.register(todoRoutes, { prefix: '/api/todos' });
    return app;
  }

  it('should create a todo', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { title: '完成项目文档' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.todo.title).toBe('完成项目文档');
    expect(body.todo.status).toBe('inbox');
    expect(body.todo.priority).toBe('medium');
  });

  it('should list todos with status filter', async () => {
    await prisma.todo.createMany({
      data: [
        { userId: 'todo-test-user', title: '待办 A', status: 'todo' },
        { userId: 'todo-test-user', title: '已完成 B', status: 'done' },
      ],
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/todos?status=todo',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.todos).toHaveLength(1);
    expect(body.todos[0].status).toBe('todo');
  });

  it('should update a todo status', async () => {
    const todo = await prisma.todo.create({
      data: {
        userId: 'todo-test-user',
        title: '进行中任务',
        status: 'doing',
      },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/todos/${todo.id}`,
      payload: { status: 'done' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().todo.status).toBe('done');
    expect(response.json().todo.completedAt).not.toBeNull();
  });

  it('should delete a todo', async () => {
    const todo = await prisma.todo.create({
      data: {
        userId: 'todo-test-user',
        title: '待删除任务',
        status: 'inbox',
      },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/todos/${todo.id}`,
    });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.todo.findUnique({ where: { id: todo.id } });
    expect(deleted).toBeNull();
  });
});
