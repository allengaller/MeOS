# MeOS 五维人生管理系统 - 设计文档

## 一、系统概述

MeOS 是一个基于五维模型的个人管理平台，覆盖人生的五个核心维度：

| 维度 | 英文 | 核心问题 | 包含模块 |
|---|---|---|---|
| 方向 | Direction | 我要去哪里 | 愿景、领域、目标、关键结果、心态、平衡轮 |
| 行动 | Action | 我今天做什么 | 待办、习惯、习惯记录 |
| 认知 | Cognition | 我要搞懂什么 | 课题、课题笔记、洞察笔记、阅读清单 |
| 反思 | Reflection | 我做得怎样 | 每日反思、周期复盘 |
| 资源 | Resources | 我用什么做 | 订阅、人脉、健康记录、开发环境 |

### 五维流转关系

```
方向 → 定义 → 行动（目标拆解为待办/习惯）
行动 → 输入 → 反思（完成情况进入日反思）
反思 → 校准 → 方向（复盘更新目标状态）
方向 → 驱动 → 认知（目标触发课题研究）
认知 → 沉淀 → 反思（洞察进入反思素材）
资源 → 支撑 → 全维度（人脉/健康/工具）
```

## 二、导航结构

```
仪表盘 (/)

▸ 方向 (/direction)
    愿景       /direction/vision
    领域       /direction/domains
    目标       /direction/goals
    心态       /direction/mindset
    平衡轮     /direction/balance-wheel

▸ 行动 (/action)
    待办       /action/todos
    习惯       /action/habits

▸ 认知 (/cognition)
    课题       /cognition/topics
    洞察       /cognition/insights
    阅读       /cognition/reading

▸ 反思 (/reflection)
    每日反思   /reflection/daily
    周期复盘   /reflection/review

▸ 资源 (/resources)
    订阅       /resources/subscriptions
    人脉       /resources/contacts
    健康       /resources/health
    开发环境   /resources/dev-environment
```

## 三、数据模型

### Direction（方向）

#### Vision（愿景）[新增]

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String @id | UUID |
| userId | String | 所属用户 |
| content | String | 愿景内容（Markdown） |
| version | Int @default(1) | 版本号 |
| isActive | Boolean @default(true) | 是否当前活跃愿景 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

#### Domain（领域）[已有]

保持不变。

#### Goal（目标）[新增]

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String @id | UUID |
| userId | String | 所属用户 |
| domainId | String | 关联领域 |
| title | String | 目标标题 |
| description | String? | 描述 |
| status | String @default("planned") | planned / active / completed / abandoned |
| priority | String @default("medium") | high / medium / low |
| startDate | DateTime? | 开始日期 |
| endDate | DateTime? | 截止日期 |
| order | Int @default(0) | 排序 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

关联：domain, keyResults[], todos[], habits[], topics[]

#### KeyResult（关键结果）[新增]

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String @id | UUID |
| goalId | String | 关联目标 |
| title | String | 标题 |
| currentValue | Float @default(0) | 当前值 |
| targetValue | Float | 目标值 |
| unit | String | 单位（kg/次/本/%） |
| startDate | DateTime? | 开始日期 |
| endDate | DateTime? | 截止日期 |
| order | Int @default(0) | 排序 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

#### MindsetSlogan（心态格言）[已有，增强]

增加可选 `domainId` 字段，关联到具体领域。

#### BalanceWheelScore（平衡轮）[已有，增强]

可从 Goal 完成率自动推算评分。

### Action（行动）

#### Todo（待办）[新增]

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String @id | UUID |
| userId | String | 所属用户 |
| title | String | 标题 |
| description | String? | 描述 |
| status | String @default("inbox") | inbox / todo / doing / done / cancelled |
| priority | String @default("medium") | urgent / high / medium / low |
| dueDate | DateTime? | 截止日期 |
| goalId | String? | 关联目标 |
| domainId | String? | 关联领域 |
| source | String @default("manual") | manual / reflection / review |
| estimatedMinutes | Int? | 预估时长（分钟） |
| energy | String? | high / medium / low |
| order | Int @default(0) | 排序 |
| completedAt | DateTime? | 完成时间 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

