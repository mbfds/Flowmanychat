import React, { useState } from 'react';
import { 
  Bot, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Zap,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, register, tenant } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  
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
      const res = await login(email || 'admin@manyflow.com', password || 'admin123');
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg('Login realizado com sucesso! Redirecionando...');
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Credenciais inválidas.');
      }
    } else {
      if (!name) {
        setIsLoading(false);
        return setErrorMsg('Por favor, informe seu nome.');
      }
      const res = await register(name, email, password || 'admin123', workspaceName);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg('Conta e Workspace criados com sucesso!');
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Erro ao criar conta.');
      }
    }
  };

  const handleQuickAdminLogin = async () => {
    setEmail('admin@manyflow.com');
    setPassword('admin123');
    setIsLoading(true);
    const res = await login('admin@manyflow.com', 'admin123');
    setIsLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.error || 'Falha no login rápido');
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-[#0F172A] p-4 relative overflow-hidden font-sans select-none">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Domain & Multi-Tenant Host Detection Pill */}
      <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 backdrop-blur-md text-slate-300 text-xs shadow-lg">
        <Globe className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        <span>Domínio Ativo: <strong className="text-white font-mono">{activeHost}</strong></span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-[11px] text-emerald-400 font-semibold">Multi-Tenant Online</span>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 transition-all">
        {/* Top Brand Banner */}
        <div className="p-8 pb-6 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div 
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white shadow-md mb-3"
            style={{ backgroundColor: primaryColor }}
          >
            <Bot className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-[#1A1D21] tracking-tight">{brandName}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Plataforma de Automação de Directs, Comentários & Atendimento Omnichannel
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 m-4 rounded-xl">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Entrar na Conta
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Criar Novo Workspace
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="mx-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seu Nome Completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Empresa / Workspace</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Ex: Minha Agência Digital"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email de Acesso</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="admin@manyflow.com ou seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Senha</label>
              {mode === 'login' && (
                <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                  Esqueci a senha
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            style={{ backgroundColor: primaryColor }}
          >
            <span>{isLoading ? 'Autenticando...' : mode === 'login' ? 'Entrar no Sistema' : 'Criar Conta e Iniciar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Acesso seguro com criptografia e sessão persistente</span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdminLogin}
            className="w-full py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Entrar com Super Admin (admin@manyflow.com)</span>
          </button>
        </div>
      </div>

      {/* Footer copyright */}
      <p className="text-slate-400 text-xs mt-6 text-center">
        {tenant?.branding?.footerText || 'ManyFlow © 2026 - Automação Multi-Domínio & Banco Único'}
      </p>
    </div>
  );
};
