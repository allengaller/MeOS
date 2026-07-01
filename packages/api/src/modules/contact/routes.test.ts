import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { contactRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'contact-test-user';

async function cleanup() {
  await prisma.contact.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Contact Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'contact-test@example.com', password: 'hashed', name: 'Contact Test' },
    });
  });

  beforeEach(async () => {
    await prisma.contact.deleteMany({ where: { userId: USER_ID } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(contactRoutes, { prefix: '/api/contacts' });
    return app;
  }

  it('should create a contact', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/contacts',
      payload: { name: '张三', relation: 'friend', contactFreq: 'monthly', company: 'ACME' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().contact.name).toBe('张三');
    expect(response.json().contact.userId).toBe(USER_ID);
  });

  it('should reject missing name', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/contacts',
      payload: { relation: 'friend' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should list contacts ordered by name', async () => {
    await prisma.contact.create({ data: { userId: USER_ID, name: 'Zoe', relation: 'friend' } });
    await prisma.contact.create({ data: { userId: USER_ID, name: 'Alice', relation: 'mentor' } });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/contacts' });

    expect(response.statusCode).toBe(200);
    const contacts = response.json().contacts;
    expect(contacts).toHaveLength(2);
    expect(contacts[0].name).toBe('Alice');
  });

  it('should flag contacts needing outreach', async () => {
    const old = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
    await prisma.contact.create({
      data: { userId: USER_ID, name: '失联', relation: 'friend', contactFreq: 'monthly', lastContact: old },
    });
    await prisma.contact.create({
      data: { userId: USER_ID, name: '近期', relation: 'friend', contactFreq: 'monthly', lastContact: new Date() },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/contacts?needsContact=true' });

    expect(response.statusCode).toBe(200);
    expect(response.json().contacts).toHaveLength(1);
    expect(response.json().contacts[0].name).toBe('失联');
  });

  it('should touch (update lastContact) a contact', async () => {
    const contact = await prisma.contact.create({
      data: { userId: USER_ID, name: '联系人', relation: 'friend' },
    });

    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: `/api/contacts/${contact.id}/touch`,
      payload: { note: '今天聊过了' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().contact.lastContact).not.toBeNull();
  });

  it('should delete a contact', async () => {
    const contact = await prisma.contact.create({
      data: { userId: USER_ID, name: '待删除', relation: 'friend' },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'DELETE', url: `/api/contacts/${contact.id}` });

    expect(response.statusCode).toBe(200);
    const deleted = await prisma.contact.findUnique({ where: { id: contact.id } });
    expect(deleted).toBeNull();
  });
});
