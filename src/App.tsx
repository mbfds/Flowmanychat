import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ComponentLoader } from './components/Common/ComponentLoader';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { dbService } from './services/db';
import { flowLogger } from './utils/flowLogger';

// Lazy-loaded heavy tab modules and modals for optimized bundle splitting & faster initial load
const FlowCanvas = lazy(() =>
  import('./components/FlowBuilder/FlowCanvas').then((m) => ({ default: m.FlowCanvas }))
);
const TriggersManager = lazy(() =>
  import('./components/Triggers/TriggersManager').then((m) => ({ default: m.TriggersManager }))
);
const CommentGrowthTools = lazy(() =>
  import('./components/CommentGrowthTools/CommentGrowthTools').then((m) => ({ default: m.CommentGrowthTools }))
);
const LiveChatInbox = lazy(() =>
  import('./components/LiveChat/LiveChatInbox').then((m) => ({ default: m.LiveChatInbox }))
);
const ContactsCRM = lazy(() =>
  import('./components/ContactsCRM/ContactsCRM').then((m) => ({ default: m.ContactsCRM }))
);
const AnalyticsDashboard = lazy(() =>
  import('./components/Analytics/AnalyticsDashboard').then((m) => ({ default: m.AnalyticsDashboard }))
);
const ABTestingModule = lazy(() =>
  import('./components/ABTesting/ABTestingModule').then((m) => ({ default: m.ABTestingModule }))
);
const WhatsAppGroupDashboard = lazy(() =>
  import('./components/WhatsAppGroups/WhatsAppGroupDashboard').then((m) => ({ default: m.WhatsAppGroupDashboard }))
);
const SettingsHub = lazy(() =>
  import('./components/SettingsHub/SettingsHub').then((m) => ({ default: m.SettingsHub }))
);
const BroadcastView = lazy(() =>
  import('./components/Broadcast/BroadcastView').then((m) => ({ default: m.BroadcastView }))
);
const InteractiveSimulatorModal = lazy(() =>
  import('./components/Simulator/InteractiveSimulatorModal').then((m) => ({ default: m.InteractiveSimulatorModal }))
);
const AIFlowGeneratorModal = lazy(() =>
  import('./components/AIFlowGenerator/AIFlowGeneratorModal').then((m) => ({ default: m.AIFlowGeneratorModal }))
);
const FlowTemplatesModal = lazy(() =>
  import('./components/FlowBuilder/FlowTemplatesModal').then((m) => ({ default: m.FlowTemplatesModal }))
);
const LoginPage = lazy(() =>
  import('./components/Auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const HomePage = lazy(() =>
  import('./components/Home/HomePage').then((m) => ({ default: m.HomePage }))
);
const UserProfileModal = lazy(() =>
  import('./components/Auth/UserProfileModal').then((m) => ({ default: m.UserProfileModal }))
);
const AffiliateSystemModule = lazy(() =>
  import('./components/Affiliates/AffiliateSystemModule').then((m) => ({ default: m.AffiliateSystemModule }))
);
const AppointmentsHub = lazy(() =>
  import('./components/Appointments/AppointmentsHub').then((m) => ({ default: m.AppointmentsHub }))
);
const AdminUsersManager = lazy(() =>
  import('./components/Admin/AdminUsersManager').then((m) => ({ default: m.AdminUsersManager }))
);
const AdminSubscriptionsManager = lazy(() =>
  import('./components/Admin/AdminSubscriptionsManager').then((m) => ({ default: m.AdminSubscriptionsManager }))
);
const AdminPackagesManager = lazy(() =>
  import('./components/Admin/AdminPackagesManager').then((m) => ({ default: m.AdminPackagesManager }))
);
const PostizPlanner = lazy(() =>
  import('./components/Postiz/PostizPlanner').then((m) => ({ default: m.PostizPlanner }))
);

import {
  INITIAL_FLOWS,
  DEMO_FLOWS,
  INITIAL_TRIGGERS,
  DEMO_TRIGGERS,
  INITIAL_COMMENT_TOOLS,
  INITIAL_CONVERSATIONS,
  DEMO_CONVERSATIONS,
  INITIAL_CONTACTS,
  DEMO_CONTACTS,
  INITIAL_KNOWLEDGE_BASE,
  INITIAL_CUSTOM_FIELDS,
  INITIAL_BROADCASTS,
  INITIAL_UTILITY_TEMPLATES,
  INITIAL_WEBHOOK_SETTINGS
} from './data/initialData';
import { NavigationTab, Flow, KeywordTrigger, PostCommentGrowthTool, LiveConversation, Contact, BotKnowledgeBase, ChannelType, CustomFieldDefinition, BroadcastCampaign, UtilityMessageTemplate, WebhookSettingsState } from './types';

function MainApp() {
  const { user, tenant, isAuthenticated } = useAuth();
  const isDemo = !isAuthenticated || user?.email === 'demo@manyflow.com' || Boolean(user?.isDemo);

  // Public Landing / Workspace View State (defaults to HomePage so user stays on landing page on load)
  const [isInWorkspace, setIsInWorkspace] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'home' | 'login' | 'register'>('home');

  // Navigation & View state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('flows');
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('omnichannel');
  const [flows, setFlows] = useState<Flow[]>(() => isDemo ? DEMO_FLOWS : INITIAL_FLOWS);
  const [selectedFlowId, setSelectedFlowId] = useState<string>(() => isDemo ? (DEMO_FLOWS[0]?.id || '') : '');

  // Growth Tools, Triggers & Live Data states
  const [triggers, setTriggers] = useState<KeywordTrigger[]>(() => isDemo ? DEMO_TRIGGERS : INITIAL_TRIGGERS);
  const [growthTools, setGrowthTools] = useState<PostCommentGrowthTool[]>(INITIAL_COMMENT_TOOLS);
  const [conversations, setConversations] = useState<LiveConversation[]>(() => isDemo ? DEMO_CONVERSATIONS : INITIAL_CONVERSATIONS);
  const [contacts, setContacts] = useState<Contact[]>(() => isDemo ? DEMO_CONTACTS : INITIAL_CONTACTS);
  const [knowledgeBase, setKnowledgeBase] = useState<BotKnowledgeBase>(INITIAL_KNOWLEDGE_BASE);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(INITIAL_CUSTOM_FIELDS);
  const [broadcasts, setBroadcasts] = useState<BroadcastCampaign[]>(INITIAL_BROADCASTS);
  const [utilityTemplates, setUtilityTemplates] = useState<UtilityMessageTemplate[]>(INITIAL_UTILITY_TEMPLATES);
  const [webhookSettings, setWebhookSettings] = useState<WebhookSettingsState>(INITIAL_WEBHOOK_SETTINGS);

  // Modals state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isDbSyncing, setIsDbSyncing] = useState(false);
  const [dbSyncProgress, setDbSyncProgress] = useState(0);
  const [dbSyncStatus, setDbSyncStatus] = useState('Conectando ao MongoDB...');
  const [dbSyncPromise, setDbSyncPromise] = useState<Promise<any> | null>(null);

  // Sync with MongoDB Service on Mount / Auth state change
  useEffect(() => {
    async function initDbSync() {
      // Demo / Guest users keep demonstration data in memory without touching real DB
      if (!isAuthenticated || user?.email === 'demo@manyflow.com' || user?.isDemo) {
        setFlows(DEMO_FLOWS);
        setSelectedFlowId(DEMO_FLOWS[0]?.id || '');
        setTriggers(DEMO_TRIGGERS);
        setContacts(DEMO_CONTACTS);
        setConversations(DEMO_CONVERSATIONS);
        setIsDbSyncing(false);
        setDbSyncProgress(100);
        return;
      }

      // Authenticated real user: fetch strictly real data from database with retry & real progress
      setIsDbSyncing(true);
      setDbSyncProgress(5);
      setDbSyncStatus('Iniciando sincronização com MongoDB...');

      const syncPromise = dbService.syncInitialDataWithRetry({
        onProgress: (progress, statusMessage) => {
          setDbSyncProgress(progress);
          setDbSyncStatus(statusMessage);
        },
        maxRetries: 3
      });

      setDbSyncPromise(syncPromise);

      try {
        const { flows: remoteFlows, contacts: remoteContacts } = await syncPromise;

        if (remoteFlows && remoteFlows.length > 0) {
          setFlows(remoteFlows);
          if (!remoteFlows.some((f) => f.id === selectedFlowId)) {
            setSelectedFlowId(remoteFlows[0]?.id || '');
          }
        } else {
          setFlows([]);
          setSelectedFlowId('');
        }

        if (remoteContacts && remoteContacts.length > 0) {
          setContacts(remoteContacts);
        } else {
          setContacts([]);
        }
      } catch (err) {
        console.warn('[App] Erro na sincronização inicial do MongoDB:', err);
      } finally {
        setDbSyncProgress(100);
        setTimeout(() => {
          setIsDbSyncing(false);
        }, 350);
      }
    }

    initDbSync();
  }, [isAuthenticated, user?.email, user?.isDemo]);

  // If user explicitly requests full login screen
  if (isLoginModalOpen) {
    return (
      <Suspense fallback={<ComponentLoader label="Carregando portal de acesso..." />}>
        <LoginPage onSuccess={() => setIsLoginModalOpen(false)} />
      </Suspense>
    );
  }

  // Selected flow for builder
  const activeFlow = flows.find((f) => f.id === selectedFlowId) || flows[0];

  const handleUpdateFlow = (updatedFlow: Flow) => {
    const startTime = Date.now();
    
    // Log flow modification to console for production debugging
    flowLogger.logUpdate(updatedFlow.id, updatedFlow, {
      previousTitle: flows.find((f) => f.id === updatedFlow.id)?.title,
      nodesDelta: (updatedFlow.nodes?.length || 0) - (flows.find((f) => f.id === updatedFlow.id)?.nodes?.length || 0),
    });

    setFlows((prev) => prev.map((f) => (f.id === updatedFlow.id ? updatedFlow : f)));
    dbService.updateFlow(updatedFlow.id, updatedFlow)
      .then((success) => {
        flowLogger.logSyncResult(updatedFlow.id, 'update', success, undefined, Date.now() - startTime);
      })
      .catch((err) => {
        console.warn('[App] Erro ao sincronizar fluxo no MongoDB:', err);
        flowLogger.logSyncResult(updatedFlow.id, 'update', false, err, Date.now() - startTime);
      });
  };

  const handleImportFlow = (importedFlow: Flow, asNewFlow: boolean = true) => {
    if (asNewFlow) {
      const newFlowId = `flow_imported_${Date.now()}`;
      const newFlow: Flow = {
        ...importedFlow,
        id: newFlowId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      flowLogger.logCreate(newFlowId, newFlow, { source: 'import_flow' });
      setFlows((prev) => [newFlow, ...prev]);
      setSelectedFlowId(newFlowId);
      dbService.saveFlowsBulk([newFlow]).catch((err) => {
        console.warn('[App] Erro ao salvar fluxo importado no MongoDB:', err);
      });
    } else {
      handleUpdateFlow({
        ...importedFlow,
        id: selectedFlowId,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleCreateNewFlow = () => {
    const startTime = Date.now();
    const newFlowId = `flow_${Date.now()}`;
    const newFlow: Flow = {
      id: newFlowId,
      title: 'Novo Fluxo de Automação',
      description: 'Construa suas mensagens e condições no canvas visual.',
      channel: selectedChannel === 'messenger' ? 'messenger' : 'instagram',
      isActive: true,
      nodes: [
        {
          id: 'node_init_trigger',
          type: 'trigger',
          title: 'Gatilho Inicial',
          data: {
            keywords: ['INICIAR']
          },
          position: { x: 100, y: 150 }
        },
        {
          id: 'node_init_msg',
          type: 'message',
          title: 'Mensagem de Boas-Vindas',
          data: {
            text: 'Olá {first_name}! Obrigado pelo contato no Instagram. Como podemos te ajudar hoje?',
            buttons: [
              {
                id: 'btn_1',
                text: '🎁 Ver Ofertas Especiais',
                type: 'flow'
              }
            ]
          },
          position: { x: 480, y: 150 }
        }
      ],
      connections: [
        {
          fromNodeId: 'node_init_trigger',
          toNodeId: 'node_init_msg'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { runs: 0, completed: 0, ctr: 0 }
    };

    // Log new flow creation to console for production debugging
    flowLogger.logCreate(newFlowId, newFlow, {
      channel: newFlow.channel,
      initialNodesCount: newFlow.nodes.length
    });

    setFlows((prev) => [newFlow, ...prev]);
    setSelectedFlowId(newFlowId);
    setCurrentTab('flows');

    dbService.createFlow(newFlow)
      .then((created) => {
        flowLogger.logSyncResult(newFlowId, 'create', Boolean(created), undefined, Date.now() - startTime);
      })
      .catch((err) => {
        console.warn('[App] Erro ao salvar novo fluxo no MongoDB:', err);
        flowLogger.logSyncResult(newFlowId, 'create', false, err, Date.now() - startTime);
      });
  };

  const handleFlowGenerated = (newFlow: Flow) => {
    setFlows((prev) => [newFlow, ...prev]);
    setSelectedFlowId(newFlow.id);
    setCurrentTab('flows');

    dbService.createFlow(newFlow).catch((err) => {
      console.warn('[App] Erro ao salvar fluxo gerado por IA no MongoDB:', err);
    });
  };

  const handleSelectTemplate = (templateFlow: Flow) => {
    setFlows((prev) => [templateFlow, ...prev]);
    setSelectedFlowId(templateFlow.id);
    setCurrentTab('flows');

    dbService.createFlow(templateFlow).catch((err) => {
      console.warn('[App] Erro ao salvar modelo pronto no MongoDB:', err);
    });
  };

  const handleUpdateContacts = (newContacts: Contact[] | ((prev: Contact[]) => Contact[])) => {
    if (typeof newContacts === 'function') {
      setContacts((prev) => {
        const next = newContacts(prev);
        dbService.saveContactsBatch(next).catch(() => {});
        return next;
      });
    } else {
      setContacts(newContacts);
      dbService.saveContactsBatch(newContacts).catch(() => {});
    }
  };

  const handleRestoreBackup = (backupData: any, mode: 'replace' | 'merge') => {
    try {
      const newFlows = backupData.data?.flows || backupData.flows;
      const newContacts = backupData.data?.contacts || backupData.contacts;
      const newFields = backupData.data?.customFields || backupData.customFields;
      const newTriggers = backupData.data?.triggers || backupData.triggers;
      const newKB = backupData.data?.knowledgeBase || backupData.knowledgeBase;
      const newGrowthTools = backupData.data?.growthTools || backupData.growthTools;
      const newBroadcasts = backupData.data?.broadcasts || backupData.broadcasts;
      const newWebhookSettings = backupData.data?.webhookSettings || backupData.webhookSettings;

      if (mode === 'replace') {
        if (Array.isArray(newFlows) && newFlows.length > 0) {
          setFlows(newFlows);
          dbService.saveFlowsBulk(newFlows).catch(() => {});
        }
        if (Array.isArray(newContacts) && newContacts.length > 0) {
          setContacts(newContacts);
          dbService.saveContactsBatch(newContacts).catch(() => {});
        }
        if (Array.isArray(newFields) && newFields.length > 0) setCustomFields(newFields);
        if (Array.isArray(newTriggers) && newTriggers.length > 0) setTriggers(newTriggers);
        if (newKB) setKnowledgeBase(newKB);
        if (Array.isArray(newGrowthTools) && newGrowthTools.length > 0) setGrowthTools(newGrowthTools);
        if (Array.isArray(newBroadcasts) && newBroadcasts.length > 0) setBroadcasts(newBroadcasts);
        if (newWebhookSettings) setWebhookSettings(newWebhookSettings);
      } else {
        // Merge mode
        if (Array.isArray(newFlows) && newFlows.length > 0) {
          setFlows(prev => {
            const existingIds = new Set(prev.map(f => f.id));
            const toAdd = newFlows.filter((f: Flow) => !existingIds.has(f.id));
            const merged = [...prev, ...toAdd];
            dbService.saveFlowsBulk(merged).catch(() => {});
            return merged;
          });
        }
        if (Array.isArray(newContacts) && newContacts.length > 0) {
          setContacts(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const toAdd = newContacts.filter((c: Contact) => !existingIds.has(c.id));
            const merged = [...prev, ...toAdd];
            dbService.saveContactsBatch(merged).catch(() => {});
            return merged;
          });
        }
        if (Array.isArray(newFields) && newFields.length > 0) {
          setCustomFields(prev => {
            const existingKeys = new Set(prev.map(f => f.key));
            const toAdd = newFields.filter((f: CustomFieldDefinition) => !existingKeys.has(f.key));
            return [...prev, ...toAdd];
          });
        }
        if (Array.isArray(newTriggers) && newTriggers.length > 0) {
          setTriggers(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const toAdd = newTriggers.filter((t: KeywordTrigger) => !existingIds.has(t.id));
            return [...prev, ...toAdd];
          });
        }
      }
    } catch (err) {
      console.error('[App] Erro ao restaurar backup:', err);
    }
  };

  // If NOT in workspace view, render public Landing Page (Home) or Login/Register portal
  if (!isInWorkspace) {
    return (
      <div className="min-h-screen w-screen overflow-x-hidden font-sans">
        <Suspense fallback={<ComponentLoader label="Carregando ManyFlow..." />}>
          {authMode === 'home' ? (
            <HomePage
              onGoToApp={() => setIsInWorkspace(true)}
              onOpenLogin={() => setAuthMode('login')}
              onOpenRegister={() => setAuthMode('register')}
              onOpenDemo={() => setIsSimulatorOpen(true)}
            />
          ) : (
            <LoginPage
              initialMode={authMode}
              onBackToHome={() => setAuthMode('home')}
              onSuccess={() => {
                setAuthMode('home');
                setIsInWorkspace(true);
              }}
            />
          )}

          {/* Interactive Mobile Simulator for Public Demo */}
          {isSimulatorOpen && (
            <InteractiveSimulatorModal
              isOpen={isSimulatorOpen}
              onClose={() => setIsSimulatorOpen(false)}
              flows={flows}
              activeFlowId={selectedFlowId}
              knowledgeBase={knowledgeBase}
              customFields={customFields}
            />
          )}
        </Suspense>
      </div>
    );
  }

  const isInZenMode = currentTab === 'flows' && isZenMode;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FB] text-[#1A1D21] font-sans antialiased">
      {/* Primary Sidebar - Hidden in Zen Mode */}
      {!isInZenMode && (
        <Sidebar
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          selectedChannel={selectedChannel}
          onSelectChannel={setSelectedChannel}
          unreadConversationsCount={conversations.filter((c) => c.status === 'human_takeover').length}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onGoToHome={() => setIsInWorkspace(false)}
        />
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8F9FB]">
        {/* Global Header - Hidden in Zen Mode */}
        {!isInZenMode && (
          <Header
            currentTab={currentTab}
            flows={flows}
            selectedFlowId={selectedFlowId}
            onSelectFlow={setSelectedFlowId}
            onCreateNewFlow={handleCreateNewFlow}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
            onOpenTemplates={() => setIsTemplatesModalOpen(true)}
            selectedChannel={selectedChannel}
          />
        )}

        {/* Tab View Routing */}
        <main className="flex-1 flex overflow-hidden bg-[#F8F9FB]">
          {isDbSyncing ? (
            <ComponentLoader 
              variant={currentTab as any} 
              label="Sincronização com Banco de Dados MongoDB"
              statusMessage={dbSyncStatus}
              progress={dbSyncProgress}
              showProgressBar={true}
              promise={dbSyncPromise}
            />
          ) : (
            <Suspense fallback={
              <ComponentLoader 
                variant={currentTab as any} 
                label={`Carregando ${
                  currentTab === 'flows' ? 'Editor Visual de Fluxos' : 
                  currentTab === 'analytics' ? 'Painel de Métricas & Funis' : 
                  currentTab === 'inbox' ? 'Atendimento ao Vivo (Inbox)' : 
                  currentTab === 'contacts' ? 'Gestão de Contatos & CRM' : 
                  currentTab === 'triggers' ? 'Gatilhos de Palavras-Chave' : 
                  currentTab === 'appointments' ? 'Central de Agendamentos Omnichannel' :
                  currentTab === 'comment_tools' ? 'Automações de Comentários' :
                  currentTab === 'postiz_planner' ? 'Planejador Social Multicanal (Postiz)' :
                  currentTab === 'broadcast' ? 'Campanhas de Disparo em Massa' : 
                  currentTab === 'admin_users' ? 'Gestão de Usuários (Admin)' :
                  currentTab === 'admin_subscriptions' ? 'Gestão de Mensalidades & Faturas' :
                  currentTab === 'admin_packages' ? 'Gestão de Planos & Pacotes' :
                  'Central de Configurações'
                }...`} 
              />
            }>
            {currentTab === 'flows' && (
              <FlowCanvas
                flow={activeFlow}
                onUpdateFlow={handleUpdateFlow}
                onImportFlow={handleImportFlow}
                openSimulator={() => setIsSimulatorOpen(true)}
                openAIGenerator={() => setIsAIGeneratorOpen(true)}
                openTemplates={() => setIsTemplatesModalOpen(true)}
                customFields={customFields}
                isZenMode={isZenMode}
                onToggleZenMode={setIsZenMode}
              />
            )}

            {currentTab === 'triggers' && (
              <TriggersManager
                triggers={triggers}
                flows={flows}
                onUpdateTriggers={setTriggers}
                openSimulator={() => setIsSimulatorOpen(true)}
              />
            )}

            {currentTab === 'comment_tools' && (
              <CommentGrowthTools
                growthTools={growthTools}
                flows={flows}
                onUpdateGrowthTools={setGrowthTools}
                openSimulator={() => setIsSimulatorOpen(true)}
              />
            )}

            {currentTab === 'postiz_planner' && (
              <PostizPlanner
                growthTools={growthTools}
                onOpenCommentTool={(toolId) => {
                  setCurrentTab('comment_tools');
                }}
              />
            )}

            {currentTab === 'broadcast' && (
              <BroadcastView
                broadcasts={broadcasts}
                onUpdateBroadcasts={setBroadcasts}
                utilityTemplates={utilityTemplates}
                onUpdateUtilityTemplates={setUtilityTemplates}
                contacts={contacts}
                customFields={customFields}
                onOpenSimulator={() => setIsSimulatorOpen(true)}
              />
            )}

            {currentTab === 'inbox' && (
              <LiveChatInbox
                conversations={conversations}
                flows={flows}
                onUpdateConversations={setConversations}
                contacts={contacts}
                onUpdateContacts={handleUpdateContacts}
              />
            )}

            {currentTab === 'contacts' && (
              <ContactsCRM
                contacts={contacts}
                onUpdateContacts={handleUpdateContacts}
                onOpenChat={() => setCurrentTab('inbox')}
                onOpenBroadcast={() => setCurrentTab('broadcast')}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsDashboard
                flows={flows}
                broadcasts={broadcasts}
                contacts={contacts}
                conversations={conversations}
                selectedFlowId={selectedFlowId}
                onSelectFlow={setSelectedFlowId}
                onOpenSimulator={(flowId) => {
                  if (flowId) setSelectedFlowId(flowId);
                  setIsSimulatorOpen(true);
                }}
                onUpdateFlow={handleUpdateFlow}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'ab_testing' && (
              <ABTestingModule
                flows={flows}
                onOpenFlow={(flowId) => {
                  setSelectedFlowId(flowId);
                  setCurrentTab('flows');
                }}
                onOpenSimulator={(flowId) => {
                  if (flowId) setSelectedFlowId(flowId);
                  setIsSimulatorOpen(true);
                }}
                onUpdateFlow={handleUpdateFlow}
              />
            )}

            {currentTab === 'whatsapp_groups' && (
              <WhatsAppGroupDashboard
                onOpenSimulator={(flowId) => {
                  if (flowId) setSelectedFlowId(flowId);
                  setIsSimulatorOpen(true);
                }}
              />
            )}

            {currentTab === 'affiliates' && (
              <AffiliateSystemModule />
            )}

            {currentTab === 'admin_users' && (
              <AdminUsersManager />
            )}

            {currentTab === 'admin_subscriptions' && (
              <AdminSubscriptionsManager />
            )}

            {currentTab === 'admin_packages' && (
              <AdminPackagesManager />
            )}

            {currentTab === 'appointments' && (
              <AppointmentsHub
                onOpenSimulator={(flowId) => {
                  if (flowId) setSelectedFlowId(flowId);
                  setIsSimulatorOpen(true);
                }}
                onNavigateToFlows={(flowId) => {
                  if (flowId) setSelectedFlowId(flowId);
                  setCurrentTab('flows');
                }}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsHub
                knowledgeBase={knowledgeBase}
                onUpdateKnowledgeBase={setKnowledgeBase}
                customFields={customFields}
                onUpdateCustomFields={setCustomFields}
                webhookSettings={webhookSettings}
                onUpdateWebhookSettings={setWebhookSettings}
                flows={flows}
                onUpdateFlows={setFlows}
                contacts={contacts}
                onUpdateContacts={handleUpdateContacts}
                conversations={conversations}
                onUpdateConversations={setConversations}
                triggers={triggers}
                growthTools={growthTools}
                broadcasts={broadcasts}
                onRestoreBackup={handleRestoreBackup}
                onOpenFlow={(flowId) => {
                  setSelectedFlowId(flowId);
                  setCurrentTab('flows');
                }}
                onOpenLiveChat={() => setCurrentTab('inbox')}
              />
            )}
          </Suspense>
          )}
        </main>
      </div>

      {/* Interactive Mobile Simulator Modal */}
      {isSimulatorOpen && (
        <Suspense fallback={null}>
          <InteractiveSimulatorModal
            isOpen={isSimulatorOpen}
            onClose={() => setIsSimulatorOpen(false)}
            flows={flows}
            activeFlowId={selectedFlowId}
            knowledgeBase={knowledgeBase}
            customFields={customFields}
          />
        </Suspense>
      )}

      {/* AI Flow Generator with Gemini 3.7 */}
      {isAIGeneratorOpen && (
        <Suspense fallback={null}>
          <AIFlowGeneratorModal
            isOpen={isAIGeneratorOpen}
            onClose={() => setIsAIGeneratorOpen(false)}
            onFlowGenerated={handleFlowGenerated}
          />
        </Suspense>
      )}

      {/* Ready-made Flow Templates Library Modal */}
      {isTemplatesModalOpen && (
        <Suspense fallback={null}>
          <FlowTemplatesModal
            isOpen={isTemplatesModalOpen}
            onClose={() => setIsTemplatesModalOpen(false)}
            onSelectTemplate={handleSelectTemplate}
            onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
          />
        </Suspense>
      )}

      {/* User Profile & Account Management Modal */}
      {isProfileModalOpen && (
        <Suspense fallback={null}>
          <UserProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}


