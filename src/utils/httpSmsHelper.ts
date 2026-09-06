import { 
  HttpSmsConfig, 
  HttpSmsDeviceStatus, 
  HttpSmsMessage 
} from '../types';

const HTTPSMS_CONFIG_KEY = 'manyflow_httpsms_config_v1';
const HTTPSMS_DEVICE_KEY = 'manyflow_httpsms_device_v1';
const HTTPSMS_MESSAGES_KEY = 'manyflow_httpsms_messages_v1';

export const DEFAULT_HTTPSMS_CONFIG: HttpSmsConfig = {
  gatewayUrl: 'https://api.httpsms.com/v1',
  apiKey: 'hsk_live_98a72b4c10df8e3a',
  defaultSenderNumber: '+55 11 98765-4321',
  webhookUrl: 'https://app.manyflow.io/api/v1/webhooks/httpsms',
  defaultSimSlot: 1,
  retryAttempts: 3,
  delayBetweenMessagesSeconds: 2,
  isEnabled: true,
  autoSyncWithLiveChat: true,
  // CRM Forwarding & Lead Generation
  forwardInboundToCrm: true,
  crmAutoCreateLead: true,
  crmDefaultTag: 'Origem-SMS-Android',
  crmLeadStage: 'Novos Leads',
  crmNotifyResponsible: true,
  crmWebhookForwardUrl: '',
  crmAssignToUserId: 'usr_admin',
  forwardedToCrmCount: 18
};

export const DEFAULT_HTTPSMS_DEVICE: HttpSmsDeviceStatus = {
  isConnected: true,
  deviceName: 'Samsung Galaxy S22 Ultra (Android 14)',
  batteryLevel: 91,
  isBatteryCharging: true,
  networkType: 'WIFI',
  signalStrength: 5,
  activeSimSlot: 1,
  sim1Number: '+55 11 98765-4321',
  sim1Carrier: 'Vivo 5G',
  sim2Number: '+55 11 91234-5678',
  sim2Carrier: 'Claro BR',
  lastHeartbeat: new Date().toISOString(),
  appVersion: 'v1.8.2'
};

export const DEFAULT_HTTPSMS_MESSAGES: HttpSmsMessage[] = [
  {
    id: 'sms_msg_1',
    direction: 'outbound',
    from: '+55 11 98765-4321',
    to: '+55 11 99882-1100',
    content: 'Olá Camila! Seu agendamento para Demonstração do ManyFlow foi confirmado para amanhã às 14:00. Responda SIM para confirmar.',
    status: 'DELIVERED',
    simSlot: 1,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    contactId: 'c1',
    contactName: 'Camila Rocha'
  },
  {
    id: 'sms_msg_2',
    direction: 'inbound',
    from: '+55 11 99882-1100',
    to: '+55 11 98765-4321',
    content: 'SIM, confirmado! Estarei presente.',
    status: 'DELIVERED',
    simSlot: 1,
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    contactId: 'c1',
    contactName: 'Camila Rocha'
  },
  {
    id: 'sms_msg_3',
    direction: 'outbound',
    from: '+55 11 98765-4321',
    to: '+55 21 97711-2233',
    content: 'Rafael, seu código de verificação Pix para ativação do Plano Pro é: 849-210. Válido por 15 minutos.',
    status: 'DELIVERED',
    simSlot: 1,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    contactId: 'c2',
    contactName: 'Rafael Silva'
  },
  {
    id: 'sms_msg_4',
    direction: 'outbound',
    from: '+55 11 98765-4321',
    to: '+55 31 98844-5566',
    content: 'Aviso ManyFlow: Detectamos 12 novos leads aguardando atendimento no seu Instagram Direct. Acesse o painel para responder.',
    status: 'SENT',
    simSlot: 1,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    contactId: 'c3',
    contactName: 'Juliana Mendes'
  }
];

export function loadHttpSmsConfig(): HttpSmsConfig {
  try {
    const raw = localStorage.getItem(HTTPSMS_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading HttpSMS config:', e);
  }
  return DEFAULT_HTTPSMS_CONFIG;
}

export function saveHttpSmsConfig(config: HttpSmsConfig): void {
  try {
    localStorage.setItem(HTTPSMS_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving HttpSMS config:', e);
  }
}

export function loadHttpSmsDevice(): HttpSmsDeviceStatus {
  try {
    const raw = localStorage.getItem(HTTPSMS_DEVICE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading HttpSMS device:', e);
  }
  return DEFAULT_HTTPSMS_DEVICE;
}

export function saveHttpSmsDevice(device: HttpSmsDeviceStatus): void {
  try {
    localStorage.setItem(HTTPSMS_DEVICE_KEY, JSON.stringify(device));
  } catch (e) {
    console.error('Error saving HttpSMS device:', e);
  }
}

export function loadHttpSmsMessages(): HttpSmsMessage[] {
  try {
    const raw = localStorage.getItem(HTTPSMS_MESSAGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading HttpSMS messages:', e);
  }
  return DEFAULT_HTTPSMS_MESSAGES;
}

export function saveHttpSmsMessages(messages: HttpSmsMessage[]): void {
  try {
    localStorage.setItem(HTTPSMS_MESSAGES_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Error saving HttpSMS messages:', e);
  }
}

export function sendHttpSmsMessage(params: {
  to: string;
  content: string;
  contactId?: string;
  contactName?: string;
  simSlot?: 1 | 2;
}): HttpSmsMessage {
  const config = loadHttpSmsConfig();
  const newMsg: HttpSmsMessage = {
    id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    direction: 'outbound',
    from: config.defaultSenderNumber,
    to: params.to,
    content: params.content,
    status: 'DELIVERED', // Simulated instant transmission via Android Phone
    simSlot: params.simSlot || config.defaultSimSlot,
    timestamp: new Date().toISOString(),
    contactId: params.contactId,
    contactName: params.contactName
  };

  const currentList = loadHttpSmsMessages();
  saveHttpSmsMessages([newMsg, ...currentList]);
  return newMsg;
}
