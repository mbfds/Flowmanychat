import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Sparkles, 
  Mic,
  Save, 
  Download, 
  Upload, 
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  Instagram,
  Facebook,
  Bot,
  Zap,
  MessageSquare,
  Split,
  Tag,
  Clock,
  Layers,
  TrendingUp,
  BarChart2,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Sun,
  Compass
} from 'lucide-react';
import { Flow, FlowNode, FlowConnection, NodeType, CustomFieldDefinition } from '../../types';
import { FlowNodeCard } from './FlowNodeCard';
import { NodeInspectorDrawer } from './NodeInspectorDrawer';
import { VoiceToFlowModal } from './VoiceToFlowModal';
import { FlowPerformanceOverlay } from './FlowPerformanceOverlay';
import { FlowExportModal } from './FlowExportModal';
import { FlowImportModal } from './FlowImportModal';
import { parseAndValidateFlowJson, FlowValidationResult } from '../../services/flowTemplateService';

interface FlowCanvasProps {
  flow: Flow;
  onUpdateFlow: (updatedFlow: Flow) => void;
  onImportFlow?: (importedFlow: Flow, asNewFlow?: boolean) => void;
  openSimulator: () => void;
  openAIGenerator: () => void;
  openTemplates?: () => void;
  customFields?: CustomFieldDefinition[];
  isZenMode?: boolean;
  onToggleZenMode?: (isZen: boolean) => void;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({
  flow,
  onUpdateFlow,
  onImportFlow,
  openSimulator,
  openAIGenerator,
  openTemplates,
  customFields = [],
  isZenMode: externalZenMode,
  onToggleZenMode
}) => {
  const [internalZenMode, setInternalZenMode] = useState(false);
  const isZenMode = externalZenMode !== undefined ? externalZenMode : internalZenMode;

  const setZenMode = (val: boolean) => {
    setInternalZenMode(val);
    if (onToggleZenMode) onToggleZenMode(val);
  };

  const [showZenToast, setShowZenToast] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [showPerformanceOverlay, setShowPerformanceOverlay] = useState(false);

  // Export & Import states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingValidationResult, setPendingValidationResult] = useState<FlowValidationResult | null>(null);
  const [isDraggingFileOver, setIsDraggingFileOver] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessToast, setImportSuccessToast] = useState<{ title: string; nodeCount: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Keyboard shortcut listener for ESC to exit Zen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  const handleToggleZen = () => {
    const nextVal = !isZenMode;
    setZenMode(nextVal);
    if (nextVal) {
      setShowZenToast(true);
      setTimeout(() => setShowZenToast(false), 3500);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.6));
  const handleResetZoom = () => setZoom(1);

  const handleToggleActive = () => {
    onUpdateFlow({
      ...flow,
      isActive: !flow.isActive,
      updatedAt: new Date().toISOString()
    });
  };

  const handleUpdateNode = (updatedNode: FlowNode) => {
    const newNodes = flow.nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n));
    onUpdateFlow({
      ...flow,
      nodes: newNodes,
      updatedAt: new Date().toISOString()
    });
    setSelectedNode(updatedNode);
  };

  const handleDeleteNode = (nodeId: string) => {
    const newNodes = flow.nodes.filter((n) => n.id !== nodeId);
    const newConns = flow.connections.filter((c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId);
    onUpdateFlow({
      ...flow,
      nodes: newNodes,
      connections: newConns,
      updatedAt: new Date().toISOString()
    });
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleDuplicateNode = (node: FlowNode) => {
    const newNodeId = `node_${Date.now()}`;
    const duplicated: FlowNode = {
      ...node,
      id: newNodeId,
      title: `${node.title} (Cópia)`,
      position: {
        x: node.position.x + 40,
        y: node.position.y + 40
      }
    };
    onUpdateFlow({
      ...flow,
      nodes: [...flow.nodes, duplicated],
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddNode = (type: NodeType) => {
    const newNodeId = `node_${Date.now()}`;
    let defaultTitle = 'Novo Nó';
    let defaultData = {};

    switch (type) {
      case 'trigger':
        defaultTitle = 'Gatilho de Entrada';
        defaultData = { keywords: ['NOVO_GATILHO'] };
        break;
      case 'message':
        defaultTitle = 'Mensagem de Resposta';
        defaultData = { text: 'Olá {first_name}! Como posso te ajudar hoje?' };
        break;
      case 'action':
        defaultTitle = 'Ação de Tag';
        defaultData = { actionType: 'add_tag', tagToAdd: 'Novo-Lead' };
        break;
      case 'ai_step':
        defaultTitle = 'Agente IA Gemini';
        defaultData = { aiPrompt: 'Responda dúvidas com base na base de conhecimento da empresa.' };
        break;
      case 'delay':
        defaultTitle = 'Pausa (3s)';
        defaultData = { delaySeconds: 3, showTypingIndicator: true };
        break;
      case 'condition':
        defaultTitle = 'Condição Lógica';
        defaultData = { conditionKey: 'tag', conditionValue: 'VIP' };
        break;
    }

    const newNode: FlowNode = {
      id: newNodeId,
      type,
      title: defaultTitle,
      data: defaultData,
      position: {
        x: 200 + (flow.nodes.length % 4) * 80,
        y: 150 + (flow.nodes.length % 3) * 60
      }
    };

    onUpdateFlow({
      ...flow,
      nodes: [...flow.nodes, newNode],
      updatedAt: new Date().toISOString()
    });
    setSelectedNode(newNode);
    setShowAddMenu(false);
  };

  const handleAddVoiceNodes = (newNodes: FlowNode[], newConnections: FlowConnection[]) => {
    onUpdateFlow({
      ...flow,
      nodes: [...flow.nodes, ...newNodes],
      connections: [...flow.connections, ...newConnections],
      updatedAt: new Date().toISOString()
    });
    if (newNodes.length > 0) {
      setSelectedNode(newNodes[0]);
    }
  };

  const handleSaveFlow = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Process uploaded or dropped JSON file
  const processImportFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setImportError(`O arquivo "${file.name}" não é um JSON (.json). Por favor selecione um arquivo de fluxo válido.`);
      return;
    }

    try {
      const text = await file.text();
      const result = parseAndValidateFlowJson(text);
      if (result.success && result.flow) {
        setPendingValidationResult(result);
        setIsImportModalOpen(true);
        setImportError(null);
      } else {
        setImportError(result.error || 'Não foi possível validar a estrutura do fluxo no arquivo JSON.');
      }
    } catch (err: any) {
      setImportError(`Erro ao ler arquivo: ${err?.message || 'Falha de leitura'}`);
    }
  };

  // Drag and drop event handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingFileOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDraggingFileOver(false);
      dragCounter.current = 0;
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFileOver(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processImportFile(files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processImportFile(files[0]);
    }
    if (e.target) e.target.value = '';
  };

  const handleConfirmImport = (importedFlow: Flow, asNewFlow: boolean) => {
    if (onImportFlow) {
      onImportFlow(importedFlow, asNewFlow);
    } else {
      onUpdateFlow(importedFlow);
    }

    setImportSuccessToast({
      title: importedFlow.title,
      nodeCount: importedFlow.nodes.length
    });
    setTimeout(() => {
      setImportSuccessToast(null);
    }, 4500);
  };

  // Export flow as JSON
  const handleExportJSON = () => {
    setIsExportModalOpen(true);
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full bg-[#F8F9FB] overflow-hidden relative select-none"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input for Manual JSON Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json,application/json"
        onChange={handleFileInputChange}
        className="hidden"
        id="input_flow_json_file"
      />

      {/* Drag and Drop Dropzone Overlay */}
      {isDraggingFileOver && (
        <div 
          id="canvas_drag_drop_overlay"
          className="absolute inset-0 z-50 bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-150 pointer-events-none"
        >
          <div className="bg-white dark:bg-slate-900 border-3 border-dashed border-blue-500 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 animate-bounce">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Solte o Arquivo de Fluxo (.json) Aqui
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                O arquivo será validado instantaneamente para importação dos nós e conexões de automação.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-blue-700 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Crie como Novo Fluxo ou Substitua o Atual</span>
            </div>
          </div>
        </div>
      )}

      {/* Import Success Toast */}
      {importSuccessToast && (
        <div 
          id="toast_import_success"
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-900/95 text-white text-xs px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 border border-emerald-500/40 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="p-1.5 rounded-xl bg-emerald-500 text-white shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold">Modelo Importado com Sucesso!</p>
            <p className="text-[11px] text-emerald-200">
              "{importSuccessToast.title}" ({importSuccessToast.nodeCount} nós carregados)
            </p>
          </div>
        </div>
      )}

      {/* Import Error Toast */}
      {importError && (
        <div 
          id="toast_import_error"
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-950/95 text-white text-xs px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 border border-rose-500/40 animate-in fade-in slide-in-from-top-4 duration-200 max-w-md"
        >
          <div className="p-1.5 rounded-xl bg-rose-500 text-white shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-rose-200">Falha ao Importar Fluxo</p>
            <p className="text-[11px] text-rose-100 leading-snug">{importError}</p>
          </div>
          <button 
            onClick={() => setImportError(null)}
            className="p-1 rounded-lg text-rose-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Zen Mode Banner Toast */}
      {showZenToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
          <span><strong>Modo Zen Ativo</strong> — Visualização limpa para foco total. Pressione <strong>ESC</strong> para sair.</span>
        </div>
      )}

      {/* Top Toolbar: Render Standard OR Zen Floating Island */}
      {!isZenMode ? (
        <div className="h-14 bg-white dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-800 px-6 flex items-center justify-between z-10 shrink-0 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#1A1D21] dark:text-white max-w-md truncate">
                {flow.title}
              </h2>
              <div className="flex items-center gap-1.5">
                {flow.channel === 'instagram' && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-pink-50 text-pink-700 border border-pink-200">
                    Instagram Direct
                  </span>
                )}
                {flow.channel === 'messenger' && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                    FB Messenger
                  </span>
                )}
                {flow.channel === 'omnichannel' && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-50 text-purple-700 border border-purple-200">
                    Omnichannel
                  </span>
                )}
              </div>
            </div>

            {/* Active Status Switch */}
            <button
              id="btn_toggle_flow_status"
              onClick={handleToggleActive}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                flow.isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-gray-100 text-[#64748B] border border-gray-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${flow.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <span>{flow.isActive ? 'Fluxo Ativo' : 'Pausado'}</span>
            </button>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            {/* Zen Mode Toggle Button */}
            <button
              id="btn_toggle_zen_mode"
              onClick={handleToggleZen}
              className="py-1.5 px-3 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Ativar Modo Zen (Esconder ferramentas e focar na edição)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Modo Zen</span>
            </button>

            {/* Quick Stats Pill with Performance Overlay Toggle */}
            <button
              id="btn_toggle_performance_overlay"
              onClick={() => setShowPerformanceOverlay(!showPerformanceOverlay)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                showPerformanceOverlay 
                  ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/20' 
                  : 'bg-[#F8F9FB] hover:bg-slate-100 border-[#E2E8F0] text-[#1A1D21] dark:text-slate-300 dark:bg-slate-800'
              }`}
              title="Abrir Gráfico de Performance e Métricas em Tempo Real"
            >
              <TrendingUp className={`w-3.5 h-3.5 ${showPerformanceOverlay ? 'text-white' : 'text-blue-600'}`} />
              <span>Métricas: <strong className={showPerformanceOverlay ? 'text-white' : 'text-emerald-600'}>{flow.stats.ctr}% CTR</strong></span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${showPerformanceOverlay ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>
                {showPerformanceOverlay ? 'Ocultar' : 'Gráfico'}
              </span>
            </button>

            {/* Ready-made Templates CTA */}
            {openTemplates && (
              <button
                id="btn_canvas_templates"
                onClick={openTemplates}
                className="py-1.5 px-3 rounded-md bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-pink-500/15 hover:from-amber-500/25 hover:to-pink-500/25 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-102"
                title="Explorar Modelos Prontos"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>Modelos Prontos</span>
              </button>
            )}

            {/* Voice-to-Flow Builder Button */}
            <button
              id="btn_open_voice_to_flow"
              onClick={() => setIsVoiceModalOpen(true)}
              className="py-1.5 px-3 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-102"
              title="Criar blocos de fluxo falando ao microfone"
            >
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden md:inline">Voice-to-Flow</span>
            </button>

            {/* AI Optimizer */}
            <button
              onClick={openAIGenerator}
              className="py-1.5 px-3 rounded-md bg-[#F0F7FF] border border-blue-200 text-[#0084FF] hover:bg-blue-100/70 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0084FF]" />
              <span className="hidden sm:inline">IA Generator</span>
            </button>

            {/* Export Flow as JSON */}
            <button
              id="btn_export_flow_json"
              onClick={handleExportJSON}
              title="Exportar Modelo de Automação (.json)"
              className="py-1.5 px-2.5 sm:px-3 rounded-md bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#1A1D21] dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>

            {/* Import Flow from JSON */}
            <button
              id="btn_import_flow_json"
              onClick={() => fileInputRef.current?.click()}
              title="Importar Arquivo JSON de Fluxo (ou arraste e solte no canvas)"
              className="py-1.5 px-2.5 sm:px-3 rounded-md bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#1A1D21] dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Importar JSON</span>
            </button>

            {/* Save / Publish */}
            <button
              onClick={handleSaveFlow}
              className="py-1.5 px-3 rounded-md bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#1A1D21] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 text-[#64748B]" />}
              <span>{isSaved ? 'Publicado!' : 'Publicar'}</span>
            </button>

            {/* Test in Simulator CTA */}
            <button
              id="btn_canvas_test_simulator"
              onClick={openSimulator}
              className="py-1.5 px-3.5 rounded-md bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Testar</span>
            </button>
          </div>
        </div>
      ) : (
        /* Minimalist Zen Mode Floating Header */
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Modo Zen</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[160px] truncate">
              {flow.title}
            </span>
          </div>

          <button
            onClick={handleSaveFlow}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Salvar alterações"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
          </button>

          <button
            id="btn_zen_export_flow"
            onClick={handleExportJSON}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Exportar fluxo (JSON)"
          >
            <Download className="w-4 h-4 text-blue-600" />
          </button>

          <button
            id="btn_zen_import_flow"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Importar fluxo (JSON) ou arraste e solte"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            onClick={openSimulator}
            className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
            title="Testar no simulador"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>

          <button
            id="btn_exit_zen_mode"
            onClick={handleToggleZen}
            className="ml-1 pl-2 border-l border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Sair do Modo Zen (ESC)"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Sair (ESC)</span>
          </button>
        </div>
      )}

      {/* Main Canvas Area */}
      <div
        ref={canvasRef}
        onClick={() => setSelectedNode(null)}
        className="flex-1 overflow-auto bg-[#F8F9FB] p-12 relative cursor-grab active:cursor-grabbing"
        style={{
          backgroundImage: `
            radial-gradient(circle, #CBD5E1 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      >
        {/* Canvas Scaled Wrapper */}
        <div
          className="relative min-w-[2200px] min-h-[1400px] transition-transform duration-100 origin-top-left"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0084FF" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#0084FF" />
              </marker>
            </defs>

            {flow.connections.map((conn, idx) => {
              const fromNode = flow.nodes.find((n) => n.id === conn.fromNodeId);
              const toNode = flow.nodes.find((n) => n.id === conn.toNodeId);
              if (!fromNode || !toNode) return null;

              const startX = fromNode.position.x + 320;
              const startY = fromNode.position.y + 110;
              const endX = toNode.position.x;
              const endY = toNode.position.y + 110;

              const deltaX = Math.abs(endX - startX) * 0.5;
              const pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

              return (
                <g key={idx}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="url(#flowGrad)"
                    strokeWidth="2.5"
                    strokeDasharray={conn.handleType === 'button' ? 'none' : 'none'}
                    markerEnd="url(#arrowhead)"
                    className="transition-all duration-300 drop-shadow-xs"
                  />
                  {conn.label && (
                    <foreignObject
                      x={(startX + endX) / 2 - 60}
                      y={(startY + endY) / 2 - 14}
                      width="130"
                      height="30"
                      className="overflow-visible"
                    >
                      <div className="px-2 py-0.5 rounded-full bg-white border border-blue-200 text-[10px] font-bold text-[#0084FF] text-center shadow-xs truncate">
                        {conn.label}
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Flow Nodes Elements */}
          {flow.nodes.map((node) => (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                zIndex: selectedNode?.id === node.id ? 20 : 10
              }}
            >
              <FlowNodeCard
                node={node}
                isSelected={selectedNode?.id === node.id}
                onSelect={(n) => setSelectedNode(n)}
                onDelete={handleDeleteNode}
                onDuplicate={handleDuplicateNode}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Floating Canvas Controls (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1 p-1 rounded-lg bg-white border border-[#E2E8F0] shadow-sm">
        <button
          onClick={handleZoomIn}
          title="Aumentar Zoom"
          className="p-1.5 rounded hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Diminuir Zoom"
          className="p-1.5 rounded hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Ajustar 100%"
          className="px-2 py-1 text-xs font-semibold rounded hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
        >
          {Math.round(zoom * 100)}%
        </button>
      </div>

      {/* Floating Add Node Palette (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="relative">
          {showAddMenu && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-80 p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-xl grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => handleAddNode('message')}
                className="p-2.5 rounded-lg bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 text-left transition-all flex items-center gap-2 text-xs font-bold text-blue-700 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Mensagem Direct</span>
              </button>
              <button
                onClick={() => handleAddNode('ai_step')}
                className="p-2.5 rounded-lg bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200 text-left transition-all flex items-center gap-2 text-xs font-bold text-purple-700 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Agente IA Gemini</span>
              </button>
              <button
                onClick={() => handleAddNode('action')}
                className="p-2.5 rounded-lg bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 text-left transition-all flex items-center gap-2 text-xs font-bold text-emerald-700 cursor-pointer"
              >
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Ação / Tag</span>
              </button>
              <button
                onClick={() => handleAddNode('delay')}
                className="p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-left transition-all flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Pausa & Digitando</span>
              </button>
              <button
                onClick={() => handleAddNode('condition')}
                className="p-2.5 rounded-lg bg-cyan-50/70 hover:bg-cyan-100/70 border border-cyan-200 text-left transition-all flex items-center gap-2 text-xs font-bold text-cyan-700 cursor-pointer"
              >
                <Split className="w-4 h-4 text-cyan-600" />
                <span>Condição (If/Else)</span>
              </button>
              <button
                onClick={() => handleAddNode('trigger')}
                className="p-2.5 rounded-lg bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 text-left transition-all flex items-center gap-2 text-xs font-bold text-amber-700 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Novo Gatilho</span>
              </button>
            </div>
          )}

          <button
            id="btn_open_add_node_menu"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="py-2.5 px-5 rounded-full bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className={`w-4 h-4 transition-transform duration-200 ${showAddMenu ? 'rotate-45' : ''}`} />
            <span>Adicionar Novo Passo ao Fluxo</span>
          </button>
        </div>
      </div>

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <NodeInspectorDrawer
          node={selectedNode}
          allNodes={flow.nodes}
          onClose={() => setSelectedNode(null)}
          onUpdateNode={handleUpdateNode}
          customFields={customFields}
        />
      )}

      {/* Interactive Performance Overlay Widget with Recharts */}
      {showPerformanceOverlay && (
        <FlowPerformanceOverlay
          flow={flow}
          onClose={() => setShowPerformanceOverlay(false)}
        />
      )}

      {/* Voice-to-Flow Audio Generation Modal */}
      <VoiceToFlowModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentFlow={flow}
        onAddNodesToFlow={handleAddVoiceNodes}
        onReplaceFlow={(newFlow) => onUpdateFlow(newFlow)}
      />

      {/* Export Flow Modal */}
      <FlowExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        flow={flow}
      />

      {/* Import Flow Modal */}
      <FlowImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setPendingValidationResult(null);
        }}
        validationResult={pendingValidationResult}
        currentFlowTitle={flow.title}
        onConfirmImport={handleConfirmImport}
      />
    </div>
  );
};

