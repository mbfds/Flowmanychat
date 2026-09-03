import { CustomFieldDefinition, CustomFieldValidationType } from '../types';

export interface ValidationPresetInfo {
  type: CustomFieldValidationType;
  label: string;
  category: 'contato' | 'documento' | 'localizacao' | 'formatos' | 'geral';
  defaultRegex: string;
  defaultErrorMessage: string;
  exampleValidValue: string;
  crmTargetSuggestion: string;
  description: string;
}

export const VALIDATION_PRESETS: Record<CustomFieldValidationType, ValidationPresetInfo> = {
  none: {
    type: 'none',
    label: 'Texto Livre (Sem Validação)',
    category: 'geral',
    defaultRegex: '',
    defaultErrorMessage: '',
    exampleValidValue: 'Qualquer texto ou resposta digitada pelo usuário',
    crmTargetSuggestion: '',
    description: 'Permite qualquer valor alfanumérico digitado pelo seguidor.'
  },
  email: {
    type: 'email',
    label: 'E-mail Válido (RFC 5322)',
    category: 'contato',
    defaultRegex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    defaultErrorMessage: 'Por favor, digite um e-mail válido (ex: contato@seudominio.com).',
    exampleValidValue: 'cliente.vip@empresa.com.br',
    crmTargetSuggestion: 'email',
    description: 'Valida sintaxe de e-mail com usuário, @ e domínio corporativo/pessoal.'
  },
  phone_br: {
    type: 'phone_br',
    label: 'Telefone Celular Brasil (DDD + 9 Dígitos)',
    category: 'contato',
    defaultRegex: '^(\\+?55\\s?)?(\\(?\\d{2}\\)?\\s?)?(9?\\d{4}[-\\s]?\\d{4})$',
    defaultErrorMessage: 'Informe um número com DDD válido (ex: (11) 99876-5432).',
    exampleValidValue: '(11) 98765-4321',
    crmTargetSuggestion: 'mobile_phone',
    description: 'Aceita telefones com ou sem +55, parênteses e hífen no formato brasileiro.'
  },
  phone_e164: {
    type: 'phone_e164',
    label: 'Telefone Internacional E.164 (+DDI)',
    category: 'contato',
    defaultRegex: '^\\+[1-9]\\d{1,14}$',
    defaultErrorMessage: 'Informe o telefone no formato internacional E.164 (ex: +5511987654321).',
    exampleValidValue: '+5511987654321',
    crmTargetSuggestion: 'phone_e164',
    description: 'Padrão global exigido pela Meta Cloud API, WhatsApp e CRMs internacionais.'
  },
  cpf: {
    type: 'cpf',
    label: 'CPF (Pessoa Física Brasil)',
    category: 'documento',
    defaultRegex: '^\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}$',
    defaultErrorMessage: 'Informe um CPF válido com 11 dígitos (ex: 123.456.789-00).',
    exampleValidValue: '123.456.789-00',
    crmTargetSuggestion: 'cpf_document',
    description: 'Aceita CPF com ou sem pontuação (pontos e traço).'
  },
  cnpj: {
    type: 'cnpj',
    label: 'CNPJ (Pessoa Jurídica Brasil)',
    category: 'documento',
    defaultRegex: '^\\d{2}\\.?\\d{3}\\.?\\d{3}\\/?\\d{4}-?\\d{2}$',
    defaultErrorMessage: 'Informe um CNPJ válido com 14 dígitos (ex: 12.345.678/0001-90).',
    exampleValidValue: '12.345.678/0001-90',
    crmTargetSuggestion: 'cnpj_document',
    description: 'Aceita CNPJ com ou sem barra e pontuação comercial.'
  },
  cep: {
    type: 'cep',
    label: 'CEP (Código Postal Brasil)',
    category: 'localizacao',
    defaultRegex: '^\\d{5}-?\\d{3}$',
    defaultErrorMessage: 'Informe um CEP válido com 8 dígitos (ex: 01310-100).',
    exampleValidValue: '01310-100',
    crmTargetSuggestion: 'postal_code',
    description: 'Padrão dos Correios do Brasil com 5 dígitos + hífen + 3 dígitos.'
  },
  url: {
    type: 'url',
    label: 'Link / URL Web (http/https)',
    category: 'formatos',
    defaultRegex: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
    defaultErrorMessage: 'Digite um link web válido iniciando com http:// ou https://',
    exampleValidValue: 'https://suaempresa.com.br/catalogo',
    crmTargetSuggestion: 'website',
    description: 'Garante que o seguidor digitou um endereço web com protocolo seguro.'
  },
  date_iso: {
    type: 'date_iso',
    label: 'Data (DD/MM/AAAA ou AAAA-MM-DD)',
    category: 'formatos',
    defaultRegex: '^(\\d{4}-\\d{2}-\\d{2}|\\d{2}\\/\\d{2}\\/\\d{4})$',
    defaultErrorMessage: 'Informe uma data válida no formato DD/MM/AAAA ou AAAA-MM-DD.',
    exampleValidValue: '25/12/1990',
    crmTargetSuggestion: 'birthdate',
    description: 'Formatos universais de calendário para cálculo de idade e agendamentos.'
  },
  currency: {
    type: 'currency',
    label: 'Moeda / Valor Monetário (R$)',
    category: 'formatos',
    defaultRegex: '^R?\\$?\\s?\\d+(\\.\\d{3})*(,\\d{2})?$|^\\d+(\\.\\d{2})?$',
    defaultErrorMessage: 'Informe um valor numérico válido (ex: 150,00 ou 1500.50).',
    exampleValidValue: 'R$ 1.450,00',
    crmTargetSuggestion: 'deal_value',
    description: 'Valida valores financeiros em formato Real (R$) ou decimal padrão.'
  },
  number_only: {
    type: 'number_only',
    label: 'Apenas Números Inteiros (Dígitos)',
    category: 'formatos',
    defaultRegex: '^\\d+$',
    defaultErrorMessage: 'Digite apenas números sem letras ou símbolos.',
    exampleValidValue: '450',
    crmTargetSuggestion: 'quantity',
    description: 'Permite unicamente caracteres numéricos (0 a 9).'
  },
  custom_regex: {
    type: 'custom_regex',
    label: 'Expressão Regular Personalizada (Regex Custom)',
    category: 'geral',
    defaultRegex: '',
    defaultErrorMessage: 'O valor digitado não corresponde ao padrão exigido.',
    exampleValidValue: '',
    crmTargetSuggestion: 'custom_field',
    description: 'Defina sua própria regra com regex padrão JavaScript e flags.'
  }
};

