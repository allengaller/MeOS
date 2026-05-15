import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon ? (
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
          {icon}
        </div>
      ) : (
        <Inbox size={40} strokeWidth={1} className="text-slate-300 mb-4" />
      )}
      <h3 className="text-sm font-medium text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}