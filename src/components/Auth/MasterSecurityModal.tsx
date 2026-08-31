import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Lock,
  X,
  AlertCircle,
  CheckCircle2,
  Building2,
  ArrowRight
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

interface MasterSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: () => void;
}

export const MasterSecurityModal: React.FC<MasterSecurityModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin
}) => {
  const { setSession } = useAuth();
  const [masterPassword, setMasterPassword] = useState('');
  const [targetTenantId, setTargetTenantId] = useState('tenant_main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.loginWithMasterPassword(masterPassword, targetTenantId);
      if (res.success && res.token && res.user && res.tenant) {
        setSession(res.token, res.user, res.tenant);
        if (onSuccessLogin) onSuccessLogin();
        onClose();
      } else {
        setError(res.error || 'Senha Master incorreta.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar ao servidor de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Acesso Master Root</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acesso de emergência exclusivo para o Administrador Master
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Chave de Desbloqueio Global</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              A Senha Master concede privilégios de Super Administrador em qualquer workspace e ultrapassa bloqueios de emergência.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleMasterLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Senha Master de Root
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="Digite a Senha Master..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 pl-9 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  required
                  autoFocus
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Workspace / Tenant Alvo (Opcional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={targetTenantId}
                  onChange={(e) => setTargetTenantId(e.target.value)}
                  placeholder="tenant_main ou slug da empresa"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 pl-9 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Validando Chave Master...' : 'Desbloquear & Acessar Sistema'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 font-mono">
            Audit Trail Ativo • Todas as ações via Senha Master são registradas
          </span>
        </div>
      </div>
    </div>
  );
};
