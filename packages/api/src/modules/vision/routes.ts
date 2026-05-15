import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

const createVisionSchema = z.object({
  content: z.string().min(1),
});

const updateVisionSchema = z.object({
  content: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const visionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const vision = await prisma.vision.findFirst({
        where: { userId, isActive: true },
      });
      return { vision };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: '服务器错误' });
    }
  });

  fastify.post('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const { content } = createVisionSchema.parse(request.body);

      const latest = await prisma.vision.findFirst({
        where: { userId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      await prisma.vision.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      const vision = await prisma.vision.create({
        data: {
          userId,
          content,
          version: (latest?.version ?? 0) + 1,
        },
      });

      return { vision };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: '请求参数错误', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: '服务器错误' });
    }
  });

  fastify.patch('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const { id } = request.params as { id: string };
      const data = updateVisionSchema.parse(request.body);

      const existing = await prisma.vision.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return reply.code(404).send({ error: '愿景不存在' });
      }

      if (data.isActive === true) {
        await prisma.vision.updateMany({
          where: { userId, isActive: true },
          data: { isActive: false },
        });
      }

      const vision = await prisma.vision.update({
        where: { id },
        data,
      });

      return { vision };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: '请求参数错误', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: '服务器错误' });
    }
  });

  fastify.get('/history', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).userId;
      const visions = await prisma.vision.findMany({
        where: { userId },
        orderBy: { version: 'desc' },
      });
      return { visions };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: '服务器错误' });
    }
  });
};
