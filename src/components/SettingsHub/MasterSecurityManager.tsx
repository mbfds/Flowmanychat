import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  Copy,
  Check,
  Activity,
  Server,
  Zap
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export const MasterSecurityManager: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    isConfigured: boolean;
    isLockdownActive: boolean;
    masterAdminEmail: string;
    updatedAt: string;
    hasCustomPassword: boolean;
    totalAuditLogs: number;
  }>({
    isConfigured: true,
    isLockdownActive: false,
    masterAdminEmail: 'admin@manyflow.com',
    updatedAt: new Date().toISOString(),
    hasCustomPassword: false,
    totalAuditLogs: 1
  });

  const [currentMasterPassword, setCurrentMasterPassword] = useState('');
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
  const [masterEmail, setMasterEmail] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [copiedKey, setCopiedKey] = useState(false);

  // Load master status & logs
  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await authService.getMasterStatus();
      if (res.success) {
        setStatus({
          isConfigured: res.isConfigured,
          isLockdownActive: res.isLockdownActive,
          masterAdminEmail: res.masterAdminEmail,
          updatedAt: res.updatedAt,
          hasCustomPassword: res.hasCustomPassword,
          totalAuditLogs: res.totalAuditLogs
        });
        setMasterEmail(res.masterAdminEmail);
      }
      const logsRes = await authService.getMasterLogs();
      if (logsRes.success && logsRes.logs) {
        setAuditLogs(logsRes.logs);
      }
    } catch (err: any) {
      console.error('Error loading master security status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleUpdateMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newMasterPassword.length < 8) {
      setFeedback({ type: 'error', message: 'A nova Senha Master deve ter pelo menos 8 caracteres.' });
      return;
    }

    if (newMasterPassword !== confirmMasterPassword) {
      setFeedback({ type: 'error', message: 'A confirmação de senha não confere com a nova Senha Master.' });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.updateMasterPassword(
        currentMasterPassword,
        newMasterPassword,
        masterEmail || user?.email
      );

      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || 'Senha Master atualizada com sucesso! Somente você possui acesso a esta chave.'
        });
        setCurrentMasterPassword('');
        setNewMasterPassword('');
        setConfirmMasterPassword('');
        loadStatus();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Falha ao atualizar Senha Master.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao processar requisição.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLockdown = async (enable: boolean) => {
    const promptPass = window.prompt(
      `Para ${enable ? 'ATIVAR' : 'DESATIVAR'} o Modo Lockdown Emergencial, informe sua Senha Master:`
    );
    if (!promptPass) return;

    setLoading(true);
    setFeedback(null);
    try {
      const res = await authService.toggleLockdown(enable, promptPass);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || `Modo Lockdown ${enable ? 'ativado' : 'desativado'} com sucesso.`
        });
        loadStatus();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Falha ao alterar Modo Lockdown.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRecoveryInfo = () => {
    const text = `ManyFlow Master Admin Security\nEmail: ${status.masterAdminEmail}\nStatus: ${
      status.isLockdownActive ? 'LOCKDOWN ATIVO' : 'SEGURO / OPERACIONAL'
    }\nAtualizado em: ${new Date(status.updatedAt).toLocaleString('pt-BR')}`;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Controle Central de Segurança & Senha Master
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Somente Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Configure a chave mestra que garante acesso emergencial e isolamento total entre os sistemas dos seus clientes. Nenhuma empresa externa pode acessar dados de outros clientes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadStatus}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            <button
              onClick={handleCopyRecoveryInfo}
              className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copiado!' : 'Copiar Status'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Lockdown Status Card */}
      <div
        className={`rounded-2xl p-5 border shadow-2xs transition-all ${
          status.isLockdownActive
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
            : 'bg-white dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-800 text-[#1A1D21] dark:text-slate-100'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                status.isLockdownActive
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
              }`}
            >
              {status.isLockdownActive ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">
                  {status.isLockdownActive ? '🚨 MODO LOCKDOWN ATIVO (SISTEMA CONGELADO)' : '🛡️ Modo de Proteção Ativa (Operação Normal)'}
                </h4>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    status.isLockdownActive
                      ? 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {status.isLockdownActive ? 'Bloqueado para não-admins' : '100% Protegido'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                {status.isLockdownActive
                  ? 'Apenas o Administrador Master pode fazer login. Todas as sessões de clientes e operadores estão suspensas por segurança.'
                  : 'O isolamento entre workspaces está 100% ativo. Usuários só enxergam dados de suas próprias empresas.'}
              </p>
            </div>
          </div>

          <div>
            {status.isLockdownActive ? (
              <button
                onClick={() => handleToggleLockdown(false)}
                disabled={loading}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Desativar Lockdown</span>
              </button>
            ) : (
              <button
                onClick={() => handleToggleLockdown(true)}
                disabled={loading}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                title="Congela o acesso de todos os clientes em caso de suspeita"
              >
                <Lock className="w-4 h-4" />
                <span>Ativar Modo Lockdown</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Change Master Password & Security Principles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Configure / Change Master Password */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-2xs space-y-4">
          <div className="border-b border-[#E2E8F0] dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-[#1A1D21] dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Configurar Nova Senha Master</span>
            </h4>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Defina uma senha forte que somente você conhece. Ela permite o destravamento do sistema em qualquer situação.
            </p>
          </div>

          <form onSubmit={handleUpdateMasterPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1D21] dark:text-slate-200 mb-1">
                Email do Administrador Master (Root)
              </label>
              <input
                type="email"
                value={masterEmail}
                onChange={(e) => setMasterEmail(e.target.value)}
                placeholder="admin@manyflow.com"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#1A1D21] dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1D21] dark:text-slate-200 mb-1">
                Senha Master Atual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentMasterPassword}
                  onChange={(e) => setCurrentMasterPassword(e.target.value)}
                  placeholder="Informe a Senha Master atual..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#1A1D21] dark:text-white rounded-xl px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                Padrão inicial do sistema: <code>Master@2026#Secure</code>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1A1D21] dark:text-slate-200 mb-1">
                  Nova Senha Master
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newMasterPassword}
                    onChange={(e) => setNewMasterPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#1A1D21] dark:text-white rounded-xl px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D21] dark:text-slate-200 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmMasterPassword}
                  onChange={(e) => setConfirmMasterPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#1A1D21] dark:text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Processando...' : 'Salvar Nova Senha Master'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Info: Security Policies & Audit Checklist */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-2xs space-y-3">
            <h4 className="text-sm font-bold text-[#1A1D21] dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Garantias de Não-Invasão</span>
            </h4>

            <ul className="space-y-2.5 text-xs text-[#64748B] dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Isolamento Multi-Tenant:</strong> Usuários de uma empresa nunca conseguem listar ou consultar contatos, fluxos ou tokens de outra.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Tokens Criptográficos:</strong> Sessões com Bearer Tokens únicos gerados em tempo de login com verificação contínua no servidor.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Assinatura HMAC SHA-256:</strong> Webhooks da Meta são validados contra o segredo do App, impedindo payloads forjados.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-2xs space-y-3 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>TRILHA DE AUDITORIA MASTER</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {auditLogs.slice(0, 5).map((log, i) => (
                <div key={i} className="p-2 rounded bg-slate-800/80 border border-slate-700/60 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold ${
                        log.status === 'error'
                          ? 'text-rose-400'
                          : log.status === 'warning'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {log.event}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300">{log.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
