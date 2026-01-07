import { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import api from '../lib/api';

export default function BalanceWheel() {
  const [domains, setDomains] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const response = await api.get('/domains');
      setDomains(response.data.domains);
      const initialScores: Record<string, number> = {};
      response.data.domains.forEach((d: any) => {
        initialScores[d.id] = 5;
      });
      setScores(initialScores);
    } catch (error) {
      console.error('加载领域失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const scoreData = Object.entries(scores).map(([domainId, score]) => ({
        domainId,
        score,
      }));
      await api.post('/balance-wheel/scores', { scores: scoreData });
      alert('评分已保存！');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = domains.map((domain) => ({
    domain: domain.name,
    score: scores[domain.id] || 0,
  }));

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">生活平衡轮</h1>
        <p className="text-gray-600">为各个生活领域打分（1-10分），可视化你的生活平衡状态</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 雷达图 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">平衡轮可视化</h2>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="domain" />
              <PolarRadiusAxis domain={[0, 10]} />
              <Radar name="当前评分" dataKey="score" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 评分表单 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">领域评分</h2>
          <div className="space-y-4">
            {domains.map((domain) => (
              <div key={domain.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-2xl">{domain.icon}</span>
                  <span className="font-medium text-gray-900">{domain.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={scores[domain.id] || 5}
                    onChange={(e) => setScores({ ...scores, [domain.id]: parseInt(e.target.value) })}
                    className="w-32"
                  />
                  <span className="text-xl font-bold text-primary-600 w-8 text-center">
                    {scores[domain.id] || 5}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {submitting ? '保存中...' : '保存评分'}
          </button>
        </div>
      </div>
    </div>
  );
}
