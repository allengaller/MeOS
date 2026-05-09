export default function Reflection() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-slate-900 tracking-tight">每日反思</h1>
        <p className="text-sm text-slate-400 mt-1">记录今天的收获、思考和明日计划</p>
      </div>

      <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <p className="text-sm text-slate-500 mb-1">每日反思功能开发中</p>
        <p className="text-xs text-slate-400">即将推出，敬请期待</p>
      </div>
    </div>
  );
}
