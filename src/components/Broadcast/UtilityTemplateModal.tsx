import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Instagram, 
  Facebook, 
  Layers, 
  Wand2, 
  HelpCircle, 
  Smartphone, 
  Send, 
  Info,
  Check,
  AlertTriangle,
  RefreshCw,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UtilityMessageTemplate, UtilityTemplateCategory, UtilityTemplateVariable, FlowButton } from '../../types';

interface UtilityTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplate: (template: UtilityMessageTemplate) => void;
  editingTemplate?: UtilityMessageTemplate | null;
}

export const UtilityTemplateModal: React.FC<UtilityTemplateModalProps> = ({
  isOpen,
  onClose,
  onSaveTemplate,
  editingTemplate
}) => {
  if (!isOpen) return null;

  // Form states
  const [name, setName] = useState(editingTemplate?.name || 'rastreio_pedido_expresso_v1');
  const [displayName, setDisplayName] = useState(editingTemplate?.displayName || 'Atualização & Rastreamento de Pedido');
  const [category, setCategory] = useState<UtilityTemplateCategory>(editingTemplate?.category || 'UTILITY');
  const [channel, setChannel] = useState<'instagram' | 'messenger' | 'omnichannel'>(editingTemplate?.channel || 'instagram');
  const [language, setLanguage] = useState(editingTemplate?.language || 'pt_BR');
  
  const [headerType, setHeaderType] = useState<'none' | 'text' | 'image'>(
    editingTemplate?.headerType === 'document' ? 'text' : (editingTemplate?.headerType || 'text')
  );
  const [headerContent, setHeaderContent] = useState(editingTemplate?.headerContent || '📦 Status do seu Pedido');
  
  const [bodyText, setBodyText] = useState(
    editingTemplate?.bodyText || 
    'Olá {{1}}! Seu pedido #{{2}} foi enviado pela transportadora e está a caminho de {{3}}.\n\nCódigo de Rastreamento: *{{4}}*.\nPrevisão estimada de entrega: até 48h úteis.'
  );
  
  const [footerText, setFooterText] = useState(editingTemplate?.footerText || 'Notificação Oficial ManyFlow • Pós-Venda');
  
  const [variables, setVariables] = useState<UtilityTemplateVariable[]>(
    editingTemplate?.variables || [
      { key: '1', sampleValue: 'Camila', description: 'Nome do Cliente ({first_name})' },
      { key: '2', sampleValue: 'PED-98421', description: 'Número do Pedido' },
      { key: '3', sampleValue: 'São Paulo, SP', description: 'Cidade de Entrega' },
      { key: '4', sampleValue: 'BR88391209X', description: 'Código de Rastreamento' }
    ]
  );

  const [buttons, setButtons] = useState<FlowButton[]>(
    editingTemplate?.buttons || [
      { id: 'btn_1', text: '🚚 Rastrear Encomenda', type: 'url', value: 'https://rastreio.manyflow.io' },
      { id: 'btn_2', text: '💬 Falar com Atendente', type: 'handover' }
    ]
  );

  // Submission / Review Simulation State
  const [isSubmittingToMeta, setIsSubmittingToMeta] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);

  // Meta Compliance Audit Live
  const forbiddenMarketingWords = ['promoção', 'desconto', 'oferta', 'compre já', '50% off', 'aproveite', 'grátis', 'imperdível', 'cupom', 'black friday'];
  const detectedMarketingIssues = category === 'UTILITY' 
    ? forbiddenMarketingWords.filter(word => bodyText.toLowerCase().includes(word) || headerContent.toLowerCase().includes(word))
    : [];

  const isCompliant = detectedMarketingIssues.length === 0;

  // Insert Variable helper
  const handleAddVariable = () => {
    const nextIndex = variables.length + 1;
    const newVarKey = `${nextIndex}`;
    setVariables([...variables, { key: newVarKey, sampleValue: `Exemplo ${nextIndex}`, description: `Parâmetro {{${newVarKey}}}` }]);
    setBodyText(prev => `${prev} {{${newVarKey}}}`);
  };

  // Update Variable sample
  const handleUpdateVariableSample = (index: number, sampleVal: string, desc: string) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], sampleValue: sampleVal, description: desc };
    setVariables(updated);
  };

  // AI Compliance Fixer (Turn promotional into compliant transactional utility)
  const handleAiComplianceFix = () => {
    setIsAiOptimizing(true);
    setTimeout(() => {
      if (category === 'UTILITY') {
        setBodyText(
          'Olá {{1}}! Informamos que o status do seu pedido #{{2}} foi atualizado.\n\nLocalização atual: Centro de Distribuição em {{3}}.\nCódigo de Rastreio: *{{4}}*.\nPrevisão de Entrega: {{5}}.'
        );
        setHeaderContent('📦 Atualização de Pedido');
      }
      setIsAiOptimizing(false);
    }, 900);
  };

  // Submit to Meta for Approval
  const handleSubmitToMeta = (forceApprove: boolean = true) => {
    setIsSubmittingToMeta(true);
    setSubmissionStep('1/3: Validando estrutura de parâmetros e idioma pt_BR...');

    setTimeout(() => {
      setSubmissionStep('2/3: Enviando payload para Meta Graph API v20.0 (WhatsApp & Instagram Direct)...');

      setTimeout(() => {
        setSubmissionStep('3/3: Meta AI Reviewer verificando conformidade de Utilidade...');

        setTimeout(() => {
          setIsSubmittingToMeta(false);

          const willReject = !forceApprove || (!isCompliant && category === 'UTILITY');

          const newTemplate: UtilityMessageTemplate = {
            id: editingTemplate?.id || `tpl_${Date.now()}`,
            name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            displayName: displayName.trim() || 'Modelo de Utilidade',
            category,
            language,
            channel,
            status: willReject ? 'REJECTED' : 'APPROVED',
            rejectionReason: willReject 
              ? `Rejeitado pela Meta: O texto contém termos promocionais (${detectedMarketingIssues.join(', ')}) não permitidos na categoria UTILITY.`
              : undefined,
            qualityScore: willReject ? 'LOW' : 'HIGH',
            metaTemplateId: `meta_tpl_${Math.floor(10000000 + Math.random() * 90000000)}`,
            headerType,
            headerContent: headerType === 'text' ? headerContent : undefined,
            bodyText,
            footerText: footerText || undefined,
            variables,
            buttons: buttons.length > 0 ? buttons : undefined,
            submittedAt: new Date().toISOString(),
            approvedAt: willReject ? undefined : new Date().toISOString(),
            usageCount: 0
          };

          if (!willReject) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }

          onSaveTemplate(newTemplate);
          onClose();
        }, 1200);
      }, 1000);
    }, 800);
  };

  // Preview computed text with sample values
  let previewBodyText = bodyText;
  variables.forEach((v) => {
    const placeholder = new RegExp(`\\{\\{${v.key}\\}\\}`, 'g');
    previewBodyText = previewBodyText.replace(placeholder, v.sampleValue || `{{${v.key}}}`);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1A1D21]">
                  {editingTemplate ? 'Editar Modelo Utilitário' : 'Novo Modelo de Utilidade (Aprovação Meta)'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Meta Verified
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Modelos de Utilidade (Utility Templates) são aprovados pela Meta para envios transacionais fora da janela de 24h.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 text-[#64748B] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#F8F9FB]">
          
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Meta Category Info Card */}
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                <Info className="w-4 h-4 text-purple-700" />
                <span>Diretrizes Oficiais da Meta para Modelos de Utilidade (UTILITY):</span>
              </div>
              <p className="text-[11px] text-purple-950/80 leading-relaxed">
                Mensagens de utilidade devem ser estritamente informativas e transacionais (confirmação de pedidos, agendamentos, rastreio, faturas e contas). <b>Não use ofertas promocionais</b> para evitar rejeição na análise automatizada da Meta.
              </p>
            </div>

            {/* General Info */}
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider">
                1. Informações Básicas do Modelo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1A1D21] block mb-1">
                    Nome de Exibição:
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex: Atualização de Rastreio Express"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0084FF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1D21] block mb-1">
                    Nome Técnico (Identificador Meta):
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                    placeholder="Ex: rastreio_pedido_v1"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0084FF]"
                  />
                  <span className="text-[10px] text-[#64748B]">Apenas letras minúsculas e _</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1A1D21] block mb-1">
                    Categoria Meta:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as UtilityTemplateCategory)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white font-bold text-purple-900"
                  >
                    <option value="UTILITY">UTILITY (Utilidade / Transacional)</option>
                    <option value="AUTHENTICATION">AUTHENTICATION (Códigos OTP/2FA)</option>
                    <option value="MARKETING">MARKETING (Comercial / Opt-in)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1D21] block mb-1">
                    Canal:
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white"
                  >
                    <option value="instagram">Instagram Direct</option>
                    <option value="messenger">Facebook Messenger</option>
                    <option value="omnichannel">Omnichannel (Instagram & Messenger)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1D21] block mb-1">
                    Idioma:
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white"
                  >
                    <option value="pt_BR">Português (Brasil) - pt_BR</option>
                    <option value="en_US">Inglês (EUA) - en_US</option>
                    <option value="es_ES">Espanhol - es_ES</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Message Body & Structure */}
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider">
                  2. Conteúdo do Modelo & Variáveis
                </h3>

                <button
                  type="button"
                  onClick={handleAiComplianceFix}
                  disabled={isAiOptimizing}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isAiOptimizing ? 'Ajustando...' : 'Reescrever para Aprovação Meta (IA)'}</span>
                </button>
              </div>

              {/* Header Configuration */}
              <div>
                <label className="text-xs font-semibold text-[#1A1D21] block mb-1">
                  Cabeçalho (Opcional):
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setHeaderType('none')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                      headerType === 'none' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-[#64748B]'
                    }`}
                  >
                    Nenhum
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeaderType('text')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                      headerType === 'text' ? 'bg-[#0084FF] text-white' : 'bg-gray-100 text-[#64748B]'
                    }`}
                  >
                    Texto Curto
                  </button>
                </div>

                {headerType === 'text' && (
                  <input
                    type="text"
                    value={headerContent}
                    onChange={(e) => setHeaderContent(e.target.value)}
                    placeholder="Ex: 📦 Status da Entrega"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0084FF]"
                  />
                )}
              </div>

              {/* Body Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#1A1D21]">
                    Corpo da Mensagem (Body):
                  </label>
                  <span className="text-[11px] text-[#64748B]">
                    Use <code className="text-purple-700 bg-purple-50 px-1 rounded font-bold">{"{{1}}"}</code>, <code className="text-purple-700 bg-purple-50 px-1 rounded font-bold">{"{{2}}"}</code> para parâmetros
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0084FF] leading-relaxed resize-none font-sans"
                />
              </div>

              {/* Real-time Compliance Alert */}
              {!isCompliant && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Atenção: Possível Rejeição pela Meta</p>
                    <p className="text-[11px] text-rose-800">
                      Detectamos palavras com teor comercial ({detectedMarketingIssues.map(w => `"${w}"`).join(', ')}). Modelos de Utilidade devem ser estritamente transacionais.
                    </p>
                    <button
                      type="button"
                      onClick={handleAiComplianceFix}
                      className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" /> Corrigir Automaticamente com IA
                    </button>
                  </div>
                </div>
              )}

              {isCompliant && category === 'UTILITY' && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% em conformidade com as diretrizes de Utilidade da Meta (Alta probabilidade de aprovação imediata).</span>
                </div>
              )}

              {/* Variables Management */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A1D21]">
                    Valores de Amostra para a Meta (Sample Values):
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariable}
                    className="text-xs text-[#0084FF] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Adicionar Parâmetro
                  </button>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  A Meta exige valores de exemplo reais para cada parâmetro para entender o propósito do modelo.
                </p>

                <div className="space-y-2">
                  {variables.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#F8F9FB] p-2 rounded-lg border border-[#E2E8F0]">
                      <span className="w-12 text-center text-xs font-bold font-mono text-purple-700 bg-purple-50 py-1 rounded">
                        {"{{" + v.key + "}}"}
                      </span>
                      <input
                        type="text"
                        value={v.sampleValue}
                        onChange={(e) => handleUpdateVariableSample(idx, e.target.value, v.description || '')}
                        placeholder="Exemplo de valor (ex: João)"
                        className="flex-1 px-2.5 py-1 text-xs rounded border border-[#E2E8F0] bg-white focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                      />
                      <input
                        type="text"
                        value={v.description || ''}
                        onChange={(e) => handleUpdateVariableSample(idx, v.sampleValue, e.target.value)}
                        placeholder="Descrição (ex: Nome do Cliente)"
                        className="flex-1 px-2.5 py-1 text-xs rounded border border-[#E2E8F0] bg-white focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Text */}
              <div>
                <label className="text-xs font-semibold text-[#1A1D21] block mb-1">
                  Texto de Rodapé (Opcional):
                </label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Ex: Notificação Oficial ManyFlow"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-[#F8F9FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0084FF]"
                />
              </div>

              {/* Buttons */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A1D21]">
                    Botões de Ação Rápida (Até 2 botões):
                  </label>
                  {buttons.length < 2 && (
                    <button
                      type="button"
                      onClick={() => setButtons([...buttons, { id: `btn_${Date.now()}`, text: 'Novo Botão', type: 'url', value: 'https://manyflow.io' }])}
                      className="text-xs text-[#0084FF] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Adicionar Botão
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {buttons.map((b, idx) => (
                    <div key={b.id} className="flex items-center gap-2 bg-[#F8F9FB] p-2 rounded-lg border border-[#E2E8F0]">
                      <input
                        type="text"
                        value={b.text}
                        onChange={(e) => {
                          const updated = [...buttons];
                          updated[idx].text = e.target.value;
                          setButtons(updated);
                        }}
                        className="flex-1 px-2.5 py-1 text-xs rounded border border-[#E2E8F0] bg-white font-medium"
                      />
                      <select
                        value={b.type}
                        onChange={(e) => {
                          const updated = [...buttons];
                          updated[idx].type = e.target.value as any;
                          setButtons(updated);
                        }}
                        className="text-xs px-2 py-1 rounded border border-[#E2E8F0] bg-white"
                      >
                        <option value="url">Link Externo (URL)</option>
                        <option value="flow">Disparar Fluxo</option>
                        <option value="handover">Falar com Humano</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setButtons(buttons.filter((_, i) => i !== idx))}
                        className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right Preview: 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Direct Phone Preview */}
            <div className="sticky top-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-600" /> Prévia Oficial no Direct
                </span>
                <span className="text-[10px] text-purple-700 bg-purple-100 font-bold px-2 py-0.5 rounded-full">
                  Meta Verified Template
                </span>
              </div>

              {/* Smartphone Frame */}
              <div className="w-full max-w-[340px] mx-auto bg-gray-950 rounded-[36px] p-3 shadow-xl border-4 border-gray-800">
                {/* Screen Notch */}
                <div className="w-28 h-4 bg-gray-900 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-black/80 mr-2" />
                  <div className="w-8 h-1 rounded-full bg-gray-700" />
                </div>

                {/* Direct App Header */}
                <div className="bg-white rounded-t-2xl px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                        <Instagram className="w-3.5 h-3.5 text-pink-600" />
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-900 flex items-center gap-1">
                        Sua Marca Oficial
                        <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500 text-white" />
                      </div>
                      <span className="text-[9px] text-emerald-600 font-semibold block">Online agora</span>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                </div>

                {/* Chat Bubble Area */}
                <div className="bg-[#F4F5F7] p-3 min-h-[300px] flex flex-col justify-end space-y-2 rounded-b-2xl">
                  
                  {/* Meta Template Verified Badge */}
                  <div className="text-center">
                    <span className="text-[9px] font-bold bg-white/90 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-purple-600" /> Mensagem Utilitária Autorizada
                    </span>
                  </div>

                  {/* Bubble Container */}
                  <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-gray-200/80 space-y-2 max-w-[92%]">
                    {/* Header */}
                    {headerType === 'text' && headerContent && (
                      <h4 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-1.5">
                        {headerContent}
                      </h4>
                    )}

                    {/* Body */}
                    <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {previewBodyText}
                    </p>

                    {/* Footer */}
                    {footerText && (
                      <p className="text-[10px] text-gray-400 border-t border-gray-100 pt-1">
                        {footerText}
                      </p>
                    )}

                    {/* Buttons */}
                    {buttons.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {buttons.map((b) => (
                          <div
                            key={b.id}
                            className="w-full py-1.5 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-bold text-center flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{b.text}</span>
                            {b.type === 'url' && <ExternalLink className="w-3 h-3" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-[9px] text-gray-400 text-right pr-2">Agora • Entregue ✓✓</span>
                </div>
              </div>

              {/* Quick Summary Card */}
              <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs space-y-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Status de Análise pela Meta
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Probabilidade de Aprovação:</span>
                  <span className={`font-bold ${isCompliant ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isCompliant ? '99% (Alta)' : 'Baixa (Ajustar termos)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Tempo Médio de Análise:</span>
                  <span className="font-bold text-purple-900">~1 minuto</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="text-xs text-[#64748B] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Ao submeter, o modelo será enviado para verificação na Meta Graph API.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmittingToMeta}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg hover:bg-gray-100 text-[#64748B] transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleSubmitToMeta(true)}
              disabled={isSubmittingToMeta}
              className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-lg bg-purple-700 hover:bg-purple-800 text-white shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmittingToMeta ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{submissionStep || 'Submetendo à Meta...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submeter para Aprovação da Meta</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
