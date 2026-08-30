import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ComponentLoader } from './components/Common/ComponentLoader';
import { AuthProvider, useAuth } from './context/AuthContext';
import { dbService } from './services/db';

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
const LoginPage = lazy(() =>
  import('./components/Auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);

import {
  INITIAL_FLOWS,
  INITIAL_TRIGGERS,
  INITIAL_COMMENT_TOOLS,
  INITIAL_CONVERSATIONS,
  INITIAL_CONTACTS,
  INITIAL_KNOWLEDGE_BASE,
  INITIAL_CUSTOM_FIELDS,
  INITIAL_BROADCASTS,
  INITIAL_UTILITY_TEMPLATES,
  INITIAL_WEBHOOK_SETTINGS
} from './data/initialData';
import { NavigationTab, Flow, KeywordTrigger, PostCommentGrowthTool, LiveConversation, Contact, BotKnowledgeBase, ChannelType, CustomFieldDefinition, BroadcastCampaign, UtilityMessageTemplate, WebhookSettingsState } from './types';

function MainApp() {
  const { user, tenant, isAuthenticated } = useAuth();

  // Navigation & View state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('flows');
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('omnichannel');
  const [flows, setFlows] = useState<Flow[]>(INITIAL_FLOWS);
  const [selectedFlowId, setSelectedFlowId] = useState<string>(INITIAL_FLOWS[0].id);

  // Growth Tools, Triggers & Live Data states
  const [triggers, setTriggers] = useState<KeywordTrigger[]>(INITIAL_TRIGGERS);
  const [growthTools, setGrowthTools] = useState<PostCommentGrowthTool[]>(INITIAL_COMMENT_TOOLS);
  const [conversations, setConversations] = useState<LiveConversation[]>(INITIAL_CONVERSATIONS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [knowledgeBase, setKnowledgeBase] = useState<BotKnowledgeBase>(INITIAL_KNOWLEDGE_BASE);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(INITIAL_CUSTOM_FIELDS);
  const [broadcasts, setBroadcasts] = useState<BroadcastCampaign[]>(INITIAL_BROADCASTS);
  const [utilityTemplates, setUtilityTemplates] = useState<UtilityMessageTemplate[]>(INITIAL_UTILITY_TEMPLATES);
  const [webhookSettings, setWebhookSettings] = useState<WebhookSettingsState>(INITIAL_WEBHOOK_SETTINGS);

  // Modals state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync with MongoDB Service on Mount
  useEffect(() => {
    async function initDbSync() {
      try {
        const [remoteFlows, remoteContacts] = await Promise.all([
          dbService.getFlows(),
          dbService.getContacts(),
        ]);

        if (remoteFlows && remoteFlows.length > 0) {
          setFlows(remoteFlows);
          if (!remoteFlows.some((f) => f.id === selectedFlowId)) {
            setSelectedFlowId(remoteFlows[0].id);
          }
        } else {
          // Seed initial flows to MongoDB
          dbService.saveFlowsBulk(INITIAL_FLOWS).catch(() => {});
        }

        if (remoteContacts && remoteContacts.length > 0) {
          setContacts(remoteContacts);
        } else {
          // Seed initial contacts to MongoDB
          dbService.saveContactsBatch(INITIAL_CONTACTS).catch(() => {});
        }
      } catch (err) {
        console.warn('[App] MongoDB initialization check:', err);
      }
    }

    initDbSync();
  }, []);

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
    setFlows((prev) => prev.map((f) => (f.id === updatedFlow.id ? updatedFlow : f)));
    dbService.updateFlow(updatedFlow.id, updatedFlow).catch((err) => {
      console.warn('[App] Erro ao sincronizar fluxo no MongoDB:', err);
    });
  };

  const handleCreateNewFlow = () => {
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

    setFlows((prev) => [newFlow, ...prev]);
    setSelectedFlowId(newFlowId);
    setCurrentTab('flows');

    dbService.createFlow(newFlow).catch((err) => {
      console.warn('[App] Erro ao salvar novo fluxo no MongoDB:', err);
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FB] text-[#1A1D21] font-sans antialiased">
      {/* Primary Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        unreadConversationsCount={conversations.filter((c) => c.status === 'human_takeover').length}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8F9FB]">
        {/* Global Header */}
        <Header
          currentTab={currentTab}
          flows={flows}
          selectedFlowId={selectedFlowId}
          onSelectFlow={setSelectedFlowId}
          onCreateNewFlow={handleCreateNewFlow}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
          selectedChannel={selectedChannel}
        />

        {/* Tab View Routing */}
        <main className="flex-1 flex overflow-hidden bg-[#F8F9FB]">
          <Suspense fallback={<ComponentLoader label="Carregando módulo..." />}>
            {currentTab === 'flows' && (
              <FlowCanvas
                flow={activeFlow}
                onUpdateFlow={handleUpdateFlow}
                openSimulator={() => setIsSimulatorOpen(true)}
                openAIGenerator={() => setIsAIGeneratorOpen(true)}
                customFields={customFields}
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
                selectedFlowId={selectedFlowId}
                onSelectFlow={setSelectedFlowId}
                onOpenSimulator={(flowId) => {
                  if (flowId) setSelectedFlowId(flowId);
                  setIsSimulatorOpen(true);
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
              />
            )}
          </Suspense>
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
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}


