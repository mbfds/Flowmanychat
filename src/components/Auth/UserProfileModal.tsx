import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Shield, 
  Lock, 
  Building2, 
  Key, 
  LogOut, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Crown, 
  Briefcase, 
  Headphones, 
  Eye, 
  EyeOff,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenLoginModal
}) => {
  const { user, tenant, tenants, token, updateProfile, switchTenant, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'permissions' | 'workspaces'>('profile');
  
  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  if (!isOpen || !user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateProfile({ name, avatarUrl });
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Erro ao atualizar perfil.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setErrorMsg('A nova senha e confirmação não conferem.');
    }
    if (newPassword.length < 6) {
      return setErrorMsg('A nova senha deve ter pelo menos 6 caracteres.');
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateProfile({ currentPassword, newPassword });
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Erro ao alterar senha.');
    }
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-600" /> Super Administrador
          </span>
        );
      case 'admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <Crown className="w-3 h-3 text-blue-600" /> Administrador
          </span>
        );
      case 'manager':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-purple-600" /> Gestor de Tráfego/Agência
          </span>
        );
      case 'agent':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Headphones className="w-3 h-3 text-emerald-600" /> Atendente (Live Chat)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Visualizador
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
                {getRoleBadge(user.role)}
              </div>
              <p className="text-xs text-slate-500 font-mono">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 px-6 bg-white gap-2 pt-2">
          <button
            onClick={() => { setActiveTab('profile'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dados do Perfil
          </button>
          <button
            onClick={() => { setActiveTab('security'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Segurança & Senha
          </button>
          <button
            onClick={() => { setActiveTab('permissions'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'permissions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Permissões RBAC
          </button>
          <button
            onClick={() => { setActiveTab('workspaces'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'workspaces'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Workspaces ({tenants.length})
          </button>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Cadastrado</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 text-slate-500 rounded-xl border border-slate-200 cursor-not-allowed font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">O email é a chave de login e identificação no MongoDB.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Workspace Ativo</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">{tenant?.name || 'Workspace Principal'}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">ID: {user.tenantId}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Alterar Senha de Acesso</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senha Atual</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite a senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nova Senha</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 dígitos"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar Nova Senha</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Ocultar senhas' : 'Ver senhas'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || !newPassword}
                    className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Atualizar Senha</span>
                  </button>
                </div>
              </form>

              {/* JWT Session Token Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    <span>Token de Sessão JWT Ativo</span>
                  </span>
                  <button
                    onClick={handleCopyToken}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedToken ? 'Copiado' : 'Copiar Token'}</span>
                  </button>
                </div>
                <p className="text-[11px] font-mono text-slate-600 bg-white p-2 rounded border border-slate-200 truncate">
                  {token || 'mf_token_anonymous'}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>Criptografia: <strong>HMAC-SHA256</strong></span>
                  <span>•</span>
                  <span>Persistência: <strong>Ativa no Navegador</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RBAC PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900">
                Seu perfil atual é <strong>{user.role.toUpperCase()}</strong>. Veja abaixo o que você pode realizar no ManyFlow:
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 p-2.5 bg-slate-50 font-bold border-b border-slate-200 text-slate-700">
                  <span>Módulo / Funcionalidade</span>
                  <span className="text-right">Acesso</span>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="grid grid-cols-2 p-2.5 items-center">
                    <span>Editor Visual de Fluxos & IA</span>
                    <span className="text-right text-emerald-600 font-bold">✓ Total (Criar/Editar/Excluir)</span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 items-center">
                    <span>Gatilhos de Palavra-chave & Comentários</span>
                    <span className="text-right text-emerald-600 font-bold">✓ Total</span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 items-center">
                    <span>Live Chat (Inbox) & Intervenção Humana</span>
                    <span className="text-right text-emerald-600 font-bold">✓ Total</span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 items-center">
                    <span>Campanhas de Disparo (Broadcast)</span>
                    <span className="text-right text-emerald-600 font-bold">✓ Total</span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 items-center">
                    <span>Multi-Domínio & White-Label</span>
                    <span className="text-right font-bold text-emerald-600">
                      {user.role === 'super_admin' || user.role === 'admin' ? '✓ Permitido' : '✕ Restrito'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 items-center">
                    <span>Gestão de Equipe & Permissões RBAC</span>
                    <span className="text-right font-bold text-emerald-600">
                      {user.role === 'super_admin' || user.role === 'admin' ? '✓ Permitido' : '✕ Restrito'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORKSPACES */}
          {activeTab === 'workspaces' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Selecione qual Workspace deseja administrar no momento:
              </p>

              <div className="space-y-2">
                {tenants.map((t) => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      tenant?.id === t.id
                        ? 'bg-blue-50/80 border-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {t.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{t.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Plano: {t.plan.toUpperCase()}</span>
                      </div>
                    </div>

                    {tenant?.id === t.id ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                        Ativo
                      </span>
                    ) : (
                      <button
                        onClick={() => switchTenant(t.id)}
                        className="py-1 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        Alternar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              logout();
              onClose();
              if (onOpenLoginModal) onOpenLoginModal();
            }}
            className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão (Logout)</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
