interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({ label, error, required, children, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}