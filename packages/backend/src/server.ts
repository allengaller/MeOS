import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authRoutes } from './modules/auth/routes.js';
import { domainRoutes } from './modules/domain/routes.js';
import { balanceWheelRoutes } from './modules/balance-wheel/routes.js';
import { reflectionRoutes } from './modules/reflection/routes.js';
import { reviewRoutes } from './modules/review/routes.js';
import { insightRoutes } from './modules/insight/routes.js';

const server = Fastify({
  logger: true,
});

// 注册插件
await server.register(cors, {
  origin: true, // 开发环境允许所有来源
});

await server.register(jwt, {
  secret: process.env.JWT_SECRET || 'meos-super-secret-key-change-in-production',
});

// JWT验证装饰器
server.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// 健康检查
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// 注册路由
server.register(authRoutes, { prefix: '/api/auth' });
server.register(domainRoutes, { prefix: '/api/domains' });
server.register(balanceWheelRoutes, { prefix: '/api/balance-wheel' });
server.register(reflectionRoutes, { prefix: '/api/reflections' });
server.register(reviewRoutes, { prefix: '/api/reviews' });
server.register(insightRoutes, { prefix: '/api/insights' });

// 启动服务器
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
