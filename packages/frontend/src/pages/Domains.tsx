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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-slate-900 tracking-tight">领域管理</h1>
        <p className="text-sm text-slate-400 mt-1">管理你关注的生活领域，调整重要性权重</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {domains.map((domain) => (
          <div
            key={domain.id}
            className="bg-white rounded-xl border border-slate-100 p-5 group hover:border-slate-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{domain.icon}</span>
                <div>
                  <h3 className="text-base font-medium text-slate-900">{domain.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{domain.identifier}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">权重</p>
                <p className="text-2xl font-light text-slate-900 mt-0.5">{domain.weight}</p>
              </div>
            </div>
            {domain.description && (
              <p className="mt-3 text-sm text-slate-500 pl-1">{domain.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
