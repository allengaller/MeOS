import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

const insightSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

export const insightRoutes: FastifyPluginAsync = async (fastify) => {
  // 创建洞察笔记
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = (request.user as any).userId;
        const data = insightSchema.parse(request.body);

        const insight = await prisma.insightNote.create({
          data: {
            userId,
            title: data.title,
            content: data.content,
            tags: data.tags ? JSON.stringify(data.tags) : null,
            category: data.category,
          },
        });

        return { insight };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ error: '请求参数错误', details: error.errors });
        }
        fastify.log.error(error);
        return reply.code(500).send({ error: '服务器错误' });
      }
    },
  });

  // 获取洞察笔记列表
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = (request.user as any).userId;
        const { category, limit = 50 } = request.query as { category?: string; limit?: number };

        const where: any = { userId };
        if (category) where.category = category;

        const insights = await prisma.insightNote.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: Number(limit),
        });

        return { insights };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: '服务器错误' });
      }
    },
  });
};
