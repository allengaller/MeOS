import {
  Briefcase, HeartPulse, Home, Wallet, BookOpen, UsersRound,
  Gamepad2, Sparkles, Compass, Target, Rocket, Lightbulb,
  Music, Palette, Coffee, Moon, Sun, Flower2, type LucideProps,
} from 'lucide-react';

export interface DomainIconConfig {
  key: string;
  label: string;
  Icon: React.FC<LucideProps>;
  color: string;
  bg: string;
  gradient: string;
}

export const DOMAIN_ICON_PRESETS: DomainIconConfig[] = [
  {
    key: 'career',
    label: '职业发展',
    Icon: Briefcase,
    color: '#4F46E5',
    bg: 'rgba(79, 70, 229, 0.08)',
    gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  },
  {
    key: 'health',
    label: '身心健康',
    Icon: HeartPulse,
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.08)',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  },
  {
    key: 'family',
    label: '家庭关系',
    Icon: Home,
    color: '#F43F5E',
    bg: 'rgba(244, 63, 94, 0.08)',
    gradient: 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)',
  },
  {
    key: 'finance',
    label: '财务状况',
    Icon: Wallet,
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.08)',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  },
  {
    key: 'learning',
    label: '学习成长',
    Icon: BookOpen,
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.08)',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  },
  {
    key: 'social',
    label: '社交人际',
    Icon: UsersRound,
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.08)',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  },
  {
    key: 'leisure',
    label: '休闲娱乐',
    Icon: Gamepad2,
    color: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.08)',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
  },
  {
    key: 'spiritual',
    label: '精神世界',
    Icon: Sparkles,
    color: '#06B6D4',
    bg: 'rgba(6, 182, 212, 0.08)',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
  },
  {
    key: 'goal',
    label: '目标',
    Icon: Target,
    color: '#6366F1',
    bg: 'rgba(99, 102, 241, 0.08)',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
  },
  {
    key: 'rocket',
    label: '进取',
    Icon: Rocket,
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.08)',
    gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
  },
  {
    key: 'idea',
    label: '创意',
    Icon: Lightbulb,
    color: '#EAB308',
    bg: 'rgba(234, 179, 8, 0.08)',
    gradient: 'linear-gradient(135deg, #EAB308 0%, #FDE047 100%)',
  },
  {
    key: 'music',
    label: '音乐',
    Icon: Music,
    color: '#D946EF',
    bg: 'rgba(217, 70, 239, 0.08)',
    gradient: 'linear-gradient(135deg, #D946EF 0%, #E879F9 100%)',
  },
  {
    key: 'art',
    label: '艺术',
    Icon: Palette,
    color: '#14B8A6',
    bg: 'rgba(20, 184, 166, 0.08)',
    gradient: 'linear-gradient(135deg, #14B8A6 0%, #2DD4BF 100%)',
  },
  {
    key: 'coffee',
    label: '生活',
    Icon: Coffee,
    color: '#A16207',
    bg: 'rgba(161, 98, 7, 0.08)',
    gradient: 'linear-gradient(135deg, #A16207 0%, #CA8A04 100%)',
  },
  {
    key: 'moon',
    label: '宁静',
    Icon: Moon,
    color: '#475569',
    bg: 'rgba(71, 85, 105, 0.08)',
    gradient: 'linear-gradient(135deg, #475569 0%, #64748B 100%)',
  },
  {
    key: 'sun',
    label: '活力',
    Icon: Sun,
    color: '#EA580C',
    bg: 'rgba(234, 88, 12, 0.08)',
    gradient: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
  },
  {
    key: 'flower',
    label: '自然',
    Icon: Flower2,
    color: '#16A34A',
    bg: 'rgba(22, 163, 74, 0.08)',
    gradient: 'linear-gradient(135deg, #16A34A 0%, #4ADE80 100%)',
  },
  {
    key: 'compass',
    label: '方向',
    Icon: Compass,
    color: '#0891B2',
    bg: 'rgba(8, 145, 178, 0.08)',
    gradient: 'linear-gradient(135deg, #0891B2 0%, #22D3EE 100%)',
  },
];

export function findDomainIconConfig(iconKey: string, domainName?: string): DomainIconConfig | undefined {
  const byKey = DOMAIN_ICON_PRESETS.find((p) => p.key === iconKey);
  if (byKey) return byKey;

  const byName = DOMAIN_ICON_PRESETS.find(
    (p) => domainName && p.label === domainName.trim()
  );
  if (byName) return byName;

  return undefined;
}

interface DomainIconProps {
  icon: string;
  domainName?: string;
  size?: number;
  className?: string;
  variant?: 'badge' | 'plain' | 'circle';
}

export default function DomainIcon({
  icon,
  domainName,
  size = 40,
  className = '',
  variant = 'badge',
}: DomainIconProps) {
  const config = findDomainIconConfig(icon, domainName);

  if (!config) {
    return (
      <span
        className={`inline-flex items-center justify-center ${className}`}
        style={{ fontSize: size * 0.6 }}
      >
        {icon}
      </span>
    );
  }

  const { Icon, color, gradient } = config;
  const iconSize = Math.round(size * 0.45);

  if (variant === 'plain') {
    return (
      <span className={`inline-flex items-center justify-center ${className}`} style={{ color }}>
        <Icon size={iconSize} strokeWidth={1.8} />
      </span>
    );
  }

  if (variant === 'circle') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full ${className}`}
        style={{
          width: size,
          height: size,
          background: gradient,
          boxShadow: `0 4px 12px ${color}25`,
        }}
      >
        <Icon size={iconSize} strokeWidth={1.6} color="#fff" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl ${className}`}
      style={{
        width: size,
        height: size,
        background: gradient,
        boxShadow: `0 4px 14px ${color}30`,
      }}
    >
      <Icon size={iconSize} strokeWidth={1.6} color="#fff" />
    </span>
  );
}

export function DomainIconMini({ icon, domainName, size = 28 }: { icon: string; domainName?: string; size?: number }) {
  const config = findDomainIconConfig(icon, domainName);

  if (!config) {
    return <span style={{ fontSize: size * 0.65 }}>{icon}</span>;
  }

  const { Icon, color, bg } = config;
  const iconSize = Math.round(size * 0.5);

  return (
    <span
      className="inline-flex items-center justify-center rounded-lg"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color,
      }}
    >
      <Icon size={iconSize} strokeWidth={1.8} />
    </span>
  );
}
