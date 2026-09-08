import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  Key, 
  Lock, 
  ShieldCheck, 
  Check, 
  Copy, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  AlertTriangle,
  ExternalLink, 
  Eye, 
  EyeOff, 
  Save, 
  Radio, 
  Zap, 
  Sliders, 
  HelpCircle, 
  Info, 
  Terminal, 
  ArrowRight, 
  Shield, 
  Activity, 
  Sparkles, 
  Clock,
  Globe,
  FileCode,
  CheckCheck
} from 'lucide-react';
import { WebhookSettingsState } from '../../types';
import { webhookService } from '../../services/webhookService';
import { useToast } from '../../context/ToastContext';

interface MetaWebhookConfigManagerProps {
  settings?: WebhookSettingsState;
  onUpdateSettings?: (settings: WebhookSettingsState) => void;
  onOpenLogs?: () => void;
  onOpenLiveChat?: (contactId: string) => void;
}

interface TestConnectionResult {
  success: boolean;
  handshakeSuccess: boolean;
  secretValid: boolean;
  statusCode: number;
  latencyMs: number;
  challenge?: string;
  details: string;
  testedAt: string;
  hmacSignature?: string;
}

const META_AVAILABLE_SUBSCRIPTION_FIELDS = [
  {
    id: 'messages',
    label: 'messages',
    title: 'Mensagens Diretas (DMs)',
    desc: 'Recebe mensagens de texto, áudio, imagens, vídeos e anexos enviados ao Instagram ou Messenger.',
    required: true
  },
  {
    id: 'messaging_postbacks',
    label: 'messaging_postbacks',
    title: 'Cliques em Botões & Quick Replies',
    desc: 'Disparado quando o usuário clica em botões interativos de fluxos ou menus persistentes.',
    required: true
  },
  {
    id: 'message_reactions',
    label: 'message_reactions',
    title: 'Reações a Mensagens',
    desc: 'Notifica reações de emoji (❤️, 🔥, 👍) adicionadas a mensagens do bate-papo.',
    required: false
  },
  {
    id: 'comments',
    label: 'comments',
    title: 'Comentários em Posts & Reels',
    desc: 'Permite automações que respondem comentários públicos no Instagram com disparo de DM.',
    required: false
  },
  {
    id: 'standby',
    label: 'standby',
    title: 'Mensagens em Modo Standby',
    desc: 'Recebe mensagens quando o controle do chat está com outro app ou operador humano.',
    required: false
  }
];

