import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { buildTestApp } from '../../test-utils.js';
import { workflowRoutes } from './routes.js';

const prisma = new PrismaClient();
const USER_ID = 'workflow-test-user';

async function cleanup() {
  await prisma.workflowConnection.deleteMany({ where: { workflow: { userId: USER_ID } } });
  await prisma.workflowStep.deleteMany({ where: { workflow: { userId: USER_ID } } });
  await prisma.workflow.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
}

describe('Workflow Routes', () => {
  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({
      data: { id: USER_ID, email: 'workflow-test@example.com', password: 'hashed', name: 'Workflow Test' },
    });
  });

  beforeEach(async () => {
    await prisma.workflowConnection.deleteMany({ where: { workflow: { userId: USER_ID } } });
    await prisma.workflowStep.deleteMany({ where: { workflow: { userId: USER_ID } } });
    await prisma.workflow.deleteMany({ where: { userId: USER_ID } });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function createApp() {
    const app = await buildTestApp({ userId: USER_ID });
    await app.register(workflowRoutes, { prefix: '/api/workflows' });
    return app;
  }

  it('should create a workflow', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/workflows',
      payload: { name: '季度目标流', description: '从愿景到行动' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().workflow.name).toBe('季度目标流');
    expect(response.json().workflow.userId).toBe(USER_ID);
  });

  it('should reject empty name', async () => {
    const app = await createApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/workflows',
      payload: { name: '' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should list workflows with counts', async () => {
    const wf = await prisma.workflow.create({ data: { userId: USER_ID, name: 'W1' } });
    await prisma.workflowStep.create({
      data: { workflowId: wf.id, entityType: 'goal', entityId: 'g1', label: '目标' },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/workflows' });

    expect(response.statusCode).toBe(200);
    const workflows = response.json().workflows;
    expect(workflows).toHaveLength(1);
    expect(workflows[0]._count.steps).toBe(1);
  });

  it('should add steps and connections to a workflow', async () => {
    const wf = await prisma.workflow.create({ data: { userId: USER_ID, name: '流' } });
    const app = await createApp();

    const step1 = await app.inject({
      method: 'POST',
      url: `/api/workflows/${wf.id}/steps`,
      payload: { entityType: 'goal', entityId: 'g1', label: '目标' },
    });
    const step2 = await app.inject({
      method: 'POST',
      url: `/api/workflows/${wf.id}/steps`,
      payload: { entityType: 'todo', entityId: 't1', label: '待办' },
    });
    expect(step1.statusCode).toBe(200);
    expect(step2.statusCode).toBe(200);

    const conn = await app.inject({
      method: 'POST',
      url: `/api/workflows/${wf.id}/connections`,
      payload: { sourceStepId: step1.json().step.id, targetStepId: step2.json().step.id },
    });
    expect(conn.statusCode).toBe(200);

    const detail = await app.inject({ method: 'GET', url: `/api/workflows/${wf.id}` });
    expect(detail.json().workflow.steps).toHaveLength(2);
    expect(detail.json().workflow.connections).toHaveLength(1);
  });

  it('should update a workflow', async () => {
    const wf = await prisma.workflow.create({ data: { userId: USER_ID, name: '旧名' } });

    const app = await createApp();
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/workflows/${wf.id}`,
      payload: { name: '新名', description: '更新描述' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().workflow.name).toBe('新名');
  });

  it('should delete a workflow and cascade steps/connections', async () => {
    const wf = await prisma.workflow.create({ data: { userId: USER_ID, name: '待删除' } });
    const step = await prisma.workflowStep.create({
      data: { workflowId: wf.id, entityType: 'goal', entityId: 'g1', label: '目标' },
    });

    const app = await createApp();
    const response = await app.inject({ method: 'DELETE', url: `/api/workflows/${wf.id}` });

    expect(response.statusCode).toBe(200);
    const orphanStep = await prisma.workflowStep.findUnique({ where: { id: step.id } });
    expect(orphanStep).toBeNull();
  });
});
