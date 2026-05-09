export default function Review() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-slate-900 tracking-tight">周期复盘</h1>
        <p className="text-sm text-slate-400 mt-1">进行每周、每月、每季度的深度复盘</p>
      </div>

      <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-sm text-slate-500 mb-1">周期复盘功能开发中</p>
        <p className="text-xs text-slate-400">即将推出，敬请期待</p>
      </div>
    </div>
  );
}
