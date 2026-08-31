import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Check, 
  Volume2, 
  RotateCcw, 
  Plus, 
  Layers, 
  MessageSquare, 
  Split, 
  Tag, 
  Clock, 
  Play, 
  Zap,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flow, FlowNode, FlowConnection, NodeType, ChannelType } from '../../types';

interface VoiceToFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFlow: Flow;
  onAddNodesToFlow: (newNodes: FlowNode[], newConnections: FlowConnection[]) => void;
  onReplaceFlow?: (newFlow: Flow) => void;
}

export const VoiceToFlowModal: React.FC<VoiceToFlowModalProps> = ({
  isOpen,
  onClose,
  currentFlow,
  onAddNodesToFlow,
  onReplaceFlow
}) => {
  if (!isOpen) return null;

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [selectedMode, setSelectedMode] = useState<'append' | 'replace'>('append');
  const [generatedPreview, setGeneratedPreview] = useState<{
    nodes: FlowNode[];
    connections: FlowConnection[];
    summary: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Suggested Voice Prompts
  const VOICE_PROMPTS = [
    {
      title: 'Mensagem com Cupom + Tag',
      text: 'Adicione uma mensagem com cupom de 20% de desconto, um botão para resgatar e atribua a tag Lead-Interessado ao clicar.',
      icon: MessageSquare
    },
    {
      title: 'Teste A/B de Copy',
      text: 'Crie um teste A/B comparando uma mensagem curta com desconto imediato e outra mais consultiva, dividindo o tráfego 50/50.',
      icon: Split
    },
    {
      title: 'Condição + Atendimento Humano',
      text: 'Verifique se o cliente já comprou. Se sim, envie uma oferta VIP; se não, faça uma pergunta de qualificação e transfira para atendente.',
      icon: Zap
    },
    {
      title: 'Fluxo Completo de E-commerce',
      text: 'Crie uma automação completa para quem comentar PREÇO: responda no Direct com catálogo, botão de compra e lembrete após 2 horas.',
      icon: Layers
    }
  ];

  // Initialize Speech Recognition on Mount / when opened
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript + ' ';
          } else {
            interimStr += item[0].transcript;
          }
        }

        if (finalStr) {
          setTranscript((prev) => (prev ? `${prev} ${finalStr}`.trim() : finalStr.trim()));
        }
        setInterimTranscript(interimStr);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Permissão de microfone negada no navegador. Permita o acesso nas configurações.');
        } else if (event.error !== 'no-speech') {
          setErrorMsg(`Erro de reconhecimento de voz: ${event.error}`);
        }
        stopAudioAnalysis();
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimTranscript('');
        stopAudioAnalysis();
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopRecording();
    };
  }, []);

  // Audio waveform meter
  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err) {
      console.warn('Could not start audio visualizer:', err);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const startRecording = () => {
    setErrorMsg(null);
    setGeneratedPreview(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        startAudioAnalysis();
      } catch (err: any) {
        console.warn('Error starting speech recognition:', err);
        // If already started, toggle it
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
          startAudioAnalysis();
        }, 200);
      }
    } else {
      setErrorMsg('Reconhecimento de fala nativo não suportado neste navegador. Digite sua instrução abaixo.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    stopAudioAnalysis();
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Convert natural voice instruction to Flow Nodes via AI or intelligent parser
  const handleProcessVoiceCommand = async () => {
    const textPrompt = transcript.trim() || interimTranscript.trim();
    if (!textPrompt) {
      setErrorMsg('Por favor, fale ou digite um comando antes de gerar os blocos.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Call server Gemini endpoint
      const response = await fetch('/api/ai/generate-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Instrução por voz do usuário para automação de direct: "${textPrompt}". Crie os blocos apropriados.`,
          channel: currentFlow.channel || 'instagram',
          businessType: 'Automação Instagram/WhatsApp ManyFlow',
          goal: textPrompt
        })
      });

      const data = await response.json();
      if (data.flow && data.flow.nodes && data.flow.nodes.length > 0) {
        // Calculate offset positions based on current flow
        const highestX = currentFlow.nodes.reduce((max, n) => Math.max(max, n.position.x), 100);
        const startX = highestX + 380;

        const offsetNodes: FlowNode[] = data.flow.nodes.map((n: FlowNode, idx: number) => ({
          ...n,
          id: `voice_node_${Date.now()}_${idx}`,
          position: {
            x: startX + idx * 360,
            y: 200 + (idx % 2 === 0 ? 0 : 60)
          }
        }));

        // Adjust connection IDs to match newly generated node IDs
        const idMap: { [key: string]: string } = {};
        data.flow.nodes.forEach((oldNode: FlowNode, idx: number) => {
          idMap[oldNode.id] = offsetNodes[idx].id;
        });

        const adjustedConnections: FlowConnection[] = (data.flow.connections || []).map((c: FlowConnection) => ({
          ...c,
          id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          fromNodeId: idMap[c.fromNodeId] || c.fromNodeId,
          toNodeId: idMap[c.toNodeId] || c.toNodeId
        }));

        // Connect last existing node in current flow to the first new node if appending
        if (currentFlow.nodes.length > 0 && offsetNodes.length > 0) {
          const lastExistingNode = currentFlow.nodes[currentFlow.nodes.length - 1];
          adjustedConnections.unshift({
            id: `conn_link_${Date.now()}`,
            fromNodeId: lastExistingNode.id,
            toNodeId: offsetNodes[0].id,
            handleType: 'default',
            label: 'Comando de Voz'
          });
        }

        setGeneratedPreview({
          nodes: offsetNodes,
          connections: adjustedConnections,
          summary: `${offsetNodes.length} novos blocos inteligentes gerados com sucesso a partir da sua voz.`
        });
      } else {
        // Intelligent client-side fallback block generator
        generateLocalFallbackBlocks(textPrompt);
      }
    } catch (err: any) {
      console.warn('AI Voice parse fallback:', err);
      generateLocalFallbackBlocks(textPrompt);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateLocalFallbackBlocks = (prompt: string) => {
    const highestX = currentFlow.nodes.reduce((max, n) => Math.max(max, n.position.x), 100);
    const startX = highestX + 380;
    const now = Date.now();

    const lower = prompt.toLowerCase();
    const isABTest = lower.includes('teste a/b') || lower.includes('a/b') || lower.includes('50/50') || lower.includes('variante');
    const hasTag = lower.includes('tag') || lower.includes('qualificar') || lower.includes('crm');
    const hasHuman = lower.includes('humano') || lower.includes('atendente') || lower.includes('suporte');

    const newNodes: FlowNode[] = [];
    const newConnections: FlowConnection[] = [];

    // Node 1: Message Node (with optional A/B test)
    const msgNodeId = `voice_node_${now}_1`;
    newNodes.push({
      id: msgNodeId,
      type: 'message',
      title: isABTest ? 'Mensagem com Teste A/B de Copy' : 'Mensagem Automática por Voz',
      position: { x: startX, y: 200 },
      data: {
        text: `Olá {first_name}! Conforme solicitado, aqui estão as informações:`,
        isMessageABTestEnabled: isABTest,
        messageVariants: isABTest ? [
          {
            id: 'var_a',
            name: 'Variante A (Direta com Cupom)',
            text: 'Olá {first_name}! 🎁 Use o cupom VIP20 para garantir seu desconto de 20% agora:',
            trafficPercent: 50,
            buttons: [{ id: 'btn_1', text: '🎁 Resgatar Desconto', type: 'flow', targetNodeId: '' }],
            quickReplies: [],
            stats: { runs: 120, opens: 118, clicks: 68, conversions: 34, ctr: 57.6, conversionRate: 28.8 }
          },
          {
            id: 'var_b',
            name: 'Variante B (Consultiva & Humanizada)',
            text: 'Oi {first_name} ✨ Tudo bem? Preparamos uma condição exclusiva para você hoje. Quer conferir?',
            trafficPercent: 50,
            buttons: [{ id: 'btn_2', text: '✨ Quero Ver Oferta', type: 'flow', targetNodeId: '' }],
            quickReplies: [],
            stats: { runs: 120, opens: 119, clicks: 82, conversions: 48, ctr: 68.9, conversionRate: 40.3 }
          }
        ] : undefined,
        buttons: [
          { id: 'btn_main', text: '🚀 Ver Oferta Agora', type: 'flow', targetNodeId: '' }
        ]
      }
    });

    // Node 2: Action or Condition or Human
    if (hasTag || hasHuman) {
      const actionNodeId = `voice_node_${now}_2`;
      newNodes.push({
        id: actionNodeId,
        type: 'action',
        title: hasHuman ? 'Chamar Atendente Humano' : 'Atribuir Tag no CRM',
        position: { x: startX + 360, y: 200 },
        data: {
          actionType: hasHuman ? 'human_handover' : 'add_tag',
          tagToAdd: hasTag ? 'Lead-Qualificado-Voz' : 'Atendimento-Voz'
        }
      });

      newConnections.push({
        id: `conn_${now}_1`,
        fromNodeId: msgNodeId,
        toNodeId: actionNodeId,
        handleType: 'button',
        label: 'Ação pós-clique'
      });
    }

    // Connect to current flow
    if (currentFlow.nodes.length > 0) {
      const last = currentFlow.nodes[currentFlow.nodes.length - 1];
      newConnections.unshift({
        id: `conn_initial_${now}`,
        fromNodeId: last.id,
        toNodeId: msgNodeId,
        handleType: 'default',
        label: 'Comando de Voz'
      });
    }

    setGeneratedPreview({
      nodes: newNodes,
      connections: newConnections,
      summary: `${newNodes.length} blocos criados e conectados a partir da instrução de voz.`
    });
  };

  const handleApplyToCanvas = () => {
    if (!generatedPreview) return;

    if (selectedMode === 'append') {
      onAddNodesToFlow(generatedPreview.nodes, generatedPreview.connections);
    } else if (onReplaceFlow) {
      const replaced: Flow = {
        ...currentFlow,
        nodes: generatedPreview.nodes,
        connections: generatedPreview.connections,
        updatedAt: new Date().toISOString()
      };
      onReplaceFlow(replaced);
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    onClose();
  };

  return (
    <div 
      id="voice_to_flow_modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Mic className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Voice-to-Flow Builder</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30 uppercase">
                  IA Generativa 2.5
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Fale pelo microfone para desenhar e adicionar novos blocos de automação ao fluxo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-[#F8F9FB]">
          {/* Audio Input Recording Studio Card */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              {/* Animated Microphone Central Button */}
              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <div 
                    className="absolute rounded-full bg-blue-500/20 animate-ping"
                    style={{
                      width: `${Math.max(70, 70 + audioLevel * 0.8)}px`,
                      height: `${Math.max(70, 70 + audioLevel * 0.8)}px`
                    }}
                  />
                )}
                
                <button
                  id="btn_toggle_voice_recording"
                  type="button"
                  onClick={toggleRecording}
                  className={`relative z-10 w-18 h-18 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 scale-105'
                      : 'bg-[#0084FF] hover:bg-[#0073E6] text-white hover:scale-105 ring-4 ring-blue-100'
                  }`}
                  title={isRecording ? 'Clique para Parar Gravação' : 'Clique para Iniciar Gravação de Voz'}
                >
                  {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
              </div>

              <div>
                <span className="text-xs font-bold text-[#1A1D21]">
                  {isRecording ? 'Ouvindo sua voz em tempo real...' : 'Clique no microfone para falar sua automação'}
                </span>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  {isRecording
                    ? 'Fale claramente o que deseja que o robô faça (gatilhos, mensagens, tags ou teste A/B).'
                    : 'Suporte nativo a Português do Brasil (pt-BR).'}
                </p>
              </div>

              {/* Real-time Audio Spectrum Equalizer */}
              {isRecording && (
                <div className="flex items-center gap-1.5 h-6 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                  {[40, 70, 100, 85, 60, 90, 45, 80, 65, 95, 50, 75].map((h, i) => {
                    const scaledHeight = Math.max(4, Math.round((h * (audioLevel || 20)) / 100));
                    return (
                      <span
                        key={i}
                        className="w-1 bg-[#0084FF] rounded-full transition-all duration-75"
                        style={{ height: `${scaledHeight}px` }}
                      />
                    );
                  })}
                  <span className="text-[10px] font-mono text-[#0084FF] font-bold ml-1">
                    {audioLevel}% Vol
                  </span>
                </div>
              )}
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Live Transcribed Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Texto Transcrito (Edite se Necessário):
                </label>
                {(transcript || interimTranscript) && (
                  <button
                    type="button"
                    onClick={() => {
                      setTranscript('');
                      setInterimTranscript('');
                      setGeneratedPreview(null);
                    }}
                    className="text-[10px] text-[#64748B] hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Limpar
                  </button>
                )}
              </div>

              <textarea
                rows={3}
                value={transcript || interimTranscript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Exemplo falado: 'Adicione uma mensagem com cupom de 20% OFF, crie um teste A/B para testar dois textos diferentes e adicione a tag Lead-Quente se o cliente clicar no botão.'"
                className="w-full p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-2 focus:ring-[#0084FF] leading-relaxed font-sans"
              />
            </div>

            {/* Process Button */}
            <div className="flex items-center justify-end">
              <button
                id="btn_process_voice_prompt"
                type="button"
                onClick={handleProcessVoiceCommand}
                disabled={isProcessing || (!transcript.trim() && !interimTranscript.trim())}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Processando com Gemini 2.5...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Blocos com IA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Voice Prompt Suggestions */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#0084FF]" />
              <span>Ou Teste Estes Exemplos de Comando por Voz:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VOICE_PROMPTS.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTranscript(p.text);
                      setGeneratedPreview(null);
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-blue-50/70 border border-gray-200 hover:border-blue-300 text-left transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded-lg bg-blue-100 text-[#0084FF] group-hover:bg-blue-200">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#1A1D21] group-hover:text-[#0084FF]">
                        {p.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] line-clamp-2">
                      "{p.text}"
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generated Preview Block Card */}
          {generatedPreview && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 shadow-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Pré-Visualização dos Blocos Gerados</h4>
                    <span className="text-[11px] text-emerald-800">{generatedPreview.summary}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-emerald-200 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('append')}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      selectedMode === 'append'
                        ? 'bg-emerald-600 text-white'
                        : 'text-[#64748B] hover:text-emerald-700'
                    }`}
                  >
                    Adicionar ao Fluxo Atual
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMode('replace')}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      selectedMode === 'replace'
                        ? 'bg-emerald-600 text-white'
                        : 'text-[#64748B] hover:text-emerald-700'
                    }`}
                  >
                    Substituir Fluxo
                  </button>
                </div>
              </div>

              {/* Node Cards Preview List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {generatedPreview.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A1D21]">
                      <span className="flex items-center gap-1.5">
                        {node.type === 'message' && <MessageSquare className="w-3.5 h-3.5 text-[#0084FF]" />}
                        {node.type === 'action' && <Tag className="w-3.5 h-3.5 text-emerald-600" />}
                        {node.type === 'condition' && <Split className="w-3.5 h-3.5 text-cyan-600" />}
                        {node.type === 'trigger' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                        <span>{node.title}</span>
                      </span>
                      {node.data.isMessageABTestEnabled && (
                        <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-fuchsia-100 text-fuchsia-800 rounded">
                          Teste A/B
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748B] line-clamp-2">
                      {node.data.text || node.data.actionType || 'Configurado automaticamente'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>

          {generatedPreview && (
            <button
              id="btn_apply_voice_blocks_to_canvas"
              type="button"
              onClick={handleApplyToCanvas}
              className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Inserir Blocos no Canvas Agora</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
