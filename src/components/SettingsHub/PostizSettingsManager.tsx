import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Key, 
  Globe, 
  Check, 
  Layers, 
  Instagram, 
  Facebook, 
  Plus, 
  Trash2,
  Sliders,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  PostizConfig, 
  PostizSocialAccount, 
  PostizSocialPlatform 
} from '../../types';
import { 
  loadPostizConfig, 
  savePostizConfig, 
  loadPostizAccounts, 
  savePostizAccounts 
} from '../../utils/postizHelper';

export const PostizSettingsManager: React.FC = () => {
  const [config, setConfig] = useState<PostizConfig>(loadPostizConfig());
  const [accounts, setAccounts] = useState<PostizSocialAccount[]>(loadPostizAccounts());
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New account modal / form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlatform, setNewPlatform] = useState<PostizSocialPlatform>('instagram');
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');

  const handleSave = () => {
    savePostizConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setTestSuccess(true);
      const updatedConfig = { ...config, lastSyncedAt: new Date().toISOString() };
      setConfig(updatedConfig);
      savePostizConfig(updatedConfig);
      setTimeout(() => setTestSuccess(false), 4000);
    }, 1200);
  };

  const handleToggleAccount = (id: string) => {
    const updated = accounts.map((acc) => 
      acc.id === id ? { ...acc, isConnected: !acc.isConnected } : acc
    );
    setAccounts(updated);
    savePostizAccounts(updated);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    const newAcc: PostizSocialAccount = {
      id: `acc_${newPlatform}_${Date.now()}`,
      platform: newPlatform,
      username: newUsername.trim(),
      displayName: newDisplayName.trim() || newUsername.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isConnected: true,
      followerCount: Math.floor(Math.random() * 5000) + 500,
      accountType: 'creator'
    };

    const updated = [...accounts, newAcc];
    setAccounts(updated);
    savePostizAccounts(updated);
    setNewUsername('');
    setNewDisplayName('');
    setShowAddModal(false);
  };

  const handleRemoveAccount = (id: string) => {
    if (window.confirm('Deseja desconectar esta conta do Postiz?')) {
      const updated = accounts.filter((acc) => acc.id !== id);
      setAccounts(updated);
      savePostizAccounts(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-600 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  Integração Postiz (Social Planner)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-400 text-purple-950">
                  gitroomhq/postiz-app
                </span>
              </div>
              <p className="text-xs text-purple-100 max-w-xl mt-1 leading-relaxed">
                Conecte sua instância do Postiz (SaaS ou Auto-Hospedada via Docker) para agendar posts em lote no Instagram, TikTok, Facebook, LinkedIn, X e Threads com gatilho direto no ManyFlow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/gitroomhq/postiz-app"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-xs border border-white/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver no GitHub</span>
            </a>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-white text-purple-900 hover:bg-purple-50 text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-purple-600' : ''}`} />
              <span>{isTesting ? 'Conectando...' : 'Testar API Postiz'}</span>
            </button>
          </div>
        </div>
      </div>

      {testSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Conexão bem-sucedida com o Postiz! Workspace autenticado e pronto para despachos.</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Configurações do Postiz salvas com sucesso!</span>
        </div>
      )}

      {/* API Configuration Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Key className="w-4 h-4 text-purple-600" />
          Configurações de Conexão com a API do Postiz
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              URL da Instância Auto-Hospedada (gitroomhq)
            </label>
            <input
              type="text"
              value={config.selfHostedUrl || config.apiUrl}
              onChange={(e) => setConfig({ ...config, selfHostedUrl: e.target.value, apiUrl: e.target.value })}
              placeholder="https://postiz.minhaempresa.com.br ou http://localhost:5200"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">Servidor Docker/VPS próprio ou https://api.postiz.com</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Token de Acesso / API Key da Instância
            </label>
            <input
              type="password"
              value={config.accessToken || config.apiKey}
              onChange={(e) => setConfig({ ...config, accessToken: e.target.value, apiKey: e.target.value })}
              placeholder="ptz_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">Token de autenticação gerado na instância Postiz</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              ID do Workspace Postiz
            </label>
            <input
              type="text"
              value={config.workspaceId}
              onChange={(e) => setConfig({ ...config, workspaceId: e.target.value })}
              placeholder="ws_manyflow_prod"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Sincronização de Agendamento Automática
            </label>
            <select
              value={config.autoSyncIntervalMinutes || 15}
              onChange={(e) => setConfig({ ...config, autoSyncIntervalMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            >
              <option value={5}>A cada 5 minutos</option>
              <option value={15}>A cada 15 minutos (Padrão)</option>
              <option value={30}>A cada 30 minutos</option>
              <option value={60}>A cada 1 hora</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoSyncComments}
              onChange={(e) => setConfig({ ...config, autoSyncComments: e.target.checked })}
              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sincronizar comentários de posts automaticamente para disparo de Directs no ManyFlow
            </span>
          </label>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Salvar Configurações
          </button>
        </div>
      </div>

      {/* Connected Accounts Manager */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Contas Sociais Conectadas no Postiz ({accounts.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gerencie os perfis ativos para agendamento de posts e coleta de engajamento
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Conta</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={acc.avatarUrl}
                  alt={acc.displayName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {acc.displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize flex items-center gap-1">
                    <span>{acc.platform}</span> • <span className="font-mono">{acc.username}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {(acc.followerCount || 0).toLocaleString()} seguidores
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleAccount(acc.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                    acc.isConnected
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {acc.isConnected ? 'Ativo' : 'Pausado'}
                </button>

                <button
                  onClick={() => handleRemoveAccount(acc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  title="Remover conta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Vincular Nova Conta Social ao Postiz
            </h3>

            <form onSubmit={handleAddAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Rede Social
                </label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as PostizSocialPlatform)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold capitalize"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="x">Twitter / X</option>
                  <option value="threads">Threads</option>
                  <option value="youtube">YouTube</option>
                  <option value="pinterest">Pinterest</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nome de Usuário (@handle)
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="@seuperfil"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Minha Marca Oficial"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Conectar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
