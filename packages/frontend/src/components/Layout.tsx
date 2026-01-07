import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

// 简单图标组件
const Icon = ({ emoji }: { emoji: string }) => <span className="text-base">{emoji}</span>;

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', emoji: '🏠', label: '仪表盘' },
    { path: '/domains', emoji: '🎯', label: '领域管理' },
    { path: '/balance-wheel', emoji: '⚖️', label: '平衡轮' },
    { path: '/reflection', emoji: '📝', label: '每日反思' },
    { path: '/review', emoji: '📖', label: '周期复盘' },
    { path: '/insights', emoji: '💡', label: '洞察笔记' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-primary-600">MeOS</h1>
              <nav className="hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                  >
                    <Icon emoji={item.emoji} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">你好，{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Icon emoji="🚪" />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
