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
  Variable
} from 'lucide-react';
import { CustomFieldDefinition } from '../../types';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [type, setType] = useState<CustomFieldDefinition['type']>('text');
  const [description, setDescription] = useState('');
  const [defaultValue, setDefaultValue] = useState('');
  const [optionsString, setOptionsString] = useState('');

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

  const handleOpenCreateModal = () => {
    setEditingFieldId(null);
    setName('');
    setKey('');
    setType('text');
    setDescription('');
    setDefaultValue('');
    setOptionsString('');
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
            options: type === 'select' ? optionsString.split(',').map((s) => s.trim()).filter(Boolean) : undefined
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

  const filteredFields = customFields.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <span>Campos Personalizados (Custom Fields)</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                {customFields.length} {customFields.length === 1 ? 'campo' : 'campos'}
              </span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Crie variáveis personalizadas do lead para utilizar nos blocos de mensagem no FlowBuilder (ex: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-purple-700 font-bold">{`{data_nascimento}`}</code>, <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-purple-700 font-bold">{`{preferencia}`}</code>).
            </p>
          </div>
        </div>

        <button
          id="btn_create_custom_field"
          onClick={handleOpenCreateModal}
          className="py-2 px-4 rounded-lg bg-[#0084FF] hover:bg-[#0073E6] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Campo Personalizado</span>
        </button>
      </div>

      {/* Guide Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white border border-blue-200 text-[#0084FF] shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs">
            <span className="font-bold text-[#1A1D21] block">
              Como usar variáveis personalizadas no FlowBuilder:
            </span>
            <p className="text-[#64748B] leading-relaxed">
              Dentro de qualquer nó de mensagem no FlowBuilder, clique nos botões de tag ou digite <code className="font-mono bg-white px-1.5 py-0.5 rounded text-[#0084FF] border border-blue-200 font-bold">{`{chave_do_campo}`}</code>. Quando o robô enviar a DM no Instagram ou Messenger, a variável será substituída pelo dado real do seguidor!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-[11px] font-mono font-bold text-gray-700 shadow-xs">
            {`{first_name}`}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-purple-100 border border-purple-300 text-[11px] font-mono font-bold text-purple-900 shadow-xs">
            {`{data_nascimento}`}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-blue-100 border border-blue-300 text-[11px] font-mono font-bold text-blue-900 shadow-xs">
            {`{preferencia}`}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input_search_custom_fields"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do campo, variável {chave} ou descrição..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-xs text-[#1A1D21] focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
          />
        </div>
        <span className="text-xs text-[#64748B] shrink-0 font-medium">
          Exibindo {filteredFields.length} de {customFields.length}
        </span>
      </div>

      {/* Custom Fields Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <th className="py-3 px-4">Nome do Campo</th>
                <th className="py-3 px-4">Tag de Variável (FlowBuilder)</th>
                <th className="py-3 px-4">Tipo de Dado</th>
                <th className="py-3 px-4">Valor Padrão (Fallback)</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#1A1D21]">
              {filteredFields.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#64748B] space-y-2">
                    <p className="font-semibold text-sm">Nenhum campo personalizado encontrado</p>
                    <p className="text-xs">Clique no botão "Novo Campo Personalizado" acima para criar sua primeira variável.</p>
                  </td>
                </tr>
              ) : (
                filteredFields.map((field) => {
                  const typeInfo = TYPE_CONFIG[field.type] || TYPE_CONFIG.text;
                  const TypeIcon = typeInfo.icon;
                  const isCopied = copiedKey === field.key;

                  return (
                    <tr key={field.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-[#1A1D21]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#0084FF]" />
                          <span>{field.name}</span>
                        </div>
                      </td>

                      {/* Tag Variable with 1-Click Copy */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleCopyTag(field.key)}
                          title="Clique para copiar a tag da variável"
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

                      {/* Data Type */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typeInfo.bg} ${typeInfo.text} ${typeInfo.border}`}>
                          <TypeIcon className="w-3 h-3" />
                          <span>{typeInfo.label}</span>
                        </span>
                      </td>

                      {/* Default Value */}
                      <td className="py-3.5 px-4">
                        {field.defaultValue ? (
                          <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px] border border-gray-200">
                            {field.defaultValue}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Vazio</span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-[#64748B] max-w-xs truncate">
                        {field.description || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(field)}
                            title="Editar campo"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            id="modal_custom_field_form"
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E2E8F0] bg-[#F8F9FB] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                  <Variable className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1D21]">
                    {editingFieldId ? 'Editar Campo Personalizado' : 'Novo Campo Personalizado'}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Defina a variável para capturar dados ou usar nos fluxos de mensagem
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

            {/* Modal Form */}
            <form onSubmit={handleSaveField} className="p-6 space-y-4 text-xs">
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
                  placeholder="Ex: Data de Nascimento, Preferência de Produto, Cidade..."
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
                      placeholder="data_nascimento"
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

              {/* Data Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1A1D21] mb-1">
                    Tipo de Dado <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                  >
                    <option value="text">🔤 Texto</option>
                    <option value="number">🔢 Número</option>
                    <option value="date">📅 Data</option>
                    <option value="select">📋 Seleção / Lista</option>
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
                    placeholder="Ex: 15/05/1995, Geral..."
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
                  Descrição / Objetivo do Campo
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Armazena o nicho de maior interesse selecionado pelo seguidor no botão do direct..."
                  className="w-full p-2.5 rounded-lg bg-[#F8F9FB] border border-[#E2E8F0] text-[#1A1D21] text-xs focus:outline-none focus:ring-1 focus:ring-[#0084FF]"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1">
                <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Exemplo de Uso no FlowBuilder:
                </span>
                <p className="text-xs text-purple-950 font-mono leading-relaxed">
                  "Olá {`{first_name}`}! Notamos que seu interesse é por <strong className="text-purple-700 bg-white px-1 rounded border border-purple-300">{`{${key || 'variavel'}}`}</strong>. Preparamos uma oferta especial!"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
