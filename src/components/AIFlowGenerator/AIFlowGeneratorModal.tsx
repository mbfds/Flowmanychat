import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Check, 
  Instagram, 
  Facebook, 
  Wand2, 
  Flame,
  ShoppingBag,
  GraduationCap,
  Calendar,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flow, ChannelType } from '../../types';

interface AIFlowGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlowGenerated: (newFlow: Flow) => void;
}

export const AIFlowGeneratorModal: React.FC<AIFlowGeneratorModalProps> = ({
  isOpen,
  onClose,
  onFlowGenerated
}) => {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState('');
  const [channel, setChannel] = useState<ChannelType>('instagram');
  const [businessType, setBusinessType] = useState('E-commerce & Vendas Online');
  const [goal, setGoal] = useState('Converter comentário em venda com cupom');
  const [isLoading, setIsLoading] = useState(false);

  const presets = [
    {
      icon: ShoppingBag,
      title: 'Vendas de E-commerce com Cupom VIP 20%',
      prompt: 'Crie um fluxo de alta conversão para Instagram Direct quando alguém comenta "QUERO" no post. O robô entrega um cupom de 20% OFF, tira dúvidas de frete e manda o link de compra com desconto aplicado.',
      channel: 'instagram' as ChannelType,
      niche: 'Moda, Beleza e E-commerce'
    },
    {
      icon: GraduationCap,
      title: 'Lançamento de Curso & Isca Digital (WhatsApp)',
      prompt: 'Automação para qualificar interessados em mentoria/curso online. Pergunta o nível do aluno, envia um e-book gratuito em PDF no direct e direciona os qualificados para o grupo VIP de WhatsApp.',
      channel: 'instagram' as ChannelType,
      niche: 'Infoprodutos & Educação'
    },
    {
      icon: Calendar,
      title: 'Agendamento em Clínica / Consultoria',
      prompt: 'Fluxo para agendamento de consultas ou serviços. Coleta nome, WhatsApp e preferência de horário, e avisa o atendente humano para confirmar o agendamento.',
      channel: 'omnichannel' as ChannelType,
      niche: 'Saúde, Estética e Consultoria'
    },
    {
      icon: Flame,
      title: 'Quiz de Qualificação de Lead no Messenger',
      prompt: 'Quiz interativo com 3 perguntas de múltipla escolha para entender o orçamento e porte da empresa no Facebook Messenger, salvando tags no CRM.',
      channel: 'messenger' as ChannelType,
      niche: 'B2B & Agências'
    }
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setPrompt(preset.prompt);
    setChannel(preset.channel);
    setBusinessType(preset.niche);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/generate-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          channel,
          businessType,
          goal
        })
      });

      const data = await response.json();
      if (data.flow) {
        const generatedFlow: Flow = {
          id: `flow_ai_${Date.now()}`,
          title: data.flow.title || 'Fluxo Gerado por IA',
          description: data.flow.description || prompt,
          channel: (data.flow.channel as ChannelType) || channel,
          isActive: true,
          nodes: data.flow.nodes || [],
          connections: data.flow.connections || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stats: {
            runs: 0,
            completed: 0,
            ctr: 0
          }
        };

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 }
        });

        onFlowGenerated(generatedFlow);
        onClose();
      }
    } catch (err) {
      console.error('Error generating flow:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1D21] flex items-center gap-2">
                <span>Criador de Automações com Gemini AI</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  FLASH
                </span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Descreva em linguagem natural o que deseja automatizar e o Gemini construirá todo o grafo de mensagens, botões e tags.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
            Modelos Rápidos Pré-Configurados:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((preset, idx) => {
              const Icon = preset.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-3 rounded-xl bg-[#F8F9FB] hover:bg-purple-50/50 border border-[#E2E8F0] hover:border-purple-300 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-[#1A1D21] group-hover:text-purple-700">
                    <Icon className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="truncate">{preset.title}</span>
                  </div>
                  <span className="text-[10px] text-[#64748B] mt-1 block truncate">
                    {preset.niche}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              O que você deseja que a automação faça?
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Quero um fluxo para Instagram Direct que receba leads que comentaram 'QUERO', envie um cupom de 20%, adicione a tag 'Lead-Cupom' e transfira para o WhatsApp se o cliente tiver dúvidas..."
              className="w-full p-3 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF] leading-relaxed font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Canal Principal
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
              >
                <option value="instagram">Instagram Direct</option>
                <option value="messenger">Facebook Messenger</option>
                <option value="omnichannel">Ambos os Canais</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Seu Nicho / Tipo de Negócio
              </label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="Ex: E-commerce, Dentista, Cursos..."
                className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21]"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
          <span className="text-xs text-[#64748B]">
            Powered by Google Gemini 2.5 Flash
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="py-2 px-4 rounded-lg bg-white hover:bg-gray-50 border border-[#E2E8F0] text-[#64748B] text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="py-2 px-5 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Gerando Nós do Fluxo...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Construir Fluxo com IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