export const CRM_PLATFORMS = [
  { id: 'rd_station', name: 'RD Station Marketing / CRM', iconColor: 'text-emerald-600' },
  { id: 'hubspot', name: 'HubSpot CRM', iconColor: 'text-orange-500' },
  { id: 'active_campaign', name: 'ActiveCampaign', iconColor: 'text-blue-600' },
  { id: 'salesforce', name: 'Salesforce', iconColor: 'text-sky-500' },
  { id: 'pipedrive', name: 'Pipedrive', iconColor: 'text-green-600' },
  { id: 'generic', name: 'Webhook REST / JSON Genérico', iconColor: 'text-purple-600' }
] as const;

export const COMMON_CRM_FIELDS = [
  { key: 'email', label: 'E-mail Principal', category: 'contato' },
  { key: 'mobile_phone', label: 'Celular / WhatsApp', category: 'contato' },
  { key: 'phone', label: 'Telefone Fixo / Comercial', category: 'contato' },
  { key: 'first_name', label: 'Primeiro Nome', category: 'perfil' },
  { key: 'last_name', label: 'Sobrenome', category: 'perfil' },
  { key: 'company_name', label: 'Nome da Empresa', category: 'empresa' },
  { key: 'job_title', label: 'Cargo / Ocupação', category: 'empresa' },
  { key: 'city', label: 'Cidade', category: 'localizacao' },
  { key: 'state', label: 'Estado (UF)', category: 'localizacao' },
  { key: 'postal_code', label: 'CEP / Código Postal', category: 'localizacao' },
  { key: 'cpf_document', label: 'CPF do Titular', category: 'fiscal' },
  { key: 'cnpj_document', label: 'CNPJ da Empresa', category: 'fiscal' },
  { key: 'website', label: 'Site / URL', category: 'empresa' },
  { key: 'lead_score', label: 'Score do Lead', category: 'vendas' },
  { key: 'deal_value', label: 'Valor da Oportunidade', category: 'vendas' }
];

export function validateCustomFieldValue(
  field: CustomFieldDefinition,
  inputValue: string
): { isValid: boolean; errorMessage?: string; sanitizedValue: string } {
  const value = inputValue ?? '';
  const trimmed = value.trim();

  // If empty and not required
  if (!trimmed) {
    if (field.isRequired) {
      return {
        isValid: false,
        errorMessage: 'Este campo é obrigatório.',
        sanitizedValue: ''
      };
    }
    return {
      isValid: true,
      sanitizedValue: ''
    };
  }

  // Determine regex pattern
  let pattern = field.regexPattern;
  if (!pattern && field.validationType && field.validationType !== 'none' && field.validationType !== 'custom_regex') {
    pattern = VALIDATION_PRESETS[field.validationType]?.defaultRegex;
  }

  // If pattern exists, test it
  if (pattern) {
    try {
      const reg = new RegExp(pattern, field.regexFlags || 'i');
      const matches = reg.test(trimmed);
      if (!matches) {
        return {
          isValid: false,
          errorMessage:
            field.validationErrorMessage ||
            (field.validationType ? VALIDATION_PRESETS[field.validationType]?.defaultErrorMessage : null) ||
            'Valor não atende ao padrão de validação.',
          sanitizedValue: trimmed
        };
      }
    } catch {
      // Invalid regex pattern configuration
      return {
        isValid: false,
        errorMessage: 'Erro na sintaxe da expressão regular configurada.',
        sanitizedValue: trimmed
      };
    }
  }

  // Apply normalization rule
  let sanitized = trimmed;
  if (field.normalizationRule === 'lowercase') {
    sanitized = sanitized.toLowerCase();
  } else if (field.normalizationRule === 'uppercase') {
    sanitized = sanitized.toUpperCase();
  } else if (field.normalizationRule === 'digits_only') {
    sanitized = sanitized.replace(/\D/g, '');
  }

  return {
    isValid: true,
    sanitizedValue: sanitized
  };
}
