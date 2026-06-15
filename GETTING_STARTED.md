# MeOS 启动指南

## 1. 安装依赖

```bash
pnpm install
```

## 2. 后端初始化

```bash
cd packages/api

# 生成 Prisma 客户端
pnpm db:generate

# 初始化数据库（基于 schema 自动建表）
pnpm db:push

# 可选：填充示例数据
pnpm db:seed

# 启动后端服务
pnpm dev
```

后端将运行在 http://localhost:3001

## 3. 前端启动

```bash
cd apps/web

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
3. 系统会自动初始化 8 个默认生活领域
4. 开始你的人生管理之旅！

## 常见问题

### 数据库表不存在

如果注册时报错 "The table `main.User` does not exist"，说明数据库尚未初始化：

```bash
cd packages/api
pnpm db:push
```

### 开发环境跳过认证

在开发模式下，API 会自动使用 mock 用户，便于快速调试。

## 主要功能

- **仪表盘**: 查看整体生活状态概览
- **领域管理**: 管理 8 个生活领域（职业、健康、家庭、财务、学习、社交、休闲、精神）
- **生活平衡轮**: 为各领域打分，可视化生活平衡状态
- **目标与关键结果**: 设定目标并跟踪关键结果进度
- **待办与习惯**: 管理每日行动与习惯打卡
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
