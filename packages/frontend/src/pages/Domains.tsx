import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Domains() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">领域管理</h1>
        <p className="text-gray-600">管理你关注的生活领域，调整重要性权重</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {domains.map((domain) => (
          <div key={domain.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{domain.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{domain.name}</h3>
                  <p className="text-sm text-gray-500">{domain.identifier}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">权重</p>
                <p className="text-2xl font-bold text-primary-600">{domain.weight}</p>
              </div>
            </div>
            {domain.description && (
              <p className="text-sm text-gray-600">{domain.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
