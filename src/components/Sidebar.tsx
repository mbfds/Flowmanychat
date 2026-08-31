import React, { useState } from 'react';
import { 
  GitFork, 
  Zap, 
  MessageSquareReply, 
  Inbox, 
  Users, 
  Sparkles, 
  BarChart3, 
  Settings, 
  Smartphone, 
  Instagram, 
  Facebook, 
  CheckCircle2, 
  Bot, 
  Radio, 
  LogOut, 
  Building2, 
  ChevronDown, 
  Globe,
  User as UserIcon,
  MessageCircle,
  Send,
  DollarSign,
  Layers,
  Split
} from 'lucide-react';
import { NavigationTab, ChannelType } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
  unreadConversationsCount?: number;
  selectedChannel?: ChannelType;
  onSelectChannel?: (channel: ChannelType) => void;
  onOpenSimulator?: () => void;
  onOpenLoginModal?: () => void;
  onOpenProfileModal?: () => void;
  onGoToHome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onChangeTab,
  unreadConversationsCount = 0,
  selectedChannel = 'omnichannel',
  onSelectChannel,
  onOpenSimulator,
  onOpenLoginModal,
  onOpenProfileModal,
  onGoToHome
}) => {
  const { user, tenant, tenants, switchTenant, logout } = useAuth();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const brandName = tenant?.branding?.brandName || 'ManyFlow';
  const primaryColor = tenant?.branding?.primaryColor || '#0084FF';

  const navItems = [
    { id: 'flows' as NavigationTab, label: 'Fluxos de Automação', icon: GitFork, badge: '5 ativos' },
    { id: 'triggers' as NavigationTab, label: 'Gatilhos & Palavras-Chave', icon: Zap, badge: '4' },
    { id: 'comment_tools' as NavigationTab, label: 'Comentário ➔ Direct', icon: MessageSquareReply, badge: 'Reels & Posts' },
    { id: 'ab_testing' as NavigationTab, label: 'Testes A/B Comparador', icon: Split, badge: 'Novo', highlight: true },
    { id: 'whatsapp_groups' as NavigationTab, label: 'Grupos WhatsApp VIP', icon: Users, badge: 'R$ 243k' },
    { id: 'broadcast' as NavigationTab, label: 'Transmissão (Broadcast)', icon: Radio },
    { id: 'inbox' as NavigationTab, label: 'Atendimento ao Vivo', icon: Inbox, badge: unreadConversationsCount > 0 ? `${unreadConversationsCount}` : undefined, highlight: unreadConversationsCount > 0 },
    { id: 'contacts' as NavigationTab, label: 'Audiência & CRM', icon: Users, badge: '4.2k' },
    { id: 'analytics' as NavigationTab, label: 'Métricas & Conversão', icon: BarChart3 },
    { id: 'settings' as NavigationTab, label: 'Configurações & Deploy', icon: Settings }
  ];

  return (
    <aside id="main_sidebar" className="w-64 bg-white dark:bg-slate-900 border-r border-[#E2E8F0] dark:border-slate-800 flex flex-col justify-between h-screen shrink-0 select-none z-30 shadow-[1px_0_4px_rgba(0,0,0,0.02)] transition-colors">
      {/* Brand Header & Workspace Selector */}
      <div className="overflow-y-auto">
        <div className="p-4 border-b border-[#E2E8F0] dark:border-slate-800 relative">
          <div 
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {brandName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-[#1A1D21] dark:text-white truncate">
                    {brandName}
                  </span>
                </div>
                <p className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono truncate">
                  {tenant?.name || 'Workspace Principal'}
                </p>
              </div>
            </div>

            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showWorkspaceMenu ? 'rotate-180' : ''}`} />
          </div>

          {/* Workspaces Dropdown */}
          {showWorkspaceMenu && (
            <div className="absolute top-16 left-3 right-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">
                Alternar Workspace
              </div>
              {tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    switchTenant(t.id);
                    setShowWorkspaceMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    tenant?.id === t.id
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{t.name}</span>
                  </div>
                  {tenant?.id === t.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  )}
                </button>
              ))}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => {
                    setShowWorkspaceMenu(false);
                    onChangeTab('settings');
                  }}
                  className="w-full text-left px-2 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Gerenciar Domínios / White-Label</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Channel Quick Toggles (Icon Only) */}
        {onSelectChannel && (
          <div className="p-3 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8F9FB] dark:bg-slate-800/40">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
              <span>Canal de Foco</span>
              <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 capitalize">
                {selectedChannel === 'omnichannel' ? 'Todos' : selectedChannel === 'messenger' ? 'Facebook' : selectedChannel}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-[#E2E8F0] dark:border-slate-800">
              <button
                id="filter_omnichannel"
                onClick={() => onSelectChannel('omnichannel')}
                className={`py-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  selectedChannel === 'omnichannel'
                    ? 'bg-[#0084FF] text-white shadow-xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#1A1D21] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Todos os Canais (Omnichannel)"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                id="filter_whatsapp"
                onClick={() => onSelectChannel('whatsapp')}
                className={`py-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  selectedChannel === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
                title="WhatsApp (Meta Cloud API + Baileys)"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                id="filter_instagram"
                onClick={() => onSelectChannel('instagram')}
                className={`py-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  selectedChannel === 'instagram'
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/40'
                }`}
                title="Instagram Direct"
              >
                <Instagram className="w-4 h-4" />
              </button>
              <button
                id="filter_messenger"
                onClick={() => onSelectChannel('messenger')}
                className={`py-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  selectedChannel === 'messenger'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                }`}
                title="Facebook Messenger"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                id="filter_telegram"
                onClick={() => onSelectChannel('telegram')}
                className={`py-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  selectedChannel === 'telegram'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40'
                }`}
                title="Telegram Bot API"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          <div className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
            Menu Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav_${item.id}`}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#F0F7FF] dark:bg-blue-950/50 text-[#0084FF] dark:text-blue-400 font-semibold border border-blue-100/80 dark:border-blue-900/50 shadow-xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#1A1D21] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-[#0084FF] dark:text-blue-400' : 'text-[#64748B] dark:text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.highlight
                        ? 'bg-emerald-500 text-white font-bold animate-pulse'
                        : isActive
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-[#0084FF] dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Session & Logout */}
      <div className="p-3 border-t border-[#E2E8F0] dark:border-slate-800 space-y-2 bg-[#F8F9FB] dark:bg-slate-800/40">
        {/* User Card */}
        {user ? (
          <div 
            onClick={onOpenProfileModal}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 shadow-2xs flex items-center justify-between cursor-pointer transition-all group"
            title="Clique para gerenciar perfil, senha e permissões"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 transition-colors">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#1A1D21] dark:text-white block truncate">{user.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">{user.role}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
              title="Sair da Conta (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="w-full py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <UserIcon className="w-4 h-4" />
            <span>Fazer Login</span>
          </button>
        )}

        {/* Simulator CTA */}
        {onOpenSimulator && (
          <button
            id="btn_open_simulator_sidebar"
            onClick={onOpenSimulator}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulador Mobile</span>
          </button>
        )}

        {/* Return to Home / Landing Page */}
        {onGoToHome && (
          <button
            id="btn_back_to_home_sidebar"
            onClick={onGoToHome}
            className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Ver Página Inicial</span>
          </button>
        )}
      </div>
    </aside>
  );
};


