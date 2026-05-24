import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

interface QuickStats {
  todosToday: number;
  goalsActive: number;
  reflectionStreak: number;
}

export default function Popup() {
  const [stats, setStats] = useState<QuickStats>({
    todosToday: 0,
    goalsActive: 0,
    reflectionStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stats from chrome storage or use defaults
    chrome.storage.local.get(['meos_stats'], (result) => {
      if (result.meos_stats) {
        setStats(result.meos_stats);
      }
      setLoading(false);
    });
  }, []);

  const openMeOS = () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
  };

  const quickAddTodo = () => {
    chrome.tabs.create({ url: 'http://localhost:5173/action?new=todo' });
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>MeOS</h1>
        <span className="subtitle">人生管理系统</span>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.todosToday}</div>
          <div className="stat-label">今日待办</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.goalsActive}</div>
          <div className="stat-label">进行中目标</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.reflectionStreak}</div>
          <div className="stat-label">反思连续天数</div>
        </div>
      </div>

      <div className="actions">
        <button onClick={openMeOS} className="btn btn-primary">
          打开 MeOS
        </button>
        <button onClick={quickAddTodo} className="btn btn-secondary">
          快速添加待办
        </button>
      </div>

      <footer className="popup-footer">
        <span>v0.1.0</span>
      </footer>

      <style>{`
        .popup-container {
          width: 320px;
          padding: 16px;
          background: #fafafa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .popup-header {
          text-align: center;
          margin-bottom: 16px;
        }
        .popup-header h1 {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }
        .subtitle {
          font-size: 12px;
          color: #666;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #4f46e5;
        }
        .stat-label {
          font-size: 10px;
          color: #888;
          margin-top: 4px;
        }
        .actions {
          display: flex;
          gap: 8px;
        }
        .btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #4f46e5;
          color: white;
        }
        .btn-primary:hover {
          background: #4338ca;
        }
        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
        }
        .btn-secondary:hover {
          background: #d1d5db;
        }
        .popup-footer {
          margin-top: 16px;
          text-align: center;
          font-size: 10px;
          color: #999;
        }
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
      `}</style>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}