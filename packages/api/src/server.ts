import Fastify from 'fastify';
import type { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { authRoutes } from './modules/auth/routes.js';
import { domainRoutes } from './modules/domain/routes.js';
import { balanceWheelRoutes } from './modules/balance-wheel/routes.js';
import { reflectionRoutes } from './modules/reflection/routes.js';
import { reviewRoutes } from './modules/review/routes.js';
import { insightRoutes } from './modules/insight/routes.js';
import { subscriptionRoutes } from './modules/subscription/routes.js';
import { mindsetRoutes } from './modules/mindset/routes.js';
import { visionRoutes } from './modules/vision/routes.js';
import { goalRoutes } from './modules/goal/routes.js';
import { todoRoutes } from './modules/todo/routes.js';
import { habitRoutes } from './modules/habit/routes.js';
import { topicRoutes } from './modules/topic/routes.js';
import { readingRoutes } from './modules/reading/routes.js';
import { contactRoutes } from './modules/contact/routes.js';
import { healthRoutes } from './modules/health/routes.js';
import { workflowRoutes } from './modules/workflow/routes.js';
import { AuthenticatedUser } from '@meos/shared';
export type { AuthenticatedUser };

// 扩展 Fastify 类型
declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser;
  }
}

const server = Fastify({
  logger: true,
});

await server.register(cors, {
  origin: true,
});

await server.register(swagger, {
  openapi: {
    info: {
      title: 'MeOS API',
      description: '人生管理系统 API 文档',
      version: '0.1.0',
    },
    servers: [{ url: 'http://localhost:3001' }],
  },
});

await server.register(swaggerUi, {
  routePrefix: '/docs',
});

await server.register(jwt, {
  secret: process.env.JWT_SECRET || 'meos-super-secret-key-change-in-production',
});

const isDev = process.env.NODE_ENV === 'development';
server.decorate('authenticate', async function (request, reply) {
  if (isDev) {
    request.user = { userId: 'mock-user-1' };
    return;
  }
  try {
    await request.jwtVerify();
  } catch (_err) {
    return reply.code(401).send({ error: '认证失败' });
  }
});

// 全局错误处理
server.setErrorHandler((error, _request, reply) => {
  server.log.error(error);
  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500 ? '服务器内部错误' : (error.message || '请求处理失败');
  reply.code(statusCode).send({ error: message });
});

server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// 方向 (Direction)
server.register(visionRoutes, { prefix: '/api/visions' });
server.register(domainRoutes, { prefix: '/api/domains' });
server.register(goalRoutes, { prefix: '/api/goals' });
server.register(mindsetRoutes, { prefix: '/api/mindsets' });
server.register(balanceWheelRoutes, { prefix: '/api/balance-wheel' });
server.register(workflowRoutes, { prefix: '/api/workflows' });

// 行动 (Action)
server.register(todoRoutes, { prefix: '/api/todos' });
server.register(habitRoutes, { prefix: '/api/habits' });

// 认知 (Cognition)
server.register(topicRoutes, { prefix: '/api/topics' });
server.register(insightRoutes, { prefix: '/api/insights' });
server.register(readingRoutes, { prefix: '/api/reading' });

// 反思 (Reflection)
server.register(reflectionRoutes, { prefix: '/api/reflections' });
server.register(reviewRoutes, { prefix: '/api/reviews' });

// 资源 (Resources)
server.register(subscriptionRoutes, { prefix: '/api/subscriptions' });
server.register(contactRoutes, { prefix: '/api/contacts' });
server.register(healthRoutes, { prefix: '/api/health' });

// 认证
server.register(authRoutes, { prefix: '/api/auth' });

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
