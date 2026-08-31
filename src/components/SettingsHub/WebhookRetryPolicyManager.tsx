import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Shield,
  ShieldAlert,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Sliders,
  Play,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Info,
  Server,
  ArrowRight,
  Database,
  Flame,
  Radio,
  FileCode,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import {
  WebhookRetryPolicy,
  WebhookBackoffStrategy,
  WebhookDeadLetterItem,
  WebhookRetryQueueItem,
  ExternalMessageWebhookEndpoint,
  WebhookRetryStepInfo,
  WebhookRetryAttemptLog
} from '../../types';
import {
  webhookRetryService,
  DEFAULT_RETRY_POLICY,
  RETRY_POLICY_PRESETS
} from '../../services/webhookRetryService';
import { externalWebhookService } from '../../services/externalWebhookService';

interface WebhookRetryPolicyManagerProps {
  tenantId?: string;
  initialEndpoint?: ExternalMessageWebhookEndpoint | null;
  onPolicySaved?: (policy: WebhookRetryPolicy) => void;
  onClose?: () => void;
}

export const WebhookRetryPolicyManager: React.FC<WebhookRetryPolicyManagerProps> = ({
  tenantId = 'tenant_main',
  initialEndpoint,
  onPolicySaved,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'policy_config' | 'simulator' | 'dlq' | 'active_queue'>('policy_config');
  const [policy, setPolicy] = useState<WebhookRetryPolicy>(() => {
    if (initialEndpoint?.retryPolicy) {
      return { ...DEFAULT_RETRY_POLICY, ...initialEndpoint.retryPolicy };
    }
    return webhookRetryService.getGlobalPolicy();
  });
  const [endpoints, setEndpoints] = useState<ExternalMessageWebhookEndpoint[]>([]);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(initialEndpoint?.id || '');
  const [dlqItems, setDlqItems] = useState<WebhookDeadLetterItem[]>([]);
  const [activeQueueItems, setActiveQueueItems] = useState<WebhookRetryQueueItem[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedDlqItem, setSelectedDlqItem] = useState<WebhookDeadLetterItem | null>(null);

  // Simulator State
  const [simulatedErrorCode, setSimulatedErrorCode] = useState<number>(503);
  const [simulateFailUntil, setSimulateFailUntil] = useState<number>(999);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedLogs, setSimulatedLogs] = useState<WebhookRetryAttemptLog[]>([]);
  const [simNextDelay, setSimNextDelay] = useState<number | null>(null);
  const [simCurrentAttempt, setSimCurrentAttempt] = useState<number>(0);
  const [simResultSuccess, setSimResultSuccess] = useState<boolean | null>(null);

  // New status code input helper
  const [newStatusCodeInput, setNewStatusCodeInput] = useState<string>('');

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadQueues();
    }, 4000);
    return () => clearInterval(interval);
  }, [tenantId]);

  const loadData = async () => {
    try {
      const eList = await externalWebhookService.getEndpoints(tenantId);
      setEndpoints(eList);
      if (!selectedEndpointId && eList.length > 0) {
        setSelectedEndpointId(eList[0].id);
      }
      await loadQueues();
    } catch (err) {
      console.warn('Failed loading endpoints for retry manager', err);
    }
  };

  const loadQueues = async () => {
    const [dlq, q] = await Promise.all([
      webhookRetryService.getDeadLetterQueue(tenantId),
      webhookRetryService.getRetryQueue(tenantId)
    ]);
    setDlqItems(dlq);
    setActiveQueueItems(q);
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = RETRY_POLICY_PRESETS[presetKey];
    if (preset) {
      setPolicy(preset.policy);
    }
  };

  const handleSavePolicy = async () => {
    webhookRetryService.saveGlobalPolicy(policy);

    // If an endpoint is selected, update that specific endpoint's policy as well
    if (selectedEndpointId) {
      const endpoint = endpoints.find((e) => e.id === selectedEndpointId);
      if (endpoint) {
        const updated: ExternalMessageWebhookEndpoint = {
          ...endpoint,
          maxRetries: policy.maxRetries,
          retryPolicy: policy
        };
        await externalWebhookService.saveEndpoint(updated);
        setEndpoints((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      }
    }

    if (onPolicySaved) {
      onPolicySaved(policy);
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run Simulator
  const handleStartSimulation = async () => {
    const endpoint = endpoints.find((e) => e.id === selectedEndpointId) || endpoints[0];
    if (!endpoint) return;

    setIsSimulating(true);
    setSimulatedLogs([]);
    setSimResultSuccess(null);
    setSimNextDelay(null);
    setSimCurrentAttempt(1);

    const testEndpoint: ExternalMessageWebhookEndpoint = {
      ...endpoint,
      retryPolicy: policy,
      maxRetries: policy.maxRetries
    };

    try {
      const result = await externalWebhookService.testDispatchWithRetry(testEndpoint, 'message.received', {
        simulatedFailureCode: simulatedErrorCode,
        simulateFailUntilAttempt: simulateFailUntil,
        fastSimulation: true,
        onStepProgress: (stepLog, nextDelay, isFinished) => {
          setSimulatedLogs((prev) => [...prev, stepLog]);
          setSimNextDelay(nextDelay);
          setSimCurrentAttempt(stepLog.attemptNumber);
          if (isFinished) {
            setSimResultSuccess(stepLog.status === 'success');
          }
        }
      });

      setSimResultSuccess(result.status === 'success');
      await loadQueues();
    } catch (err) {
      console.error('Simulation failed', err);
    } finally {
      setIsSimulating(false);
      setSimNextDelay(null);
    }
  };

  // DLQ Actions
  const handleReprocessDlq = async (item: WebhookDeadLetterItem) => {
    const endpoint = endpoints.find((e) => e.id === item.endpointId);
    if (!endpoint) return;

    await webhookRetryService.markDlqReprocessed(item.id);
    await externalWebhookService.testDispatchWithRetry(endpoint, item.event, {
      fastSimulation: true
    });
    await loadQueues();
  };

  const handleReprocessAllDlq = async () => {
    for (const item of dlqItems.filter((i) => i.status === 'queued')) {
      await handleReprocessDlq(item);
    }
  };

  const handleClearDlq = async () => {
    if (window.confirm('Tem certeza que deseja limpar todas as mensagens em quarentena (Dead Letter Queue)?')) {
      await webhookRetryService.clearDeadLetterQueue();
      await loadQueues();
      setSelectedDlqItem(null);
    }
  };

  const handleDeleteDlqItem = async (id: string) => {
    await webhookRetryService.deleteDlqItem(id);
    await loadQueues();
    if (selectedDlqItem?.id === id) {
      setSelectedDlqItem(null);
    }
  };

  // Add / Remove Retryable Status Codes
  const handleAddStatusCode = () => {
    const code = parseInt(newStatusCodeInput.trim(), 10);
    if (!isNaN(code) && code >= 100 && code <= 599) {
      if (!policy.retryableStatusCodes.includes(code)) {
        setPolicy({
          ...policy,
          retryableStatusCodes: [...policy.retryableStatusCodes, code].sort((a, b) => a - b)
        });
      }
      setNewStatusCodeInput('');
    }
  };

  const handleRemoveStatusCode = (codeToRemove: number) => {
    setPolicy({
      ...policy,
      retryableStatusCodes: policy.retryableStatusCodes.filter((c) => c !== codeToRemove)
    });
  };

  const scheduleProjection = webhookRetryService.calculateSchedule(policy);
  const totalProjectedDuration = scheduleProjection[scheduleProjection.length - 1]?.cumulativeWaitSeconds || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-500/20 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
              <RotateCcw className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Políticas de Retry Automático & Backoff Exponencial
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                  Resiliência de Entrega
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Dead Letter Queue (DLQ)
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Garanta que nenhum webhook ou mensagem seja perdida quando CRMs externos, n8n, Typebot ou servidores upstream oscilarem. Configure curvas exponenciais com Jitter para evitar efeito avalanche (*Thundering Herd*).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Fechar</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('policy_config')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'policy_config'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Configuração da Curva & Backoff</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Simulador de Falhas & Retentativas</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500/30 text-amber-200">
              Ao Vivo
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dlq')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'dlq'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Dead Letter Queue (Quarentena)</span>
            {dlqItems.filter((i) => i.status === 'queued').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {dlqItems.filter((i) => i.status === 'queued').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('active_queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'active_queue'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Fila em Execução</span>
            {activeQueueItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-500 text-white">
                {activeQueueItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: POLICY CONFIGURATION & BACKOFF CURVE */}
      {/* ========================================================================= */}
      {activeTab === 'policy_config' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Presets */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Presets Bar */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Presets Prontos de Política</span>
                </span>
                <span className="text-[11px] text-slate-400">1-Clique para aplicar</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(RETRY_POLICY_PRESETS).map(([key, item]) => {
                  const isCurrent = policy.maxRetries === item.policy.maxRetries && policy.strategy === item.policy.strategy;
                  return (
                    <button
                      key={key}
                      onClick={() => handleApplyPreset(key)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <span className={`text-xs font-black ${isCurrent ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Form Fields */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-black">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Parâmetros da Curva de Retentativa
                    </h3>
                    <p className="text-xs text-slate-500">
                      Defina como o ManyFlow incrementa o tempo de espera entre tentativas
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {policy.enabled ? 'Retry Ativo' : 'Desativado'}
                  </span>
                  <input
                    type="checkbox"
                    checked={policy.enabled}
                    onChange={(e) => setPolicy({ ...policy, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Endpoint Context Selector (Optional per endpoint override) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Aplicar Política Para:</span>
                  <span className="text-[10px] text-slate-400">Padrão Global ou Endpoint Específico</span>
                </label>
                <select
                  value={selectedEndpointId}
                  onChange={(e) => setSelectedEndpointId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="">⚙️ Todos os Webhooks (Política Padrão Global)</option>
                  {endpoints.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      🔗 {ep.name} ({ep.targetUrl})
                    </option>
                  ))}
                </select>
              </div>

              {/* Strategy and Multiplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Estratégia de Backoff
                  </label>
                  <select
                    value={policy.strategy}
                    onChange={(e) => setPolicy({ ...policy, strategy: e.target.value as WebhookBackoffStrategy })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="exponential_jitter">⚡ Exponencial com Jitter (Recomendado)</option>
                    <option value="exponential">📈 Exponencial Puro (T0 * Multiplier^n)</option>
                    <option value="fibonacci">🌀 Fibonacci (Série Harmônica)</option>
                    <option value="linear">📐 Linear (T0 * n)</option>
                    <option value="fixed">⏱️ Intervalo Fixo (T0 constante)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Multiplicador (Fator Base)</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono font-black">
                      {policy.multiplier}x
                    </span>
                  </label>
                  <select
                    value={policy.multiplier}
                    onChange={(e) => setPolicy({ ...policy, multiplier: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="1.5">1.5x (Crescimento Suave)</option>
                    <option value="2.0">2.0x (Padrão Indústria - Dobra o tempo)</option>
                    <option value="2.5">2.5x (Crescimento Acentuado)</option>
                    <option value="3.0">3.0x (Crescimento Rápido)</option>
                  </select>
                </div>
              </div>

              {/* Sliders: Max Retries and Initial Interval */}
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Número Máximo de Tentativas (Retries)
                    </label>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {policy.maxRetries} tentativas adicionais
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={policy.maxRetries}
                    onChange={(e) => setPolicy({ ...policy, maxRetries: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1 tentativa</span>
                    <span>3 (Rápido)</span>
                    <span>5 (Padrão)</span>
                    <span>10 (Máx Resiliência)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Intervalo Inicial ($T_0$)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0.5}
                        max={60}
                        step={0.5}
                        value={policy.initialIntervalSeconds}
                        onChange={(e) => setPolicy({ ...policy, initialIntervalSeconds: Math.max(0.5, parseFloat(e.target.value) || 1) })}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white"
                      />
                      <span className="text-xs font-bold text-slate-500">segundos</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Teto Máximo ($T_{'{'}max{'}'}$)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={7200}
                        step={10}
                        value={policy.maxIntervalSeconds}
                        onChange={(e) => setPolicy({ ...policy, maxIntervalSeconds: Math.max(10, parseInt(e.target.value, 10) || 60) })}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white"
                      />
                      <span className="text-xs font-bold text-slate-500">segundos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jitter Switch */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="enable_jitter"
                  checked={policy.enableJitter}
                  onChange={(e) => setPolicy({ ...policy, enableJitter: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="enable_jitter" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer leading-relaxed">
                  <span className="font-black text-indigo-950 dark:text-indigo-200 block mb-0.5">
                    Ativar Full Jitter (Descorrelação Aleatória)
                  </span>
                  Adiciona uma variação aleatória de até 35% ao intervalo. Evita que centenas de webhooks que falharam juntos colidam no mesmo segundo exato, prevenindo sobrecarga em cascata no servidor de destino.
                </label>
              </div>

              {/* Status Codes Eligible for Retry */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Códigos HTTP Elegíveis para Retentativa</span>
                  <span className="text-[10px] text-slate-400">Erros transitórios de rede / servidor</span>
                </label>

                <div className="flex flex-wrap items-center gap-1.5">
                  {policy.retryableStatusCodes.map((code) => (
                    <span
                      key={code}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1.5"
                    >
                      <span>{code}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStatusCode(code)}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <div className="flex items-center gap-1 ml-2">
                    <input
                      type="number"
                      placeholder="Ex: 503"
                      value={newStatusCodeInput}
                      onChange={(e) => setNewStatusCodeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddStatusCode()}
                      className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddStatusCode}
                      className="px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Dead Letter Queue (DLQ) Toggle */}
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="dlq_enabled"
                  checked={policy.deadLetterQueue?.enabled}
                  onChange={(e) => setPolicy({
                    ...policy,
                    deadLetterQueue: { ...policy.deadLetterQueue, enabled: e.target.checked }
                  })}
                  className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <label htmlFor="dlq_enabled" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer leading-relaxed">
                  <span className="font-black text-rose-950 dark:text-rose-200 block mb-0.5">
                    Quarentena Automática (Dead Letter Queue - DLQ)
                  </span>
                  Ao esgotar todas as {policy.maxRetries} tentativas sem sucesso, arquiva o payload intacto na fila de quarentena para auditoria e reprocessamento manual em 1-clique.
                </label>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500">
                  {isSaved ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Política salva com sucesso no sistema!
                    </span>
                  ) : (
                    'As alterações terão efeito imediato em todos os despachos de webhook.'
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleSavePolicy}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Shield className="w-4 h-4" />
                  <span>Salvar Política de Backoff</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Curve & Projection Table */}
          <div className="lg:col-span-5 space-y-6">
            {/* Mathematical Formula Card */}
            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-slate-800 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Fórmula & Projeção Matemática</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Total: ~{totalProjectedDuration}s
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 font-mono text-center space-y-1">
                <p className="text-sm font-black text-indigo-300">
                  Delay(n) = min(Tmax, T₀ × {policy.multiplier}ⁿ⁻¹) {policy.enableJitter ? '± Jitter' : ''}
                </p>
                <p className="text-[11px] text-slate-400">
                  T₀ = {policy.initialIntervalSeconds}s | Tmax = {policy.maxIntervalSeconds}s | Retries = {policy.maxRetries}
                </p>
              </div>

              {/* Step-by-Step Schedule Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Linha do Tempo Projetada ({scheduleProjection.length} passos):
                </span>

                <div className="space-y-2">
                  {scheduleProjection.map((step) => {
                    const isInitial = step.attempt === 0;
                    return (
                      <div
                        key={step.attempt}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          isInitial
                            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                            : 'bg-slate-800/60 border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                              isInitial ? 'bg-emerald-500/30 text-emerald-300' : 'bg-indigo-500/30 text-indigo-300'
                            }`}
                          >
                            #{step.attempt}
                          </div>
                          <div>
                            <span className="text-xs font-bold block">{step.description}</span>
                            <span className="text-[10px] text-slate-400">
                              {isInitial ? 'Disparo inicial do webhook' : `Aguardar +${step.delaySeconds}s`}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-black block text-indigo-300">
                            t = {step.cumulativeWaitSeconds}s
                          </span>
                          <span className="text-[10px] text-slate-400">decorrido</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DLQ Endpoint Footer */}
              {policy.deadLetterQueue?.enabled && (
                <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-900/60 flex items-center gap-2.5 text-xs text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    Após a tentativa #{policy.maxRetries}, o ManyFlow arquiva o evento na <strong>Dead Letter Queue (DLQ)</strong> sem descarte de dados.
                  </span>
                </div>
              )}
            </div>

            {/* Microservices Resiliency Tips */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-500" />
                <span>Boas Práticas de Engenharia</span>
              </span>

              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed list-disc list-inside">
                <li>
                  <strong>Status 429 (Rate Limit):</strong> O backoff exponencial permite que a janela de quota da API externa resete antes da próxima tentativa.
                </li>
                <li>
                  <strong>Status 503 (Manutenção):</strong> Espaçar tentativas até 300s permite que deploys e reinicializações de servidores de terceiros terminem com sucesso.
                </li>
                <li>
                  <strong>Erros 4xx (400, 401, 403):</strong> São abortados imediatamente pois reenvios idênticos com credenciais incorretas continuariam falhando.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE SIMULATOR & FAILOVER STRESS TESTER */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-500" />
                <span>Simulador de Falhas & Retentativas em Tempo Real</span>
              </h3>
              <p className="text-xs text-slate-500">
                Simule falhas de rede e respostas HTTP (503, 429, 408) para testar o comportamento do Backoff Exponencial
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Simular Resposta:</span>
                <select
                  value={simulatedErrorCode}
                  onChange={(e) => setSimulatedErrorCode(parseInt(e.target.value, 10))}
                  disabled={isSimulating}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value={503}>HTTP 503 - Service Unavailable</option>
                  <option value={429}>HTTP 429 - Too Many Requests (Rate Limit)</option>
                  <option value={408}>HTTP 408 - Request Timeout</option>
                  <option value={502}>HTTP 502 - Bad Gateway</option>
                  <option value={504}>HTTP 504 - Gateway Timeout</option>
                  <option value={401}>HTTP 401 - Unauthorized (Aborto Fatal)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Falhar até tentativa:</span>
                <select
                  value={simulateFailUntil}
                  onChange={(e) => setSimulateFailUntil(parseInt(e.target.value, 10))}
                  disabled={isSimulating}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value={2}>Tentativa #2 (Recupera no 2º retry)</option>
                  <option value={3}>Tentativa #3 (Recupera no 3º retry)</option>
                  <option value={999}>Todas (Esgota e envia para DLQ)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleStartSimulation}
                disabled={isSimulating}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Simulando Backoff...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Disparar Simulação</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real-time Visual Execution Steps */}
          <div className="space-y-4">
            {isSimulating && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                    #{simCurrentAttempt}
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-950 dark:text-amber-200 block">
                      Executando Ciclo de Backoff (Tentativa #{simCurrentAttempt})
                    </span>
                    <span className="text-[11px] text-amber-800 dark:text-amber-300">
                      {simNextDelay ? `Aguardando intervalo de +${simNextDelay}s com Jitter antes do próximo retry...` : 'Transcrevendo requisição...'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                    Em Progresso
                  </span>
                </div>
              </div>
            )}

            {simulatedLogs.length === 0 && !isSimulating && (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Play className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  Nenhuma simulação executada nesta sessão.
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Clique no botão "Disparar Simulação" acima para acompanhar a curva de tentativas, timeouts e redirecionamento para a Dead Letter Queue.
                </p>
              </div>
            )}

            {simulatedLogs.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                  Linha de Execução em Tempo Real ({simulatedLogs.length} eventos registrados):
                </span>

                <div className="space-y-2">
                  {simulatedLogs.map((log) => {
                    const isSuccess = log.status === 'success';
                    return (
                      <div
                        key={log.attemptNumber}
                        className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          isSuccess
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
                            : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center ${
                              isSuccess
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                            }`}
                          >
                            #{log.attemptNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {log.attemptNumber === 1 ? 'Tentativa Inicial' : `Retentativa #${log.attemptNumber - 1}`}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                                  isSuccess
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                                }`}
                              >
                                HTTP {log.statusCode}
                              </span>
                              {log.delaySeconds > 0 && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  (Backoff: +{log.delaySeconds}s)
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {log.errorMessage || 'Requisição aceita e confirmada pelo servidor remoto.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono">
                          <span className="text-slate-500">
                            Latência: <strong>{log.durationMs}ms</strong>
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {new Date(log.executedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Final Result Card */}
                {simResultSuccess !== null && !isSimulating && (
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between mt-4 ${
                      simResultSuccess
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {simResultSuccess ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      )}
                      <div>
                        <span className="font-black text-xs block">
                          {simResultSuccess
                            ? 'Transmissão Recuperada com Sucesso!'
                            : 'Tentativas Esgotadas - Payload Armazenado em Quarentena (DLQ)'}
                        </span>
                        <span className="text-[11px] opacity-80">
                          {simResultSuccess
                            ? 'O webhook foi entregue em um ciclo posterior de backoff sem perda de dados.'
                            : 'O evento está disponível na aba Dead Letter Queue para reprocessamento manual.'}
                        </span>
                      </div>
                    </div>

                    {!simResultSuccess && (
                      <button
                        onClick={() => setActiveTab('dlq')}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
                      >
                        Ver na DLQ →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DEAD LETTER QUEUE (DLQ / QUARENTENA) */}
      {/* ========================================================================= */}
      {activeTab === 'dlq' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Dead Letter Queue (Quarentena de Falhas Esgotadas)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mensagens que falharam após todas as tentativas de backoff e estão retidas com segurança
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {dlqItems.filter((i) => i.status === 'queued').length > 0 && (
                  <button
                    type="button"
                    onClick={handleReprocessAllDlq}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reprocessar Todos ({dlqItems.filter((i) => i.status === 'queued').length})</span>
                  </button>
                )}

                {dlqItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearDlq}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-700 text-slate-600 dark:text-slate-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar DLQ</span>
                  </button>
                )}
              </div>
            </div>

            {dlqItems.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500/50" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Nenhum evento em quarentena na Dead Letter Queue!
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Todos os webhooks enviados foram confirmados com sucesso ou recuperados durante a janela de backoff exponencial.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {dlqItems.map((item) => {
                  const isReprocessed = item.status === 'reprocessed';
                  return (
                    <div
                      key={item.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 p-3 rounded-2xl transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shrink-0 ${
                            isReprocessed
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {isReprocessed ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {item.endpointName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              HTTP {item.lastStatusCode}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {item.totalAttempts} tentativas esgotadas
                            </span>
                            {isReprocessed && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                                Reprocessado
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 font-mono truncate max-w-xl">
                            {item.targetUrl}
                          </p>
                          <p className="text-[11px] text-rose-600 dark:text-rose-400">
                            {item.lastErrorMessage}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedDlqItem(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Inspecionar Payload</span>
                        </button>

                        {!isReprocessed && (
                          <button
                            type="button"
                            onClick={() => handleReprocessDlq(item)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reexecutar Agora</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteDlqItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Remover da Quarentena"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Payload Inspector */}
          {selectedDlqItem && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-500" />
                    <span>Payload do Evento em Quarentena ({selectedDlqItem.event})</span>
                  </h4>
                  <button
                    onClick={() => setSelectedDlqItem(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Destino: <strong>{selectedDlqItem.targetUrl}</strong></span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(selectedDlqItem.payload, null, 2), 'dlqPayload')}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'dlqPayload' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'dlqPayload' ? 'Copiado!' : 'Copiar JSON'}</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
                    {JSON.stringify(selectedDlqItem.payload, null, 2)}
                  </pre>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedDlqItem(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      handleReprocessDlq(selectedDlqItem);
                      setSelectedDlqItem(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reprocessar Agora</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACTIVE RETRY QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'active_queue' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Fila de Retentativas em Espera (Backoff Ativo)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tarefas temporizadas aguardando o vencimento do cronômetro de backoff para o próximo disparo
              </p>
            </div>
            <button
              onClick={loadQueues}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Atualizar</span>
            </button>
          </div>

          {activeQueueItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Clock className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Nenhum webhook em espera no momento.
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                A fila é populada automaticamente quando um endpoint responde com status de erro transitório elegível.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeQueueItems.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-blue-950 dark:text-blue-200">
                        {task.endpointName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
                        Tentativa #{task.currentAttempt} de {task.maxRetries}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-500 truncate max-w-md">
                      {task.targetUrl}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-blue-700 dark:text-blue-300 block">
                        Próximo disparo em: {task.secondsRemaining}s
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Agendado para: {new Date(task.scheduledExecutionAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
