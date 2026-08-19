import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';

const ToastContext = createContext(null);
const TOAST_LIFETIME = 3200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((message, type = 'info') => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-3), { id, message, type }]);
    setTimeout(() => dismiss(id), TOAST_LIFETIME);
  }, [dismiss]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    error: <XCircle className="h-5 w-5 text-brand-500" />,
    info: <Info className="h-5 w-5 text-sky-400" />,
  };

  return (
    <ToastContext.Provider value={{ toast: push, success: (m) => push(m, 'success'), error: (m) => push(m, 'error'), info: (m) => push(m, 'info') }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-lg animate-pop dark:border-neutral-700 dark:bg-neutral-800"
            role="status"
          >
            {icons[t.type] || icons.info}
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{t.message}</span>
            <button
              className="ml-auto text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}