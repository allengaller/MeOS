# MeOS - 人生管理系统

一个以"梳理与反思"为核心的人生管理系统，帮助用户从多维度审视生活状态、规划目标方向、沉淀经验智慧。

## 核心价值

- 🎯 **不是任务清单工具，而是生活状态的仪表盘**
- 💭 **不是记录流水账，而是促进深度思考与成长**
- 🛠️ **不是单一方法论，而是方法论工具箱**

## 支持的管理方法论

- **生活平衡轮（Life Balance Wheel）** - 可视化各领域满意度，识别失衡区域
- **OKR 人生版** - 目标驱动的阶段性管理
- **GTD 生活版** - 系统化整理生活事务
- **时间矩阵** - 优化时间精力分配

## 技术栈

### 后端
- Node.js + TypeScript
- Fastify (API框架)
- Prisma (ORM)
- SQLite (本地优先存储)

### 前端
- React 18 + TypeScript
- Vite
- TailwindCSS
- Recharts (数据可视化)
- Zustand (状态管理)

## 项目结构

```
MeOS/
├── packages/
│   ├── backend/          # 后端API服务
│   │   ├── src/
│   │   │   ├── modules/  # 业务模块
│   │   │   ├── prisma/   # 数据库模型
│   │   │   └── server.ts
│   │   └── package.json
│   └── frontend/         # Web前端应用
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   └── stores/
│       └── package.json
└── package.json
```

## 开始使用

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 同时启动前后端
pnpm dev

# 仅启动后端
pnpm backend:dev

# 仅启动前端
pnpm frontend:dev
```

### 构建

```bash
pnpm build
```

## MVP 功能范围（阶段一）

- ✅ 用户注册登录、基础配置
- ✅ 生活领域管理（默认8领域）
- ✅ 生活平衡轮方法论深度实现
- ✅ 基础反思记录（每日反思、周复盘）
- ✅ 简单数据可视化（领域雷达图、时间曲线）
- ✅ Web端完整功能
- 🚧 移动端基础功能（计划中）

## 路线图

- **阶段一（MVP）** - 单一方法论深度实现 ✅
- **阶段二** - 多方法论整合
- **阶段三** - 智能化与生态
- **阶段四** - 持续优化与商业化

## 设计文档

详细架构设计请参考：[设计文档](./.qoder/quests/life-management-architecture.md)

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提Issue。
