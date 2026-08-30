import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  Copy, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Instagram, 
  Facebook, 
  Layers, 
  Smartphone, 
  FileText, 
  Check, 
  Sparkles,
  RefreshCw,
  TrendingUp,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UtilityMessageTemplate, Contact } from '../../types';

interface UtilityTemplateDetailsDrawerProps {
  template: UtilityMessageTemplate | null;
  onClose: () => void;
  onLaunchBroadcastWithTemplate: (template: UtilityMessageTemplate) => void;
  onEditTemplate: (template: UtilityMessageTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onUpdateTemplate: (updated: UtilityMessageTemplate) => void;
  contacts?: Contact[];
}

export const UtilityTemplateDetailsDrawer: React.FC<UtilityTemplateDetailsDrawerProps> = ({
  template,
  onClose,
  onLaunchBroadcastWithTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onUpdateTemplate,
  contacts = []
}) => {
  if (!template) return null;

  const [copiedId, setCopiedId] = useState(false);
  const [selectedContactIndex, setSelectedContactIndex] = useState(0);
  const [isVerifyingStatus, setIsVerifyingStatus] = useState(false);

  const selectedContact = contacts[selectedContactIndex] || {
    id: 'c_demo',
    name: 'Camila Silveira',
    username: '@camilasilveira.style',
    channel: 'instagram'
  };

  const handleCopyMetaId = () => {
    if (template.metaTemplateId) {
      navigator.clipboard.writeText(template.metaTemplateId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Re-verify or force approve pending template
  const handleVerifyPendingStatus = () => {
    setIsVerifyingStatus(true);
    setTimeout(() => {
      const approved: UtilityMessageTemplate = {
        ...template,
        status: 'APPROVED',
        qualityScore: 'HIGH',
        approvedAt: new Date().toISOString(),
        rejectionReason: undefined
      };
      onUpdateTemplate(approved);
      setIsVerifyingStatus(false);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 1200);
  };

  // Compute text preview
  let renderedText = template.bodyText;
  template.variables.forEach((v) => {
    const placeholder = new RegExp(`\\{\\{${v.key}\\}\\}`, 'g');
    let val = v.sampleValue || `{{${v.key}}}`;
    if (v.key === '1' && selectedContact.name) {
      val = selectedContact.name.split(' ')[0];
    }
    renderedText = renderedText.replace(placeholder, val);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-[#E2E8F0] animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1A1D21]">
                  {template.displayName}
                </h2>
                {template.status === 'APPROVED' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Aprovado pela Meta
                  </span>
                )}
                {template.status === 'PENDING_APPROVAL' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Em Análise Meta
                  </span>
                )}
                {template.status === 'REJECTED' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Rejeitado pela Meta
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-[#64748B] mt-0.5">
                {template.name} • Categoria: <b>{template.category}</b>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8F9FB]">
          
          {/* Status & Rejection Alert if any */}
          {template.status === 'REJECTED' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Motivo da Rejeição na Meta:</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                {template.rejectionReason || 'O texto contém termos incompatíveis com mensagens utilitárias (UTILITY). Ajuste removendo chamadas promocionais e ressubmeta.'}
              </p>
              <button
                type="button"
                onClick={() => onEditTemplate(template)}
                className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer mt-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Corrigir & Ressubmeter com IA
              </button>
            </div>
          )}

          {template.status === 'PENDING_APPROVAL' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="text-xs font-bold text-amber-950 block">Aguardando Avaliação da Meta</span>
                  <span className="text-[11px] text-amber-800">Geralmente leva entre 1 e 5 minutos.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyPendingStatus}
                disabled={isVerifyingStatus}
                className="py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingStatus ? 'animate-spin' : ''}`} />
                <span>{isVerifyingStatus ? 'Consultando API...' : 'Verificar Status Agora'}</span>
              </button>
            </div>
          )}

          {/* Meta Technical Badges Card */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">ID Oficial Meta</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-mono font-bold text-purple-900 truncate">
                  {template.metaTemplateId || 'meta_tpl_pending'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyMetaId}
                  title="Copiar ID"
                  className="text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Qualidade Meta</span>
              <span className="text-xs font-bold text-emerald-600 mt-1 block">
                {template.qualityScore === 'HIGH' ? '🟢 Alta Qualidade' : '🟡 Média'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Canal</span>
              <div className="flex items-center gap-1 text-xs font-bold text-[#1A1D21] mt-1">
                {template.channel === 'instagram' && <Instagram className="w-3.5 h-3.5 text-pink-600" />}
                {template.channel === 'messenger' && <Facebook className="w-3.5 h-3.5 text-blue-600" />}
                {template.channel === 'omnichannel' && <Layers className="w-3.5 h-3.5 text-purple-600" />}
                <span className="capitalize">{template.channel}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Disparos Realizados</span>
              <span className="text-xs font-bold text-[#1A1D21] mt-1 block">
                {(template.usageCount || 0).toLocaleString('pt-BR')} msgs
              </span>
            </div>
          </div>

          {/* Rendered Direct Phone Preview */}
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-purple-600" /> Prévia Renderizada para o Lead
              </h3>
              
              {/* Contact Switcher for Test */}
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <span>Testar com:</span>
                <select
                  value={selectedContactIndex}
                  onChange={(e) => setSelectedContactIndex(Number(e.target.value))}
                  className="px-2 py-0.5 text-xs rounded border border-[#E2E8F0] bg-[#F8F9FB] font-medium"
                >
                  {contacts.map((c, idx) => (
                    <option key={c.id} value={idx}>
                      {c.name} ({c.username})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bubble Rendering */}
            <div className="p-4 bg-[#F4F5F7] rounded-xl border border-gray-200/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-purple-800 font-bold border-b border-gray-200 pb-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Meta Approved Utility Delivery
                </span>
                <span className="text-gray-400">Janela de 24h: Ilimitada</span>
              </div>

              {template.headerContent && (
                <div className="font-bold text-xs text-gray-900 pt-1">
                  {template.headerContent}
                </div>
              )}

              <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                {renderedText}
              </p>

              {template.footerText && (
                <p className="text-[10px] text-gray-400 border-t border-gray-200/60 pt-1">
                  {template.footerText}
                </p>
              )}

              {template.buttons && template.buttons.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {template.buttons.map((btn) => (
                    <div
                      key={btn.id}
                      className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-purple-900 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>{btn.text}</span>
                      {btn.type === 'url' && <ExternalLink className="w-3 h-3 text-purple-600" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Variables Mappings List */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-[#1A1D21] uppercase tracking-wider">
              Parâmetros Dinâmicos Cadastrados na Meta
            </h3>
            
            <div className="space-y-2">
              {template.variables.map((v, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-mono font-bold rounded">
                      {"{{" + v.key + "}}"}
                    </span>
                    <span className="font-semibold text-gray-800">{v.description || `Parâmetro ${v.key}`}</span>
                  </div>
                  <span className="text-[#64748B] font-mono text-[11px]">
                    Exemplo: <b className="text-gray-900">"{v.sampleValue}"</b>
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#E2E8F0] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onEditTemplate(template)}
              className="p-2 rounded-lg hover:bg-gray-100 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
              title="Editar Modelo"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteTemplate(template.id)}
              className="p-2 rounded-lg hover:bg-rose-50 text-[#64748B] hover:text-rose-600 transition-colors cursor-pointer"
              title="Excluir Modelo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-gray-100 text-[#64748B] transition-colors cursor-pointer"
            >
              Fechar
            </button>

            {template.status === 'APPROVED' && (
              <button
                type="button"
                onClick={() => {
                  onLaunchBroadcastWithTemplate(template);
                  onClose();
                }}
                className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-lg bg-purple-700 hover:bg-purple-800 text-white shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Disparar Transmissão com este Modelo</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
