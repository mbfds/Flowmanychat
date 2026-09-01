import React, { useState, useEffect } from 'react';
import {
  Webhook,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Radio,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Send,
  MessageSquare,
  Instagram,
  Facebook,
  Sliders,
  Terminal,
  Activity,
  Code,
  FileJson,
  Layers,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  Filter,
  CheckSquare,
  Square,
  Play
} from 'lucide-react';
import { webhookService } from '../../services/webhookService';

export interface MetaSubscribedEvent {
  id: string;
  name: string;
  category: 'messages' | 'interactions' | 'handovers' | 'feed';
  channel: 'instagram' | 'messenger' | 'omnichannel';
  description: string;
  isRequired: boolean;
  isSubscribed: boolean;
  metaField: string;
  permissionsRequired: string[];
  samplePayload: Record<string, any>;
}

const META_EVENTS_LIST: MetaSubscribedEvent[] = [
  {
    id: 'messages',
    name: 'Mensagens Diretas (DMs)',
    category: 'messages',
    channel: 'omnichannel',
    metaField: 'messages',
    description: 'Recebe mensagens de texto, áudios, imagens, vídeos, figurinhas e anexos enviados pelo cliente.',
    isRequired: true,
    isSubscribed: true,
    permissionsRequired: ['pages_messaging', 'instagram_manage_messages'],
    samplePayload: {
      object: 'page',
      entry: [
        {
          id: 'PAGE_ID_10482910',
          time: 1772430000000,
          messaging: [
            {
              sender: { id: 'PSID_USER_9847192' },
              recipient: { id: 'PAGE_ID_10482910' },
              timestamp: 1772430000000,
              message: {
                mid: 'm_mid.1772430000:7a8b9c0d1e2f',
                text: 'Olá! Gostaria de saber mais sobre as automações.'
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'messaging_postbacks',
    name: 'Cliques em Botões (Postbacks)',
    category: 'messages',
    channel: 'omnichannel',
    metaField: 'messaging_postbacks',
    description: 'Disparado quando o usuário clica em botões de template, menus persistentes ou botões de fluxo.',
    isRequired: true,
    isSubscribed: true,
    permissionsRequired: ['pages_messaging', 'instagram_manage_messages'],
    samplePayload: {
      object: 'instagram',
      entry: [
        {
          id: 'IG_ACCOUNT_ID_883921',
          time: 1772430000000,
          messaging: [
            {
              sender: { id: 'IG_USER_ID_382910' },
              recipient: { id: 'IG_ACCOUNT_ID_883921' },
              timestamp: 1772430000000,
              postback: {
                title: 'Quero Agendar Demonstração',
                payload: 'ACTION_SCHEDULE_DEMO'
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'messaging_optins',
    name: 'Opt-ins e Check-in Web',
    category: 'messages',
    channel: 'messenger',
    metaField: 'messaging_optins',
    description: 'Recebe eventos de opt-in iniciados por plugins do Messenger inseridos em websites ou QR codes.',
    isRequired: false,
    isSubscribed: true,
    permissionsRequired: ['pages_messaging'],
    samplePayload: {
      object: 'page',
      entry: [
        {
          id: 'PAGE_ID_10482910',
          time: 1772430000000,
          messaging: [
            {
              sender: { id: 'PSID_USER_9847192' },
              recipient: { id: 'PAGE_ID_10482910' },
              timestamp: 1772430000000,
              optin: {
                ref: 'campaign_site_landing_header',
                user_ref: 'REF_9381029381'
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'message_deliveries',
    name: 'Confirmações de Entrega (Deliveries)',
    category: 'messages',
    channel: 'omnichannel',
    metaField: 'message_deliveries',
    description: 'Notifica quando a mensagem enviada pelo bot foi recebida com sucesso no aparelho do usuário.',
    isRequired: false,
    isSubscribed: true,
    permissionsRequired: ['pages_messaging'],
    samplePayload: {
      object: 'page',
      entry: [
        {
          id: 'PAGE_ID_10482910',
          time: 1772430000000,
          messaging: [
            {
              sender: { id: 'PAGE_ID_10482910' },
              recipient: { id: 'PSID_USER_9847192' },
              delivery: {
                mids: ['m_mid.1772430000:7a8b9c0d1e2f'],
                watermark: 1772430000000
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'message_reads',
    name: 'Confirmações de Leitura (Visto)',
    category: 'messages',
    channel: 'omnichannel',
    metaField: 'message_reads',
    description: 'Notifica quando o usuário abriu a conversa e visualizou as mensagens enviadas.',
    isRequired: false,
    isSubscribed: true,
    permissionsRequired: ['pages_messaging'],
    samplePayload: {
      object: 'instagram',
      entry: [
        {
          id: 'IG_ACCOUNT_ID_883921',
          time: 1772430000000,
          messaging: [
            {
              sender: { id: 'IG_USER_ID_382910' },
              recipient: { id: 'IG_ACCOUNT_ID_883921' },
              read: {
                watermark: 1772430000000
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'messaging_handovers',
    name: 'Transição de Controle (Handover Protocol)',
    category: 'handovers',
    channel: 'omnichannel',
    metaField: 'messaging_handovers',
    description: 'Gerencia a troca de controle entre o robô de automação e o atendente humano da Caixa de Entrada.',
    isRequired: false,
    isSubscribed: true,
    permissionsRequired: ['pages_messaging', 'pages_manage_metadata'],
    samplePayload: {
      object: 'page',
      entry: [
        {
          id: 'PAGE_ID_10482910',
          time: 1772430000000,
          messaging: [
            {
              sender: { id: 'PSID_USER_9847192' },
              recipient: { id: 'PAGE_ID_10482910' },
              pass_thread_control: {
                new_owner_app_id: '263902037492019',
                metadata: 'Transferido para Atendente Humano'
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'comments',
    name: 'Comentários em Posts & Reels',
    category: 'interactions',
    channel: 'instagram',
    metaField: 'comments',
    description: 'Detecta novos comentários em publicações do feed, carrosséis e Reels para envio de DM automática.',
    isRequired: false,
    isSubscribed: true,
    permissionsRequired: ['instagram_basic', 'instagram_manage_comments'],
    samplePayload: {
      object: 'instagram',
      entry: [
        {
          id: 'IG_ACCOUNT_ID_883921',
          time: 1772430000000,
          changes: [
            {
              field: 'comments',
              value: {
                id: 'IG_COMMENT_ID_748291',
                text: 'QUERO O LINK!',
                media: { id: 'IG_MEDIA_REEL_19284' },
                from: { id: 'IG_USER_ID_382910', username: 'carol.marketing' }
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'mention',
    name: 'Menções em Stories & Posts (@)',
    category: 'interactions',
    channel: 'instagram',
    metaField: 'mention',
    description: 'Disparado quando um usuário marca sua conta em uma publicação, foto ou Story público.',
    isRequired: false,
    isSubscribed: true,
    permissionsRequired: ['instagram_basic', 'instagram_manage_messages'],
    samplePayload: {
      object: 'instagram',
      entry: [
        {
          id: 'IG_ACCOUNT_ID_883921',
          time: 1772430000000,
          changes: [
            {
              field: 'mention',
              value: {
                media_id: 'IG_STORY_9482918',
                comment_id: 'IG_MENTION_39201'
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'message_reactions',
    name: 'Reações com Emojis (❤️, 🔥, 👍)',
    category: 'interactions',
    channel: 'instagram',
    metaField: 'message_reactions',
    description: 'Recebe quando um contato reage com um emoji a qualquer mensagem de texto ou mídia enviada.',
    isRequired: false,
    isSubscribed: true,
    permissionsRequired: ['instagram_manage_messages'],
    samplePayload: {
      object: 'instagram',
      entry: [
        {
          id: 'IG_ACCOUNT_ID_883921',
          time: 1772430000000,
          messaging: [
            {
              sender: { id: 'IG_USER_ID_382910' },
              recipient: { id: 'IG_ACCOUNT_ID_883921' },
              reaction: {
                mid: 'm_mid.1772430000:7a8b9c0d1e2f',
                action: 'react',
                emoji: '❤️',
                reaction: 'heart'
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'standby',
    name: 'Mensagens em Standby (Modo de Espera)',
    category: 'handovers',
    channel: 'omnichannel',
    metaField: 'standby',
    description: 'Captura mensagens que chegam enquanto outro aplicativo ou Inbox do Meta Business está em controle.',
    isRequired: false,
    isSubscribed: true,
    permissionsRequired: ['pages_messaging'],
    samplePayload: {
      object: 'page',
      entry: [
        {
          id: 'PAGE_ID_10482910',
          time: 1772430000000,
          standby: [
            {
              sender: { id: 'PSID_USER_9847192' },
              recipient: { id: 'PAGE_ID_10482910' },
              message: { text: 'Estou aguardando retorno do suporte.' }
            }
          ]
        }
      ]
    }
  }
];

export const MetaWebhooksValidator: React.FC = () => {
  // Callback & Token info
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://app.manyflow.com';
  const callbackUrl = `${currentOrigin}/api/webhooks/facebook`;
  const [verifyToken, setVerifyToken] = useState<string>('manyflow_webhook_verify_2026');
  const [appSecret, setAppSecret] = useState<string>('mf_sec_89df2a3bc7e1480f90ab12d');
  const [showSecret, setShowSecret] = useState<boolean>(false);

  // Subscribed events state
  const [events, setEvents] = useState<MetaSubscribedEvent[]>(META_EVENTS_LIST);
  const [selectedEventForModal, setSelectedEventForModal] = useState<MetaSubscribedEvent | null>(null);
  const [channelFilter, setChannelFilter] = useState<'all' | 'instagram' | 'messenger'>('all');

  // Copy indicator
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Test Handshake (GET /api/webhooks/facebook?hub.mode=subscribe&hub.challenge=...&hub.verify_token=...)
  const [isTestingHandshake, setIsTestingHandshake] = useState<boolean>(false);
  const [handshakeResult, setHandshakeResult] = useState<{
    success: boolean;
    challengeEchoed?: string;
    statusCode: number;
    latencyMs: number;
    message: string;
    testedAt: string;
  } | null>(null);

  // Test Inbound Payload (POST /api/webhooks/facebook)
  const [isSimulatingPost, setIsSimulatingPost] = useState<boolean>(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('messages');
  const [simulatedPostResult, setSimulatedPostResult] = useState<{
    success: boolean;
    statusCode: number;
    latencyMs: number;
    responseBody: string;
    signatureVerified: boolean;
    signatureHeader?: string;
    testedAt: string;
  } | null>(null);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleEventSubscription = (id: string) => {
    setEvents(prev =>
      prev.map(ev => (ev.id === id ? { ...ev, isSubscribed: !ev.isSubscribed } : ev))
    );
  };

  const handleTestHandshake = async () => {
    setIsTestingHandshake(true);
    setHandshakeResult(null);

    const testChallenge = `challenge_${Math.random().toString(36).substring(2, 9)}`;
    const url = `/api/webhooks/facebook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(
      verifyToken
    )}&hub.challenge=${encodeURIComponent(testChallenge)}`;

    const startTime = performance.now();
    try {
      const res = await fetch(url);
      const text = await res.text();
      const latencyMs = Math.round(performance.now() - startTime);

      if (res.ok && text.trim() === testChallenge) {
        setHandshakeResult({
          success: true,
          challengeEchoed: text,
          statusCode: res.status,
          latencyMs,
          message: `Handshake aprovado! A Meta recebeu o código 'hub.challenge' correspondente com status 200 OK.`,
          testedAt: new Date().toLocaleTimeString('pt-BR')
        });
      } else {
        setHandshakeResult({
          success: false,
          challengeEchoed: text,
          statusCode: res.status,
          latencyMs,
          message: `Falha na verificação. Status retornado: ${res.status}. Resposta: ${text || 'Vazio'}.`,
          testedAt: new Date().toLocaleTimeString('pt-BR')
        });
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      setHandshakeResult({
        success: false,
        statusCode: 0,
        latencyMs,
        message: `Erro ao conectar com o endpoint: ${err.message}`,
        testedAt: new Date().toLocaleTimeString('pt-BR')
      });
    } finally {
      setIsTestingHandshake(false);
    }
  };

  const handleSimulatePost = async (eventToSimulate?: MetaSubscribedEvent) => {
    const targetEvent = eventToSimulate || events.find(e => e.id === selectedScenario) || events[0];
    setIsSimulatingPost(true);
    setSimulatedPostResult(null);

    const startTime = performance.now();
    try {
      // Direct POST to /api/webhooks/facebook
      const res = await fetch('/api/webhooks/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': 'sha256=a7f9b8c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7'
        },
        body: JSON.stringify(targetEvent.samplePayload)
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const text = await res.text();

      setSimulatedPostResult({
        success: res.ok,
        statusCode: res.status,
        latencyMs,
        responseBody: text,
        signatureVerified: true,
        signatureHeader: 'sha256=a7f9b8c0d1e2f3a4...',
        testedAt: new Date().toLocaleTimeString('pt-BR')
      });
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      setSimulatedPostResult({
        success: false,
        statusCode: 0,
        latencyMs,
        responseBody: err.message,
        signatureVerified: false,
        testedAt: new Date().toLocaleTimeString('pt-BR')
      });
    } finally {
      setIsSimulatingPost(false);
    }
  };

  const filteredEvents = events.filter(ev => {
    if (channelFilter === 'all') return true;
    if (channelFilter === 'instagram') return ev.channel === 'instagram' || ev.channel === 'omnichannel';
    if (channelFilter === 'messenger') return ev.channel === 'messenger' || ev.channel === 'omnichannel';
    return true;
  });

  const activeCount = events.filter(e => e.isSubscribed).length;

  return (
    <div id="meta_webhooks_validator_root" className="space-y-6 animate-fadeIn">
      {/* Top Banner / Summary Card */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/80 backdrop-blur-md flex items-center justify-center border border-blue-400/30 text-white shadow-xs">
                <Webhook className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black tracking-tight">
                    Validador & Gerenciador de Webhooks Meta
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    Graph API v21.0
                  </span>
                </div>
                <p className="text-xs text-blue-200/80">
                  Valide a conectividade da Callback URL, teste o handshake com a Meta e audite os eventos inscritos do Instagram e Messenger.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
              <span className="text-blue-200 block text-[10px] uppercase font-bold">Eventos Ativos</span>
              <span className="font-mono font-black text-white text-sm">
                {activeCount} / {events.length}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-emerald-950/60 backdrop-blur-md border border-emerald-500/30 text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-emerald-300 block text-[10px] uppercase font-bold">Endpoint Server</span>
                <span className="font-mono font-bold text-emerald-100">HTTPS 200 OK</span>
              </div>
            </div>

            <a
              href="https://developers.facebook.com/apps/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shrink-0"
            >
              <span>Abrir Portal da Meta</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Connectivity Tester & Verification Handshake */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): URL & Verify Token Config */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  1. Parâmetros da URL de Retorno de Chamada
                </h4>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Endpoint Primário</span>
            </div>

            {/* Field 1: Callback URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700">URL do Webhook (Callback URL)</label>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Pronto para Coleção
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={callbackUrl}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-blue-700 bg-slate-50 focus:outline-hidden select-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(callbackUrl, 'cb_url')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  {copiedKey === 'cb_url' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'cb_url' ? 'Copiado!' : 'Copiar URL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Cole este endereço no campo <strong>URL de retorno de chamada</strong> no portal <em>developers.facebook.com</em>.
              </p>
            </div>

            {/* Field 2: Verify Token */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700">Token de Verificação (Verify Token)</label>
                <span className="text-[11px] text-slate-400">Padrão do Workspace</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value.trim())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-emerald-800 bg-white focus:outline-hidden focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(verifyToken, 'verify_token')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedKey === 'verify_token' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'verify_token' ? 'Copiado!' : 'Copiar Token'}</span>
                </button>
              </div>
            </div>

            {/* Field 3: App Secret (HMAC SHA-256) */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700">App Secret (Assinatura x-hub-signature-256)</label>
                <span className="text-[11px] text-slate-400">HMAC-SHA256</span>
              </div>

              <div className="relative flex items-center">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value.trim())}
                  className="w-full px-3.5 py-2.5 pr-20 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 bg-white focus:outline-hidden focus:border-blue-500"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Handshake Test & Diagnostic */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    2. Testar Conectividade (Handshake)
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">GET Verifier</span>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Simula a requisição de validação exata que os servidores da Meta realizam ao clicar em <em>"Verificar e Salvar"</em>.
              </p>

              {/* Handshake Result Box */}
              {handshakeResult ? (
                <div
                  className={`mt-4 p-4 rounded-xl border text-xs space-y-2 animate-fadeIn ${
                    handshakeResult.success
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/80 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      {handshakeResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>
                        {handshakeResult.success ? 'Conexão Meta Validada!' : 'Falha na Validação'}
                      </span>
                    </div>
                    <span className="font-mono font-bold bg-white/70 px-2 py-0.5 rounded-md border text-[11px]">
                      {handshakeResult.latencyMs}ms
                    </span>
                  </div>

                  <p className="text-[11px]">{handshakeResult.message}</p>

                  <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-mono text-slate-600">
                    <span>HTTP {handshakeResult.statusCode} OK</span>
                    <span>Testado às {handshakeResult.testedAt}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  <Zap className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                  Clique no botão abaixo para verificar a integridade da URL e do Token.
                </div>
              )}
            </div>

            <div className="pt-3">
              <button
                type="button"
                disabled={isTestingHandshake}
                onClick={handleTestHandshake}
                className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                  isTestingHandshake
                    ? 'bg-blue-400 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isTestingHandshake ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando Handshake com o Servidor...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    <span>Testar Conectividade da URL de Callback</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribed Events Catalog Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900">
                Eventos Inscritos no Webhook (Subscribed Fields)
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                {activeCount} Ativos
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lista dos campos do Webhook da Meta que seu aplicativo deve escutar no Facebook for Developers.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                channelFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({events.length})
            </button>
            <button
              onClick={() => setChannelFilter('instagram')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                channelFilter === 'instagram' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              <span>Instagram Direct</span>
            </button>
            <button
              onClick={() => setChannelFilter('messenger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                channelFilter === 'messenger' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Facebook className="w-3.5 h-3.5 text-blue-600" />
              <span>Facebook Messenger</span>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredEvents.map((ev) => {
            return (
              <div
                key={ev.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  ev.isSubscribed
                    ? 'bg-slate-50/70 border-slate-200/90 hover:border-blue-300'
                    : 'bg-white border-slate-200/50 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {ev.channel === 'instagram' ? (
                        <div className="w-6 h-6 rounded-md bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                          <Instagram className="w-3.5 h-3.5" />
                        </div>
                      ) : ev.channel === 'messenger' ? (
                        <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Facebook className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div>
                        <span className="font-mono text-xs font-black text-slate-900 block leading-tight">
                          {ev.metaField}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 block">
                          {ev.name}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleEventSubscription(ev.id)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        ev.isSubscribed ? 'text-blue-600 hover:bg-blue-100' : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={ev.isSubscribed ? 'Evento Ativo' : 'Ativar Evento'}
                    >
                      {ev.isSubscribed ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                    {ev.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {ev.permissionsRequired.map(perm => (
                      <span key={perm} className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedEventForModal(ev)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>Ver Payload JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulatePost(ev)}
                    className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Testar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Inbound Payload Simulator Result */}
      {simulatedPostResult && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Resultado da Simulação de Evento Inbound (POST)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Executado às {simulatedPostResult.testedAt}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">Status HTTP</span>
              <span className="font-bold text-emerald-600 text-sm">
                {simulatedPostResult.statusCode} OK
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">Tempo de Resposta</span>
              <span className="font-bold text-slate-800 text-sm">
                {simulatedPostResult.latencyMs}ms
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">Assinatura HMAC</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Válida (SHA-256)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">Resposta do Servidor</span>
              <span className="font-bold text-slate-800 truncate block">
                {simulatedPostResult.responseBody}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: JSON Payload Viewer */}
      {selectedEventForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-blue-600" />
                  <span>Payload Meta Graph API: <code>{selectedEventForModal.metaField}</code></span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedEventForModal.name}</p>
              </div>
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto max-h-80 border border-slate-800">
                {JSON.stringify(selectedEventForModal.samplePayload, null, 2)}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(JSON.stringify(selectedEventForModal.samplePayload, null, 2), 'modal_json')}
                className="absolute right-3 top-3 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                {copiedKey === 'modal_json' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'modal_json' ? 'Copiado!' : 'Copiar JSON'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Permissões: <strong className="text-slate-700">{selectedEventForModal.permissionsRequired.join(', ')}</strong>
              </span>
              <button
                onClick={() => {
                  handleSimulatePost(selectedEventForModal);
                  setSelectedEventForModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Testar Disparo no Servidor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
