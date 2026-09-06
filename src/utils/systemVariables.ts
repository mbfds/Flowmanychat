import { SystemVariable } from '../types';

export type { SystemVariable };

export const DEFAULT_SYSTEM_VARIABLES: SystemVariable[] = [
  {
    id: 'sys_var_business_hours',
    key: 'business_hours',
    name: 'Horário de Atendimento',
    value: 'Segunda a Sexta, das 09:00 às 18:00 (Sábado das 09:00 às 13:00)',
    category: 'operations',
    type: 'time_range',
    description: 'Horário oficial em que atendentes humanos estão disponíveis para suporte.',
    isSystemDefault: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'sys_var_default_currency',
    key: 'default_currency',
    name: 'Moeda Padrão',
    value: 'BRL (R$)',
    category: 'finance',
    type: 'currency',
    description: 'Moeda base utilizada nos preços, propostas e orçamentos enviados pelo bot.',
    isSystemDefault: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'sys_var_timezone',
    key: 'timezone',
    name: 'Fuso Horário',
    value: 'America/Sao_Paulo (GMT-3 - Horário de Brasília)',
    category: 'operations',
    type: 'timezone',
    description: 'Fuso horário de referência para agendamentos, atrasos (delays) e automações.',
    isSystemDefault: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'sys_var_company_name',
    key: 'company_name',
    name: 'Nome da Empresa / Marca',
    value: 'ManyFlow Soluções Digitais',
    category: 'brand',
    type: 'text',
    description: 'Nome comercial exibido nas saudações e assinaturas dos fluxos.',
    isSystemDefault: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'sys_var_support_email',
    key: 'support_email',
    name: 'E-mail de Suporte',
    value: 'suporte@manyflow.com.br',
    category: 'contact',
    type: 'email',
    description: 'Endereço de e-mail central para envio de dúvidas e escalonamento de tickets.',
    isSystemDefault: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'sys_var_whatsapp_number',
    key: 'whatsapp_number',
    name: 'WhatsApp Oficial de Transbordo',
    value: '+55 (11) 98765-4321',
    category: 'contact',
    type: 'phone',
    description: 'Número de WhatsApp corporativo para onde contatos podem ser redirecionados.',
    isSystemDefault: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'sys_var_website_url',
    key: 'website_url',
    name: 'Link do Site Oficial',
    value: 'https://manyflow.com.br',
    category: 'brand',
    type: 'url',
    description: 'Página web principal da empresa compartilhada em fluxos de boas-vindas.',
    isSystemDefault: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'sys_var_booking_link',
    key: 'booking_link',
    name: 'Link de Agendamento Online',
    value: 'https://cal.com/manyflow/agendamento',
    category: 'operations',
    type: 'url',
    description: 'URL direta para a agenda pública de reuniões, demonstrações ou consultas.',
    isSystemDefault: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'sys_var_response_sla',
    key: 'response_sla',
    name: 'Tempo Médio de Resposta (SLA)',
    value: 'Até 15 minutos em horário de atendimento',
    category: 'operations',
    type: 'text',
    description: 'Expectativa de tempo de resposta comunicada ao cliente durante transbordo humano.',
    isSystemDefault: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'sys_var_pix_key',
    key: 'pix_key',
    name: 'Chave PIX Oficial',
    value: 'financeiro@manyflow.com.br',
    category: 'finance',
    type: 'text',
    description: 'Chave PIX corporativa para fechamento instantâneo de pedidos e vendas.',
    isSystemDefault: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z'
  }
];

const STORAGE_KEY = 'manyflow_system_variables';

export const getSystemVariables = (): SystemVariable[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao carregar variáveis de sistema do localStorage:', e);
  }
  return DEFAULT_SYSTEM_VARIABLES;
};

export const saveSystemVariables = (variables: SystemVariable[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(variables));
    // Dispatch event so other components across the app update reactively
    window.dispatchEvent(new CustomEvent('manyflow_system_variables_updated', {
      detail: variables
    }));
  } catch (e) {
    console.error('Erro ao salvar variáveis de sistema no localStorage:', e);
  }
};

export const resetSystemVariables = (): SystemVariable[] => {
  saveSystemVariables(DEFAULT_SYSTEM_VARIABLES);
  return DEFAULT_SYSTEM_VARIABLES;
};

/**
 * Replaces both {{system.key}} and {system.key} placeholders in a given string.
 */
export const interpolateSystemVariables = (
  text: string,
  variables?: SystemVariable[]
): string => {
  if (!text) return '';
  const vars = variables || getSystemVariables();

  let interpolated = text;
  vars.forEach((v) => {
    // Matches {{system.key}} or {system.key}
    const doubleRegex = new RegExp(`\\{\\{system\\.${v.key}\\}\\}`, 'gi');
    const singleRegex = new RegExp(`\\{system\\.${v.key}\\}`, 'gi');
    interpolated = interpolated.replace(doubleRegex, v.value).replace(singleRegex, v.value);
  });

  return interpolated;
};

export const getSystemVariableTag = (key: string, format: 'double' | 'single' = 'double'): string => {
  return format === 'double' ? `{{system.${key}}}` : `{system.${key}}`;
};
