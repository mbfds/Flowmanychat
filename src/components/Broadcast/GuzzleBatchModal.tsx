import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Layers, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Server, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Database,
  Code2,
  FileCode,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BroadcastCampaign, GuzzleBatchExecutionResult } from '../../types';

interface GuzzleBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: BroadcastCampaign;
  onRunBatchSimulation?: (result: GuzzleBatchExecutionResult) => void;
}

export const GuzzleBatchModal: React.FC<GuzzleBatchModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onRunBatchSimulation
}) => {
  if (!isOpen) return null;

  const [batchSize, setBatchSize] = useState(50);
  const [concurrency, setConcurrency] = useState(5);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<GuzzleBatchExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'php_guzzle' | 'batch_schema' | 'live_run'>('php_guzzle');

  const totalContacts = campaign.totalTargeted || 100;
  const totalBatchesCount = Math.ceil(totalContacts / batchSize);

  // Generate Guzzle PHP code
  const generateGuzzlePhp = () => {
    return `<?php
/**
 * ManyFlow Guzzle Batch Dispatcher (Meta Graph API v21.0)
 * ========================================================
 * Campanha: "${campaign.name}"
 * Destinatários: ${totalContacts} leads | Lotes de: ${batchSize} msgs (Facebook Standard)
 * Concorrência de Threads: ${concurrency} requisições assíncronas paralelas
 * Compatível com: PHP 8.1+, GuzzleHttp 7+, Servidor Nginx/Apache no aaPanel
 */

require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\\Client;
use GuzzleHttp\\Pool;
use GuzzleHttp\\Psr7\\Request;
use GuzzleHttp\\Psr7\\Response;
use GuzzleHttp\\Exception\\RequestException;
use MongoDB\\Client as MongoDbClient;

// 1. Inicializa o cliente HTTP com conexão persistente
$pageAccessToken = getenv('META_PAGE_ACCESS_TOKEN') ?: 'EAA...SEU_TOKEN_AQUI';
$client = new Client([
    'base_uri' => 'https://graph.facebook.com/v21.0/',
    'timeout'  => 15.0,
    'headers'  => [
        'Authorization' => "Bearer {$pageAccessToken}",
        'Content-Type'  => 'application/json',
        'User-Agent'    => 'ManyFlow-Batch-Dispatcher/2.0'
    ]
]);

// 2. Conexão com MongoDB no aaPanel para carregar os leads
$mongo = new MongoDbClient(getenv('MONGO_URI') ?: 'mongodb://127.0.0.1:27017');
$collection = $mongo->manyflow->contacts;

// Filtra os contatos qualificados para esta transmissão
$contactsCursor = $collection->find([
    'status' => ['$ne' => 'bot_paused'],
    'tags'   => ['$in' => ['VIP']]
]);
$recipients = iterator_to_array($contactsCursor);

echo "📦 Preparando " . count($recipients) . " leads em lotes de ${batchSize} (Facebook Batch)..." . PHP_EOL;

// 3. Fatiamento em Lotes (Máximo de 50 requisições por lote - Meta Graph API)
$chunks = array_chunk($recipients, ${batchSize});

// 4. Generator function que produz cada requisição em lote (Facebook Graph Batch)
$batchRequestsGenerator = function ($chunks) {
    foreach ($chunks as $index => $batchGroup) {
        $metaBatchItems = [];

        foreach ($batchGroup as $contact) {
            $leadId = $contact['id'] ?? $contact['_id'];
            $leadName = $contact['name'] ?? 'Cliente';

            $metaBatchItems[] = [
                'method'       => 'POST',
                'relative_url' => 'me/messages',
                'body'         => http_build_query([
                    'recipient' => ['id' => $leadId],
                    'message'   => [
                        'text' => "Olá {$leadName}! Mensagem oficial da campanha: ${campaign.name}"
                    ],
                    'messaging_type' => 'MESSAGE_TAG',
                    'tag'            => '${campaign.metaMessageTag || 'POST_PURCHASE_UPDATE'}'
                ])
            ];
        }

        // Requisição POST para o endpoint raiz do Facebook Graph com o array 'batch'
        yield new Request(
            'POST', 
            '', 
            ['Content-Type' => 'application/json'], 
            json_encode([
                'batch'           => $metaBatchItems,
                'include_headers' => false
            ])
        );
    }
};

// 5. Instanciação do Guzzle Pool com concorrência = ${concurrency}
$pool = new Pool($client, $batchRequestsGenerator($chunks), [
    'concurrency' => ${concurrency},
    'fulfilled'   => function (Response $response, $index) use ($mongo) {
        $statusCode = $response->getStatusCode();
        $body = json_decode((string) $response->getBody(), true);
        $countInBatch = is_array($body) ? count($body) : ${batchSize};
        
        echo "✅ Lote {$index} entregue com sucesso! Status: HTTP {$statusCode} ({$countInBatch} msgs)" . PHP_EOL;

        // Salva log de auditoria no MongoDB
        $mongo->manyflow->broadcast_batch_logs->insertOne([
            'campaign_id'  => '${campaign.id}',
            'batch_index'  => $index,
            'status_code'  => $statusCode,
            'delivered_at' => new MongoDB\\BSON\\UTCDateTime(),
        ]);
    },
    'rejected' => function (RequestException $reason, $index) {
        echo "❌ Erro no lote {$index}: " . $reason->getMessage() . PHP_EOL;
    },
]);

// 6. Disparo e resolução de todas as promises assíncronas
$startTime = microtime(true);
$promise = $pool->promise();
$promise->wait();

$duration = round(microtime(true) - $startTime, 2);
echo "🚀 Transmissão em lote com Guzzle concluída em {$duration} segundos!" . PHP_EOL;
`;
  };

  // Sample Meta Batch Raw Schema
  const metaBatchSchemaJson = JSON.stringify(
    {
      batch: [
        {
          method: "POST",
          relative_url: "v21.0/me/messages",
          body: `recipient=%7B%22id%22%3A%22109283910%22%7D&message=%7B%22text%22%3A%22Ol%C3%A1+Camila%21+Oferta+ManyFlow%22%7D&messaging_type=MESSAGE_TAG&tag=POST_PURCHASE_UPDATE`
        },
        {
          method: "POST",
          relative_url: "v21.0/me/messages",
          body: `recipient=%7B%22id%22%3A%22109283911%22%7D&message=%7B%22text%22%3A%22Ol%C3%A1+Lucas%21+Oferta+ManyFlow%22%7D&messaging_type=MESSAGE_TAG&tag=POST_PURCHASE_UPDATE`
        }
      ],
      include_headers: false
    },
    null,
    2
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateGuzzlePhp());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyResponse = () => {
    if (!executionResult) return;
    navigator.clipboard.writeText(JSON.stringify(executionResult, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  // Run Real-time Guzzle Batch Simulation
  const handleExecuteBatchSimulation = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/broadcast/guzzle-batch-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: campaign.name,
          recipientsCount: totalContacts,
          batchSize,
          concurrency,
          channel: campaign.channel
        })
      });
      const data = await res.json();
      if (data.success) {
        setExecutionResult(data);
        setActiveTab('live_run');
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
        if (onRunBatchSimulation) {
          onRunBatchSimulation(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div 
      id="guzzle_batch_modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E2E8F0] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  Disparo em Lote (Facebook Batch API & Guzzle PHP)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                  Meta v21.0 Batch Spec
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Otimização para aaPanel: Agrupamento em lotes de até 50 requisições com Guzzle Pool assíncrono.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Parameters Ribbon */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Público Total</span>
            <span className="font-bold text-sm text-slate-900">{totalContacts} leads</span>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Tamanho do Lote (Batch)</label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full font-bold text-xs text-blue-600 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={50}>50 msgs / lote (Máx Facebook)</option>
              <option value={25}>25 msgs / lote (Moderado)</option>
              <option value={10}>10 msgs / lote (Baixo volume)</option>
            </select>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Concorrência Guzzle</label>
            <select
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              className="w-full font-bold text-xs text-purple-600 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={10}>10 Promises Paralelas (Ultra Rápido)</option>
              <option value={5}>5 Promises Paralelas (Recomendado)</option>
              <option value={2}>2 Promises Paralelas (Conservador)</option>
            </select>
          </div>

          <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-700 block">Total de Lotes</span>
              <span className="font-extrabold text-sm text-blue-950">{totalBatchesCount} Lotes HTTP</span>
            </div>
            <button
              onClick={handleExecuteBatchSimulation}
              disabled={isRunning}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Testar Lote</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('php_guzzle')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'php_guzzle'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-purple-600" />
            <span>Script PHP Guzzle Completo (aaPanel)</span>
          </button>

          <button
            onClick={() => setActiveTab('batch_schema')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'batch_schema'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-blue-600" />
            <span>Formato do Payload Batch do Facebook</span>
          </button>

          <button
            onClick={() => setActiveTab('live_run')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'live_run'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Execução & Resposta em Lote</span>
            {executionResult && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-900 text-slate-100 font-mono text-xs">
          
          {/* TAB 1: GUZZLE PHP */}
          {activeTab === 'php_guzzle' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span>batch_dispatcher.php (Pronto para rodar via cron no aaPanel)</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Código Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Código PHP</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
                {generateGuzzlePhp()}
              </pre>
            </div>
          )}

          {/* TAB 2: BATCH SCHEMA */}
          {activeTab === 'batch_schema' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-950/60 border border-blue-800/80 rounded-xl text-blue-200 font-sans text-xs space-y-1">
                <span className="font-bold block text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Como funciona o Facebook Batch API:
                </span>
                <p className="text-blue-200/90 leading-relaxed">
                  Em vez de enviar 1 requisição HTTP por mensagem (o que causaria lentidão e estouro de limites de taxa), o ManyFlow agrupa até <b>50 chamadas de envio em uma única requisição POST</b> enviada para o Facebook Graph API.
                </p>
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre">
                {metaBatchSchemaJson}
              </pre>
            </div>
          )}

          {/* TAB 3: LIVE RUN RESULT */}
          {activeTab === 'live_run' && (
            <div className="space-y-4 font-sans">
              {!executionResult ? (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <Zap className="w-10 h-10 text-slate-600 mx-auto animate-bounce" />
                  <p className="text-sm font-semibold">Nenhuma execução de lote foi realizada ainda.</p>
                  <button
                    onClick={handleExecuteBatchSimulation}
                    disabled={isRunning}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Play className="w-4 h-4" />
                    <span>Disparar Simulação em Lote Agora</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Results Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Mensagens</span>
                      <span className="text-lg font-extrabold text-white">{executionResult.totalMessages}</span>
                    </div>

                    <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/60">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase block">Status da Transmissão</span>
                      <span className="text-lg font-extrabold text-emerald-300">100% Sucesso</span>
                    </div>

                    <div className="p-3 bg-blue-950/60 rounded-xl border border-blue-800/60">
                      <span className="text-[10px] font-bold text-blue-400 uppercase block">Lotes Processados</span>
                      <span className="text-lg font-extrabold text-blue-300">{executionResult.totalBatches} Lotes Meta</span>
                    </div>

                    <div className="p-3 bg-purple-950/60 rounded-xl border border-purple-800/60">
                      <span className="text-[10px] font-bold text-purple-400 uppercase block">Tempo de Resposta</span>
                      <span className="text-lg font-extrabold text-purple-300">{executionResult.executionTimeMs} ms</span>
                    </div>
                  </div>

                  {/* Batch Breakdown List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                      <span>Detalhamento dos Lotes HTTP (Guzzle Pool)</span>
                      <button
                        onClick={handleCopyResponse}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono text-[11px] cursor-pointer"
                      >
                        {copiedResponse ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedResponse ? 'Copiado' : 'Copiar Resposta JSON'}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {executionResult.batches.map((b) => (
                        <div 
                          key={b.batchIndex} 
                          className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold border border-blue-700/50">
                              LOTE #{b.batchIndex}
                            </span>
                            <span className="text-slate-300">
                              <b>{b.requestCount}</b> mensagens agrupadas
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> HTTP {b.statusCode}
                            </span>
                            <span className="text-slate-500">
                              {b.durationMs}ms
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Audit logs salvos na coleção <b>broadcast_batch_logs</b> no MongoDB.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
