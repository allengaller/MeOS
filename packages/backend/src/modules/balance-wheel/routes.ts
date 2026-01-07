import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

const scoreSchema = z.object({
  scores: z.array(
    z.object({
      domainId: z.string(),
      score: z.number().min(1).max(10),
      note: z.string().optional(),
    })
  ),
});

export const balanceWheelRoutes: FastifyPluginAsync = async (fastify) => {
  // 提交平衡轮评分
  fastify.post('/scores', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = (request.user as any).userId;
        const { scores } = scoreSchema.parse(request.body);

        const createdScores = await Promise.all(
          scores.map((score) =>
            prisma.balanceWheelScore.create({
              data: {
                userId,
                domainId: score.domainId,
                score: score.score,
                note: score.note,
              },
            })
          )
        );

        return { scores: createdScores };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ error: '请求参数错误', details: error.errors });
        }
        fastify.log.error(error);
        return reply.code(500).send({ error: '服务器错误' });
      }
    },
  });

  // 获取平衡轮历史数据
  fastify.get('/history', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = (request.user as any).userId;
        const { limit = 10 } = request.query as { limit?: number };

        const scores = await prisma.balanceWheelScore.findMany({
          where: { userId },
          include: { domain: true },
          orderBy: { createdAt: 'desc' },
          take: Number(limit),
        });

        return { scores };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: '服务器错误' });
      }
    },
  });
};
