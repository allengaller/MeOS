import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

const DEFAULT_DOMAINS = [
  { identifier: 'Career', name: '职业发展', icon: '💼', order: 1 },
  { identifier: 'Health', name: '身心健康', icon: '💪', order: 2 },
  { identifier: 'Family', name: '家庭关系', icon: '👨‍👩‍👧‍👦', order: 3 },
  { identifier: 'Finance', name: '财务状况', icon: '💰', order: 4 },
  { identifier: 'Learning', name: '学习成长', icon: '📚', order: 5 },
  { identifier: 'Social', name: '社交人际', icon: '🤝', order: 6 },
  { identifier: 'Leisure', name: '休闲娱乐', icon: '🎮', order: 7 },
  { identifier: 'Spirituality', name: '精神世界', icon: '🧘', order: 8 },
];

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  };
  token: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('邮箱已被注册');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    await prisma.domain.createMany({
      data: DEFAULT_DOMAINS.map((domain) => ({
        ...domain,
        userId: user.id,
      })),
    });

    return { user, token: '' };
  }

  async login(input: LoginInput, jwtSign: (payload: { userId: string }) => string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('邮箱或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error('邮箱或密码错误');
    }

    const token = jwtSign({ userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }
}

export const authService = new AuthService();