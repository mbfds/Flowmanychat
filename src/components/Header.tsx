import React from 'react';
import { 
  Sparkles, 
  Play, 
  Plus, 
  Instagram, 
  Facebook, 
  Activity, 
  Search, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Users, 
  Send, 
  MessageCircle,
  Zap
} from 'lucide-react';
import { ChannelType, Flow, NavigationTab } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentTab: NavigationTab;
  flows: Flow[];
  selectedFlowId: string;
  onSelectFlow: (id: string) => void;
  onCreateNewFlow: () => void;
  onOpenSimulator: () => void;
  onOpenAIGenerator: () => void;
  onOpenTemplates?: () => void;
  selectedChannel?: ChannelType;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  flows,
  selectedFlowId,
  onSelectFlow,
  onCreateNewFlow,
  onOpenSimulator,
  onOpenAIGenerator,
  onOpenTemplates,
  selectedChannel = 'omnichannel'
}) => {
  const { isDark, toggleTheme } = useTheme();

  const getTabTitle = () => {
    switch (currentTab) {
      case 'flows':
        return 'Editor Visual de Fluxos';
      case 'triggers':
        return 'Gatilhos por Palavra-Chave & Regras';
      case 'comment_tools':
        return 'Automação de Comentário ➔ Direct';
      case 'broadcast':
        return 'Campanhas de Transmissão (Broadcast)';
      case 'inbox':
        return 'Atendimento Unificado (Live Chat)';
      case 'contacts':
        return 'Audiência & Gestão de Leads (CRM)';
      case 'analytics':
        return 'Relatórios & Métricas de Conversão';
      case 'ab_testing':
        return 'Testes A/B: Comparador Side-by-Side de Fluxos';
      case 'appointments':
        return 'Agendamentos & Calendário nos Canais';
      case 'whatsapp_groups':
        return 'Super Administrador & Monetização de Grupos WhatsApp';
      case 'affiliates':
        return 'Sistema & Gestão de Afiliados ManyFlow';
      case 'admin_users':
        return 'Gestão de Usuários & Contas (Admin SaaS)';
      case 'admin_subscriptions':
        return 'Gestão de Mensalidades, PIX & Faturas Recorrentes';
      case 'admin_packages':
        return 'Gestão de Planos, Limites & Pacotes Adicionais';
      case 'settings':
        return 'Configurações de Conexão & Base IA';
      default:
        return 'Painel de Automação';
    }
  };

  return (
    <header id="main_header" className="h-16 bg-white dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-800 px-6 lg:px-8 flex items-center justify-between shrink-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors">
      {/* Title & Flow Switcher */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-bold text-[#1A1D21] dark:text-white">
              {getTabTitle()}
            </h1>
            {selectedChannel === 'instagram' && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 flex items-center gap-1">
                <Instagram className="w-3 h-3 text-pink-600 dark:text-pink-400" /> Instagram
              </span>
            )}
            {selectedChannel === 'messenger' && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <Facebook className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Messenger
              </span>
            )}
            {selectedChannel === 'whatsapp' && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> WhatsApp
              </span>
            )}
            {selectedChannel === 'telegram' && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                <Send className="w-3 h-3 text-sky-600 dark:text-sky-400" /> Telegram
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400 hidden sm:block">
            Instagram • WhatsApp (Cloud API + Baileys) • Telegram • Facebook Messenger
          </p>
        </div>

        {/* Flow Dropdown if in flows tab */}
        {currentTab === 'flows' && flows.length > 0 && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#E2E8F0] dark:border-slate-800">
            <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium">Fluxo:</span>
            <select
              id="select_active_flow"
              value={selectedFlowId}
              onChange={(e) => onSelectFlow(e.target.value)}
              className="bg-[#F8F9FB] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-xs font-semibold text-[#1A1D21] dark:text-white rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0084FF] max-w-[240px] truncate cursor-pointer hover:border-gray-300"
            >
              {flows.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Global Dark / Light Theme Toggle */}
        <button
          id="btn_theme_toggle"
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
          title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          aria-label="Alternar Modo Escuro / Claro"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 transition-transform rotate-0 hover:-rotate-12" />
          )}
        </button>

        {/* Webhook Status */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">Webhooks Ativos</span>
        </div>

        {/* Templates CTA */}
        {onOpenTemplates && (
          <button
            id="btn_header_templates"
            onClick={onOpenTemplates}
            className="py-1.5 px-3 rounded-md bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 hover:from-amber-500/20 hover:to-pink-500/20 border border-amber-300/80 dark:border-amber-700/80 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-102"
            title="Modelos Prontos para Influenciadores, Infoprodutos, E-commerce e AdSense"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>Modelos Prontos</span>
          </button>
        )}

        {/* AI Generator CTA */}
        <button
          id="btn_header_ai_generator"
          onClick={onOpenAIGenerator}
          className="py-1.5 px-3 rounded-md bg-[#F0F7FF] dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#0084FF] dark:text-blue-400 hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0084FF] dark:text-blue-400" />
          <span className="hidden sm:inline">Criar com IA</span>
        </button>

        {/* New Flow Button */}
        {currentTab === 'flows' && (
          <button
            id="btn_header_new_flow"
            onClick={onCreateNewFlow}
            className="py-1.5 px-3 rounded-md bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#1A1D21] dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#64748B] dark:text-slate-400" />
            <span className="hidden sm:inline">Novo Fluxo</span>
          </button>
        )}

        {/* Test in Simulator Main Button */}
        <button
          id="btn_header_simulator"
          onClick={onOpenSimulator}
          className="bg-[#0084FF] hover:bg-[#0073E6] text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Testar no Celular</span>
        </button>
      </div>
    </header>
  );
};


