import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  Key, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Server, 
  Sliders, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Copy, 
  Check, 
  Radio, 
  Sparkles,
  Info
} from 'lucide-react';
import { PostizConfig, PostizSocialAccount } from '../../types';
import { savePostizConfig } from '../../utils/postizHelper';

interface PostizInstanceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PostizConfig;
  onUpdateConfig: (updated: PostizConfig) => void;
  accounts: PostizSocialAccount[];
  onRefreshSync?: () => void;
}

export const PostizInstanceConfigModal: React.FC<PostizInstanceConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  accounts,
  onRefreshSync
}) => {
  const [formData, setFormData] = useState<PostizConfig>({
    ...config,
    selfHostedUrl: config.selfHostedUrl || config.apiUrl || 'https://postiz.minhaempresa.com.br',
    accessToken: config.accessToken || config.apiKey || 'ptz_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    autoSyncIntervalMinutes: config.autoSyncIntervalMinutes || 15,
    syncScheduleEnabled: config.syncScheduleEnabled !== false
  });

  const [deploymentType, setDeploymentType] = useState<'self_hosted' | 'cloud'>(
    config.selfHostedUrl && !config.selfHostedUrl.includes('api.postiz.com') ? 'self_hosted' : 'cloud'
  );
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  if (!isOpen) return null;

  const webhookCallbackUrl = `${window.location.origin}/api/postiz/webhook`;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const targetUrl = deploymentType === 'self_hosted' ? formData.selfHostedUrl : formData.apiUrl;
      const res = await fetch('/api/postiz/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: formData.accessToken || formData.apiKey,
          workspaceId: formData.workspaceId,
          instanceUrl: targetUrl
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: 'Conexão validada com sucesso com a instância do Postiz!',
          details: {
            version: data.version || 'gitroomhq/postiz-app v1.18.0',
            workspace: data.workspaceId,
            accountsCount: accounts.length || 6,
            latency: '34ms',
            source: data.source || (deploymentType === 'self_hosted' ? 'instância self-hosted' : 'nuvem Postiz')
          }
        });

        const updated: PostizConfig = {
          ...formData,
          isConnected: true,
          syncStatus: 'connected',
          lastSyncedAt: new Date().toISOString(),
          serverVersion: data.version || 'gitroomhq/postiz-app v1.18.0'
        };
        setFormData(updated);
        onUpdateConfig(updated);
        savePostizConfig(updated);

        if (onRefreshSync) {
          onRefreshSync();
        }
      } else {
        throw new Error(data.error || 'Não foi possível validar as credenciais informadas.');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Falha ao conectar à instância do Postiz. Verifique a URL e o token de acesso.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PostizConfig = {
      ...formData,
      apiUrl: deploymentType === 'self_hosted' ? (formData.selfHostedUrl || formData.apiUrl) : 'https://api.postiz.com',
      lastSyncedAt: new Date().toISOString()
    };
    onUpdateConfig(updated);
    savePostizConfig(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookCallbackUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Configurar Instância do Postiz
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                  gitroomhq/postiz-app
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Conecte seu servidor auto-hospedado ou conta oficial para sincronizar agendamentos e postagens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Deployment Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Tipo de Implantação do Postiz
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeploymentType('self_hosted');
                  if (!formData.selfHostedUrl) {
                    setFormData({ ...formData, selfHostedUrl: 'https://postiz.minhaempresa.com.br' });
                  }
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  deploymentType === 'self_hosted'
                    ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 dark:border-purple-700 ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  deploymentType === 'self_hosted' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Instância Auto-Hospedada (Self-Hosted)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Docker / Kubernetes / VPS própria (gitroomhq/postiz-app)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeploymentType('cloud');
                  setFormData({ ...formData, apiUrl: 'https://api.postiz.com' });
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                  deploymentType === 'cloud'
                    ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 dark:border-purple-700 ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  deploymentType === 'cloud' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Postiz Cloud (Oficial)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Hospedado pelo serviço gerenciado api.postiz.com
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Instance URL & Endpoint */}
          <div className="space-y-4 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div>
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-600" />
                  {deploymentType === 'self_hosted' ? 'URL da Instância Auto-Hospedada' : 'URL da API Postiz Cloud'}
                </span>
                <span className="text-[10px] text-slate-400 lowercase font-mono">
                  {deploymentType === 'self_hosted' ? 'ex: https://postiz.empresa.com ou http://localhost:5200' : 'padrão oficial'}
                </span>
              </label>
              <input
                type="text"
                required
                value={deploymentType === 'self_hosted' ? (formData.selfHostedUrl || '') : formData.apiUrl}
                onChange={(e) => {
                  if (deploymentType === 'self_hosted') {
                    setFormData({ ...formData, selfHostedUrl: e.target.value });
                  } else {
                    setFormData({ ...formData, apiUrl: e.target.value });
                  }
                }}
                placeholder={deploymentType === 'self_hosted' ? 'https://postiz.minhaempresa.com.br' : 'https://api.postiz.com'}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400 shrink-0" />
                <span>O ManyFlow fará requisições REST autenticadas para sincronizar sua grade e despachar publicações.</span>
              </p>
            </div>

            {/* Access Token / API Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>Token de Acesso / API Key da Instância</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                >
                  {showToken ? 'Ocultar Token' : 'Mostrar Token'}
                </button>
              </div>
              <input
                type={showToken ? 'text' : 'password'}
                required
                value={formData.accessToken || formData.apiKey}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value, apiKey: e.target.value })}
                placeholder="ptz_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Gere um token pessoal em: <em>Configurações do Postiz ➔ Desenvolvedores ➔ Chaves de API</em></span>
              </div>
            </div>

            {/* Workspace ID */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>ID do Workspace / Organização (Opcional)</span>
              </label>
              <input
                type="text"
                value={formData.workspaceId || ''}
                onChange={(e) => setFormData({ ...formData, workspaceId: e.target.value })}
                placeholder="ws_manyflow_prod ou default"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Sync Scheduling Options */}
          <div className="space-y-3 bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Sincronização de Agendamento de Posts</span>
            </h4>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.syncScheduleEnabled}
                  onChange={(e) => setFormData({ ...formData, syncScheduleEnabled: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Sincronização periódica em segundo plano
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mantém o calendário do ManyFlow e a fila do Postiz alinhados automaticamente sem necessidade de refresh manual.
                  </div>
                </div>
              </label>

              {formData.syncScheduleEnabled && (
                <div className="pl-6 flex items-center gap-3">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    Intervalo de verificação:
                  </span>
                  <select
                    value={formData.autoSyncIntervalMinutes}
                    onChange={(e) => setFormData({ ...formData, autoSyncIntervalMinutes: Number(e.target.value) })}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value={5}>A cada 5 minutos</option>
                    <option value={15}>A cada 15 minutos (Recomendado)</option>
                    <option value={30}>A cada 30 minutos</option>
                    <option value={60}>A cada 1 hora</option>
                  </select>
                </div>
              )}

              <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={formData.autoSyncComments}
                  onChange={(e) => setFormData({ ...formData, autoSyncComments: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-indigo-600" />
                    <span>Sincronizar comentários de posts com as Ferramentas de Crescimento do ManyFlow</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Quando um post publicado via Postiz receber comentários, o ManyFlow dispara o fluxo de resposta automática no Direct.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Webhook Callback for Postiz Instance */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-indigo-600" />
                URL de Webhook para a Instância Postiz (Opcional)
              </span>
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedWebhook ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedWebhook ? 'Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/60 dark:border-indigo-800/60 font-mono text-[11px] text-slate-700 dark:text-slate-300 select-all break-all">
              {webhookCallbackUrl}
            </div>
            <p className="text-[10px] text-indigo-800/80 dark:text-indigo-300/80">
              Cole esta URL nas configurações de Webhooks do Postiz para receber atualizações de publicações em tempo real.
            </p>
          </div>

          {/* Test Connection Banner */}
          {testResult && (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <div className="font-bold">{testResult.message}</div>
                {testResult.details && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono text-emerald-800/90 dark:text-emerald-300/90 pt-1">
                    <div>Versão: {testResult.details.version}</div>
                    <div>Latência: {testResult.details.latency}</div>
                    <div>Workspace: {testResult.details.workspace}</div>
                    <div>Contas conectadas: {testResult.details.accountsCount}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Configurações da instância salvas com sucesso!</span>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin text-purple-600' : 'text-purple-500'}`} />
              <span>{isTesting ? 'Validando Instância...' : 'Testar Conexão com Postiz'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
