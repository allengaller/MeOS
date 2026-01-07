import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

const reflectionSchema = z.object({
  date: z.string().datetime().optional(),
  type: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).default('daily'),
  celebrations: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
  tomorrow: z.string().optional(),
  content: z.string().optional(),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional(),
  domainId: z.string().optional(),
});

export const reflectionRoutes: FastifyPluginAsync = async (fastify) => {
  // 创建反思
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = (request.user as any).userId;
        const data = reflectionSchema.parse(request.body);

        const reflection = await prisma.reflection.create({
          data: {
            userId,
            date: data.date ? new Date(data.date) : new Date(),
            type: data.type,
            celebrations: data.celebrations ? JSON.stringify(data.celebrations) : null,
            improvements: data.improvements ? JSON.stringify(data.improvements) : null,
            tomorrow: data.tomorrow,
            content: data.content,
            mood: data.mood,
            tags: data.tags ? JSON.stringify(data.tags) : null,
            domainId: data.domainId,
          },
        });

        return { reflection };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ error: '请求参数错误', details: error.errors });
        }
        fastify.log.error(error);
        return reply.code(500).send({ error: '服务器错误' });
      }
    },
  });

  // 获取反思列表
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = (request.user as any).userId;
        const { type, limit = 20 } = request.query as { type?: string; limit?: number };

        const where: any = { userId };
        if (type) where.type = type;

        const reflections = await prisma.reflection.findMany({
          where,
          include: { domain: true },
          orderBy: { date: 'desc' },
          take: Number(limit),
        });

        return { reflections };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: '服务器错误' });
      }
    },
  });
};
