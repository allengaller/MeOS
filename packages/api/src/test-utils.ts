import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '@meos/shared';

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser;
  }
}

interface BuildTestAppOptions {
  userId?: string;
}

/**
 * 创建一个用于测试的 Fastify 实例，注入 mock 认证装饰器。
 * 调用方注册具体路由模块后即可通过 inject() 进行 HTTP 级测试。
 */
export async function buildTestApp(options: BuildTestAppOptions = {}): Promise<FastifyInstance> {
  const { userId = 'test-user-1' } = options;
  const app = Fastify({ logger: false });

  app.decorate('authenticate', async function (request) {
    request.user = { userId };
  });

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = error.statusCode || 500;
    reply.code(statusCode).send({ error: error.message || '请求处理失败' });
  });

  return app;
}