#### Habit（习惯）[新增]

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String @id | UUID |
| userId | String | 所属用户 |
| title | String | 习惯名称 |
| description | String? | 描述 |
| frequency | String @default("daily") | daily / weekly |
| targetPerWeek | Int? | 每周目标次数 |
| goalId | String? | 关联目标 |
| domainId | String? | 关联领域 |
| color | String? | 显示颜色 |
| isActive | Boolean @default(true) | 是否活跃 |
| order | Int @default(0) | 排序 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

#### HabitLog（习惯记录）[新增]

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String @id | UUID |
| habitId | String | 关联习惯 |
| date | DateTime | 打卡日期 |
| note | String? | 备注 |
| createdAt | DateTime | 创建时间 |

约束：@@unique([habitId, date])

### Cognition（认知）

#### Topic（课题）[已有，增强]

- 增加 `goalId` 可选字段，关联目标
- status 枚举增加 `archived` 终态

#### TopicNote（课题笔记）[已有]

保持不变。

#### InsightNote（洞察笔记）[已有，增强]

- 增加 `topicId` 可选字段，关联课题
- 实现 CRUD

#### ReadingItem（阅读清单）[新增]

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String @id | UUID |
| userId | String | 所属用户 |
| title | String | 标题 |
| author | String? | 作者 |
| type | String @default("book") | book / article / video / podcast / course |
| status | String @default("want") | want / reading / done / abandoned |
| url | String? | 链接 |
| note | String? | 笔记/摘要 |
| rating | Int? | 1-5 评分 |
| topicId | String? | 关联课题 |
| startDate | DateTime? | 开始阅读日期 |
| endDate | DateTime? | 完成阅读日期 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### Reflection（反思）

#### Reflection（每日反思）[已有，需实现]

- 记录时自动汇总当日 Todo 完成情况 + Habit 打卡状态
- `tomorrow` 字段可一键生成次日 Todo

#### PeriodicReview（周期复盘）[已有，需实现]

- 自动汇总 Goal 进度变化 + Todo 完成率 + Habit 达标率

### Resources（资源）

#### Subscription / QuotaDefinition / MonthlyUsage / QuotaUsage [已有]

保持不变。

#### Contact（人脉）[新增]

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String @id | UUID |
| userId | String | 所属用户 |
| name | String | 姓名 |
| title | String? | 职位 |
| company | String? | 公司 |
| relation | String? | friend / colleague / mentor / family / other |
| tags | String? | 标签（JSON 数组） |
| notes | String? | 备注 |
| contactFreq | String? | weekly / monthly / quarterly |
| lastContact | DateTime? | 上次联系时间 |
| domainId | String? | 关联领域 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

#### HealthRecord（健康记录）[新增]

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String @id | UUID |
| userId | String | 所属用户 |
| type | String | sleep / exercise / weight / mood / energy / water / custom |
| value | Float | 记录值 |
| unit | String | hours / kg / steps / ml / score |
| note | String? | 备注 |
| recordedAt | DateTime | 记录时间 |
| createdAt | DateTime | 创建时间 |

#### DevEnvironment（开发环境）[已有]

纯前端实现，保持现状。

## 四、跨维度联动

