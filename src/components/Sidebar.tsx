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
  Split,
  CalendarCheck,
  ShieldCheck,
  Receipt,
  Package,
  Calendar,
  MessageSquare
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

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(
    currentTab === 'ab_testing' || currentTab === 'whatsapp_groups' || currentTab === 'broadcast'
  );

  const brandName = tenant?.branding?.brandName || 'ManyFlow';
  const primaryColor = tenant?.branding?.primaryColor || '#0084FF';

  // Primary High-Focus Navigation Items
  const primaryNavItems = [
    { id: 'flows' as NavigationTab, label: 'Fluxos de Automação', icon: GitFork, badge: '5' },
    { id: 'triggers' as NavigationTab, label: 'Gatilhos & Palavras-Chave', icon: Zap, badge: '4' },
    { id: 'appointments' as NavigationTab, label: 'Agendamentos nos Canais', icon: CalendarCheck, badge: '5 Canais' },
    { id: 'comment_tools' as NavigationTab, label: 'Comentário ➔ Direct', icon: MessageSquareReply },
    { id: 'postiz_planner' as NavigationTab, label: 'Planejador Social (Postiz)', icon: Calendar, badge: 'Postiz' },
    { id: 'inbox' as NavigationTab, label: 'Atendimento ao Vivo', icon: Inbox, badge: unreadConversationsCount > 0 ? `${unreadConversationsCount}` : undefined, highlight: unreadConversationsCount > 0 },
    { id: 'contacts' as NavigationTab, label: 'Audiência & CRM', icon: Users, badge: '4.2k' },
    { id: 'analytics' as NavigationTab, label: 'Resumo do Dia & Métricas', icon: BarChart3 },
    { id: 'affiliates' as NavigationTab, label: 'Sistema de Afiliados', icon: DollarSign, badge: 'Até 40%' }
  ];

  // Secondary Low-Usage Items Grouped in Advanced Tools
  const advancedNavItems = [
    { id: 'ab_testing' as NavigationTab, label: 'Testes A/B Comparador', icon: Split, badge: 'Otimização' },
    { id: 'whatsapp_groups' as NavigationTab, label: 'Grupos VIP WhatsApp', icon: MessageCircle },
    { id: 'broadcast' as NavigationTab, label: 'Transmissão em Massa', icon: Radio }
  ];

  // Admin SaaS Management Section
  const adminNavItems = [
    { id: 'admin_users' as NavigationTab, label: 'Todos os Usuários', icon: ShieldCheck, badge: 'Admin' },
    { id: 'admin_subscriptions' as NavigationTab, label: 'Mensalidades & Faturas', icon: Receipt, badge: 'MRR' },
    { id: 'admin_packages' as NavigationTab, label: 'Planos & Pacotes', icon: Package, badge: 'SaaS' }
  ];

  const isCurrentTabInAdvanced = advancedNavItems.some((item) => item.id === currentTab);
  const isCurrentTabInAdmin = adminNavItems.some((item) => item.id === currentTab);

  const [isAdminOpen, setIsAdminOpen] = useState(
    isCurrentTabInAdmin || true
  );

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
                {selectedChannel === 'omnichannel' ? 'Todos' : selectedChannel === 'messenger' ? 'Facebook' : selectedChannel === 'sms' ? 'SMS Gateway' : selectedChannel}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-[#E2E8F0] dark:border-slate-800">
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
              <button
                id="filter_sms"
                onClick={() => onSelectChannel('sms')}
                className={`py-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  selectedChannel === 'sms'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                }`}
                title="SMS Gateway (HttpSMS Android)"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <nav className="p-3 space-y-3">
          {/* Main Automation & Engagement Navigation */}
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2.5 pb-1">
              Automações & Conversas
            </div>
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav_${item.id}`}
                  onClick={() => onChangeTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold shrink-0 ${
                        item.highlight
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isActive
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Collapsible Advanced Tools Dropdown */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              id="btn_toggle_advanced_tools"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isCurrentTabInAdvanced
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-bold">Ferramentas Avançadas</span>
                {isCurrentTabInAdvanced && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
            </button>

            {/* Sub-items list */}
            {isAdvancedOpen && (
              <div className="mt-1 pl-2 space-y-0.5 border-l-2 border-indigo-100 dark:border-indigo-900/50 ml-3 py-0.5">
                {advancedNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav_${item.id}`}
                      onClick={() => onChangeTab(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin SaaS Management Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              id="btn_toggle_admin_section"
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isCurrentTabInAdmin
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50/70 dark:bg-purple-950/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="font-bold">Painel do Admin</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                  SaaS
                </span>
                {isCurrentTabInAdmin && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAdminOpen ? 'rotate-180 text-purple-600' : 'text-slate-400'}`} />
            </button>

            {/* Admin sub-items list */}
            {isAdminOpen && (
              <div className="mt-1 pl-2 space-y-0.5 border-l-2 border-purple-100 dark:border-purple-900/50 ml-3 py-0.5">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav_${item.id}`}
                      onClick={() => onChangeTab(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          item.id === 'admin_subscriptions' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              id="nav_settings"
              onClick={() => onChangeTab('settings')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                currentTab === 'settings'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings
                  className={`w-4 h-4 transition-transform group-hover:rotate-45 ${
                    currentTab === 'settings' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>Configurações & Conexões</span>
              </div>
            </button>
          </div>
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


