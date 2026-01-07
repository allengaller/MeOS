import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Dashboard() {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const response = await api.get('/domains');
      setDomains(response.data.domains);
    } catch (error) {
      console.error('加载领域失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">人生仪表盘</h1>
        <p className="text-gray-600">欢迎回来，让我们一起梳理生活的方方面面</p>
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">活跃领域</p>
              <p className="text-3xl font-bold text-gray-900">{domains.length}</p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">本周反思</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <span className="text-3xl">📈</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">平衡指数</p>
              <p className="text-3xl font-bold text-gray-900">--</p>
            </div>
            <span className="text-3xl">⚖️</span>
          </div>
        </div>
      </div>

      {/* 领域概览 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">我的生活领域</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl">{domain.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{domain.name}</p>
                  <p className="text-xs text-gray-500">权重: {domain.weight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">今日建议</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>💡 去「平衡轮」为各领域打分，了解当前生活状态</li>
          <li>📝 写一篇「每日反思」，记录今天的收获与思考</li>
          <li>🎯 查看「领域管理」，调整各领域的权重和描述</li>
        </ul>
      </div>
    </div>
  );
}
