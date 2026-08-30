import React from 'react';
import { 
  Sparkles, 
  Play, 
  Plus, 
  Instagram, 
  Facebook, 
  Activity, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { ChannelType, Flow, NavigationTab } from '../types';

interface HeaderProps {
  currentTab: NavigationTab;
  flows: Flow[];
  selectedFlowId: string;
  onSelectFlow: (id: string) => void;
  onCreateNewFlow: () => void;
  onOpenSimulator: () => void;
  onOpenAIGenerator: () => void;
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
  selectedChannel = 'omnichannel'
}) => {
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
      case 'settings':
        return 'Configurações de Conexão & Base IA';
      default:
        return 'Painel de Automação';
    }
  };

  return (
    <header id="main_header" className="h-16 bg-white border-b border-[#E2E8F0] px-6 lg:px-8 flex items-center justify-between shrink-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Title & Flow Switcher */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-bold text-[#1A1D21]">
              {getTabTitle()}
            </h1>
            {selectedChannel === 'instagram' && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-1">
                <Instagram className="w-3 h-3 text-pink-600" /> Instagram
              </span>
            )}
            {selectedChannel === 'messenger' && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Facebook className="w-3 h-3 text-blue-600" /> Messenger
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] hidden sm:block">
            Instagram Direct & Facebook Messenger • Meta Graph API v21.0
          </p>
        </div>

        {/* Flow Dropdown if in flows tab */}
        {currentTab === 'flows' && flows.length > 0 && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#E2E8F0]">
            <span className="text-xs text-[#64748B] font-medium">Fluxo:</span>
            <select
              id="select_active_flow"
              value={selectedFlowId}
              onChange={(e) => onSelectFlow(e.target.value)}
              className="bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21] rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0084FF] max-w-[240px] truncate cursor-pointer hover:border-gray-300"
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
        {/* Webhook Status */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-emerald-700">Webhook Meta Ativo</span>
        </div>

        {/* AI Generator CTA */}
        <button
          id="btn_header_ai_generator"
          onClick={onOpenAIGenerator}
          className="py-1.5 px-3 rounded-md bg-[#F0F7FF] border border-blue-200 text-[#0084FF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0084FF]" />
          <span className="hidden sm:inline">Criar com IA</span>
        </button>

        {/* New Flow Button */}
        {currentTab === 'flows' && (
          <button
            id="btn_header_new_flow"
            onClick={onCreateNewFlow}
            className="py-1.5 px-3 rounded-md bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#1A1D21] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#64748B]" />
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

