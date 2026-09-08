import React, { useState } from 'react';
import { 
  Bot, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Building2, 
  Crown,
  Briefcase, 
  Headphones, 
  Globe, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Check 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onSuccess?: () => void;
  onBackToHome?: () => void;
  onBack?: () => void;
  initialMode?: 'login' | 'register' | 'recovery';
  targetDestinationName?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onSuccess,
  onBackToHome,
  onBack,
  initialMode = 'login',
  targetDestinationName
}) => {
  const handleBack = onBack || onBackToHome;
  const { login, register, resetPassword, tenant } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>(initialMode);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'agent'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Recovery fields
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeHost = window.location.hostname;
  const brandName = tenant?.branding?.brandName || 'ManyFlow';
  const primaryColor = tenant?.branding?.primaryColor || '#0084FF';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    if (mode === 'login') {
      if (!email || !password) {
        setIsLoading(false);
        return setErrorMsg('Por favor, informe seu e-mail e senha.');
      }
      const res = await login(email.trim(), password);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg('Login realizado com sucesso! Entrando...');
        if (onSuccess) {
          setTimeout(onSuccess, 300);
        }
      } else {
        setErrorMsg(res.error || 'Credenciais inválidas.');
      }
    } else if (mode === 'register') {
      if (!name || !email || !password) {
        setIsLoading(false);
        return setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      }
      const res = await register(name.trim(), email.trim(), password, workspaceName.trim());
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg('Conta e Workspace criados com sucesso!');
        if (onSuccess) {
          setTimeout(onSuccess, 400);
        }
      } else {
        setErrorMsg(res.error || 'Erro ao criar conta.');
      }
    } else if (mode === 'recovery') {
      if (recoveryStep === 1) {
        if (!email) {
          setIsLoading(false);
          return setErrorMsg('Por favor, informe seu e-mail.');
        }
        const res = await resetPassword(email.trim());
        setIsLoading(false);
        if (res.success) {
          setSuccessMsg(res.message || 'Código de verificação enviado para o seu e-mail.');
          setRecoveryStep(2);
        } else {
          setErrorMsg(res.error || 'Erro ao solicitar recuperação.');
        }
      } else {
        if (!recoveryCode) {
          setIsLoading(false);
          return setErrorMsg('Por favor, digite o código de verificação recebido.');
        }
        if (!newPassword || newPassword.length < 6) {
          setIsLoading(false);
          return setErrorMsg('A nova senha deve ter pelo menos 6 caracteres.');
        }
        const res = await resetPassword(email.trim(), recoveryCode.trim(), newPassword);
        setIsLoading(false);
        if (res.success) {
          setSuccessMsg(res.message || 'Senha redefinida com sucesso!');
          setTimeout(() => {
            setMode('login');
            setPassword(newPassword);
            setRecoveryStep(1);
          }, 1200);
        } else {
          setErrorMsg(res.error || 'Erro ao definir nova senha.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-[#0B132B] p-4 relative overflow-hidden font-sans select-none">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-5%] w-[350px] h-[350px] bg-sky-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Domain & Multi-Tenant Host Detection Pill & Back to Home */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2.5">
        {handleBack && (
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-md"
          >
            <span>← Voltar para a Página Inicial</span>
          </button>
        )}

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 backdrop-blur-md text-slate-300 text-xs shadow-lg">
          <Globe className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Domínio Ativo: <strong className="text-white font-mono">{activeHost}</strong></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-emerald-400 font-semibold">Multi-Tenant 100% Isolado</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 transition-all">
        {/* Top Brand Banner */}
        <div className="p-6 pb-4 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div 
            className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-white shadow-md mb-2 transition-transform hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            <Bot className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-black text-[#1A1D21] tracking-tight">
            {brandName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automação Omnichannel Instagram Direct & WhatsApp
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5 m-4 mb-2 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Criar Conta
          </button>
          <button
            type="button"
            onClick={() => { setMode('recovery'); setRecoveryStep(1); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'recovery'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Recuperar
          </button>
        </div>

        {/* SECURITY RESTRICTION NOTICE */}
        <div className="mx-4 mb-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-medium text-[11px] leading-tight">
            {targetDestinationName ? (
              <>
                <strong>Acesso Restrito:</strong> Faça login ou crie sua conta para acessar direto{' '}
                <span className="underline font-bold text-amber-900 dark:text-amber-200">{targetDestinationName}</span>.
              </>
            ) : (
              <>
                <strong>Acesso Restrito:</strong> É obrigatório estar logado para acessar o workspace e os dados do sistema.
              </>
            )}
          </span>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mx-5 my-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-5 my-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 pt-2 space-y-3.5">
          {/* MODE: REGISTER FIELDS */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ana Clara Santos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Empresa / Workspace</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Ex: Agência Digital Alpha"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Perfil de Acesso</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                      role === 'admin'
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('manager')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                      role === 'manager'
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Gestor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('agent')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                      role === 'agent'
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Atendente</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* MODE: RECOVERY STEP 1 & 2 */}
          {mode === 'recovery' && recoveryStep === 2 ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Código de 6 Dígitos</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: 123456"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nova Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {mode === 'recovery' ? 'Email para envio do código' : 'Email de Acesso'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="seu-email@suaempresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all"
                />
              </div>
            </div>
          )}

          {/* PASSWORD FIELD (FOR LOGIN & REGISTER) */}
          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Senha</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('recovery'); setRecoveryStep(1); setErrorMsg(null); }}
                    className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* REMEMBER ME TOGGLE */}
          {mode === 'login' && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs text-slate-600">Lembrar neste navegador</span>
              </label>
            </div>
          )}

          {/* QUICK CREDENTIALS HELPER FOR ADMINISTRATOR */}
          {mode === 'login' && (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-center">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@manyflow.io');
                  setPassword('admin123');
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold bg-blue-50/70 hover:bg-blue-100/70 py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer border border-blue-100"
              >
                ⚡ Preencher Conta de Administrador (admin@manyflow.io)
              </button>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl font-bold text-xs shadow-md hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'register' ? (
              <>
                <span>Criar Conta & Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : recoveryStep === 1 ? (
              <>
                <span>Enviar Código de Recuperação</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Salvar Nova Senha</span>
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* SECURITY & ISOLATION BADGE */}
        <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex flex-col items-center justify-center gap-1 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ambiente Corporativo Seguro & Criptografado</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Autenticação JWT protegida com isolamento total de dados e multi-tenancy.
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <p className="text-slate-400 text-xs mt-5 text-center font-medium">
        {tenant?.branding?.footerText || 'ManyFlow © 2026 - Automação Omnichannel Instagram & Messenger'}
      </p>
    </div>
  );
};
