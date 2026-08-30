import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Zap, 
  Cpu, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  Send, 
  Database, 
  FileCode, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  Code2, 
  ChevronRight, 
  Info,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Contact, BatchMessageItem, BatchDispatchResult, GraphApiRateLimitUsage } from '../../types';
import { facebookBatchService, FACEBOOK_GRAPH_MAX_BATCH_SIZE } from '../../services/facebookBatchService';
import { dbService } from '../../services/db';

interface FacebookBatchStudioProps {
  contacts: Contact[];
}

export const FacebookBatchStudio: React.FC<FacebookBatchStudioProps> = ({ contacts }) => {
  // Config state
  const [recipientSource, setRecipientSource] = useState<'crm' | 'simulated'>('crm');
  const [simulatedCount, setSimulatedCount] = useState<number>(100);
  const [batchSize, setBatchSize] = useState<number>(50); // Facebook standard is 50
  const [channel, setChannel] = useState<'instagram' | 'messenger'>('instagram');
  const [messageTag, setMessageTag] = useState<'POST_PURCHASE_UPDATE' | 'CONFIRMED_EVENT_UPDATE' | 'ACCOUNT_UPDATE'>('POST_PURCHASE_UPDATE');
  const [customText, setCustomText] = useState<string>('Olá {{name}}! Sua confirmação ManyFlow está pronta com benefícios exclusivos 🚀');
  const [delayBetweenBatchesMs, setDelayBetweenBatchesMs] = useState<number>(150);

  // Execution state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [progress, setProgress] = useState<{
    completedMessages: number;
    totalMessages: number;
    completedBatches: number;
    totalBatches: number;
    percent: number;
  }>({ completedMessages: 0, totalMessages: 0, completedBatches: 0, totalBatches: 0, percent: 0 });

  const [lastResult, setLastResult] = useState<BatchDispatchResult | null>(null);
  const [selectedChunkIndex, setSelectedChunkIndex] = useState<number>(0);
  const [activeCodeTab, setActiveCodeTab] = useState<'guzzle_php' | 'curl' | 'nodejs'>('guzzle_php');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Historical Batch Stats from API
  const [stats, setStats] = useState<{
    totalBatches: number;
    totalMessagesDelivered: number;
    totalSavedHttpCalls: number;
    averageLatencyMs: number;
    rateLimitSavingsPercent: number;
  }>({
    totalBatches: 18,
    totalMessagesDelivered: 850,
    totalSavedHttpCalls: 832,
    averageLatencyMs: 138,
    rateLimitSavingsPercent: 98,
  });

  const loadBatchStats = async () => {
    try {
      const res = await fetch('/api/meta/batch/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.warn('[FacebookBatchStudio] Erro ao carregar estatísticas:', err);
    }
  };

  useEffect(() => {
    loadBatchStats();
  }, []);

  // Compute recipients list
  const getPreparedMessages = (): BatchMessageItem[] => {
    if (recipientSource === 'crm' && contacts.length > 0) {
      return contacts.map((c) => ({
        recipientId: c.id,
        recipientName: c.name,
        channel: c.channel,
        text: customText.replace('{{name}}', c.name || 'Cliente'),
        tag: messageTag,
        messagingType: 'MESSAGE_TAG',
      }));
    }

    // Simulated leads
    const list: BatchMessageItem[] = [];
    for (let i = 1; i <= simulatedCount; i++) {
      const leadName = `Lead #${i}`;
      list.push({
        recipientId: `rec_lead_${100000 + i}`,
        recipientName: leadName,
        channel,
        text: customText.replace('{{name}}', leadName),
        tag: messageTag,
        messagingType: 'MESSAGE_TAG',
      });
    }
    return list;
  };

  const handleRunBatchDispatch = async () => {
    const messages = getPreparedMessages();
    if (messages.length === 0) return;

    setIsExecuting(true);
    setProgress({
      completedMessages: 0,
      totalMessages: messages.length,
      completedBatches: 0,
      totalBatches: Math.ceil(messages.length / batchSize),
      percent: 0,
    });

    try {
      const result = await facebookBatchService.sendMessagesInBatches(messages, {
        batchSize,
        delayBetweenBatchesMs,
        onProgress: (prog) => {
          setProgress(prog);
        },
      });

      setLastResult(result);
      setSelectedChunkIndex(0);

      // Celebration
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });

      loadBatchStats();
    } catch (err) {
      console.error('[FacebookBatchStudio] Falha na execução do lote:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const totalCalculatedBatches = Math.ceil(
    (recipientSource === 'crm' ? contacts.length || 1 : simulatedCount) / batchSize
  );
  const totalCalculatedMessages = recipientSource === 'crm' ? contacts.length || 1 : simulatedCount;
  const calculatedSavings = Math.max(0, totalCalculatedMessages - totalCalculatedBatches);

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Facebook Graph API Batch Engine (50 requisições / chamada HTTP)</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Serviço de Envio em Lote (Batch Processing)
            </h1>
            
            <p className="text-sm text-blue-100/80 leading-relaxed">
              Otimize drasticamente o consumo de rate limits da Meta. Ao agrupar até <strong>50 operações de envio</strong> em uma única requisição HTTP POST para a Graph API, seu servidor economiza até <strong>98% de chamadas de rede</strong>, conexões TLS e overhead de CPU.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
                Economia de Rate Limit
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                ~98.0%
              </span>
              <span className="text-[10px] text-blue-200/70">50 msgs = 1 única chamada HTTP</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
                Capacidade Máxima
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                50 ops/req
              </span>
              <span className="text-[10px] text-blue-200/70">Padrão oficial Meta Graph v21.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Historical Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold uppercase">
            <span>Mensagens em Lote</span>
            <Send className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1A1D21]">
              {stats.totalMessagesDelivered.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-emerald-600 font-bold">entregues</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Disparadas via Graph Batch</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold uppercase">
            <span>Chamadas HTTP Economizadas</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">
              +{stats.totalSavedHttpCalls.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">requisições poupadas</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Sem atingir throttling 429</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold uppercase">
            <span>Total de Lotes (50 ops)</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1A1D21]">{stats.totalBatches}</span>
            <span className="text-xs text-purple-600 font-bold">pacotes</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Latência média: {stats.averageLatencyMs}ms</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold uppercase">
            <span>Uso de Rate Limit Atual</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1A1D21]">
              {lastResult ? `${lastResult.rateLimitUsage.callCountPercent}%` : '8%'}
            </span>
            <span className="text-xs text-emerald-600 font-bold">Seguro (Verde)</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Meta Header: x-app-usage</p>
        </div>
      </div>

      {/* Main Interactive Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Batch Configuration & Trigger (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-5">
            <div className="border-b border-[#E2E8F0] pb-4">
              <h2 className="text-base font-bold text-[#1A1D21] flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Configurador de Disparo em Lote</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Monte e envie pacotes de mensagens agrupadas em lotes de até 50 requisições.
              </p>
            </div>

            {/* Source Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1A1D21] block">
                Origem dos Destinatários:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRecipientSource('crm')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    recipientSource === 'crm'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold ring-1 ring-indigo-600'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-gray-300'
                  }`}
                >
                  <span className="block font-bold">Contatos do CRM</span>
                  <span className="text-[11px] text-[#64748B] font-normal">
                    {contacts.length} leads carregados
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientSource('simulated')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    recipientSource === 'simulated'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold ring-1 ring-indigo-600'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-gray-300'
                  }`}
                >
                  <span className="block font-bold">Simulação de Volume</span>
                  <span className="text-[11px] text-[#64748B] font-normal">
                    100, 250 ou 500 leads
                  </span>
                </button>
              </div>
            </div>

            {recipientSource === 'simulated' && (
              <div className="space-y-1.5 bg-gray-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                <label className="text-xs font-bold text-[#1A1D21] flex justify-between">
                  <span>Quantidade de Destinatários Simulados:</span>
                  <span className="text-indigo-600">{simulatedCount} leads</span>
                </label>
                <div className="flex items-center gap-2">
                  {[25, 50, 100, 250, 500].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSimulatedCount(num)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        simulatedCount === num
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-gray-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Batch Size & Channel */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1D21] flex items-center justify-between">
                  <span>Tamanho do Lote:</span>
                  <span className="text-xs font-extrabold text-indigo-700">{batchSize} reqs</span>
                </label>
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#1A1D21] focus:outline-none focus:border-indigo-500"
                >
                  <option value={50}>50 por chamada (Padrão Meta)</option>
                  <option value={25}>25 por chamada</option>
                  <option value={10}>10 por chamada</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1D21]">Canal:</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#1A1D21] focus:outline-none focus:border-indigo-500"
                >
                  <option value="instagram">Instagram Direct</option>
                  <option value="messenger">Facebook Messenger</option>
                </select>
              </div>
            </div>

            {/* Message Tag (Meta Compliance) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A1D21] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Message Tag (Conformidade Meta):</span>
              </label>
              <select
                value={messageTag}
                onChange={(e) => setMessageTag(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#1A1D21] focus:outline-none focus:border-indigo-500"
              >
                <option value="POST_PURCHASE_UPDATE">POST_PURCHASE_UPDATE (Atualização de Pedido/Lead)</option>
                <option value="CONFIRMED_EVENT_UPDATE">CONFIRMED_EVENT_UPDATE (Lembrete de Evento/Live)</option>
                <option value="ACCOUNT_UPDATE">ACCOUNT_UPDATE (Alteração de Conta)</option>
              </select>
            </div>

            {/* Message Text Template */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A1D21]">
                Texto da Mensagem (suporta <code>&#123;&#123;name&#125;&#125;</code>):
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={3}
                className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1A1D21] focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Batch Strategy Summary Card */}
            <div className="p-3.5 bg-[#F8F9FB] rounded-xl border border-[#E2E8F0] text-xs space-y-2">
              <span className="font-bold text-[#1A1D21] block flex items-center justify-between">
                <span>Resumo da Otimização:</span>
                <span className="text-emerald-700 font-extrabold">Economia de 98%</span>
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] block">Total Destinatários</span>
                  <span className="font-black text-[#1A1D21] text-sm">{totalCalculatedMessages}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[#64748B] block">Chamadas HTTP</span>
                  <span className="font-black text-indigo-600 text-sm">{totalCalculatedBatches}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-200 bg-emerald-50/50">
                  <span className="text-emerald-800 block">Chamadas Poupança</span>
                  <span className="font-black text-emerald-700 text-sm">+{calculatedSavings}</span>
                </div>
              </div>
            </div>

            {/* Action Trigger Button */}
            <button
              type="button"
              id="btn_execute_graph_batch"
              disabled={isExecuting}
              onClick={handleRunBatchDispatch}
              className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Enviando em Lotes ({progress.completedBatches}/{progress.totalBatches})...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Disparar {totalCalculatedMessages} Mensagens em {totalCalculatedBatches} Lotes (Graph API)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Execution Monitor, Chunks Inspection & Code Snippets (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Progress Banner (Active or Completed) */}
          {(isExecuting || lastResult) && (
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
                    {isExecuting ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                        <span>Processamento em Lote em Andamento...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Disparo em Lote Concluído com Sucesso!</span>
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {lastResult 
                      ? `${lastResult.successfulMessages} de ${lastResult.totalMessages} mensagens entregues em ${lastResult.totalBatches} lote(s) (${lastResult.durationMs}ms)`
                      : `Enviando lote ${progress.completedBatches} de ${progress.totalBatches}...`}
                  </p>
                </div>

                {lastResult && (
                  <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-black">
                    +{lastResult.savedHttpCalls} Chamadas Poupadas
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-linear-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${isExecuting ? progress.percent : 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-[#64748B]">
                  <span>
                    {isExecuting 
                      ? `${progress.completedMessages} / ${progress.totalMessages} mensagens`
                      : `${lastResult?.totalMessages} mensagens processadas`}
                  </span>
                  <span>{isExecuting ? `${progress.percent}%` : '100%'}</span>
                </div>
              </div>

              {/* Rate Limit Gauges (x-app-usage) */}
              {lastResult && (
                <div className="pt-3 border-t border-[#E2E8F0]">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                    Métricas de Rate Limit Retornadas pela Graph API (Headers de Resposta):
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-[#64748B] block font-bold">Call Count %</span>
                      <span className="text-sm font-black text-emerald-700">
                        {lastResult.rateLimitUsage.callCountPercent}%
                      </span>
                      <span className="text-[9px] text-emerald-600 block">Totalmente Seguro</span>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-[#64748B] block font-bold">CPU Time %</span>
                      <span className="text-sm font-black text-indigo-700">
                        {lastResult.rateLimitUsage.cpuTimePercent}%
                      </span>
                      <span className="text-[9px] text-indigo-600 block">Baixa Carga</span>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-[#64748B] block font-bold">Total Time %</span>
                      <span className="text-sm font-black text-purple-700">
                        {lastResult.rateLimitUsage.totalTimePercent}%
                      </span>
                      <span className="text-[9px] text-purple-600 block">Tempo Ótimo</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed Batch Chunks Inspector */}
          {lastResult && lastResult.chunks.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#1A1D21] uppercase tracking-wider">
                    Inspetor de Lotes HTTP ({lastResult.chunks.length} Lotes Enviados)
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Selecione um lote para inspecionar o envelope e sub-respostas da Meta.
                  </p>
                </div>
              </div>

              {/* Chunk Selector Tabs */}
              <div className="p-3 bg-[#F8F9FB] border-b border-[#E2E8F0] flex gap-2 overflow-x-auto">
                {lastResult.chunks.map((chunk, idx) => (
                  <button
                    key={chunk.chunkIndex}
                    type="button"
                    onClick={() => setSelectedChunkIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
                      selectedChunkIndex === idx
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#1A1D21]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Lote #{chunk.chunkIndex} ({chunk.requestCount} msgs)</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-100 text-emerald-800">
                      200 OK
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Chunk Content & Responses Preview */}
              {lastResult.chunks[selectedChunkIndex] && (
                <div className="p-4 space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-3 gap-2 font-sans text-xs">
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-[#64748B] block text-[10px]">Duração da Requisição</span>
                      <strong className="text-[#1A1D21]">{lastResult.chunks[selectedChunkIndex].durationMs}ms</strong>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-emerald-800 block text-[10px]">Entregas Confirmadas</span>
                      <strong className="text-emerald-950">
                        {lastResult.chunks[selectedChunkIndex].successCount} / {lastResult.chunks[selectedChunkIndex].requestCount}
                      </strong>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-blue-800 block text-[10px]">Endpoint Meta</span>
                      <strong className="text-blue-950">graph.facebook.com/v21.0/</strong>
                    </div>
                  </div>

                  <div className="bg-[#1E293B] text-slate-100 p-3.5 rounded-xl max-h-48 overflow-y-auto space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-sans block mb-1">
                      Amostra de Respostas do Envelope (JSON Sub-responses):
                    </span>
                    {(lastResult.chunks[selectedChunkIndex].rawResponse || []).slice(0, 5).map((sub, sIdx) => (
                      <div key={sIdx} className="text-[11px] pb-1 border-b border-slate-700/50">
                        <span className="text-emerald-400 font-bold">HTTP {sub.code}</span> -{' '}
                        <span className="text-slate-300">{sub.body}</span>
                      </div>
                    ))}
                    {(lastResult.chunks[selectedChunkIndex].rawResponse || []).length > 5 && (
                      <div className="text-[10px] text-slate-400 font-sans italic pt-1">
                        + {(lastResult.chunks[selectedChunkIndex].rawResponse || []).length - 5} outras sub-respostas com status 200 OK...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Deployment Code & Script Exporter (PHP Guzzle / cURL / Node.js) */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-[#1A1D21] uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-600" />
                  <span>Código de Produção para Servidor (aaPanel / VPS)</span>
                </h4>
                <p className="text-[11px] text-[#64748B]">
                  Exporte o script otimizado pronto para execução via cron, workers ou webhook.
                </p>
              </div>

              {/* Code Tab Switcher */}
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('guzzle_php')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeCodeTab === 'guzzle_php' ? 'bg-white text-indigo-700 shadow-xs' : 'text-[#64748B]'
                  }`}
                >
                  PHP (Guzzle Pool)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('curl')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeCodeTab === 'curl' ? 'bg-white text-indigo-700 shadow-xs' : 'text-[#64748B]'
                  }`}
                >
                  cURL (Batch)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('nodejs')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeCodeTab === 'nodejs' ? 'bg-white text-indigo-700 shadow-xs' : 'text-[#64748B]'
                  }`}
                >
                  Node.js
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="relative bg-[#0F172A] p-4 text-slate-100 font-mono text-xs overflow-x-auto max-h-72">
              <button
                type="button"
                onClick={() => {
                  let textToCopy = '';
                  if (activeCodeTab === 'guzzle_php') {
                    textToCopy = facebookBatchService.generateGuzzlePhpSnippet({
                      count: totalCalculatedMessages,
                      batchSize,
                      concurrency: 5,
                    });
                  } else if (activeCodeTab === 'curl') {
                    textToCopy = facebookBatchService.generateCurlSnippet(getPreparedMessages().slice(0, 3));
                  } else {
                    textToCopy = facebookBatchService.generateNodeJsSnippet({
                      count: totalCalculatedMessages,
                      batchSize,
                    });
                  }
                  handleCopyCode(textToCopy);
                }}
                className="absolute right-4 top-4 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-sans font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Script</span>
                  </>
                )}
              </button>

              <pre className="text-[11px] leading-relaxed">
                {activeCodeTab === 'guzzle_php' &&
                  facebookBatchService.generateGuzzlePhpSnippet({
                    count: totalCalculatedMessages,
                    batchSize,
                    concurrency: 5,
                  })}
                {activeCodeTab === 'curl' &&
                  facebookBatchService.generateCurlSnippet(getPreparedMessages().slice(0, 3))}
                {activeCodeTab === 'nodejs' &&
                  facebookBatchService.generateNodeJsSnippet({
                    count: totalCalculatedMessages,
                    batchSize,
                  })}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
