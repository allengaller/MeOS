import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

const updateDomainSchema = z.object({
  name: z.string().optional(),
  icon: z.string().optional(),
  weight: z.number().min(1).max(10).optional(),
  description: z.string().optional(),
});

export const domainRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取用户所有领域
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = (request.user as any).userId;
        const domains = await prisma.domain.findMany({
          where: { userId },
          orderBy: { order: 'asc' },
        });
        return { domains };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: '服务器错误' });
      }
    },
  });

  // 更新领域
  fastify.patch('/:id', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = (request.user as any).userId;
        const { id } = request.params as { id: string };
        const data = updateDomainSchema.parse(request.body);

        const domain = await prisma.domain.updateMany({
          where: { id, userId },
          data,
        });

        if (domain.count === 0) {
          return reply.code(404).send({ error: '领域不存在' });
        }

        const updated = await prisma.domain.findUnique({ where: { id } });
        return { domain: updated };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ error: '请求参数错误', details: error.errors });
        }
        fastify.log.error(error);
        return reply.code(500).send({ error: '服务器错误' });
      }
    },
  });
};