| 联动 | 说明 |
|---|---|
| 反思 → 待办 | 每日反思的"明日计划"一键生成 Todo |
| 待办 → 复盘 | 周期复盘自动汇总本周 Todo 完成情况 |
| 习惯 → 复盘 | 周期复盘自动汇总习惯达标率 |
| 目标 → 待办 | Goal 页面可快速创建关联 Todo |
| 目标 → 习惯 | Goal 页面可创建关联 Habit |
| 目标 → 课题 | Goal 页面可创建关联 Topic |
| 目标 → 复盘 | Review 自动展示 KeyResult 进度变化 |
| 课题 → 洞察 | Topic 详情页直接创建 InsightNote |
| 课题 → 阅读 | Topic 详情页添加相关阅读材料 |
| 平衡轮 → 目标 | 领域下 Goal 平均完成率作为平衡轮自动评分参考 |
| 健康记录 → 反思 | 每日反思自动带入当日睡眠/运动数据 |
| 人脉 → 提醒 | 超过 contactFreq 未联系人脉出现在 Dashboard |

## 五、Dashboard 五维交汇设计

Dashboard 应一屏纵览全局：

```
┌─────────────────────────────────────────────────┐
│  今日概览                    2026年5月10日 周日    │
├────────────────────┬────────────────────────────┤
│  方向               │  行动                      │
│  · 3 个活跃目标     │  今日待办: 2/5 已完成       │
│  · 整体进度 62%     │  ┌─────────────────────┐   │
│  [进度条]           │  │ □ 完成MeOS方案设计   │   │
│                    │  │ ■ 晨跑 30min        │   │
│                    │  │ □ 阅读《原则》ch3    │   │
│                    │  └─────────────────────┘   │
│                    │  习惯: ●●●○● 本周 4/5     │
├────────────────────┼────────────────────────────┤
│  认知               │  反思                      │
│  · 活跃课题 2 个    │  · 昨日已反思 ✓           │
│  · 新洞察 3 条      │  · 本周复盘待完成          │
│  · 阅读中: 《原则》 │  · 连续反思 7 天           │
├────────────────────┴────────────────────────────┤
│  资源                                             │
│  · 本月订阅支出 $128.50                           │
│  · 待联系人: 3 人 (超30天未联系)                    │
│  · 近7天平均睡眠 7.2h                             │
└─────────────────────────────────────────────────┘
```

## 六、技术选型

| 需求 | 选型 | 理由 |
|---|---|---|
| 图表 | recharts | 轻量、React 原生、支持响应式 |
| 日期 | date-fns | 函数式、可 tree-shake |
| 图标 | lucide-react（已有） | 统一风格 |
| 拖拽 | @dnd-kit/core | Todo 状态看板、排序 |
| 后端框架 | Fastify（已有） | 高性能 |
| ORM | Prisma（已有） | 类型安全 |
| 数据库 | SQLite（已有） | 轻量个人使用 |

## 七、实施路线

### Phase 0: 基础设施
- Prisma schema 全量更新（所有新模型）
- 导航重构为五维分组（含展开/折叠）
- 引入 recharts + date-fns
- 数据库 migration

### Phase 1: 方向
- 愿景页（单条编辑，版本历史）
- 领域页增强（展示旗下目标概要）
- 目标 CRUD + KeyResult 进度条
- 心态保持现状
- 平衡轮增强（目标完成率参考）

### Phase 2: 行动
- 待办 CRUD + 状态看板（inbox/todo/doing/done）
- 待办关联目标 + 截止日期
- 习惯 CRUD + 打卡日历视图
- 周视图（聚合 Todo dueDate + Habit 频率）

### Phase 3: 反思
- 每日反思实现（三省吾身 + 开放内容）
- 自动汇总当日 Todo/Habit 数据
- tomorrow → 一键生成 Todo
- 周期复盘实现
- 自动汇总 Goal/Todo/Habit 数据

### Phase 4: 认知
- 课题增强（archived、关联 Goal）
- 洞察笔记实现（关联 Topic）
- 阅读清单 CRUD

### Phase 5: 资源
- 订阅保持现状
- 人脉 CRUD + 联系提醒
- 健康记录 CRUD + 趋势图
- 开发环境保持现状

### Phase 6: Dashboard & 统计
- Dashboard 重构为五维交汇视图
- 统计页面（趋势、完成率、连续天数等）
