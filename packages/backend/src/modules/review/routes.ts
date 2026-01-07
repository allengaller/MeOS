import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

const reviewSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  achievements: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  insights: z.string().optional(),
  nextFocus: z.array(z.string()).optional(),
});

export const reviewRoutes: FastifyPluginAsync = async (fastify) => {
  // 创建复盘
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = (request.user as any).userId;
        const data = reviewSchema.parse(request.body);

        const review = await prisma.periodicReview.create({
          data: {
            userId,
            period: data.period,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            achievements: data.achievements ? JSON.stringify(data.achievements) : null,
            challenges: data.challenges ? JSON.stringify(data.challenges) : null,
            insights: data.insights,
            nextFocus: data.nextFocus ? JSON.stringify(data.nextFocus) : null,
          },
        });

        return { review };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ error: '请求参数错误', details: error.errors });
        }
        fastify.log.error(error);
        return reply.code(500).send({ error: '服务器错误' });
      }
    },
  });

  // 获取复盘列表
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = (request.user as any).userId;
        const { period } = request.query as { period?: string };

        const where: any = { userId };
        if (period) where.period = period;

        const reviews = await prisma.periodicReview.findMany({
          where,
          orderBy: { startDate: 'desc' },
        });

        return { reviews };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: '服务器错误' });
      }
    },
  });
};
