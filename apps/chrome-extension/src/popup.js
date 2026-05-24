// MeOS Chrome Extension - Popup Script

document.addEventListener('DOMContentLoaded', () => {
  const statsContainer = document.getElementById('stats');
  const openBtn = document.getElementById('open-meos');
  const quickAddBtn = document.getElementById('quick-add');

  // Default stats
  let stats = {
    todosToday: 0,
    goalsActive: 0,
    reflectionStreak: 0
  };

  // Load stats from storage
  chrome.storage.local.get(['meos_stats'], (result) => {
    if (result.meos_stats) {
      stats = result.meos_stats;
      renderStats();
    }
  });

  function renderStats() {
    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${stats.todosToday}</div>
        <div class="stat-label">今日待办</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.goalsActive}</div>
        <div class="stat-label">进行中目标</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.reflectionStreak}</div>
        <div class="stat-label">反思连续天数</div>
      </div>
    `;
  }

  openBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
  });

  quickAddBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173/action?new=todo' });
  });
});