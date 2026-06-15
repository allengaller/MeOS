/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@meos.app' },
    update: {},
    create: {
      email: 'demo@meos.app',
      password: hashedPassword,
      name: 'Demo User',
    },
  });
  console.log(`✅ Created user: ${user.email}`);

  // Create default domains
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

  for (const domain of defaultDomains) {
    await prisma.domain.upsert({
      where: {
        userId_identifier: { userId: user.id, identifier: domain.identifier },
      },
      update: {},
      create: { ...domain, userId: user.id },
    });
  }
  console.log('✅ Created 8 default domains');

  // Create sample goal
  const careerDomain = await prisma.domain.findFirst({
    where: { userId: user.id, identifier: 'Career' },
  });

  if (careerDomain) {
    await prisma.goal.upsert({
      where: { id: 'seed-goal-1' },
      update: {},
      create: {
        id: 'seed-goal-1',
        userId: user.id,
        domainId: careerDomain.id,
        title: '完成项目架构设计',
        description: '设计 MeOS 系统的整体架构',
        status: 'active',
        priority: 'high',
        order: 1,
      },
    });
    console.log('✅ Created sample goal');
  }

  // Create sample todo
  await prisma.todo.upsert({
    where: { id: 'seed-todo-1' },
    update: {},
    create: {
      id: 'seed-todo-1',
      userId: user.id,
      title: '编写技术文档',
      description: '整理系统设计文档',
      status: 'todo',
      priority: 'medium',
      source: 'manual',
      order: 1,
    },
  });
  console.log('✅ Created sample todo');

  // Create sample habit
  await prisma.habit.upsert({
    where: { id: 'seed-habit-1' },
    update: {},
    create: {
      id: 'seed-habit-1',
      userId: user.id,
      title: '每日阅读',
      description: '每天阅读 30 分钟',
      frequency: 'daily',
      targetPerWeek: 7,
      isActive: true,
      order: 1,
    },
  });
  console.log('✅ Created sample habit');

  // Create sample subscription
  await prisma.subscription.upsert({
    where: { id: 'seed-sub-1' },
    update: {},
    create: {
      id: 'seed-sub-1',
      userId: user.id,
      name: 'GitHub Pro',
      provider: 'GitHub',
      billingCycle: 'monthly',
      costPerCycle: 4,
      currency: 'USD',
      startDate: new Date().toISOString(),
      isActive: true,
      autoRenew: true,
    },
  });
  console.log('✅ Created sample subscription');

  // Create sample reflection
  await prisma.reflection.upsert({
    where: { id: 'seed-reflection-1' },
    update: {},
    create: {
      id: 'seed-reflection-1',
      userId: user.id,
      date: new Date(),
      celebrations: '["完成了重要功能开发", "获得了用户反馈"]',
      improvements: '["需要提高代码质量", "减少会议时间"]',
      tomorrow: '继续开发核心功能',
      mood: 'good',
    },
  });
  console.log('✅ Created sample reflection');

  console.log('\n🎉 Database seed completed!');
  console.log('\n📋 Demo credentials:');
  console.log('   Email: demo@meos.app');
  console.log('   Password: demo123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });