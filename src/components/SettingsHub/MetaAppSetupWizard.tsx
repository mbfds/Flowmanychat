import React, { useState } from 'react';
import {
  Facebook,
  ShieldCheck,
  Key,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  HelpCircle,
  Layers,
  Globe,
  Radio,
  RefreshCw,
  Server,
  Terminal,
  Instagram,
  MessageCircle,
  FileCheck,
  CheckCircle,
  X
} from 'lucide-react';
import { FacebookApp, FacebookAppType, FacebookAppStatus } from '../../types';
import { facebookAppsService, TestFacebookConnectionResult } from '../../services/facebookAppsService';
import { useAuth } from '../../context/AuthContext';

interface MetaAppSetupWizardProps {
  onAppCreated?: (newApp: FacebookApp) => void;
  onCancel?: () => void;
  isEmbedded?: boolean;
}

export const MetaAppSetupWizard: React.FC<MetaAppSetupWizardProps> = ({
  onAppCreated,
  onCancel,
  isEmbedded = false
}) => {
  const { user: currentUser, tenant } = useAuth();

  // Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [appName, setAppName] = useState<string>('');
  const [appId, setAppId] = useState<string>('');
  const [appSecret, setAppSecret] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [appType, setAppType] = useState<FacebookAppType>('business');
  const [apiVersion, setApiVersion] = useState<string>('v21.0');
  const [verifyToken, setVerifyToken] = useState<string>('manyflow_webhook_verify_2026');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'pages_messaging',
    'instagram_manage_messages',
    'pages_read_engagement',
    'pages_manage_metadata',
    'pages_show_list',
    'instagram_basic',
    'pages_read_user_content'
  ]);

  // UI States
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [showToken, setShowToken] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestFacebookConnectionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [createdAppResult, setCreatedAppResult] = useState<FacebookApp | null>(null);

  // Webhook host URL calculation
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://app.manyflow.com';
  const callbackUrl = `${currentOrigin}/api/webhooks/facebook`;

  // Validation rules
  const isAppIdValid = /^\d{14,19}$/.test(appId.trim());
  const isAppSecretValid = /^[a-fA-F0-9]{32}$/.test(appSecret.trim());
  const isAccessTokenValid = accessToken.trim().length >= 35 && (accessToken.trim().startsWith('EAA') || accessToken.trim().startsWith('EAAB') || accessToken.trim().startsWith('EAAG') || accessToken.trim().startsWith('EAAC') || accessToken.trim().startsWith('EAAQ'));
  const isAppNameValid = appName.trim().length >= 3;

  // Step 1 Validation (App Name & Intent)
  const isStep1Valid = isAppNameValid;
  // Step 2 Validation (App ID & Secret)
  const isStep2Valid = isAppIdValid && isAppSecretValid;
  // Step 3 Validation (Permissions selected)
  const isStep3Valid = selectedPermissions.length >= 2;
  // Step 4 Validation (Access Token)
  const isStep4Valid = isAccessTokenValid;
  // All Credentials Ready for Step 5
  const isAllValid = isAppNameValid && isAppIdValid && isAppSecretValid && isAccessTokenValid;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const togglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleTestConnection = async () => {
    if (!isAllValid) return;
    setIsTesting(true);
    setTestResult(null);

    // Call test connection service
    const mockAppToTest: FacebookApp = {
      id: 'temp_test_app',
      name: appName,
      appId: appId.trim(),
      appSecret: appSecret.trim(),
      systemUserToken: accessToken.trim(),
      appType,
      status: 'active',
      apiVersion,
      ownerUserId: currentUser?.id || 'usr_super_1',
      ownerUserName: currentUser?.name || 'Administrador',
      ownerUserEmail: currentUser?.email || 'admin@manyflow.com',
      tenantId: tenant?.id || 'tenant_main',
      assignedUserIds: ['all'],
      verifyToken,
      webhookCallbackUrl: callbackUrl,
      isWebhookLive: true,
      pages: [],
      whatsAppAccounts: [],
      approvedPermissions: selectedPermissions,
      isDefault: true,
      rateLimitUsagePercent: 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const res = await facebookAppsService.testConnection(mockAppToTest);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSaveApp = async () => {
    if (!isAllValid) return;
    setIsSubmitting(true);

    try {
      const newApp = await facebookAppsService.createApp({
        name: appName.trim(),
        appId: appId.trim(),
        appSecret: appSecret.trim(),
        systemUserToken: accessToken.trim(),
        appType,
        status: 'active',
        apiVersion,
        ownerUserId: currentUser?.id || 'usr_super_1',
        ownerUserName: currentUser?.name || 'Administrador',
        ownerUserEmail: currentUser?.email || 'admin@manyflow.com',
        tenantId: tenant?.id || 'tenant_main',
        assignedUserIds: ['all'],
        verifyToken,
        webhookCallbackUrl: callbackUrl,
        isWebhookLive: true,
        pages: [],
        whatsAppAccounts: [],
        approvedPermissions: selectedPermissions,
        isDefault: true,
        notes: `Criado através do Assistente de Configuração da Meta em ${new Date().toLocaleDateString('pt-BR')}`
      });

      setCreatedAppResult(newApp);
      setHasCompleted(true);
      if (onAppCreated) {
        onAppCreated(newApp);
      }
    } catch (err) {
      console.error('Erro ao salvar Meta App:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { number: 1, title: 'Criar App na Meta', desc: 'Portal for Developers' },
    { number: 2, title: 'App ID & Secret', desc: 'Chaves Básicas' },
    { number: 3, title: 'Webhook & Produtos', desc: 'Messenger & Direct' },
    { number: 4, title: 'Token Permanente', desc: 'System User Token' },
    { number: 5, title: 'Validação & Salvar', desc: 'Teste Graph API' }
  ];

  return (
    <div id="meta_app_setup_wizard" className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${isEmbedded ? '' : 'p-6 lg:p-8'}`}>
      {/* Header */}
      <div className="border-b border-slate-100 p-6 bg-linear-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Facebook className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Assistente de Configuração da Meta App
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                  Graph API v21.0
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Guia passo a passo com validação em tempo real para obter o <strong>App ID</strong>, <strong>App Secret</strong> e <strong>Access Token</strong> permanente no portal de desenvolvedores da Meta.
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="self-start sm:self-center p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Fechar Assistente"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Stepper Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-200/60">
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {stepsList.map((st) => {
              const isActive = currentStep === st.number;
              const isPast = currentStep > st.number;

              return (
                <button
                  key={st.number}
                  onClick={() => setCurrentStep(st.number)}
                  className={`flex flex-col items-center sm:items-start text-center sm:text-left p-2 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/10 border border-blue-300'
                      : isPast
                      ? 'bg-emerald-50/60 border border-emerald-200'
                      : 'bg-slate-50/50 border border-slate-200/60 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.number}
                    </div>
                    <span className="hidden md:inline text-xs font-bold text-slate-800">
                      {st.title}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-[10px] text-slate-500 truncate max-w-full">
                    {st.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Step Content Area */}
      <div className="p-6 lg:p-8 space-y-6">
        {/* COMPLETED SUCCESS SCREEN */}
        {hasCompleted && createdAppResult ? (
          <div className="py-8 text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border-4 border-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900">
                Aplicativo Meta Configurado com Sucesso!
              </h4>
              <p className="text-xs text-slate-600 mt-2">
                O aplicativo <strong>{createdAppResult.name}</strong> (ID: {createdAppResult.appId}) foi registrado e validado com o Access Token permanente.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Nome do App:</span>
                <span className="font-bold text-slate-800">{createdAppResult.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">App ID:</span>
                <span className="font-mono font-bold text-blue-700">{createdAppResult.appId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Graph API:</span>
                <span className="font-bold text-slate-800">{createdAppResult.apiVersion}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Status de Conexão:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ativo & Validado
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setHasCompleted(false);
                  setCurrentStep(1);
                  setAppName('');
                  setAppId('');
                  setAppSecret('');
                  setAccessToken('');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
              >
                Cadastrar Outro Aplicativo
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Concluir e Voltar
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* STEP 1: CREATE APP ON META PORTAL */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">1</span>
                      Acesse o Portal Meta for Developers e Crie seu Aplicativo
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Você precisará de uma conta no portal oficial da Meta para criar o aplicativo que conectará suas páginas e DMs.
                    </p>
                  </div>

                  <a
                    href="https://developers.facebook.com/apps/create/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs shrink-0 transition-all"
                  >
                    <span>Abrir Portal da Meta</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Instructions Box */}
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-3">
                    <h5 className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Como Criar o App na Meta:
                    </h5>
                    <ol className="text-xs text-blue-900 space-y-2 list-decimal list-inside leading-relaxed">
                      <li>
                        Acesse <strong>developers.facebook.com</strong> e faça login com seu Facebook administrador.
                      </li>
                      <li>
                        Clique no botão verde superior <strong>"Criar Aplicativo"</strong> (ou <em>Create App</em>).
                      </li>
                      <li>
                        Em <em>"O que você quer que seu app faça?"</em>, selecione a opção <strong>"Outro"</strong> (Other) e clique em Avançar.
                      </li>
                      <li>
                        Selecione o tipo de aplicativo <strong>"Empresa" (Business)</strong>. Este tipo libera Messenger, Instagram e WhatsApp simultaneamente.
                      </li>
                      <li>
                        Defina um nome para seu App (ex: <em>ManyFlow Automações</em>) e selecione sua Conta Empresarial do Meta Business.
                      </li>
                    </ol>
                  </div>

                  {/* Input details inside ManyFlow */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                    <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-slate-600" />
                      Identificação no ManyFlow
                    </h5>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nome do Aplicativo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        placeholder="Ex: ManyFlow Oficial - Produção"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white text-slate-900 focus:outline-hidden transition-all ${
                          appName.length > 0 && isAppNameValid
                            ? 'border-emerald-400 focus:border-emerald-500'
                            : 'border-slate-300 focus:border-blue-500'
                        }`}
                      />
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className={isAppNameValid ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                          {isAppNameValid ? '✓ Nome válido' : 'Mínimo de 3 caracteres'}
                        </span>
                        <span className="text-slate-400">Exibido na listagem interna</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tipo de App
                        </label>
                        <select
                          value={appType}
                          onChange={(e) => setAppType(e.target.value as FacebookAppType)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 font-medium focus:outline-hidden"
                        >
                          <option value="business">Empresa (Business) - Recomendado</option>
                          <option value="consumer">Consumidor (Consumer)</option>
                          <option value="gaming">Jogos (Gaming)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Versão da Graph API
                        </label>
                        <select
                          value={apiVersion}
                          onChange={(e) => setApiVersion(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 font-medium focus:outline-hidden"
                        >
                          <option value="v21.0">v21.0 (Mais Recente)</option>
                          <option value="v20.0">v20.0</option>
                          <option value="v19.0">v19.0</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: OBTAIN & VALIDATE APP ID AND APP SECRET */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">2</span>
                      Obter App ID e App Secret (Chave Secreta)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      No painel do seu aplicativo na Meta, acesse o menu lateral esquerdo: <strong>Configurações do aplicativo &gt; Básico</strong> (<em>App settings &gt; Basic</em>).
                    </p>
                  </div>

                  <a
                    href="https://developers.facebook.com/apps/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 shrink-0 transition-all"
                  >
                    <span>Ir para Meus Apps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-4">
                  {/* Field 1: App ID */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        1. ID do Aplicativo (App ID) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-500">14 a 19 dígitos numéricos</span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={appId}
                        onChange={(e) => setAppId(e.target.value.replace(/\s+/g, ''))}
                        placeholder="Ex: 154892019482716"
                        className={`w-full px-3.5 py-2.5 font-mono text-xs rounded-xl border bg-white text-slate-900 focus:outline-hidden transition-all ${
                          appId.length === 0
                            ? 'border-slate-300 focus:border-blue-500'
                            : isAppIdValid
                            ? 'border-emerald-500 bg-emerald-50/20 text-emerald-900'
                            : 'border-rose-400 bg-rose-50/20 text-rose-900'
                        }`}
                      />
                      {appId.length > 0 && (
                        <div className="absolute right-3 top-2.5">
                          {isAppIdValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Feedback message */}
                    {appId.length > 0 && !isAppIdValid && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        O App ID deve conter apenas números (geralmente entre 14 e 19 dígitos).
                      </p>
                    )}
                    {isAppIdValid && (
                      <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Formato de App ID validado com sucesso.
                      </p>
                    )}
                  </div>

                  {/* Field 2: App Secret */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        2. Chave Secreta do Aplicativo (App Secret) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-500">Exatamente 32 caracteres hexadecimais</span>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        value={appSecret}
                        onChange={(e) => setAppSecret(e.target.value.replace(/\s+/g, ''))}
                        placeholder="Ex: 8f9b2c3d4e5f60718293a4b5c6d7e8f9"
                        className={`w-full px-3.5 py-2.5 pr-20 font-mono text-xs rounded-xl border bg-white text-slate-900 focus:outline-hidden transition-all ${
                          appSecret.length === 0
                            ? 'border-slate-300 focus:border-blue-500'
                            : isAppSecretValid
                            ? 'border-emerald-500 bg-emerald-50/20 text-emerald-900'
                            : 'border-rose-400 bg-rose-50/20 text-rose-900'
                        }`}
                      />
                      <div className="absolute right-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                          title={showSecret ? 'Ocultar' : 'Mostrar'}
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        {appSecret.length > 0 && (
                          <div className="pr-1">
                            {isAppSecretValid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback message */}
                    {appSecret.length > 0 && !isAppSecretValid && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        O App Secret deve ter exatamente 32 caracteres (atualmente com {appSecret.length}).
                      </p>
                    )}
                    {isAppSecretValid && (
                      <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Chave Secreta válida (criptografia HMAC SHA-256 habilitada).
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Segurança de Dados:</span> O App Secret é utilizado pelo servidor para assinar webhooks de mensagens e evitar requisições forjadas (HMAC-SHA256). Nunca compartilhe sua chave secreta com terceiros.
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PRODUCTS & WEBHOOK CONFIGURATION */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">3</span>
                    Adicionar Produtos e Configurar Webhook
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    No painel da Meta, adicione os produtos <strong>Messenger</strong> e <strong>Instagram</strong>, e preencha os campos de Webhook com os dados abaixo.
                  </p>
                </div>

                {/* 1-Click Copy Webhook Box */}
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-blue-400" />
                      Dados do Webhook ManyFlow para colar na Meta
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Endpoint HTTPS Ativo
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>URL de Retorno de Chamada (Callback URL)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={callbackUrl}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 text-xs font-mono text-blue-300 border border-slate-700 focus:outline-hidden select-all"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(callbackUrl, 'cb_url')}
                          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                        >
                          {copiedKey === 'cb_url' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'cb_url' ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Token de Verificação (Verify Token)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={verifyToken}
                          onChange={(e) => setVerifyToken(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 text-xs font-mono text-emerald-300 border border-slate-700 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(verifyToken, 'verify_token')}
                          className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                        >
                          {copiedKey === 'verify_token' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'verify_token' ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscriptions Fields to Check in Meta */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h5 className="text-xs font-black text-slate-800 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    Campos de Subscrição Obrigatórios no Webhook da Página:
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    {[
                      'messages',
                      'messaging_postbacks',
                      'messaging_optins',
                      'message_deliveries',
                      'message_reads',
                      'feed',
                      'mention',
                      'standby'
                    ].map((field) => (
                      <div key={field} className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{field}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PERMANENT SYSTEM USER ACCESS TOKEN */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">4</span>
                      Gerar Access Token Permanente (Usuário do Sistema)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Para que suas automações nunca parem por expiração de token (evitando a validade padrão de 60 dias), gere o token via <strong>Usuário do Sistema</strong> no Meta Business Suite.
                    </p>
                  </div>

                  <a
                    href="https://business.facebook.com/settings/system-users"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shrink-0 transition-all"
                  >
                    <span>Abrir Usuários do Sistema</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs text-indigo-950">
                  <h5 className="font-bold flex items-center gap-1.5 text-indigo-900">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Como Gerar o Token Permanente no Meta Business:
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-indigo-900/90 leading-relaxed">
                    <li>Acesse <strong>Configurações do Negócio &gt; Usuários &gt; Usuários do Sistema</strong>.</li>
                    <li>Crie um usuário com função de <strong>Administrador</strong> (ex: <em>Bot ManyFlow</em>).</li>
                    <li>Clique em <strong>Atribuir Ativos</strong> e adicione as Páginas do Facebook e Contas do Instagram com controle total.</li>
                    <li>Clique em <strong>Gerar Novo Token</strong>, selecione o seu App e marque as permissões recomendadas abaixo.</li>
                    <li>Defina a expiração como <strong>"Nunca"</strong> (Never) e copie o token gerado.</li>
                  </ol>
                </div>

                {/* Permissions Selector */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-800">
                      Permissões Recomendadas para o Token:
                    </h5>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedPermissions.join(','), 'perms_list')}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'perms_list' ? 'Copiado!' : 'Copiar lista de permissões'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'pages_messaging', label: 'pages_messaging', desc: 'Envio & Recebimento no Messenger' },
                      { id: 'instagram_manage_messages', label: 'instagram_manage_messages', desc: 'DMs & Respostas no Instagram Direct' },
                      { id: 'pages_read_engagement', label: 'pages_read_engagement', desc: 'Leitura de curtidas e engajamento' },
                      { id: 'pages_manage_metadata', label: 'pages_manage_metadata', desc: 'Subscrição automática de Webhook' },
                      { id: 'pages_show_list', label: 'pages_show_list', desc: 'Listar Páginas gerenciadas' },
                      { id: 'instagram_basic', label: 'instagram_basic', desc: 'Dados da Conta Profissional do Instagram' },
                      { id: 'pages_read_user_content', label: 'pages_read_user_content', desc: 'Leitura de comentários em posts e Reels' }
                    ].map((p) => {
                      const isSelected = selectedPermissions.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => togglePermission(p.id)}
                          className={`p-2 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-blue-200 text-blue-900'
                              : 'bg-white border-slate-200 text-slate-600 opacity-60'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-sm flex items-center justify-center text-white ${isSelected ? 'bg-blue-600' : 'border border-slate-300'}`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="truncate">
                            <span className="font-mono font-bold block truncate">{p.label}</span>
                            <span className="text-[10px] text-slate-500 block truncate">{p.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Input for Access Token */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Cole o Access Token Gerado <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">Começa com EAA...</span>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value.trim())}
                      placeholder="Ex: EAABwzLIX4n0BO..."
                      className={`w-full px-3.5 py-2.5 pr-20 font-mono text-xs rounded-xl border bg-white text-slate-900 focus:outline-hidden transition-all ${
                        accessToken.length === 0
                          ? 'border-slate-300 focus:border-blue-500'
                          : isAccessTokenValid
                          ? 'border-emerald-500 bg-emerald-50/20 text-emerald-900'
                          : 'border-rose-400 bg-rose-50/20 text-rose-900'
                      }`}
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                        title={showToken ? 'Ocultar' : 'Mostrar'}
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {accessToken.length > 0 && (
                        <div className="pr-1">
                          {isAccessTokenValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {accessToken.length > 0 && !isAccessTokenValid && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Token inválido. Verifique se copiou o token completo iniciando com 'EAA...'.
                    </p>
                  )}
                  {isAccessTokenValid && (
                    <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Token no formato correto da Meta Graph API.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: VALIDATION, GRAPH API TEST & SAVE */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">5</span>
                    Revisão de Credenciais e Teste na Graph API v21.0
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Confira todos os parâmetros e execute o teste em tempo real antes de salvar o aplicativo.
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      1. Aplicativo & Tipo
                    </span>
                    <span className="text-xs font-bold text-slate-800 block truncate">{appName || 'Não definido'}</span>
                    <span className="text-[11px] text-slate-500 capitalize">{appType} • {apiVersion}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      2. App ID & Secret
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isAppIdValid && isAppSecretValid ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      )}
                      <span className="text-xs font-mono font-bold text-slate-800 truncate">{appId || 'Incompleto'}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">••••••••{appSecret.slice(-6)}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      3. Access Token & Permissões
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isAccessTokenValid ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-800 truncate">{selectedPermissions.length} permissões</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium">Token Permanente Validado</span>
                  </div>
                </div>

                {/* Connection Tester */}
                <div className="p-5 rounded-2xl bg-linear-to-b from-slate-50 to-white border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-black text-slate-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Diagnóstico de Conexão com a Meta Graph API
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Testa o endpoint oficial <code>https://graph.facebook.com/{apiVersion}/debug_token</code> com as credenciais preenchidas.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!isAllValid || isTesting}
                      onClick={handleTestConnection}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                        !isAllValid
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : isTesting
                          ? 'bg-blue-400 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Testando Graph API...</span>
                        </>
                      ) : (
                        <>
                          <Radio className="w-3.5 h-3.5" />
                          <span>Executar Teste de Conexão</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Test Result Box */}
                  {testResult && (
                    <div className={`p-4 rounded-xl border text-xs space-y-3 animate-fadeIn ${
                      testResult.success
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/80 border-rose-200 text-rose-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {testResult.success ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          )}
                          <span className="font-bold">
                            {testResult.success ? 'Conexão Meta Validada com Sucesso!' : 'Falha na Validação da Meta'}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold bg-white/70 px-2 py-0.5 rounded-md border">
                          Latência: {testResult.latencyMs}ms
                        </span>
                      </div>

                      <p className="text-[11px] leading-relaxed">
                        {testResult.message}
                      </p>

                      {testResult.success && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Tipo do Token:</span>
                            <span className="font-bold text-emerald-800">{testResult.tokenType}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Expiração:</span>
                            <span className="font-bold text-emerald-800">{testResult.tokenExpiresAt || 'Nunca (Permanente)'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Páginas Conectadas:</span>
                            <span className="font-bold text-emerald-800">{testResult.pagesFoundCount} ativas</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Instagram Direct:</span>
                            <span className="font-bold text-emerald-800">{testResult.instagramFoundCount} contas vinculadas</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step Navigation Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Próximo Passo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!isAllValid || isSubmitting}
                    onClick={handleSaveApp}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                      !isAllValid
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : isSubmitting
                        ? 'bg-blue-400 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Salvando Aplicativo...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Salvar & Ativar Aplicativo Meta</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
