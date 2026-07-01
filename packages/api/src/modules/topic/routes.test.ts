import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { topicRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'topic-test-user';

async function cleanup() {
  await prisma.topicNote.deleteMany({ where: { userId: USER_ID } });
  await prisma.topic.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Topic Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'topic-test@example.com', password: 'hashed', name: 'Topic Test' },
    });
  });

  beforeEach(async () => {
    await prisma.topicNote.deleteMany({ where: { userId: USER_ID } });
    await prisma.topic.deleteMany({ where: { userId: USER_ID } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(topicRoutes, { prefix: '/api/topics' });
    return app;
  }

  it('should create a topic', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/topics',
      payload: { title: '深度工作的本质', category: '工作', status: '探索中' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().topic.title).toBe('深度工作的本质');
    expect(response.json().topic.userId).toBe(USER_ID);
  });

  it('should reject invalid category', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/topics',
      payload: { title: 'X', category: '不存在' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should list topics with latest note and counts', async () => {
    const topic = await prisma.topic.create({
      data: { userId: USER_ID, title: '阅读方法', category: '工作', status: '研究中', order: 0 },
    });
    await prisma.topicNote.create({ data: { topicId: topic.id, userId: USER_ID, content: 'note1' } });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/topics' });

    expect(response.statusCode).toBe(200);
    const topics = response.json().topics;
    expect(topics).toHaveLength(1);
    expect(topics[0]._count.notes).toBe(1);
  });

  it('should get a topic by id with notes', async () => {
    const topic = await prisma.topic.create({
      data: { userId: USER_ID, title: '复盘机制', category: '工作', status: '探索中', order: 0 },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: `/api/topics/${topic.id}` });

    expect(response.statusCode).toBe(200);
    expect(response.json().topic.id).toBe(topic.id);
  });

  it('should add a note to a topic', async () => {
    const topic = await prisma.topic.create({
      data: { userId: USER_ID, title: '笔记测试', category: '工作', status: '探索中', order: 0 },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: `/api/topics/${topic.id}/notes`,
      payload: { content: '一条新笔记', noteType: 'insight' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().note.content).toBe('一条新笔记');
    expect(response.json().note.noteType).toBe('insight');
  });

  it('should update a topic status', async () => {
    const topic = await prisma.topic.create({
      data: { userId: USER_ID, title: '进度', category: '工作', status: '探索中', order: 0 },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/topics/${topic.id}`,
      payload: { status: '突破' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().topic.status).toBe('突破');
  });

  it('should delete a topic and cascade its notes', async () => {
    const topic = await prisma.topic.create({
      data: { userId: USER_ID, title: '待删除', category: '工作', status: '探索中', order: 0 },
    });
    const note = await prisma.topicNote.create({
      data: { topicId: topic.id, userId: USER_ID, content: '随主题删除' },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'DELETE', url: `/api/topics/${topic.id}` });

    expect(response.statusCode).toBe(200);
    const orphanNote = await prisma.topicNote.findUnique({ where: { id: note.id } });
    expect(orphanNote).toBeNull();
  });
});
