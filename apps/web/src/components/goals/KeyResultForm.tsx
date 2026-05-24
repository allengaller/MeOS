interface KeyResultFormProps {
  form: {
    title: string;
    targetValue: string;
    unit: string;
    order: string;
  };
  onChange: (form: { title: string; targetValue: string; unit: string; order: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function KeyResultForm({
  form,
  onChange,
  onSubmit,
  onCancel,
}: KeyResultFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="text"
        value={form.title}
        onChange={(e) => onChange({ ...form, title: e.target.value })}
        placeholder="关键结果名称"
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-300"
        required
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          value={form.targetValue}
          onChange={(e) => onChange({ ...form, targetValue: e.target.value })}
          placeholder="目标值"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-300"
          required
        />
        <input
          type="text"
          value={form.unit}
          onChange={(e) => onChange({ ...form, unit: e.target.value })}
          placeholder="单位"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-300"
          required
        />
        <input
          type="number"
          value={form.order}
          onChange={(e) => onChange({ ...form, order: e.target.value })}
          placeholder="排序"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-300"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          添加
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
        >
          取消
        </button>
      </div>
    </form>
  );
}