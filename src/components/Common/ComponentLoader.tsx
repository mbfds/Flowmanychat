import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { SkeletonScreen, SkeletonVariant } from './SkeletonScreen';

export interface ComponentLoaderProps {
  label?: string;
  variant?: SkeletonVariant;
  progress?: number; // Real percentage: 0 to 100
  statusMessage?: string;
  showProgressBar?: boolean;
  promise?: Promise<any> | null;
  onComplete?: () => void;
  className?: string;
}

export const ComponentLoader: React.FC<ComponentLoaderProps> = ({ 
  label = 'Carregando serviços...',
  variant = 'generic',
  progress: explicitProgress,
  statusMessage,
  showProgressBar,
  promise,
  onComplete,
  className = ''
}) => {
  const [promiseProgress, setPromiseProgress] = useState<number>(0);
  const [promiseStatus, setPromiseStatus] = useState<string>('Iniciando carregamento...');
  const [isDone, setIsDone] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // If a promise is passed, track its lifecycle and interpolate progress
  useEffect(() => {
    if (!promise) return;

    let isMounted = true;
    setIsDone(false);
    setHasError(false);
    setPromiseProgress(10);
    setPromiseStatus('Conectando aos serviços de dados...');

    // Progress simulation while waiting for the promise
    const timer1 = setTimeout(() => {
      if (isMounted) {
        setPromiseProgress(35);
        setPromiseStatus('Verificando conectividade e latência...');
      }
    }, 150);

    const timer2 = setTimeout(() => {
      if (isMounted) {
        setPromiseProgress(65);
        setPromiseStatus('Sincronizando fluxos e automações...');
      }
    }, 400);

    const timer3 = setTimeout(() => {
      if (isMounted) {
        setPromiseProgress(85);
        setPromiseStatus('Carregando base de dados...');
      }
    }, 800);

    promise
      .then(() => {
        if (!isMounted) return;
        setPromiseProgress(100);
        setPromiseStatus('Sincronização concluída com sucesso!');
        setIsDone(true);
        if (onComplete) {
          setTimeout(onComplete, 300);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[ComponentLoader] Falha na promessa de carregamento:', err);
        setHasError(true);
        setPromiseStatus('Falha ao conectar com banco de dados. Operando em modo de contingência.');
        setPromiseProgress(100);
      });

    return () => {
      isMounted = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [promise, onComplete]);

  // Determine active progress value: explicit progress prop takes precedence if passed
  const activeProgress = explicitProgress !== undefined 
    ? Math.min(100, Math.max(0, Math.round(explicitProgress)))
    : promiseProgress;

  const isCompleted = activeProgress >= 100 || isDone;

  const shouldDisplayProgressBar = 
    showProgressBar || 
    explicitProgress !== undefined || 
    promise !== undefined && promise !== null;

  const activeStatus = statusMessage || promiseStatus || label;

  return (
    <div className={`relative flex-1 w-full h-full flex flex-col overflow-hidden ${className}`}>
      {/* Background Skeleton Canvas corresponding to the active view */}
      <div className="flex-1 w-full h-full overflow-hidden opacity-90">
        <SkeletonScreen variant={variant} />
      </div>

      {/* Floating Central Real Progress Bar Card */}
      {shouldDisplayProgressBar ? (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-white/40 backdrop-blur-xs z-20 pointer-events-none">
          <div 
            className="w-full max-w-md bg-white rounded-2xl border border-gray-200/90 shadow-xl p-6 pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200"
            role="progressbar"
            aria-valuenow={activeProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
          >
            {/* Header with status icon and title */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isCompleted && !hasError
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : hasError
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}>
                  {isCompleted && !hasError ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : hasError ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-tight flex items-center gap-1.5">
                    {label}
                    {activeProgress === 100 && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Pronto
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {activeStatus}
                  </p>
                </div>
              </div>

              {/* Real Percentage Display */}
              <div className="text-right">
                <span className="text-lg font-mono font-black text-gray-900">
                  {activeProgress}%
                </span>
              </div>
            </div>

            {/* Visual Real Progress Bar Track */}
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5 relative shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-300 ease-out relative ${
                  isCompleted && !hasError
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : hasError
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500'
                }`}
                style={{ width: `${activeProgress}%` }}
              >
                {/* Subtle animated light highlight effect */}
                {!isCompleted && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
              </div>
            </div>

            {/* Footer Metadata / Step Badges */}
            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5 font-medium">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>MongoDB Pooler & Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={activeProgress >= 25 ? 'text-blue-600 font-semibold' : 'text-gray-400'}>
                  1. Conexão
                </span>
                <span>•</span>
                <span className={activeProgress >= 70 ? 'text-blue-600 font-semibold' : 'text-gray-400'}>
                  2. Fluxos
                </span>
                <span>•</span>
                <span className={activeProgress >= 95 ? 'text-blue-600 font-semibold' : 'text-gray-400'}>
                  3. CRM
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Subtle Badge Fallback when no progress bar is requested */
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-gray-200 shadow-md text-xs font-semibold text-gray-700 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>{label}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export { SkeletonScreen };
export type { SkeletonVariant };
