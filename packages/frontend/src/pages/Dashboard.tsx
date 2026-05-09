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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-slate-900 tracking-tight">人生仪表盘</h1>
        <p className="text-sm text-slate-400 mt-1">欢迎回来，让我们一起梳理生活的方方面面</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">活跃领域</p>
          <p className="text-3xl font-light text-slate-900">{domains.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">本周反思</p>
          <p className="text-3xl font-light text-slate-900">0</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">平衡指数</p>
          <p className="text-3xl font-light text-slate-900">--</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-slate-50">
          <h2 className="text-sm font-medium text-slate-900">我的生活领域</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="group flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all cursor-pointer"
              >
                <span className="text-2xl">{domain.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{domain.name}</p>
                  <p className="text-xs text-slate-400">权重 {domain.weight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 p-5">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">今日建议</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="text-slate-300 mt-0.5">·</span>
            去「平衡轮」为各领域打分，了解当前生活状态
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="text-slate-300 mt-0.5">·</span>
            写一篇「每日反思」，记录今天的收获与思考
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600">
            <span className="text-slate-300 mt-0.5">·</span>
            查看「领域管理」，调整各领域的权重和描述
          </li>
        </ul>
      </div>
    </div>
  );
}
