import React, { useState } from 'react';
import { 
  X, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  DollarSign, 
  Clock, 
  MessageSquare, 
  Link2, 
  Zap, 
  CheckCircle2,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { WhatsAppGroup, WhatsAppEngineType } from '../../types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (newGroup: WhatsAppGroup) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WhatsAppGroup['category']>('vip_monetized');
  const [isVipMonetized, setIsVipMonetized] = useState(true);
  const [price, setPrice] = useState(197);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'lifetime'>('monthly');
  const [antiLink, setAntiLink] = useState(true);
  const [antiLinkAction, setAntiLinkAction] = useState<'kick_member' | 'delete_msg' | 'warn'>('kick_member');
  const [antiForeignNumbers, setAntiForeignNumbers] = useState(true);
  const [autoWelcome, setAutoWelcome] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('👋 Seja muito bem-vindo(a) ao grupo, @membro! Leia as regras fixadas na descrição.');
  const [autoMute, setAutoMute] = useState(false);
  const [muteTime, setMuteTime] = useState('22:00');
  const [unmuteTime, setUnmuteTime] = useState('08:00');
  const [engine, setEngine] = useState<WhatsAppEngineType>('hybrid');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGroup: WhatsAppGroup = {
      id: `grp_${Date.now()}`,
      name: name.trim(),
      jid: `120363${Math.floor(100000000000 + Math.random() * 900000000000)}@g.us`,
      description: description.trim(),
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80',
      inviteLink: `https://chat.whatsapp.com/${Math.random().toString(36).substring(2, 12)}`,
      category,
      status: 'active',
      memberCount: 1, // apenas o admin inicialmente
      maxMembers: 1024,
      isAdmin: true,
      isVipMonetized,
      pricing: isVipMonetized ? {
        price: Number(price),
        currency: 'BRL',
        billingCycle,
        checkoutUrl: `https://pay.manyflow.io/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        pixKey: 'financeiro@manyflow.io',
        benefits: [
          'Acesso exclusivo à comunidade VIP',
          'Sinais e conteúdos em primeira mão',
          'Suporte prioritário e networking'
        ]
      } : undefined,
      autoManagement: {
        antiLink,
        antiLinkAction,
        antiSpam: true,
        antiPorn: true,
        antiForeignNumbers,
        autoWelcome,
        welcomeMessage,
        autoMuteSchedule: {
          enabled: autoMute,
          muteTime,
          unmuteTime
        },
        autoKickExpiredVip: isVipMonetized,
        smartLinkRotation: true,
        sendDailyDigest: true
      },
      stats: {
        totalJoined: 1,
        totalLeft: 0,
        currentMembers: 1,
        dailyJoinsHistory: [
          { date: 'Hoje', count: 1, leftCount: 0 }
        ],
        messagesCount24h: 1,
        activeMembersPercent: 100,
        churnRate: 0,
        revenueTotal: 0,
        activeSubscribers: 0,
        expiringIn7Days: 0
      },
      engine,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onCreateGroup(newGroup);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Criar Novo Grupo de WhatsApp
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Criação instantânea via Baileys Engine com regras de moderação e monetização
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Group Basic Info */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Informações do Grupo
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Grupo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: 💎 VIP Alpha Investidores #03"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Descrição do Grupo (Regras & Informações)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o propósito do grupo, links úteis e avisos para os membros..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const val = e.target.value as WhatsAppGroup['category'];
                      setCategory(val);
                      setIsVipMonetized(val === 'vip_monetized');
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="vip_monetized">💎 Grupo VIP Pago (Monetizado)</option>
                    <option value="launch_funnel">🔥 Funil de Lançamento / Tráfego</option>
                    <option value="community">💬 Comunidade / Networking</option>
                    <option value="leads">🎯 Captura & Qualificação de Leads</option>
                    <option value="support">🎧 Suporte & Alunos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Motor de Operação
                  </label>
                  <select
                    value={engine}
                    onChange={(e) => setEngine(e.target.value as WhatsAppEngineType)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="hybrid">⚡ Híbrido (Meta Cloud API + Baileys Engine)</option>
                    <option value="baileys_unofficial">🤖 Baileys Multi-Device (Disparo Rápido / Adm)</option>
                    <option value="meta_cloud_api">🏛️ Meta Cloud API Oficial</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* VIP Monetization Box */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  Monetização & Venda de Acesso VIP
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVipMonetized}
                  onChange={(e) => setIsVipMonetized(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {isVipMonetized && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Preço da Assinatura (R$)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="197"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ciclo de Cobrança
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  >
                    <option value="monthly">Mensal Recorrente</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="semiannual">Semestral</option>
                    <option value="annual">Anual</option>
                    <option value="lifetime">Acesso Vitalício</option>
                  </select>
                </div>
                <div className="sm:col-span-2 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Expulsão automática do Baileys ativada quando a assinatura do membro expirar sem pagamento.</span>
                </div>
              </div>
            )}
          </div>

          {/* Auto Management & Protection Rules */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Regras de Automação & Moderação Anti-Spam
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Anti Link */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Anti-Link Externo
                  </span>
                  <input
                    type="checkbox"
                    checked={antiLink}
                    onChange={(e) => setAntiLink(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
                {antiLink && (
                  <select
                    value={antiLinkAction}
                    onChange={(e) => setAntiLinkAction(e.target.value as any)}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="kick_member">Expulsar Imediatamente</option>
                    <option value="delete_msg">Apenas Apagar Mensagem</option>
                    <option value="warn">Dar Aviso (Warn 1/3)</option>
                  </select>
                )}
              </div>

              {/* Anti Foreign */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Anti-Números Estrangeiros
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Expulsa DDI diferente de +55 (gringos/bots)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={antiForeignNumbers}
                  onChange={(e) => setAntiForeignNumbers(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Welcome Message */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Boas-Vindas Automáticas no Grupo
                </span>
                <input
                  type="checkbox"
                  checked={autoWelcome}
                  onChange={(e) => setAutoWelcome(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </div>
              {autoWelcome && (
                <input
                  type="text"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Use @membro para marcar a pessoa que entrou..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              )}
            </div>

            {/* Auto Mute Schedule */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Silenciamento Noturno Programado
                </span>
                <input
                  type="checkbox"
                  checked={autoMute}
                  onChange={(e) => setAutoMute(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
              </div>
              {autoMute && (
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Fechar grupo às:</span>
                    <input
                      type="time"
                      value={muteTime}
                      onChange={(e) => setMuteTime(e.target.value)}
                      className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Reabrir às:</span>
                    <input
                      type="time"
                      value={unmuteTime}
                      onChange={(e) => setUnmuteTime(e.target.value)}
                      className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Criar Grupo Agora</span>
          </button>
        </div>
      </div>
    </div>
  );
};