export const MetaWebhookConfigManager: React.FC<MetaWebhookConfigManagerProps> = ({
  settings: initialSettings,
  onUpdateSettings,
  onOpenLogs
}) => {
  const { show: showToast } = useToast();

  // Primary Webhook Fields
  const [globalVerifyToken, setGlobalVerifyToken] = useState<string>(
    initialSettings?.globalVerifyToken || 'manyflow_verify_token_secure_2026'
  );
  const [appSecret, setAppSecret] = useState<string>(
    initialSettings?.appSecret || 'mf_sec_89df2a3bc7e1480f90ab12d'
  );
  const [serverBaseUrl, setServerBaseUrl] = useState<string>(
    initialSettings?.serverBaseUrl || (typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks` : '/api/webhooks')
  );
  const [enableLogging, setEnableLogging] = useState<boolean>(
    initialSettings?.enableLogging ?? true
  );
  const [activeFields, setActiveFields] = useState<string[]>(
    initialSettings?.activeFields || ['messages', 'messaging_postbacks', 'message_reactions']
  );
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'pending'>(
    initialSettings?.verificationStatus || 'verified'
  );

  // UI state
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);

  // Computed public Callback URLs
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.manyflow.io';
  const callbackUrl = `${originUrl}/api/webhook`;
  const metaReceiveUrl = `${originUrl}/api/webhooks/meta-receive`;
  const alternativeFacebookUrl = `${originUrl}/api/webhooks/facebook`;

  // Sync state if initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      if (initialSettings.globalVerifyToken) setGlobalVerifyToken(initialSettings.globalVerifyToken);
      if (initialSettings.appSecret) setAppSecret(initialSettings.appSecret);
      if (initialSettings.serverBaseUrl) setServerBaseUrl(initialSettings.serverBaseUrl);
      if (initialSettings.enableLogging !== undefined) setEnableLogging(initialSettings.enableLogging);
      if (initialSettings.activeFields) setActiveFields(initialSettings.activeFields);
      if (initialSettings.verificationStatus) setVerificationStatus(initialSettings.verificationStatus);
    }
  }, [initialSettings]);

  // Track unsaved modifications
  const handleVerifyTokenChange = (val: string) => {
    setGlobalVerifyToken(val);
    setHasUnsavedChanges(true);
  };

  const handleAppSecretChange = (val: string) => {
    setAppSecret(val);
    setHasUnsavedChanges(true);
  };

  const toggleField = (fieldId: string) => {
    setActiveFields(prev => 
      prev.includes(fieldId) ? prev.filter(f => f !== fieldId) : [...prev, fieldId]
    );
    setHasUnsavedChanges(true);
  };

  // Copy helper
  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
    showToast('info', 'Copiado para a área de transferência', {
      description: text,
      duration: 2500
    });
  };

  // Generate randomized secure Verify Token
  const handleGenerateVerifyToken = () => {
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const newToken = `manyflow_verify_${randomHex}`;
    setGlobalVerifyToken(newToken);
    setHasUnsavedChanges(true);
    showToast('info', 'Novo Token de Verificação gerado', {
      description: 'Lembre-se de salvar as alterações e atualizar no portal da Meta.',
      duration: 3500
    });
  };

  // Test Connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // If there are unsaved changes, first prompt or save to memory
      const result = await webhookService.testMetaWebhookConnection(globalVerifyToken.trim(), appSecret.trim());
      setTestResult(result);

      if (result.success) {
        setVerificationStatus('verified');
        showToast('success', 'Conexão com Webhook Validada!', {
          description: `Handshake HTTP ${result.statusCode} validado em ${result.latencyMs}ms.`,
          duration: 4000
        });
      } else {
        setVerificationStatus('pending');
        showToast('warning', 'Falha no Teste de Conexão', {
          description: result.details,
          duration: 5000
        });
      }
    } catch (err: any) {
      const failResult: TestConnectionResult = {
        success: false,
        handshakeSuccess: false,
        secretValid: false,
        statusCode: 0,
        latencyMs: 0,
        details: err.message || 'Erro inesperado ao conectar ao servidor.',
        testedAt: new Date().toISOString()
      };
      setTestResult(failResult);
      showToast('error', 'Erro ao Testar Conexão', {
        description: err.message,
        duration: 4000
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const updatedConfig: WebhookSettingsState = {
      endpoints: initialSettings?.endpoints || [],
      conversionEndpoints: initialSettings?.conversionEndpoints || [],
      globalVerifyToken: globalVerifyToken.trim(),
      appSecret: appSecret.trim(),
      serverBaseUrl: serverBaseUrl.trim(),
      enableLogging,
      activeFields,
      verificationStatus,
      autoRetryFailed: initialSettings?.autoRetryFailed ?? true,
      maxRetryAttempts: initialSettings?.maxRetryAttempts ?? 3,
      retryIntervalSeconds: initialSettings?.retryIntervalSeconds ?? 30,
      retryBackoffStrategy: initialSettings?.retryBackoffStrategy ?? 'exponential',
      retryTimeoutSeconds: initialSettings?.retryTimeoutSeconds ?? 10,
      retryableStatusCodes: initialSettings?.retryableStatusCodes || [408, 429, 500, 502, 503, 504],
      deadLetterQueueEnabled: initialSettings?.deadLetterQueueEnabled ?? true,
      jitterEnabled: initialSettings?.jitterEnabled ?? true
    };

    try {
      // 1. Save to MongoDB
      const savedToDb = await webhookService.saveConfig(updatedConfig);
      
      // 2. Save to localStorage
      try {
        localStorage.setItem('manyflow_webhook_settings', JSON.stringify(updatedConfig));
      } catch {}

      // 3. Notify parent component
      if (onUpdateSettings) {
        onUpdateSettings(updatedConfig);
      }

      setHasUnsavedChanges(false);

      showToast('success', 'Configurações de Webhook Salvas!', {
        description: savedToDb 
          ? 'Salvo no MongoDB e sincronizado com o runtime da API com sucesso.' 
          : 'Salvo localmente na sessão com sucesso.',
        duration: 3500
      });
    } catch (err: any) {
      showToast('error', 'Erro ao Salvar Configurações', {
        description: err.message || 'Não foi possível salvar no banco de dados.',
        duration: 4000
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-50/60 to-purple-50/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Webhook className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Configurações do Webhook Meta</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                    verificationStatus === 'verified'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      verificationStatus === 'verified' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                    {verificationStatus === 'verified' ? 'Conexão Ativa' : 'Aguardando Validação'}
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Gerencie o Token de Verificação e o App Secret necessários para receber mensagens do Instagram Direct e Messenger em tempo real.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onOpenLogs && (
              <button
                type="button"
                id="btn_webhook_open_logs"
                onClick={onOpenLogs}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                <span>Ver Logs</span>
              </button>
            )}

            <button
              type="button"
              id="btn_webhook_test_connection_top"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 text-blue-600 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testando Conexão...' : 'Testar Conexão'}</span>
            </button>

            <button
              type="button"
              id="btn_webhook_save_settings_top"
              onClick={() => handleSaveSettings()}
              disabled={isSaving}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs text-white ${
                hasUnsavedChanges 
                  ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400/40 animate-pulse' 
                  : 'bg-slate-900 hover:bg-slate-800'
              } disabled:opacity-50`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Salvando...' : hasUnsavedChanges ? 'Salvar Alterações' : 'Salvo'}</span>
            </button>
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold">
                Você tem alterações não salvas. Salve as novas chaves para que o backend as reconheça durante os testes e nas requisições da Meta.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSaveSettings()}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
            >
              Salvar Agora
            </button>
          </div>
        )}
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Keys and Endpoints */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Callback URL Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">URL de Retorno de Chamada (Callback URL)</h2>
                  <p className="text-[11px] text-slate-500">Endpoint público que deve ser inserido no painel de desenvolvedores da Meta.</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                HTTPS Pronto
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                URL Principal (Instagram & Messenger)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={callbackUrl}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 text-slate-900 outline-none select-all"
                  />
                </div>
                <button
                  type="button"
                  id="btn_copy_callback_url"
                  onClick={() => handleCopy(callbackUrl, 'callback_url')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedKey === 'callback_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'callback_url' ? 'Copiado!' : 'Copiar URL'}</span>
                </button>
              </div>
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Autenticação segura via token e HMAC SHA-256 (.env).</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Endpoint legado:</span>
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600">/api/webhooks/meta-receive</code>
                  <button
                    type="button"
                    onClick={() => handleCopy(metaReceiveUrl, 'meta_receive_url')}
                    className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                  >
                    {copiedKey === 'meta_receive_url' ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                Suporta requisições <code className="bg-slate-100 px-1 py-0.2 rounded font-bold text-slate-700">GET</code> para handshake de verificação e <code className="bg-slate-100 px-1 py-0.2 rounded font-bold text-slate-700">POST</code> para eventos e mensagens.
              </p>
            </div>
          </div>

          {/* 2. Verify Token & App Secret Card (The Core Requested Inputs) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Credenciais de Autenticação Meta</h2>
                  <p className="text-[11px] text-slate-500">Parâmetros de handshake e assinatura criptográfica exigidos pela Meta.</p>
                </div>
              </div>
            </div>

            {/* Field: Verify Token */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Token de Verificação (Verify Token)</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateVerifyToken}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Gerar Novo Token</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(globalVerifyToken, 'verify_token')}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'verify_token' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  id="input_verify_token"
                  required
                  value={globalVerifyToken}
                  onChange={(e) => handleVerifyTokenChange(e.target.value)}
                  placeholder="Ex: manyflow_verify_token_secure_2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Insira este exato texto no campo "Token de Verificação" no portal Meta for Developers.</span>
                <span className="font-mono text-[10px] text-slate-400">
                  {globalVerifyToken.length} caracteres
                </span>
              </div>
            </div>

            {/* Field: App Secret */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Chave Secreta do Aplicativo (App Secret)</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showSecret ? 'Ocultar' : 'Exibir Chave'}</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(appSecret, 'app_secret')}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'app_secret' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  id="input_app_secret"
                  required
                  value={appSecret}
                  onChange={(e) => handleAppSecretChange(e.target.value)}
                  placeholder="Ex: 89df2a3bc7e1480f90ab12d987654321"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>
                  Obtenha em: <strong>Configurações do Aplicativo &gt; Básico &gt; Chave Secreta do Aplicativo</strong>.
                </span>
                <span className={`font-mono text-[10px] ${
                  appSecret.length === 32 ? 'text-emerald-600 font-bold' : 'text-slate-400'
                }`}>
                  {appSecret.length === 32 ? '✔ 32 hex (Padrão Meta)' : `${appSecret.length} caracteres`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-purple-900 text-xs mt-2 flex items-start gap-2">
                <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Segurança HMAC SHA-256:</strong> O ManyFlow valida automaticamente o cabeçalho <code className="bg-purple-100/80 px-1 py-0.2 rounded font-mono text-purple-950 font-bold">X-Hub-Signature-256</code> em cada evento recebido, garantindo que o payload partiu comprovadamente dos servidores oficiais do Meta/Instagram.
                </p>
              </div>
            </div>

            {/* Test Connection Button & Save Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                id="btn_webhook_test_connection_main"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Play className={`w-4 h-4 text-white ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Executando Teste de Handshake...' : 'Testar Conexão com a Meta'}</span>
              </button>

              <button
                type="button"
                id="btn_webhook_save_settings_main"
                onClick={() => handleSaveSettings()}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</span>
              </button>
            </div>
          </div>

          {/* 3. Diagnostic Test Result Card (Appears after clicking Test) */}
          {testResult && (
            <div className={`rounded-2xl border p-5 transition-all shadow-xs space-y-3 ${
              testResult.success 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <h3 className="text-sm font-black">
                    {testResult.success ? 'Conexão com a Meta 100% Validada' : 'Falha na Validação da Conexão'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(testResult.testedAt).toLocaleTimeString()}
                </span>
              </div>

              <p className="text-xs leading-relaxed font-medium">
                {testResult.details}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/50 text-xs">
                <div className="p-2 bg-white/70 rounded-lg border border-slate-200/60">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Status HTTP</span>
                  <span className={`font-black ${testResult.statusCode === 200 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {testResult.statusCode > 0 ? `${testResult.statusCode} OK` : 'Inacessível'}
                  </span>
                </div>

                <div className="p-2 bg-white/70 rounded-lg border border-slate-200/60">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Latência</span>
                  <span className="font-black text-slate-800">
                    {testResult.latencyMs} ms
                  </span>
                </div>

                <div className="p-2 bg-white/70 rounded-lg border border-slate-200/60">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Handshake GET</span>
                  <span className={`font-black ${testResult.handshakeSuccess ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {testResult.handshakeSuccess ? '✔ Correspondente' : '✖ Divergente'}
                  </span>
                </div>

                <div className="p-2 bg-white/70 rounded-lg border border-slate-200/60">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Assinatura HMAC</span>
                  <span className={`font-black ${testResult.secretValid ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {testResult.secretValid ? '✔ Ativa (SHA-256)' : '✖ Incorreta'}
                  </span>
                </div>
              </div>

              {testResult.challenge && (
                <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700">
                  <span className="text-slate-400 block text-[10px] font-bold">Challenge de Retorno:</span>
                  <code className="text-emerald-800 font-bold">{testResult.challenge}</code>
                </div>
              )}

              {!testResult.success && hasUnsavedChanges && (
                <div className="p-2.5 bg-amber-100/70 rounded-xl border border-amber-300 text-amber-950 text-xs flex items-center justify-between">
                  <span>Você editou o token mas ainda não salvou. Salve as configurações antes de testar!</span>
                  <button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    className="px-2.5 py-1 bg-amber-700 text-white rounded-md text-[11px] font-bold cursor-pointer"
                  >
                    Salvar Agora
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. Subscribed Fields Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Eventos & Tópicos de Assinatura</h3>
                  <p className="text-[11px] text-slate-500">Marque quais eventos do Instagram e Messenger o ManyFlow deve capturar.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {activeFields.length} Ativos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {META_AVAILABLE_SUBSCRIPTION_FIELDS.map((field) => {
                const isSelected = activeFields.includes(field.id);
                return (
                  <div
                    key={field.id}
                    onClick={() => toggleField(field.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-500/20'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{field.title}</span>
                        {field.required && (
                          <span className="text-[9px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">{field.desc}</p>
                      <code className="text-[9px] font-mono text-slate-400 block pt-0.5">campo: {field.label}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Step-by-Step Meta Integration Guide */}
        <div className="space-y-6">

          {/* Quick Guide */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Passo a Passo na Meta</h3>
                <p className="text-[11px] text-slate-500">Como conectar ao Meta for Developers</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Abra seu Aplicativo Meta</span>
                  <span className="text-[11px] text-slate-500">
                    Acesse o portal Meta for Developers e entre no seu App de Negócios.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Vá em Webhooks</span>
                  <span className="text-[11px] text-slate-500">
                    No menu lateral esquerdo, selecione <strong>Webhooks</strong> ou <strong>Instagram &gt; Configuração Básica</strong>.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Cole a URL e o Verify Token</span>
                  <span className="text-[11px] text-slate-500">
                    Cole o <strong>Callback URL</strong> e o <strong>Verify Token</strong> gerados aqui.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Copie o App Secret</span>
                  <span className="text-[11px] text-slate-500">
                    Em <em>Configurações Básicas &gt; Chave Secreta do Aplicativo</em>, copie o segredo e cole no campo acima.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200/80 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Abrir Meta for Developers</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Logging & Storage Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">Armazenamento de Logs</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableLogging}
                  onChange={(e) => {
                    setEnableLogging(e.target.checked);
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Registra cada evento recebido, payloads brutos e status de entrega no MongoDB para auditoria e histórico em tempo real.
            </p>
          </div>

          {/* Alternative Endpoint */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/70 p-4 space-y-2 text-xs">
            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
              Endpoint Alternativo (Facebook Messenger)
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={alternativeFacebookUrl}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-[10px] bg-white text-slate-800 outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopy(alternativeFacebookUrl, 'alt_fb_url')}
                className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 text-slate-600 shrink-0 cursor-pointer"
                title="Copiar URL alternativa"
              >
                {copiedKey === 'alt_fb_url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Pode ser utilizado se sua integração for direcionada especificamente para Páginas do Facebook Messenger.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
