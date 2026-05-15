import { useState, useEffect, useCallback, useRef } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success';
}

let addToastFn: ((message: string, type?: 'error' | 'success') => void) | null = null;

export function toast(message: string, type: 'error' | 'success' = 'error') {
  addToastFn?.(message, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const addToast = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
    timersRef.current.add(timer);
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2 ${
            t.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
