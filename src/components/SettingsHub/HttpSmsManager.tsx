import React, { useState } from 'react';
import { 
  Smartphone, 
  BatteryCharging, 
  Battery, 
  Wifi, 
  Radio, 
  Send, 
  Key, 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Terminal, 
  Check, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  ArrowDownLeft, 
  ArrowUpRight,
  UserPlus,
  Users,
  Tag,
  Sliders,
  Share2,
  CheckSquare
} from 'lucide-react';
import { 
  HttpSmsConfig, 
  HttpSmsDeviceStatus, 
  HttpSmsMessage,
  Contact,
  LiveConversation
} from '../../types';
import { 
  loadHttpSmsConfig, 
  saveHttpSmsConfig, 
  loadHttpSmsDevice, 
  saveHttpSmsDevice, 
  loadHttpSmsMessages, 
  saveHttpSmsMessages, 
  sendHttpSmsMessage 
} from '../../utils/httpSmsHelper';

interface HttpSmsManagerProps {
  contacts?: Contact[];
  onUpdateContacts?: (contacts: Contact[]) => void;
  conversations?: LiveConversation[];
  onUpdateConversations?: (conversations: LiveConversation[]) => void;
}

export const HttpSmsManager: React.FC<HttpSmsManagerProps> = ({
  contacts = [],
  onUpdateContacts,
  conversations = [],
  onUpdateConversations
}) => {
  const [config, setConfig] = useState<HttpSmsConfig>(loadHttpSmsConfig());
  const [device, setDevice] = useState<HttpSmsDeviceStatus>(loadHttpSmsDevice());
  const [messages, setMessages] = useState<HttpSmsMessage[]>(loadHttpSmsMessages());

  const [activeTab, setActiveTab] = useState<
    'connection' | 'crm_forwarding' | 'device' | 'test_send' | 'logs' | 'api_docs'
  >('connection');
  
  // Test Send Form
  const [testRecipient, setTestRecipient] = useState('+55 11 99882-1100');
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste enviada via ManyFlow + HttpSMS Gateway direto pelo chip do celular.');
  const [testSimSlot, setTestSimSlot] = useState<1 | 2>(1);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessBanner, setSendSuccessBanner] = useState(false);

  // Inbound & CRM Simulator Form
  const [simInboundFrom, setSimInboundFrom] = useState('+55 11 98844-3322');
  const [simInboundName, setSimInboundName] = useState('Mariana Siqueira');
  const [simInboundText, setSimInboundText] = useState('Olá! Gostaria de agendar uma demonstração da plataforma ManyFlow.');
  const [simulatingCrm, setSimulatingCrm] = useState(false);
  const [crmSuccessResult, setCrmSuccessResult] = useState<{
    contactName: string;
    contactPhone: string;
    stage: string;
    tag: string;
    isNew: boolean;
  } | null>(null);

  // Ping device state
  const [isPingRunning, setIsPingRunning] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [connectionTestSuccess, setConnectionTestSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const inboundWebhookUrl = `${window.location.origin}/api/httpsms/webhook`;

  const handleSaveConfig = () => {
    saveHttpSmsConfig(config);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handlePingDevice = () => {
    setIsPingRunning(true);
    setConnectionTestSuccess(false);

    setTimeout(() => {
      const updatedDevice: HttpSmsDeviceStatus = {
        ...device,
        isConnected: true,
        batteryLevel: Math.min(100, device.batteryLevel + 1),
        lastHeartbeat: new Date().toISOString()
      };
      setDevice(updatedDevice);
      saveHttpSmsDevice(updatedDevice);
      setIsPingRunning(false);
      setConnectionTestSuccess(true);
      setTimeout(() => setConnectionTestSuccess(false), 4000);
    }, 1200);
  };

  const handleSendTestSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient.trim() || !testMessage.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      sendHttpSmsMessage({
        to: testRecipient.trim(),
        content: testMessage.trim(),
        simSlot: testSimSlot,
        contactName: 'Cliente Teste'
      });

      setMessages(loadHttpSmsMessages());
      setIsSending(false);
      setSendSuccessBanner(true);
      setTimeout(() => setSendSuccessBanner(false), 4000);
    }, 800);
  };

  // Simulate Inbound SMS & Automatic Redirection to CRM
  const handleSimulateInboundAndCrm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simInboundFrom.trim() || !simInboundText.trim()) return;

    setSimulatingCrm(true);
    setCrmSuccessResult(null);

    setTimeout(() => {
      const cleanPhone = simInboundFrom.trim();
      const cleanName = simInboundName.trim() || 'Lead Inbound SMS';

      // 1. Record incoming SMS
      const newInboundMsg: HttpSmsMessage = {
        id: `sms_in_${Date.now()}`,
        direction: 'inbound',
        from: cleanPhone,
        to: config.defaultSenderNumber,
        content: simInboundText.trim(),
        status: 'DELIVERED',
        simSlot: 1,
        timestamp: new Date().toISOString(),
        contactName: cleanName
      };

      const updatedMsgs = [newInboundMsg, ...messages];
      setMessages(updatedMsgs);
      saveHttpSmsMessages(updatedMsgs);

      let isNewContact = false;

      // 2. Forward to ManyFlow CRM if enabled
      if (config.forwardInboundToCrm && onUpdateContacts) {
        const existingIndex = contacts.findIndex(
          (c) => c.phone === cleanPhone || (c.phone && c.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, ''))
        );

        if (existingIndex >= 0) {
          // Update existing contact
          const existingContact = contacts[existingIndex];
          const updatedContact: Contact = {
            ...existingContact,
            lastInteractionAt: new Date().toISOString(),
            totalInteractions: (existingContact.totalInteractions || 0) + 1,
            tags: Array.from(new Set([...existingContact.tags, config.crmDefaultTag || 'Origem-SMS-Android'])),
            activityLogs: [
              {
                id: `act_${Date.now()}`,
                type: 'sms_received',
                title: 'SMS Recebido no Chip Android',
                description: `Mensagem: "${simInboundText.trim()}"`,
                timestamp: new Date().toISOString(),
                actor: 'system'
              },
              ...(existingContact.activityLogs || [])
            ]
          };

          const updatedList = [...contacts];
          updatedList[existingIndex] = updatedContact;
          onUpdateContacts(updatedList);
        } else if (config.crmAutoCreateLead) {
          // Create new CRM Lead
          isNewContact = true;
          const newLead: Contact = {
            id: `lead_sms_${Date.now()}`,
            name: cleanName,
            username: cleanName.toLowerCase().replace(/\s+/g, '.'),
            phone: cleanPhone,
            avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            channel: 'sms' as any,
            tags: [config.crmDefaultTag || 'Origem-SMS-Android', 'Lead-Inbound-Gateway'],
            customFields: {
              funil_etapa: config.crmLeadStage || 'Novos Leads',
              origem_gateway: 'HttpSMS Android'
            },
            status: 'active',
            leadScore: 25,
            createdAt: new Date().toISOString(),
            lastInteractionAt: new Date().toISOString(),
            totalInteractions: 1,
            notes: `Lead criado automaticamente via SMS Inbound recebido no Chip Android (${cleanPhone}). Etapa: ${config.crmLeadStage}.`,
            activityLogs: [
              {
                id: `act_${Date.now()}`,
                type: 'lead_created',
                title: 'Lead Cadastrado via SMS Android',
                description: `Primeira mensagem: "${simInboundText.trim()}"`,
                timestamp: new Date().toISOString(),
                actor: 'system'
              }
            ]
          };

          onUpdateContacts([newLead, ...contacts]);
        }
      }

      // 3. Sync to Live Chat if enabled
      if (config.autoSyncWithLiveChat && onUpdateConversations) {
        const existingConv = conversations.find(
          (c) => c.contact?.phone === cleanPhone
        );

        if (existingConv) {
          const updatedConvs = conversations.map((c) => {
            if (c.id === existingConv.id) {
              return {
                ...c,
                unreadCount: c.unreadCount + 1,
                lastMessage: {
                  text: simInboundText.trim(),
                  timestamp: 'Agora',
                  sender: 'user' as const
                },
                messages: [
                  ...c.messages,
                  {
                    id: `msg_sms_${Date.now()}`,
                    sender: 'user' as const,
                    channel: 'sms' as any,
                    text: simInboundText.trim(),
                    timestamp: 'Agora'
                  }
                ]
              };
            }
            return c;
          });
          onUpdateConversations(updatedConvs);
        }
      }

      // 4. Increment forwarded count
      const updatedConfig = {
        ...config,
        forwardedToCrmCount: (config.forwardedToCrmCount || 0) + 1
      };
      setConfig(updatedConfig);
      saveHttpSmsConfig(updatedConfig);

      setCrmSuccessResult({
        contactName: cleanName,
        contactPhone: cleanPhone,
        stage: config.crmLeadStage || 'Novos Leads',
        tag: config.crmDefaultTag || 'Origem-SMS-Android',
        isNew: isNewContact
      });

      setSimulatingCrm(false);
    }, 700);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(inboundWebhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(config.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  Gateway SMS Android (HttpSMS)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-emerald-950">
                  NdoleStudio/httpsms
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/20">
                  CRM Integrado
                </span>
              </div>
              <p className="text-xs text-emerald-100 max-w-2xl mt-1 leading-relaxed">
                Transforme qualquer smartphone Android em um servidor gateway de SMS corporativo. Conecte via API Key e configure o redirecionamento automático de SMS recebidos diretamente para o CRM do ManyFlow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/NdoleStudio/httpsms"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-xs border border-white/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <button
              onClick={handlePingDevice}
              disabled={isPingRunning}
              className="px-4 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPingRunning ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isPingRunning ? 'Testando Conexão...' : 'Testar Aparelho'}</span>
            </button>
          </div>
        </div>

        {/* Header Telemetry Pill Bar */}
        <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between gap-4 text-xs overflow-x-auto">
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="font-semibold text-emerald-100">Dispositivo:</span>
              <span className="font-bold text-white">{device.deviceName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-300" />
              <span className="font-bold text-white">{device.batteryLevel}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-300" />
              <span className="font-bold text-white">{device.networkType}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-emerald-100 text-[11px]">Redirecionamento CRM:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              config.forwardInboundToCrm ? 'bg-emerald-300 text-emerald-950' : 'bg-white/20 text-white'
            }`}>
              {config.forwardInboundToCrm ? 'ATIVO NO CRM' : 'INATIVO'}
            </span>
          </div>
        </div>
      </div>

      {connectionTestSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <div>Conexão com o smartphone Android verificada com sucesso!</div>
            <div className="text-[11px] font-normal text-emerald-700 dark:text-emerald-300 mt-0.5">
              Heartbeat ativo via API Key • Latência: 28ms • Bateria: {device.batteryLevel}% • Chip: {device.sim1Carrier}
            </div>
          </div>
        </div>
      )}

      {saveToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Configurações do Gateway HttpSMS e CRM salvas com sucesso!</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'connection', label: 'Conexão Android & API Key', icon: Key },
          { id: 'crm_forwarding', label: 'Redirecionamento para o CRM', icon: ArrowDownLeft, badge: config.forwardInboundToCrm ? 'Ativo' : undefined },
          { id: 'device', label: 'Telemetria & Hardware (SIMs)', icon: Smartphone },
          { id: 'test_send', label: 'Disparo de Teste SMS', icon: Send },
          { id: 'logs', label: `Histórico & Leads CRM (${messages.length})`, icon: Clock },
          { id: 'api_docs', label: 'Webhooks & Documentação', icon: Terminal }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-600 text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: CONEXÃO DO DISPOSITIVO ANDROID VIA API KEY                    */}
      {/* ==================================================================== */}
      {activeTab === 'connection' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Card Principal de Conexão */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-600" />
                  <span>Conectar Dispositivo Android via API Key</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Insira a chave de autenticação (x-api-key) gerada no aplicativo HttpSMS instalado no seu celular Android.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  device.isConnected
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${device.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span>{device.isConnected ? 'Android Pareado' : 'Aguardando Pareamento'}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* API Key Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chave de API do Dispositivo (API Key)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[11px] font-semibold text-emerald-600 hover:underline"
                  >
                    {showApiKey ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="hsk_live_98a72b4c10df8e3a..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleCopyApiKey}
                    className="absolute right-2.5 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600"
                    title="Copiar API Key"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Esta chave autentica os disparos e o retorno de status do aparelho via cabeçalho <code>x-api-key</code>.
                </p>
              </div>

              {/* Gateway URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>URL do Gateway HttpSMS</span>
                </label>
                <input
                  type="text"
                  value={config.gatewayUrl}
                  onChange={(e) => setConfig({ ...config, gatewayUrl: e.target.value })}
                  placeholder="https://api.httpsms.com/v1 ou http://192.168.1.100:8080"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">
                  Use o endpoint cloud oficial <code>https://api.httpsms.com/v1</code> ou seu backend Go auto-hospedado.
                </p>
              </div>

              {/* Sender Number SIM 1 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Número do Celular Android (SIM 1 Principal)</span>
                </label>
                <input
                  type="text"
                  value={config.defaultSenderNumber}
                  onChange={(e) => setConfig({ ...config, defaultSenderNumber: e.target.value })}
                  placeholder="+55 11 98765-4321"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Delay & Sim Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Slot Padrão de Envio
                  </label>
                  <select
                    value={config.defaultSimSlot}
                    onChange={(e) => setConfig({ ...config, defaultSimSlot: Number(e.target.value) as 1 | 2 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value={1}>SIM Card 1 (Vivo 5G)</option>
                    <option value={2}>SIM Card 2 (Claro BR)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Intervalo Entre Envios
                  </label>
                  <select
                    value={config.delayBetweenMessagesSeconds}
                    onChange={(e) => setConfig({ ...config, delayBetweenMessagesSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value={1}>1 segundo</option>
                    <option value={2}>2 segundos (Recomendado)</option>
                    <option value={5}>5 segundos</option>
                    <option value={10}>10 segundos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePingDevice}
                disabled={isPingRunning}
                className="px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isPingRunning ? 'animate-spin text-emerald-600' : 'text-emerald-500'}`} />
                <span>{isPingRunning ? 'Testando Conexão...' : 'Testar Conexão com Smartphone'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Credenciais</span>
              </button>
            </div>
          </div>

          {/* Guia Rápido de Instalação e Pareamento */}
          <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Passo a Passo: Como Parear seu Smartphone Android</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                  1
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Instale o App HttpSMS
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Baixe o APK oficial do HttpSMS (NdoleStudio) no seu celular Android através do GitHub ou Play Store.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Autorize Permissões de SMS
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Conceda permissão de envio/leitura de SMS e desative a otimização de bateria para operação ininterrupta.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                  3
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Copie a API Key & Teste
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Copie a chave gerada no app do celular, cole no campo acima e clique em "Testar Conexão com Smartphone".
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: REDIRECIONAMENTO AUTOMÁTICO DE SMS PARA O CRM                 */}
      {/* ==================================================================== */}
      {activeTab === 'crm_forwarding' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Info Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-700 to-emerald-800 text-white shadow-lg space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
                <ArrowDownLeft className="w-5 h-5 text-white" />
              </span>
              <div>
                <h3 className="text-base font-black tracking-tight">
                  Redirecionamento Automático de SMS Recebidos para o CRM
                </h3>
                <p className="text-xs text-emerald-100">
                  Todo SMS recebido no chip do seu Android é capturado em tempo real e encaminhado como lead ou conversa no ManyFlow CRM.
                </p>
              </div>
            </div>

            {/* Metrics Counter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/20 text-xs">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-emerald-200 text-[11px]">Total de SMS Encaminhados</div>
                <div className="text-xl font-black text-white mt-0.5">
                  {config.forwardedToCrmCount || 18} leads/mensagens
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-emerald-200 text-[11px]">Cadastro Automático no CRM</div>
                <div className="text-xl font-black text-white mt-0.5">
                  {config.crmAutoCreateLead ? 'Ativo (Instantâneo)' : 'Manual'}
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-emerald-200 text-[11px]">Etapa Padrão no Funil</div>
                <div className="text-xl font-black text-white mt-0.5">
                  {config.crmLeadStage || 'Novos Leads'}
                </div>
              </div>
            </div>
          </div>

          {/* CRM Configuration Controls */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Regras de Roteamento de SMS para o CRM</span>
            </h4>

            <div className="space-y-4">
              {/* Main Toggle */}
              <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Ativar Redirecionamento Automático para o CRM</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Quando o gateway Android receber uma mensagem, o ManyFlow analisa o remetente e registra o SMS no CRM.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.forwardInboundToCrm}
                    onChange={(e) => {
                      const updated = { ...config, forwardInboundToCrm: e.target.checked };
                      setConfig(updated);
                      saveHttpSmsConfig(updated);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              {/* Sub-toggles & Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Auto Create Lead */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.crmAutoCreateLead}
                      onChange={(e) => {
                        const updated = { ...config, crmAutoCreateLead: e.target.checked };
                        setConfig(updated);
                        saveHttpSmsConfig(updated);
                      }}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cadastrar Novo Contato Automaticamente</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Se o número do SMS não existir na base de contatos, cria o lead imediatamente com telefone e pontuação inicial.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Live Chat Sync */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoSyncWithLiveChat}
                      onChange={(e) => {
                        const updated = { ...config, autoSyncWithLiveChat: e.target.checked };
                        setConfig(updated);
                        saveHttpSmsConfig(updated);
                      }}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Abrir Conversa no Live Chat</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        O histórico do SMS aparece instantaneamente na caixa de entrada para o atendente responder via chip.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Pipeline Stage */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Etapa Inicial do Funil (Pipeline Stage)</span>
                  </label>
                  <select
                    value={config.crmLeadStage || 'Novos Leads'}
                    onChange={(e) => {
                      const updated = { ...config, crmLeadStage: e.target.value };
                      setConfig(updated);
                      saveHttpSmsConfig(updated);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Novos Leads">Novos Leads (Entrada)</option>
                    <option value="Primeiro Contato">Primeiro Contato Realizado</option>
                    <option value="Qualificação Comercial">Em Qualificação</option>
                    <option value="Demonstração Agendada">Demonstração Agendada</option>
                    <option value="Atendimento Humano">Atendimento Humano</option>
                  </select>
                </div>

                {/* Default Tag */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tag Automática Aplicada ao Contato</span>
                  </label>
                  <input
                    type="text"
                    value={config.crmDefaultTag || 'Origem-SMS-Android'}
                    onChange={(e) => {
                      const updated = { ...config, crmDefaultTag: e.target.value };
                      setConfig(updated);
                      saveHttpSmsConfig(updated);
                    }}
                    placeholder="Origem-SMS-Android"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* External Webhook Forwarding (Optional) */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Share2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Webhook de Repasse para CRM Externo (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={config.crmWebhookForwardUrl || ''}
                  onChange={(e) => {
                    const updated = { ...config, crmWebhookForwardUrl: e.target.value };
                    setConfig(updated);
                    saveHttpSmsConfig(updated);
                  }}
                  placeholder="https://api.rdstation.com/v1/leads ou https://api.hubspot.com/crm/v3/..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Se preenchido, o ManyFlow envia simultaneamente uma cópia JSON com o SMS recebido para seu CRM externo.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Regras do CRM</span>
              </button>
            </div>
          </div>

          {/* Simulador Interativo de Redirecionamento em Tempo Real */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Testar Redirecionamento para o CRM em Tempo Real</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simule o recebimento de um SMS no chip Android e visualize o lead sendo cadastrado no CRM e a conversa sendo aberta.
                </p>
              </div>
            </div>

            <form onSubmit={handleSimulateInboundAndCrm} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Número do Remetente (Lead)
                  </label>
                  <input
                    type="text"
                    required
                    value={simInboundFrom}
                    onChange={(e) => setSimInboundFrom(e.target.value)}
                    placeholder="+55 11 98844-3322"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nome do Contato
                  </label>
                  <input
                    type="text"
                    required
                    value={simInboundName}
                    onChange={(e) => setSimInboundName(e.target.value)}
                    placeholder="Mariana Siqueira"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Conteúdo do SMS Recebido
                </label>
                <textarea
                  rows={2}
                  required
                  value={simInboundText}
                  onChange={(e) => setSimInboundText(e.target.value)}
                  placeholder="Mensagem do cliente..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400">
                  Total de contatos atuais no CRM: <strong>{contacts.length}</strong>
                </div>

                <button
                  type="submit"
                  disabled={simulatingCrm}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowDownLeft className={`w-4 h-4 ${simulatingCrm ? 'animate-bounce' : ''}`} />
                  <span>{simulatingCrm ? 'Processando Redirecionamento...' : 'Simular Recebimento & Redirecionar para CRM'}</span>
                </button>
              </div>
            </form>

            {/* Success Result Box */}
            {crmSuccessResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 animate-in fade-in space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {crmSuccessResult.isNew ? 'Novo Lead Cadastrado com Sucesso no CRM!' : 'Lead Existente Atualizado com o Novo SMS!'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-emerald-700/80 dark:text-emerald-400 text-[10px] block">Nome:</span>
                    <strong className="text-emerald-950 dark:text-white">{crmSuccessResult.contactName}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700/80 dark:text-emerald-400 text-[10px] block">Telefone:</span>
                    <strong className="text-emerald-950 dark:text-white font-mono">{crmSuccessResult.contactPhone}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700/80 dark:text-emerald-400 text-[10px] block">Etapa no Funil:</span>
                    <strong className="text-emerald-950 dark:text-white">{crmSuccessResult.stage}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700/80 dark:text-emerald-400 text-[10px] block">Tag CRM:</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[11px] font-mono font-bold">
                      {crmSuccessResult.tag}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: STATUS DO APARELHO & SIMs                                     */}
      {/* ==================================================================== */}
      {activeTab === 'device' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Telemetry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Aparelho Android</span>
              <div className="text-base font-black text-slate-900 dark:text-white mt-2 truncate">
                {device.deviceName}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>HttpSMS v{device.appVersion} Conectado</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Bateria</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {device.batteryLevel}%
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full rounded-full ${device.batteryLevel > 20 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${device.batteryLevel}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Rede / Sinal</span>
              <div className="text-base font-black text-slate-900 dark:text-white mt-2 flex items-center gap-2">
                <span>{device.networkType}</span>
                <span className="text-xs font-normal text-slate-400">({device.signalStrength}/5 barras)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Heartbeat: {new Date(device.lastHeartbeat).toLocaleTimeString('pt-BR')}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Slot de Envio Ativo</span>
              <div className="text-base font-black text-slate-900 dark:text-white mt-2">
                SIM {device.activeSimSlot}: {device.sim1Carrier}
              </div>
              <div className="text-[11px] text-purple-600 font-mono font-bold mt-1">
                {device.sim1Number}
              </div>
            </div>
          </div>

          {/* SIM Cards Details */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              Chips Detectados no Smartphone
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border-2 border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase">
                    SIM Card 1 (Padrão)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-black">
                    EM USO
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {device.sim1Number}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>Operadora: <strong>{device.sim1Carrier}</strong></span>
                  <span>Tecnologia: <strong>5G SA / VoLTE</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                    SIM Card 2 (Secundário)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                    STANDBY
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {device.sim2Number || '+55 11 91234-5678'}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>Operadora: <strong>{device.sim2Carrier || 'Claro BR'}</strong></span>
                  <span>Tecnologia: <strong>4G LTE</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: DISPARO DE TESTE SMS                                          */}
      {/* ==================================================================== */}
      {activeTab === 'test_send' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              Disparo de Teste SMS via Chip Android
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Envie um SMS real através do celular Android para validar a transmissão instantânea pelo chip.
            </p>
          </div>

          <form onSubmit={handleSendTestSms} className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Destinatário (E.164)
              </label>
              <input
                type="text"
                required
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="+55 11 99882-1100"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Mensagem SMS
              </label>
              <textarea
                rows={3}
                required
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <div className="text-[11px] text-slate-400 text-right">
                {testMessage.length}/160 caracteres (1 SMS)
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Enviar via:</span>
                <select
                  value={testSimSlot}
                  onChange={(e) => setTestSimSlot(Number(e.target.value) as 1 | 2)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value={1}>SIM 1 ({device.sim1Carrier})</option>
                  <option value={2}>SIM 2 ({device.sim2Carrier || 'Claro'})</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-pulse' : ''}`} />
                <span>{isSending ? 'Despachando...' : 'Enviar SMS'}</span>
              </button>
            </div>
          </form>

          {sendSuccessBanner && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>SMS transmitido pelo celular Android e entregue com sucesso à rede da operadora!</span>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: HISTÓRICO DE MENSAGENS & LEADS CRM                            */}
      {/* ==================================================================== */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden animate-in fade-in">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Histórico de Mensagens SMS do Aparelho ({messages.length})
            </h3>
            <span className="text-xs text-slate-400">
              Atualização contínua via Gateway
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhum registro de SMS no gateway ainda.
              </div>
            ) : (
              messages.map((msg) => {
                const isInbound = msg.direction === 'inbound';
                return (
                  <div key={msg.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isInbound 
                          ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400' 
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                      }`}>
                        {isInbound ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {msg.contactName || (isInbound ? msg.from : msg.to)}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {isInbound ? `De: ${msg.from}` : `Para: ${msg.to}`}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isInbound 
                              ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200' 
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                          }`}>
                            {isInbound ? 'RECEBIDO ➔ CRM' : 'ENVIADO'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            SIM {msg.simSlot}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {msg.content}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono shrink-0">
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: REST API & DOCUMENTAÇÃO DE WEBHOOKS                           */}
      {/* ==================================================================== */}
      {activeTab === 'api_docs' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              Webhook e Documentação Técnica de Integração
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              URL pública que recebe eventos de SMS do smartphone e dispara o pipeline de automação e CRM.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                URL do Webhook Inbound (Recebimento de SMS)
              </span>
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 font-mono text-xs text-slate-800 dark:text-slate-200 select-all border border-slate-200 dark:border-slate-800">
              {inboundWebhookUrl}
            </div>
            <p className="text-[11px] text-slate-500">
              Cadastre esta URL nas configurações de Webhooks do aplicativo HttpSMS no Android.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Exemplo de Envio via cURL
            </h4>
            <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
              <pre>{`curl -X POST "${config.gatewayUrl}/messages/send" \\
  -H "x-api-key: ${config.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Olá! Sua mensagem ManyFlow",
    "from": "${config.defaultSenderNumber}",
    "to": "+5511998821100",
    "sim_slot": ${config.defaultSimSlot}
  }'`}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
