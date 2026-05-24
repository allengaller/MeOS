export default function Insights() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-slate-900 tracking-tight">洞察笔记</h1>
        <p className="text-sm text-slate-400 mt-1">记录灵感、困惑、顿悟和重要思考</p>
      </div>

      <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-sm text-slate-500 mb-1">洞察笔记功能开发中</p>
        <p className="text-xs text-slate-400">即将推出，敬请期待</p>
      </div>
    </div>
  );
}
