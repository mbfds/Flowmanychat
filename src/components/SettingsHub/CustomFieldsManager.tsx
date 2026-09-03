import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  Sparkles, 
  Tag as TagIcon, 
  Calendar, 
  Type, 
  Hash, 
  ListFilter, 
  ToggleLeft, 
  Search, 
  Info, 
  HelpCircle,
  X,
  Layers,
  Code2,
  Variable,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  Mail,
  Phone,
  FileText,
  MapPin,
  Link as LinkIcon,
  DollarSign,
  Filter
} from 'lucide-react';
import { CustomFieldDefinition, CustomFieldValidationType } from '../../types';
import { 
  VALIDATION_PRESETS, 
  CRM_PLATFORMS, 
  COMMON_CRM_FIELDS, 
  validateCustomFieldValue 
} from '../../utils/customFieldValidation';

interface CustomFieldsManagerProps {
  customFields: CustomFieldDefinition[];
  onUpdateCustomFields: (fields: CustomFieldDefinition[]) => void;
}

const TYPE_CONFIG = {
  text: { label: 'Texto', icon: Type, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  number: { label: 'Número', icon: Hash, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  date: { label: 'Data', icon: Calendar, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  select: { label: 'Seleção / Lista', icon: ListFilter, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  boolean: { label: 'Booleano (Sim/Não)', icon: ToggleLeft, bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' }
};

export const CustomFieldsManager: React.FC<CustomFieldsManagerProps> = ({
  customFields,
  onUpdateCustomFields
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValidation, setFilterValidation] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Quick Test Popover/Modal State
  const [testModalField, setTestModalField] = useState<CustomFieldDefinition | null>(null);
  const [quickTestInput, setQuickTestInput] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [type, setType] = useState<CustomFieldDefinition['type']>('text');
  const [description, setDescription] = useState('');
  const [defaultValue, setDefaultValue] = useState('');
  const [optionsString, setOptionsString] = useState('');

  // Validation & CRM Integration States
  const [validationType, setValidationType] = useState<CustomFieldValidationType>('none');
  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('i');
  const [validationErrorMessage, setValidationErrorMessage] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [crmTargetField, setCrmTargetField] = useState('');
  const [crmPlatformPreset, setCrmPlatformPreset] = useState<CustomFieldDefinition['crmPlatformPreset']>('generic');
  const [normalizationRule, setNormalizationRule] = useState<CustomFieldDefinition['normalizationRule']>('none');

  // Interactive Live Regex Tester state in modal
  const [liveTestValue, setLiveTestValue] = useState('');
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'validation' | 'crm'>('basic');

  const formatKeySlug = (val: string) => {
    return val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingFieldId) {
      setKey(formatKeySlug(val));
    }
  };

  const handleSelectValidationPreset = (newType: CustomFieldValidationType) => {
    setValidationType(newType);
    const preset = VALIDATION_PRESETS[newType];
    if (preset) {
      setRegexPattern(preset.defaultRegex);
      setValidationErrorMessage(preset.defaultErrorMessage);
      if (preset.exampleValidValue && !liveTestValue) {
        setLiveTestValue(preset.exampleValidValue);
      }
      if (preset.crmTargetSuggestion && !crmTargetField) {
        setCrmTargetField(preset.crmTargetSuggestion);
      }
      if (newType === 'email') {
        setNormalizationRule('lowercase');
      } else if (newType === 'phone_br' || newType === 'cpf' || newType === 'cnpj' || newType === 'cep') {
        setNormalizationRule('digits_only');
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingFieldId(null);
    setName('');
    setKey('');
    setType('text');
    setDescription('');
    setDefaultValue('');
    setOptionsString('');
    setValidationType('none');
    setRegexPattern('');
    setRegexFlags('i');
    setValidationErrorMessage('');
    setIsRequired(false);
    setCrmTargetField('');
    setCrmPlatformPreset('rd_station');
    setNormalizationRule('none');
    setLiveTestValue('');
    setActiveFormTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (field: CustomFieldDefinition) => {
    setEditingFieldId(field.id);
    setName(field.name);
    setKey(field.key);
    setType(field.type);
    setDescription(field.description || '');
    setDefaultValue(field.defaultValue || '');
    setOptionsString(field.options?.join(', ') || '');
    setValidationType(field.validationType || 'none');
    setRegexPattern(field.regexPattern || '');
    setRegexFlags(field.regexFlags || 'i');
    setValidationErrorMessage(field.validationErrorMessage || '');
    setIsRequired(!!field.isRequired);
    setCrmTargetField(field.crmTargetField || '');
    setCrmPlatformPreset(field.crmPlatformPreset || 'rd_station');
    setNormalizationRule(field.normalizationRule || 'none');
    const preset = VALIDATION_PRESETS[field.validationType || 'none'];
    setLiveTestValue(preset?.exampleValidValue || field.defaultValue || '');
    setActiveFormTab('basic');
    setIsModalOpen(true);
  };

  const handleSaveField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    const formattedKey = formatKeySlug(key.trim());

    if (editingFieldId) {
      const updated = customFields.map((f) => {
        if (f.id === editingFieldId) {
          return {
            ...f,
            name: name.trim(),
            key: formattedKey,
            type,
            description: description.trim(),
            defaultValue: defaultValue.trim(),
            options: type === 'select' ? optionsString.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
            validationType,
            regexPattern: regexPattern.trim(),
            regexFlags: regexFlags.trim() || 'i',
            validationErrorMessage: validationErrorMessage.trim(),
            isRequired,
            crmTargetField: crmTargetField.trim(),
            crmPlatformPreset,
            normalizationRule
          };
        }
        return f;
      });
      onUpdateCustomFields(updated);
    } else {
      const newField: CustomFieldDefinition = {
        id: `cf_${Date.now()}`,
        name: name.trim(),
        key: formattedKey,
        type,
        description: description.trim(),
        defaultValue: defaultValue.trim(),
        options: type === 'select' ? optionsString.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        validationType,
        regexPattern: regexPattern.trim(),
        regexFlags: regexFlags.trim() || 'i',
        validationErrorMessage: validationErrorMessage.trim(),
        isRequired,
        crmTargetField: crmTargetField.trim(),
        crmPlatformPreset,
        normalizationRule,
        createdAt: new Date().toISOString()
      };
      onUpdateCustomFields([...customFields, newField]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteField = (id: string) => {
    if (confirm('Tem certeza que deseja remover este campo personalizado?')) {
      onUpdateCustomFields(customFields.filter((f) => f.id !== id));
    }
  };

  const handleCopyTag = (fieldKey: string) => {
    navigator.clipboard.writeText(`{${fieldKey}}`);
    setCopiedKey(fieldKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Compute live validation result for the modal's test bench
  const currentModalFieldMock: CustomFieldDefinition = {
    id: editingFieldId || 'temp',
    name: name || 'Campo',
    key: key || 'campo',
    type,
    validationType,
    regexPattern,
    regexFlags,
    validationErrorMessage,
    isRequired,
    crmTargetField,
    normalizationRule,
    createdAt: ''
  };

  const liveTestResult = validateCustomFieldValue(currentModalFieldMock, liveTestValue);

  const filteredFields = customFields.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.crmTargetField && f.crmTargetField.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterValidation === 'with_validation') {
      return f.validationType && f.validationType !== 'none';
    }
    if (filterValidation === 'email') {
      return f.validationType === 'email';
    }
    if (filterValidation === 'phone') {
      return f.validationType === 'phone_br' || f.validationType === 'phone_e164';
    }
    if (filterValidation === 'crm_mapped') {
      return !!f.crmTargetField;
    }
    return true;
  });

  const getValidationBadge = (field: CustomFieldDefinition) => {
    const vType = field.validationType || 'none';
    if (vType === 'none') {
      return (
        <span className="text-gray-400 text-[11px] italic">
          Livre (sem regex)
        </span>
      );
    }
    if (vType === 'email') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <Mail className="w-3 h-3 text-blue-600" />
          <span>E-mail (RFC 5322)</span>
        </span>
      );
    }
    if (vType === 'phone_br' || vType === 'phone_e164') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Phone className="w-3 h-3 text-emerald-600" />
          <span>{vType === 'phone_br' ? 'Telefone BR' : 'Telefone E.164'}</span>
        </span>
      );
    }
    if (vType === 'cpf' || vType === 'cnpj') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
          <FileText className="w-3 h-3 text-indigo-600" />
          <span>{vType === 'cpf' ? 'CPF' : 'CNPJ'}</span>
        </span>
      );
    }
    if (vType === 'cep') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <MapPin className="w-3 h-3 text-amber-600" />
          <span>CEP</span>
        </span>
      );
    }
    if (vType === 'url') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          <LinkIcon className="w-3 h-3 text-purple-600" />
          <span>URL Web</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
        <Code2 className="w-3 h-3 text-slate-600" />
        <span>Regex Custom</span>
      </span>
    );
  };

  return (
    <div className="space-y-6" id="custom_fields_manager_section">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
            <Variable className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A1D21] flex items-center gap-2">
              <span>Campos Personalizados & Validação de Dados CRM</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                {customFields.length} {customFields.length === 1 ? 'campo' : 'campos'}
              </span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Defina validações regex para garantir dados padronizados (e-mail, telefone, CPF, etc.) antes de sincronizar com CRMs externos (RD Station, HubSpot, ActiveCampaign, Salesforce).
            </p>
          </div>
        </div>

        <button
          id="btn_create_custom_field"
          onClick={handleOpenCreateModal}
          className="py-2.5 px-4 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Campo com Validação</span>
        </button>
      </div>

      {/* Guide & CRM Best Practice Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/90 border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white border border-blue-200 text-[#0084FF] shrink-0 mt-0.5 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-1 text-xs">
            <span className="font-bold text-[#1A1D21] flex items-center gap-2">
              <span>Validação Automática & Higienização para CRMs:</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-black text-[10px]">
                RFC 5322 & E.164
              </span>
            </span>
            <p className="text-[#64748B] leading-relaxed">
              Ao habilitar validação regex, o ManyFlow rejeita entradas malformatadas no FlowBuilder e solicita a correção amigável do seguidor. Os dados são normalizados (ex: remoção de pontuação de telefones ou conversão de e-mails para minúsculo) garantindo compatibilidade com CRMs externos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0 items-center">
          <span className="px-2.5 py-1 rounded-md bg-white border border-blue-200 text-[11px] font-mono font-bold text-blue-700 shadow-xs flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {`{email_lead}`}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-emerald-200 text-[11px] font-mono font-bold text-emerald-700 shadow-xs flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {`{whatsapp_lead}`}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-purple-200 text-[11px] font-mono font-bold text-purple-700 shadow-xs flex items-center gap-1">
            <TagIcon className="w-3 h-3" />
            {`{preferencia}`}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input_search_custom_fields"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do campo, variável {chave}, campo CRM ou regex..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
          />
        </div>

        {/* Validation Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={filterValidation}
            onChange={(e) => setFilterValidation(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs font-semibold text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
          >
            <option value="all">Todos os Campos ({customFields.length})</option>
            <option value="with_validation">Com Validação Regex Ativa</option>
            <option value="email">Validação de E-mail</option>
            <option value="phone">Validação de Telefone / WhatsApp</option>
            <option value="crm_mapped">Mapeados para CRM Externo</option>
          </select>
          <span className="text-xs text-[#64748B] font-medium ml-1">
            {filteredFields.length} exibidos
          </span>
        </div>
      </div>

      {/* Custom Fields Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <th className="py-3 px-4">Nome do Campo</th>
                <th className="py-3 px-4">Tag (FlowBuilder)</th>
                <th className="py-3 px-4">Tipo & Padrão</th>
                <th className="py-3 px-4">Validação Regex</th>
                <th className="py-3 px-4">Mapeamento CRM</th>
                <th className="py-3 px-4 text-center">Testar</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#1A1D21]">
              {filteredFields.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#64748B] space-y-2">
                    <ShieldCheck className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="font-semibold text-sm">Nenhum campo personalizado encontrado</p>
                    <p className="text-xs">Clique no botão "Novo Campo com Validação" para configurar um campo com padrão consistente para CRM.</p>
                  </td>
                </tr>
              ) : (
                filteredFields.map((field) => {
                  const typeInfo = TYPE_CONFIG[field.type] || TYPE_CONFIG.text;
                  const TypeIcon = typeInfo.icon;
                  const isCopied = copiedKey === field.key;
                  const hasValidation = field.validationType && field.validationType !== 'none';

                  return (
                    <tr key={field.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-[#1A1D21]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${hasValidation ? 'bg-emerald-500' : 'bg-[#0084FF]'}`} />
                            <span>{field.name}</span>
                            {field.isRequired && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-700 font-bold rounded">
                                Obrigatório
                              </span>
                            )}
                          </div>
                          {field.description && (
                            <p className="text-[11px] text-gray-500 font-normal line-clamp-1 max-w-xs">
                              {field.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Tag Variable with 1-Click Copy */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleCopyTag(field.key)}
                          title="Clique para copiar a tag da variável para o FlowBuilder"
                          className={`group px-2.5 py-1 rounded-lg border font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <span>{`{${field.key}}`}</span>
                              <Copy className="w-3 h-3 text-purple-400 group-hover:text-purple-700 opacity-60 group-hover:opacity-100" />
                            </>
                          )}
                        </button>
                      </td>

                      {/* Data Type & Fallback */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeInfo.bg} ${typeInfo.text} ${typeInfo.border}`}>
                            <TypeIcon className="w-3 h-3" />
                            <span>{typeInfo.label}</span>
                          </span>
                          {field.defaultValue ? (
                            <div className="text-[10px] text-gray-500 font-mono">
                              Fallback: <span className="bg-gray-100 px-1 py-0.2 rounded text-gray-700">{field.defaultValue}</span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Validation Badge & Details */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div>{getValidationBadge(field)}</div>
                          {field.regexPattern && (
                            <div className="text-[10px] font-mono text-gray-500 max-w-xs truncate" title={field.regexPattern}>
                              /{field.regexPattern}/{field.regexFlags || 'i'}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* CRM Mapping */}
                      <td className="py-3.5 px-4">
                        {field.crmTargetField ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>{field.crmTargetField}</span>
                            </span>
                            <div className="text-[10px] text-gray-500">
                              {field.crmPlatformPreset ? field.crmPlatformPreset.replace('_', ' ').toUpperCase() : 'CRM'}
                              {field.normalizationRule && field.normalizationRule !== 'none' && (
                                <span className="ml-1 text-purple-600 font-medium">({field.normalizationRule})</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">Não mapeado</span>
                        )}
                      </td>

                      {/* Test Action Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setTestModalField(field);
                            setQuickTestInput(field.defaultValue || VALIDATION_PRESETS[field.validationType || 'none']?.exampleValidValue || '');
                          }}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                          title="Testar validação deste campo com exemplos"
                        >
                          <Play className="w-3 h-3 text-emerald-600" />
                          <span>Testar</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(field)}
                            title="Editar campo e regras de validação"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#0084FF] hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteField(field.id)}
                            title="Excluir campo"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Test Modal Popover for testing any field */}
      {testModalField && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8F9FB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A1D21]">
                    Testar Validação: {testModalField.name}
                  </h4>
                  <p className="text-[11px] text-[#64748B] font-mono">
                    {`{${testModalField.key}}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTestModalField(null)}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1A1D21]">
                  Digite um valor para simular a resposta do seguidor:
                </label>
                <input
                  type="text"
                  value={quickTestInput}
                  onChange={(e) => setQuickTestInput(e.target.value)}
                  placeholder="Ex: seu.email@exemplo.com ou (11) 99999-8888"
                  className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                />
              </div>

              {/* Live Test Outcome */}
              {(() => {
                const res = validateCustomFieldValue(testModalField, quickTestInput);
                return (
                  <div className={`p-3 rounded-xl border ${
                    res.isValid 
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                      : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {res.isValid ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Padrão Válido para CRM!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Entrada Rejeitada pelo Padrão Regex</span>
                        </>
                      )}
                    </div>
                    {res.isValid ? (
                      <p className="text-[11px] text-emerald-800">
                        Valor higienizado enviado ao CRM: <strong className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-300">{res.sanitizedValue || '(vazio)'}</strong>
                      </p>
                    ) : (
                      <p className="text-[11px] text-rose-700">
                        Mensagem exibida ao seguidor: <em>"{res.errorMessage}"</em>
                      </p>
                    )}
                  </div>
                );
              })()}

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-[11px] space-y-1">
                <div className="text-gray-600 flex justify-between">
                  <span>Tipo de Validação:</span>
                  <span className="font-bold text-gray-800">{testModalField.validationType || 'Nenhuma'}</span>
                </div>
                {testModalField.regexPattern && (
                  <div className="text-gray-600 flex justify-between">
                    <span>Expressão Regex:</span>
                    <span className="font-mono font-bold text-gray-800 truncate max-w-[200px]">{testModalField.regexPattern}</span>
                  </div>
                )}
                {testModalField.crmTargetField && (
                  <div className="text-gray-600 flex justify-between">
                    <span>Campo de Destino no CRM:</span>
                    <span className="font-mono font-bold text-blue-700">{testModalField.crmTargetField}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setTestModalField(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  Fechar Teste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal with Validation & CRM Tabs */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            id="modal_custom_field_form"
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E2E8F0] bg-[#F8F9FB] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                  <Variable className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1D21]">
                    {editingFieldId ? 'Editar Campo Personalizado' : 'Novo Campo Personalizado & Regra CRM'}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Configure tipos de dados, regex de validação e destino em CRMs externos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 text-[#64748B] hover:text-[#1A1D21] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-gray-200 bg-gray-50/50 px-6 pt-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveFormTab('basic')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer ${
                  activeFormTab === 'basic'
                    ? 'border-[#0084FF] text-[#0084FF]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                1. Informações Básicas
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('validation')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFormTab === 'validation'
                    ? 'border-[#0084FF] text-[#0084FF]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Validação de Dados (Regex)</span>
                {validationType !== 'none' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('crm')}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFormTab === 'crm'
                    ? 'border-[#0084FF] text-[#0084FF]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                <span>3. Integração com CRM Externo</span>
                {crmTargetField && (
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                )}
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveField} className="p-6 space-y-4 text-xs">
              {/* TAB 1: BASIC INFORMATION */}
              {activeFormTab === 'basic' && (
                <div className="space-y-4">
                  {/* Field Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                      Nome Amigável do Campo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: E-mail Corporativo, WhatsApp do Lead, CPF, Cidade..."
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF]"
                    />
                  </div>

                  {/* Variable Key Slug */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                      Chave da Variável no FlowBuilder <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-gray-400 font-bold">
                          {'{'}
                        </span>
                        <input
                          type="text"
                          required
                          value={key}
                          onChange={(e) => setKey(formatKeySlug(e.target.value))}
                          placeholder="email_lead"
                          className="w-full pl-6 pr-6 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-gray-400 font-bold">
                          {'}'}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Tag que você usará no FlowBuilder: <strong className="font-mono text-purple-700">{`{${key || 'sua_variavel'}}`}</strong>
                    </p>
                  </div>

                  {/* Data Type & Default Value */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                        Tipo de Dado Base <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                      >
                        <option value="text">🔤 Texto (Padrão Alfanumérico)</option>
                        <option value="number">🔢 Número</option>
                        <option value="date">📅 Data</option>
                        <option value="select">📋 Seleção / Lista de Opções</option>
                        <option value="boolean">🔘 Booleano (Sim/Não)</option>
                      </select>
                    </div>

                    {/* Default Fallback Value */}
                    <div>
                      <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                        Valor Padrão (Fallback)
                      </label>
                      <input
                        type="text"
                        value={defaultValue}
                        onChange={(e) => setDefaultValue(e.target.value)}
                        placeholder="Ex: cliente@empresa.com, Geral..."
                        className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                      />
                    </div>
                  </div>

                  {/* Options for Select Type */}
                  {type === 'select' && (
                    <div>
                      <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                        Opções da Lista (separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        value={optionsString}
                        onChange={(e) => setOptionsString(e.target.value)}
                        placeholder="Ex: Moda Feminina, Calçados, Eletrônicos, Acessórios"
                        className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                      Descrição / Finalidade do Campo
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: Armazena o e-mail coletado durante o fluxo de qualificação para envio ao CRM..."
                      className="w-full p-2.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                    />
                  </div>

                  {/* Required Field Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div>
                      <span className="font-bold text-gray-800 block text-xs">Campo Obrigatório</span>
                      <span className="text-[11px] text-gray-500">O robô não avança no fluxo até o usuário fornecer um valor válido</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRequired}
                        onChange={(e) => setIsRequired(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0084FF]"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: REGEX VALIDATION & LIVE TEST BENCH */}
              {activeFormTab === 'validation' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1D21] mb-1.5">
                      Padrão de Validação Pré-Configurado (Regex Standard)
                    </label>
                    <select
                      value={validationType}
                      onChange={(e) => handleSelectValidationPreset(e.target.value as CustomFieldValidationType)}
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                    >
                      {Object.entries(VALIDATION_PRESETS).map(([k, preset]) => (
                        <option key={k} value={k}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                    {validationType !== 'none' && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        {VALIDATION_PRESETS[validationType]?.description}
                      </p>
                    )}
                  </div>

                  {/* Custom Regex Pattern and Flags */}
                  {validationType !== 'none' && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                          Expressão Regular (Regex) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono">/</span>
                          <input
                            type="text"
                            value={regexPattern}
                            onChange={(e) => setRegexPattern(e.target.value)}
                            placeholder="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                            className="w-full pl-6 pr-6 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono">/</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                          Flags (ex: i, m)
                        </label>
                        <input
                          type="text"
                          value={regexFlags}
                          onChange={(e) => setRegexFlags(e.target.value)}
                          placeholder="i"
                          className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Validation Error Message */}
                  {validationType !== 'none' && (
                    <div>
                      <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                        Mensagem de Erro Personalizada para o Usuário
                      </label>
                      <input
                        type="text"
                        value={validationErrorMessage}
                        onChange={(e) => setValidationErrorMessage(e.target.value)}
                        placeholder="Ex: Por favor, informe um endereço de e-mail válido (ex: contato@empresa.com)."
                        className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">
                        Esta mensagem é enviada automaticamente pelo bot caso a resposta do usuário não corresponda ao regex.
                      </p>
                    </div>
                  )}

                  {/* LIVE REGEX TESTER IN FORM */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bancada de Teste em Tempo Real:</span>
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Teste exemplos antes de salvar
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={liveTestValue}
                        onChange={(e) => setLiveTestValue(e.target.value)}
                        placeholder="Digite aqui um texto de teste (ex: cliente@dominio.com.br ou 11999998888)..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-[#1A1D21] font-mono focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                      />
                    </div>

                    {liveTestValue.trim() ? (
                      <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                        liveTestResult.isValid 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}>
                        <div className="flex items-center gap-2">
                          {liveTestResult.isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <div>
                            <span className="font-bold block">
                              {liveTestResult.isValid ? 'Padrão Válido!' : 'Padrão Inválido:'}
                            </span>
                            <span className="text-[11px] opacity-90">
                              {liveTestResult.isValid 
                                ? `Dado higienizado: "${liveTestResult.sanitizedValue}"` 
                                : liveTestResult.errorMessage}
                            </span>
                          </div>
                        </div>

                        {liveTestResult.isValid && (
                          <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 font-bold text-[10px]">
                            OK para CRM
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-500 italic">
                        Insira um valor acima para verificar se o regex e a mensagem de erro estão funcionando como esperado.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: EXTERNAL CRM INTEGRATION */}
              {activeFormTab === 'crm' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
                    <ExternalLink className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Padrão Consistente de Integração com CRM</span>
                      <p className="text-[11px] text-purple-800 mt-0.5">
                        Mapeie o nome do campo exatamente como o seu CRM ou ferramenta externa espera (ex: HubSpot, RD Station, ActiveCampaign ou Webhook JSON).
                      </p>
                    </div>
                  </div>

                  {/* CRM Platform Preset */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                      Plataforma de CRM Alvo
                    </label>
                    <select
                      value={crmPlatformPreset}
                      onChange={(e) => setCrmPlatformPreset(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                    >
                      {CRM_PLATFORMS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CRM Target Field Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                      Identificador / Nome do Campo no CRM
                    </label>
                    <input
                      type="text"
                      value={crmTargetField}
                      onChange={(e) => setCrmTargetField(e.target.value)}
                      placeholder="Ex: email, mobile_phone, cf_cpf, customer_company..."
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] text-gray-500 font-bold self-center">Sugestões rápidas:</span>
                      {COMMON_CRM_FIELDS.slice(0, 6).map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => setCrmTargetField(s.key)}
                          className="px-2 py-0.5 rounded bg-gray-100 hover:bg-purple-100 hover:text-purple-800 text-[10px] font-mono text-gray-700 border border-gray-200 transition-colors cursor-pointer"
                        >
                          {s.key}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Data Normalization Before Dispatch */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                      Regra de Higienização / Normalização do Dado
                    </label>
                    <select
                      value={normalizationRule}
                      onChange={(e) => setNormalizationRule(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                    >
                      <option value="none">Manter exatamente como digitado pelo seguidor</option>
                      <option value="lowercase">Converter tudo para minúsculo (Recomendado para e-mails)</option>
                      <option value="uppercase">Converter tudo para MAIÚSCULO (Recomendado para cupons/UF)</option>
                      <option value="digits_only">Remover pontuação / Apenas dígitos (Recomendado para WhatsApp, CPF e CNPJ)</option>
                      <option value="trim">Remover espaços excedentes nas pontas (Trim)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {activeFormTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => setActiveFormTab(activeFormTab === 'crm' ? 'validation' : 'basic')}
                      className="py-1.5 px-3 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      ← Voltar
                    </button>
                  )}
                  {activeFormTab !== 'crm' && (
                    <button
                      type="button"
                      onClick={() => setActiveFormTab(activeFormTab === 'basic' ? 'validation' : 'crm')}
                      className="py-1.5 px-3 rounded-lg text-xs font-semibold text-[#0084FF] hover:bg-blue-50 cursor-pointer flex items-center gap-1"
                    >
                      <span>Avançar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-2 px-4 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-gray-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn_submit_custom_field"
                    type="submit"
                    disabled={!name.trim() || !key.trim()}
                    className="py-2 px-5 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingFieldId ? 'Salvar Alterações' : 'Criar Campo Personalizado'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
