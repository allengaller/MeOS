# MeOS 启动指南

## 1. 安装依赖

```bash
pnpm install
```

## 2. 后端初始化

```bash
cd packages/backend

# 生成 Prisma 客户端
pnpm db:generate

# 初始化数据库
pnpm db:push

# 启动后端服务
pnpm dev
```

后端将运行在 http://localhost:3001

## 3. 前端启动

```bash
cd packages/frontend
pnpm dev
```

前端将运行在 http://localhost:3000

## 4. 同时启动前后端

在项目根目录执行：

```bash
pnpm dev
```

## 首次使用

1. 访问 http://localhost:3000
2. 点击"立即注册"创建账号
3. 系统会自动初始化8个默认生活领域
4. 开始你的人生管理之旅！

## 主要功能

- **仪表盘**: 查看整体生活状态概览
- **领域管理**: 管理8个生活领域（职业、健康、家庭、财务、学习、社交、休闲、精神）
- **生活平衡轮**: 为各领域打分，可视化生活平衡状态
- **每日反思**: 记录每日收获与思考
- **周期复盘**: 进行周/月/季/年度深度复盘
- **洞察笔记**: 记录灵感和重要思考

## 技术栈

### 后端
- Node.js + TypeScript
- Fastify (API 框架)
- Prisma (ORM)
- SQLite (数据库)
- JWT (身份认证)

### 前端
- React 18 + TypeScript
- Vite (构建工具)
- TailwindCSS (样式)
- Recharts (图表)
- Zustand (状态管理)
- Axios (HTTP 客户端)
