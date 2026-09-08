import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X,
  ExternalLink 
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: ToastAction;
  icon?: React.ReactNode;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
  action?: ToastAction;
  createdAt: number;
  icon?: React.ReactNode;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  show: (type: ToastType, title: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  success: (title: string, options?: ToastOptions) => string;
  error: (title: string, options?: ToastOptions) => string;
  warning: (title: string, options?: ToastOptions) => string;
  info: (title: string, options?: ToastOptions) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Global bridge for triggering toasts outside React component trees
type ToastListener = (toast: ToastItem) => void;
type DismissListener = (id: string) => void;

const globalListeners = new Set<ToastListener>();
const globalDismissListeners = new Set<DismissListener>();

export const toast = {
  success: (title: string, options?: ToastOptions) => emitGlobalToast('success', title, options),
  error: (title: string, options?: ToastOptions) => emitGlobalToast('error', title, options),
  warning: (title: string, options?: ToastOptions) => emitGlobalToast('warning', title, options),
  info: (title: string, options?: ToastOptions) => emitGlobalToast('info', title, options),
  dismiss: (id: string) => {
    globalDismissListeners.forEach((fn) => fn(id));
  }
};

function emitGlobalToast(type: ToastType, title: string, options?: ToastOptions): string {
  const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const item: ToastItem = {
    id,
    type,
    title,
    description: options?.description,
    duration: options?.duration ?? (type === 'error' ? 5500 : 4200),
    action: options?.action,
    icon: options?.icon,
    createdAt: Date.now()
  };
  globalListeners.forEach((fn) => fn(item));
  return id;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const show = useCallback((type: ToastType, title: string, options?: ToastOptions): string => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = {
      id,
      type,
      title,
      description: options?.description,
      duration: options?.duration ?? (type === 'error' ? 5500 : 4200),
      action: options?.action,
      icon: options?.icon,
      createdAt: Date.now()
    };
    setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 visible
    return id;
  }, []);

  const success = useCallback((title: string, options?: ToastOptions) => show('success', title, options), [show]);
  const error = useCallback((title: string, options?: ToastOptions) => show('error', title, options), [show]);
  const warning = useCallback((title: string, options?: ToastOptions) => show('warning', title, options), [show]);
  const info = useCallback((title: string, options?: ToastOptions) => show('info', title, options), [show]);

  // Connect global listeners
  useEffect(() => {
    const handleGlobal = (t: ToastItem) => {
      setToasts((prev) => [...prev.slice(-4), t]);
    };
    const handleDismiss = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    globalListeners.add(handleGlobal);
    globalDismissListeners.add(handleDismiss);
    return () => {
      globalListeners.delete(handleGlobal);
      globalDismissListeners.delete(handleDismiss);
    };
  }, []);

  const contextValue: ToastContextValue = {
    toasts,
    show,
    dismiss,
    dismissAll,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return fallback wrapper around global methods so calling useToast() never throws
    return {
      toasts: [],
      show: emitGlobalToast,
      dismiss: toast.dismiss,
      dismissAll: () => {},
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info
    };
  }
  return ctx;
};

// Individual Toast Notification Component with auto-dismiss countdown bar & pause on hover
interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast: item, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(item.duration);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    if (item.duration <= 0) return;

    const interval = setInterval(() => {
      if (!isPaused) {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        setRemainingTime((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            clearInterval(interval);
            onDismiss(item.id);
            return 0;
          }
          return next;
        });
      }
      lastTickRef.current = Date.now();
    }, 50);

    return () => clearInterval(interval);
  }, [item.id, item.duration, isPaused, onDismiss]);

  const progressPercent = item.duration > 0 
    ? Math.max(0, Math.min(100, (remainingTime / item.duration) * 100))
    : 100;

  // Icon & Theme Styling based on type
  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
      accentBar: 'bg-emerald-500',
      border: 'border-emerald-200/90 dark:border-emerald-800/80',
      bgGlow: 'shadow-[0_8px_30px_rgb(16,185,129,0.15)]',
      badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
      badgeText: 'Sucesso'
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
      accentBar: 'bg-rose-500',
      border: 'border-rose-200/90 dark:border-rose-800/80',
      bgGlow: 'shadow-[0_8px_30px_rgb(244,63,94,0.15)]',
      badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
      badgeText: 'Atenção / Erro'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
      accentBar: 'bg-amber-500',
      border: 'border-amber-200/90 dark:border-amber-800/80',
      bgGlow: 'shadow-[0_8px_30px_rgb(245,158,11,0.15)]',
      badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
      badgeText: 'Aviso'
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
      accentBar: 'bg-blue-500',
      border: 'border-blue-200/90 dark:border-blue-800/80',
      bgGlow: 'shadow-[0_8px_30px_rgb(59,130,246,0.15)]',
      badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
      badgeText: 'Informação'
    }
  }[item.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={() => {
        setIsPaused(true);
        lastTickRef.current = Date.now();
      }}
      onMouseLeave={() => {
        setIsPaused(false);
        lastTickRef.current = Date.now();
      }}
      className={`relative w-full max-w-sm rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border ${config.border} ${config.bgGlow} overflow-hidden transition-all duration-300 ease-out hover:scale-[1.01] pointer-events-auto p-4 flex flex-col gap-2`}
      style={{ animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className="flex items-start gap-3">
        {item.icon || config.icon}

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {item.title}
            </h4>
            <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full uppercase tracking-wider ${config.badgeBg}`}>
              {config.badgeText}
            </span>
          </div>

          {item.description && (
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed break-words font-medium">
              {item.description}
            </p>
          )}

          {item.action && (
            <button
              onClick={() => {
                item.action?.onClick();
                onDismiss(item.id);
              }}
              className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>{item.action.label}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          onClick={() => onDismiss(item.id)}
          aria-label="Fechar notificação"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Countdown Progress Bar */}
      {item.duration > 0 && (
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
          <div
            className={`h-full ${config.accentBar} transition-all duration-75 ease-linear rounded-full`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Container fixed at corner of the screen
interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notificações do sistema"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col-reverse gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      <style>{`
        @keyframes toastSlideIn {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      {toasts.map((item) => (
        <ToastCard key={item.id} toast={item} onDismiss={onDismiss} />
      ))}
    </aside>
  );
};
