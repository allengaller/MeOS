import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';

// 请求验证schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // 注册
  fastify.post('/register', async (request, reply) => {
    try {
      const { email, password, name } = registerSchema.parse(request.body);

      // 检查用户是否已存在
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return reply.code(400).send({ error: '邮箱已被注册' });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      // 初始化默认8个领域
      const defaultDomains = [
        { identifier: 'Career', name: '职业发展', icon: '💼', order: 1 },
        { identifier: 'Health', name: '身心健康', icon: '💪', order: 2 },
        { identifier: 'Family', name: '家庭关系', icon: '👨‍👩‍👧‍👦', order: 3 },
        { identifier: 'Finance', name: '财务状况', icon: '💰', order: 4 },
        { identifier: 'Learning', name: '学习成长', icon: '📚', order: 5 },
        { identifier: 'Social', name: '社交人际', icon: '🤝', order: 6 },
        { identifier: 'Leisure', name: '休闲娱乐', icon: '🎮', order: 7 },
        { identifier: 'Spirituality', name: '精神世界', icon: '🧘', order: 8 },
      ];

      await prisma.domain.createMany({
        data: defaultDomains.map((domain) => ({
          ...domain,
          userId: user.id,
        })),
      });

      // 生成JWT Token
      const token = fastify.jwt.sign({ userId: user.id });

      return { user, token };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: '请求参数错误', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: '服务器错误' });
    }
  });

  // 登录
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);

      // 查找用户
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.code(401).send({ error: '邮箱或密码错误' });
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return reply.code(401).send({ error: '邮箱或密码错误' });
      }

      // 生成JWT Token
      const token = fastify.jwt.sign({ userId: user.id });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        token,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: '请求参数错误', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: '服务器错误' });
    }
  });

  // 获取当前用户信息
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = (request.user as any).userId;
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        });

        if (!user) {
          return reply.code(404).send({ error: '用户不存在' });
        }

        return { user };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: '服务器错误' });
      }
    },
  });
};
