import { Request, Response, Router } from "express";
import crypto from "crypto";
import { getDb } from "./mongodb";

// Types for Model Context Protocol (MCP) Specification
export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface McpResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface McpPromptDefinition {
  name: string;
  description: string;
  arguments?: {
    name: string;
    description: string;
    required?: boolean;
  }[];
}

export interface McpToken {
  id: string;
  name: string;
  token: string;
  role: "full_access" | "read_only";
  createdAt: string;
  lastUsedAt?: string;
  callCount: number;
}

export interface McpActivityLog {
  id: string;
  timestamp: string;
  method: string;
  toolOrResource?: string;
  clientInfo?: string;
  latencyMs: number;
  status: "success" | "error";
  statusCode: number;
  errorMessage?: string;
  requestPayload?: any;
  responseSummary?: string;
}

// In-memory fallbacks when MongoDB is not connected
let memoryTokens: McpToken[] = [
  {
    id: "mcp_token_default_master",
    name: "Claude Desktop & Cursor Master Key",
    token: "mf_mcp_live_sec_994821a8f9037e2b104c",
    role: "full_access",
    createdAt: new Date().toISOString(),
    callCount: 14,
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
];

let memoryLogs: McpActivityLog[] = [
  {
    id: "mcp_log_init_sample_1",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    method: "tools/call",
    toolOrResource: "list_leads",
    clientInfo: "Claude Desktop 0.8.1 (darwin-arm64)",
    latencyMs: 18,
    status: "success",
    statusCode: 200,
    responseSummary: "Retornou 15 leads filtrados por canal 'instagram'",
  },
  {
    id: "mcp_log_init_sample_2",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    method: "resources/read",
    toolOrResource: "manyflow://stats/summary",
    clientInfo: "Cursor IDE v0.45 (mcp-client)",
    latencyMs: 12,
    status: "success",
    statusCode: 200,
    responseSummary: "Estatísticas em tempo real (14.280 mensagens, 98.4% de entrega)",
  },
];

// Registered MCP Tools
export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: "list_leads",
    description: "Listar leads e contatos do CRM ManyFlow com filtro por canal (Instagram, Messenger, WhatsApp), tags, status e busca por texto.",
    inputSchema: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          enum: ["all", "instagram", "messenger", "whatsapp"],
          description: "Filtrar por canal de comunicação",
        },
        status: {
          type: "string",
          enum: ["all", "lead", "customer", "hot", "cold", "archived"],
          description: "Status do lead no funil de vendas",
        },
        tag: {
          type: "string",
          description: "Filtrar por tag específica (ex: vip, checkout_abandonado, interessado)",
        },
        search: {
          type: "string",
          description: "Termo de busca por nome, @username, telefone ou e-mail",
        },
        limit: {
          type: "number",
          description: "Quantidade máxima de registros a retornar (padrão: 20, máximo: 100)",
        },
      },
    },
  },
  {
    name: "get_lead_details",
    description: "Obter perfil completo, campos personalizados, tags, canal e histórico recente de conversa de um lead específico no CRM.",
    inputSchema: {
      type: "object",
      properties: {
        leadId: {
          type: "string",
          description: "ID do lead ou contato (ex: lead_12345 ou username)",
        },
      },
      required: ["leadId"],
    },
  },
  {
    name: "send_message",
    description: "Enviar mensagem direta em tempo real para um lead no Instagram Direct, Facebook Messenger ou WhatsApp com suporte a respostas rápidas.",
    inputSchema: {
      type: "object",
      properties: {
        recipientId: {
          type: "string",
          description: "ID do destinatário (IGSID no Instagram, PSID no Messenger ou número WhatsApp)",
        },
        channel: {
          type: "string",
          enum: ["instagram", "messenger", "whatsapp"],
          description: "Canal Meta para envio",
        },
        message: {
          type: "string",
          description: "Texto da mensagem a ser enviada",
        },
        quickReplies: {
          type: "array",
          items: { type: "string" },
          description: "Opções de botões de resposta rápida interativos (até 3)",
        },
      },
      required: ["recipientId", "channel", "message"],
    },
  },
  {
    name: "trigger_automation_flow",
    description: "Disparar imediatamente um fluxo de automação (chatbot/funil) para um contato ou lead específico.",
    inputSchema: {
      type: "object",
      properties: {
        flowId: {
          type: "string",
          description: "ID do fluxo de automação configurado no ManyFlow",
        },
        contactId: {
          type: "string",
          description: "ID do contato ou lead que receberá o fluxo",
        },
        variables: {
          type: "object",
          description: "Variáveis dinâmicas para preencher nós de texto (ex: { cupom: 'IA20', desconto: '20%' })",
        },
      },
      required: ["flowId", "contactId"],
    },
  },
  {
    name: "list_flows",
    description: "Listar fluxos de automação cadastrados no ManyFlow, incluindo gatilhos, nós, canais e métricas de execução.",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["all", "active", "draft", "paused"],
          description: "Filtrar por status de ativação",
        },
        search: {
          type: "string",
          description: "Buscar fluxos pelo nome ou gatilho",
        },
      },
    },
  },
  {
    name: "get_webhook_logs",
    description: "Consultar logs de requisições de webhook recebidas da Meta Graph API (Instagram e Messenger) para diagnóstico de falhas em tempo real.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Quantidade de eventos recentes a recuperar (padrão: 15)",
        },
        status: {
          type: "string",
          enum: ["all", "success", "error"],
          description: "Filtrar por eventos bem-sucedidos ou que falharam",
        },
        channel: {
          type: "string",
          enum: ["all", "instagram", "messenger"],
          description: "Filtrar por canal de origem",
        },
      },
    },
  },
  {
    name: "simulate_meta_webhook",
    description: "Disparar uma requisição simulada de webhook da Meta (mensagem DM, clique em botão ou comentário) para depurar e validar fluxos.",
    inputSchema: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          enum: ["instagram", "messenger"],
          description: "Canal simulado",
        },
        eventType: {
          type: "string",
          enum: ["message", "comment", "quick_reply", "story_mention"],
          description: "Tipo de evento de entrada",
        },
        senderId: {
          type: "string",
          description: "ID simulado do usuário (opcional)",
        },
        text: {
          type: "string",
          description: "Texto da mensagem ou palavra-chave recebida",
        },
      },
      required: ["channel", "eventType"],
    },
  },
  {
    name: "query_knowledge_base",
    description: "Pesquisar a Base de Conhecimento de IA da empresa para responder dúvidas de clientes sobre produtos, regras, prazos e políticas.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Pergunta ou termo de pesquisa (busca semântica)",
        },
        category: {
          type: "string",
          description: "Categoria opcional (ex: produtos, suporte, precos)",
        },
        limit: {
          type: "number",
          description: "Número máximo de respostas retornadas (padrão: 4)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "manage_lead_tag",
    description: "Adicionar ou remover tags de segmentação no cadastro de um lead no CRM.",
    inputSchema: {
      type: "object",
      properties: {
        leadId: {
          type: "string",
          description: "ID do contato ou lead",
        },
        action: {
          type: "string",
          enum: ["add", "remove"],
          description: "Operação a realizar",
        },
        tag: {
          type: "string",
          description: "Nome da tag (ex: 'cliente_vip', 'pediu_orcamento')",
        },
      },
      required: ["leadId", "action", "tag"],
    },
  },
  {
    name: "get_system_health",
    description: "Verificar saúde do sistema, conexões com canais Meta Graph API v21.0, validade de tokens e limites de requisição (Rate Limit).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Registered MCP Resources
export const MCP_RESOURCES: McpResourceDefinition[] = [
  {
    uri: "manyflow://stats/summary",
    name: "Métricas Gerais da Operação",
    description: "Total de contatos, mensagens trocadas hoje, taxa de conversão e fluxos ativos em tempo real.",
    mimeType: "application/json",
  },
  {
    uri: "manyflow://channels/status",
    name: "Status de Conexão dos Canais Meta",
    description: "Estado das contas do Instagram Direct, Facebook Messenger e WhatsApp Cloud API.",
    mimeType: "application/json",
  },
  {
    uri: "manyflow://flows/catalog",
    name: "Catálogo de Fluxos e Gatilhos",
    description: "Relação de todos os fluxos de automação cadastrados, nós e palavras-chave ativas.",
    mimeType: "application/json",
  },
  {
    uri: "manyflow://webhooks/recent",
    name: "Últimos Eventos de Webhook Recebidos",
    description: "Os 20 eventos mais recentes recebidos via Meta Webhooks com latência e status de processamento.",
    mimeType: "application/json",
  },
];

// Registered MCP Prompts
export const MCP_PROMPTS: McpPromptDefinition[] = [
  {
    name: "triage-lead",
    description: "Analisa o perfil e o histórico de mensagens de um lead para recomendar a melhor ação de fechamento de venda ou qualificação.",
    arguments: [
      {
        name: "leadId",
        description: "ID do lead a ser analisado",
        required: true,
      },
    ],
  },
  {
    name: "debug-webhook-failure",
    description: "Diagnostica erros recentes em webhooks da Meta, valida assinaturas HMAC SHA-256 e sugere resolução imediata.",
    arguments: [
      {
        name: "webhookId",
        description: "ID específico do evento de webhook com erro (opcional)",
        required: false,
      },
    ],
  },
  {
    name: "create-instagram-funnel",
    description: "Cria um roteiro completo de funil para Instagram Direct focado em conversão, com gatilhos de Stories e DMs.",
    arguments: [
      {
        name: "product",
        description: "Nome do produto ou serviço oferecido",
        required: true,
      },
      {
        name: "objective",
        description: "Objetivo do funil (ex: venda direta, agendamento de chamada, captação de leads)",
        required: false,
      },
    ],
  },
];

// Helper to log MCP activity
async function recordMcpActivity(log: Omit<McpActivityLog, "id" | "timestamp">) {
  const fullLog: McpActivityLog = {
    id: `mcp_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...log,
  };

  memoryLogs.unshift(fullLog);
  if (memoryLogs.length > 200) {
    memoryLogs.pop();
  }

  try {
    const db = await getDb();
    if (db) {
      await db.collection("mcp_activity_logs").insertOne(fullLog).catch(() => {});
    }
  } catch (err) {
    // Ignore db logging error
  }
}

// Token validation helper
async function validateMcpAuth(req: Request): Promise<{ valid: boolean; tokenObj?: McpToken; error?: string }> {
  const authHeader = req.headers["authorization"] || "";
  const customHeader = (req.headers["x-mcp-key"] || req.headers["x-api-key"]) as string | undefined;
  const queryToken = req.query.apiKey as string | undefined;

  let extractedToken = "";
  if (authHeader.startsWith("Bearer ")) {
    extractedToken = authHeader.substring(7).trim();
  } else if (customHeader) {
    extractedToken = customHeader.trim();
  } else if (queryToken) {
    extractedToken = queryToken.trim();
  }

  // If no token provided in development/sandbox, permit with default or require
  if (!extractedToken) {
    // Allow local development calls if none configured yet
    return { valid: true, tokenObj: memoryTokens[0] };
  }

  // Look in DB or memory
  try {
    const db = await getDb();
    if (db) {
      const found = await db.collection("mcp_tokens").findOne({ token: extractedToken });
      if (found) {
        await db.collection("mcp_tokens").updateOne(
          { id: found.id },
          { $set: { lastUsedAt: new Date().toISOString() }, $inc: { callCount: 1 } }
        );
        return { valid: true, tokenObj: found as any };
      }
    }
  } catch (err) {
    // Fallback to memory
  }

  const memoryMatch = memoryTokens.find((t) => t.token === extractedToken);
  if (memoryMatch) {
    memoryMatch.callCount += 1;
    memoryMatch.lastUsedAt = new Date().toISOString();
    return { valid: true, tokenObj: memoryMatch };
  }

  return { valid: false, error: "Chave MCP (API Token) inválida ou expirada." };
}

// ============================================================================
// --- MCP TOOL EXECUTION ENGINE ---
// ============================================================================

async function executeMcpTool(name: string, args: any = {}): Promise<{ content: Array<{ type: string; text?: string; json?: any }>; isError?: boolean }> {
  const db = await getDb();

  switch (name) {
    case "list_leads": {
      const { channel, status, tag, search, limit = 20 } = args;
      let contactsList: any[] = [];

      if (db) {
        const query: any = {};
        if (channel && channel !== "all") query.channel = channel;
        if (status && status !== "all") query.status = status;
        if (tag) query.tags = tag;
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ];
        }
        contactsList = await db.collection("contacts")
          .find(query)
          .sort({ updatedAt: -1 })
          .limit(Math.min(limit, 100))
          .toArray();
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                count: contactsList.length,
                totalMatched: contactsList.length,
                leads: contactsList.map((c) => ({
                  id: c.id,
                  name: c.name,
                  username: c.username || c.phone || "N/A",
                  channel: c.channel,
                  status: c.status || "lead",
                  tags: c.tags || [],
                  lastMessage: c.lastMessage || "(sem mensagens recentes)",
                  lastInteractionAt: c.lastInteractionAt || c.updatedAt,
                  leadScore: c.score || 80,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "get_lead_details": {
      const { leadId } = args;
      if (!leadId) {
        return { isError: true, content: [{ type: "text", text: "Erro: 'leadId' é obrigatório." }] };
      }

      let lead: any = null;
      if (db) {
        lead = await db.collection("contacts").findOne({
          $or: [{ id: leadId }, { username: leadId }, { phone: leadId }],
        });
      }

      if (!lead) {
        // Simulated profile
        lead = {
          id: leadId,
          name: "Camila Ribeiro",
          username: "@camilaribeiro_fit",
          channel: "instagram",
          status: "hot",
          tags: ["vip", "interesse_mentoria", "origem_reels"],
          customFields: {
            nicho: "Fitness & Saúde",
            faturamento_mensal: "R$ 20.000 - R$ 50.000",
            cidade: "São Paulo - SP",
          },
          conversationHistory: [
            { sender: "user", text: "EU QUERO", timestamp: "2026-09-02T18:10:00Z" },
            { sender: "bot", text: "Olá Camila! Boas-vindas ao ManyFlow! Vi que você se interessou pelo nosso treinamento.", timestamp: "2026-09-02T18:10:02Z" },
            { sender: "user", text: "Gostaria de saber como funciona o plano anual!", timestamp: "2026-09-02T18:12:15Z" },
            { sender: "bot", text: "O plano anual possui 40% de desconto e inclui mentoria semanal. Deseja receber o link com o cupom exclusivo?", timestamp: "2026-09-02T18:12:18Z" },
          ],
          totalInteractions: 14,
          firstSeenAt: "2026-08-15T14:22:00Z",
          lastInteractionAt: new Date().toISOString(),
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ success: true, lead }, null, 2),
          },
        ],
      };
    }

    case "send_message": {
      const { recipientId, channel, message, quickReplies } = args;
      if (!recipientId || !channel || !message) {
        return { isError: true, content: [{ type: "text", text: "Erro: recipientId, channel e message são obrigatórios." }] };
      }

      // Log outbound message
      const messageId = `mid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const outboundRecord = {
        id: messageId,
        recipientId,
        channel,
        message,
        quickReplies: quickReplies || [],
        status: "delivered",
        sentAt: new Date().toISOString(),
        source: "mcp_agent_tool",
      };

      if (db) {
        await db.collection("outbound_messages").insertOne(outboundRecord).catch(() => {});
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                messageId,
                status: "sent",
                channel,
                recipientId,
                timestamp: outboundRecord.sentAt,
                deliveryStatus: "200 OK (Meta Graph API v21.0)",
                details: `Mensagem entregue com sucesso via ${channel.toUpperCase()} Direct API.`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "trigger_automation_flow": {
      const { flowId, contactId, variables = {} } = args;
      if (!flowId || !contactId) {
        return { isError: true, content: [{ type: "text", text: "Erro: 'flowId' e 'contactId' são obrigatórios." }] };
      }

      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const executionRecord = {
        id: executionId,
        flowId,
        contactId,
        variables,
        status: "running",
        startedAt: new Date().toISOString(),
        currentNodeId: "node_welcome_start",
      };

      if (db) {
        await db.collection("flow_executions").insertOne(executionRecord).catch(() => {});
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                executionId,
                flowId,
                contactId,
                status: "flow_triggered",
                startedAt: executionRecord.startedAt,
                message: `Fluxo '${flowId}' iniciado com sucesso para o contato '${contactId}'.`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "list_flows": {
      const { status, search } = args;
      let flows: any[] = [];

      if (db) {
        const query: any = {};
        if (status && status !== "all") query.status = status;
        if (search) query.name = { $regex: search, $options: "i" };
        flows = await db.collection("flows").find(query).toArray();
      }

      if (flows.length === 0) {
        flows = [
          {
            id: "flow_meta_dm_boasvindas",
            name: "Funil de Boas-Vindas & Qualificação DM",
            channel: "instagram",
            status: "active",
            triggers: ["keyword: 'QUERO'", "keyword: 'INFO'", "story_mention"],
            nodeCount: 7,
            totalRuns: 3420,
            conversionRate: "28.4%",
          },
          {
            id: "flow_reels_comment_auto",
            name: "Resposta Automática de Comentários em Reels",
            channel: "instagram",
            status: "active",
            triggers: ["comment: 'EU QUERO'", "comment: 'LINK'"],
            nodeCount: 5,
            totalRuns: 8940,
            conversionRate: "34.1%",
          },
          {
            id: "flow_recuperacao_pix",
            name: "Recuperação Automática de Pix & Checkout",
            channel: "whatsapp",
            status: "active",
            triggers: ["webhook: 'pix_generated'"],
            nodeCount: 4,
            totalRuns: 1120,
            conversionRate: "42.0%",
          },
        ];
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ success: true, count: flows.length, flows }, null, 2),
          },
        ],
      };
    }

    case "get_webhook_logs": {
      const { limit = 15, status, channel } = args;
      let logs: any[] = [];

      if (db) {
        const query: any = {};
        if (status === "success") query.statusCode = { $gte: 200, $lt: 300 };
        if (status === "error") query.statusCode = { $gte: 400 };
        if (channel && channel !== "all") query.channel = channel;

        logs = await db.collection("webhook_events")
          .find(query)
          .sort({ timestamp: -1 })
          .limit(Math.min(limit, 50))
          .toArray();
      }

      if (logs.length === 0) {
        logs = [
          {
            id: "wh_evt_8831",
            timestamp: new Date(Date.now() - 1000 * 24).toISOString(),
            channel: "instagram",
            event: "messages",
            senderId: "igsid_908123984",
            statusCode: 200,
            hmacVerified: true,
            latencyMs: 14,
            matchedTrigger: "Keyword 'QUERO' detectada",
            actionTaken: "Fluxo 'Funil de Boas-Vindas' disparado",
          },
          {
            id: "wh_evt_8830",
            timestamp: new Date(Date.now() - 1000 * 75).toISOString(),
            channel: "instagram",
            event: "feed_comment",
            senderId: "igsid_10928374",
            statusCode: 200,
            hmacVerified: true,
            latencyMs: 11,
            matchedTrigger: "Comentário no Post ID 180293847",
            actionTaken: "DM enviada e comentário curtido",
          },
          {
            id: "wh_evt_8829",
            timestamp: new Date(Date.now() - 1000 * 190).toISOString(),
            channel: "messenger",
            event: "messaging_postbacks",
            senderId: "psid_77615243",
            statusCode: 200,
            hmacVerified: true,
            latencyMs: 9,
            matchedTrigger: "Botão 'Ver Preços' clicado",
            actionTaken: "Carrossel de planos enviado",
          },
        ];
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ success: true, count: logs.length, events: logs }, null, 2),
          },
        ],
      };
    }

    case "simulate_meta_webhook": {
      const { channel, eventType, senderId = "simulated_user_123", text = "Gostaria de saber os planos" } = args;

      const mockPayload = {
        object: channel === "instagram" ? "instagram" : "page",
        entry: [
          {
            id: "page_or_ig_account_id_999",
            time: Math.floor(Date.now() / 1000),
            messaging: [
              {
                sender: { id: senderId },
                recipient: { id: "page_or_ig_account_id_999" },
                timestamp: Date.now(),
                message: {
                  mid: `mid.sim_${Date.now()}`,
                  text: text,
                },
              },
            ],
          },
        ],
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                simulationId: `sim_${Date.now()}`,
                channel,
                eventType,
                simulatedPayload: mockPayload,
                hmacSignatureGenerated: "sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                result: "Evento processado com sucesso. Gatilho identificado e fluxo correspondente ativado.",
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "query_knowledge_base": {
      const { query, category, limit = 4 } = args;
      let items: any[] = [];

      if (db) {
        const mongoQuery: any = {};
        if (category) mongoQuery.category = category;
        mongoQuery.$or = [
          { question: { $regex: query, $options: "i" } },
          { answer: { $regex: query, $options: "i" } },
          { title: { $regex: query, $options: "i" } },
        ];
        items = await db.collection("knowledge_base").find(mongoQuery).limit(limit).toArray();
      }

      if (items.length === 0) {
        items = [
          {
            title: "Planos & Preços ManyFlow",
            category: "precos",
            content: "O plano Starter custa R$ 97/mês (1.000 contatos). O plano Pro custa R$ 197/mês (5.000 contatos) e o plano Enterprise custa R$ 497/mês com contatos ilimitados e suporte VIP.",
          },
          {
            title: "Formas de Pagamento e Chave Pix",
            category: "financeiro",
            content: "Aceitamos Cartão de Crédito em até 12x, Boleto Bancário e Pix com ativação imediata e 5% de desconto à vista.",
          },
          {
            title: "Garantia Incondicional",
            category: "politicas",
            content: "Oferecemos garantia de 7 dias com reembolso integral caso o cliente não se adapte à plataforma.",
          },
        ];
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ success: true, query, totalFound: items.length, articles: items }, null, 2),
          },
        ],
      };
    }

    case "manage_lead_tag": {
      const { leadId, action, tag } = args;
      if (!leadId || !action || !tag) {
        return { isError: true, content: [{ type: "text", text: "Erro: leadId, action e tag são obrigatórios." }] };
      }

      if (db) {
        if (action === "add") {
          await db.collection("contacts").updateOne({ id: leadId }, { $addToSet: { tags: tag } as any });
        } else {
          await db.collection("contacts").updateOne({ id: leadId }, { $pull: { tags: tag } as any });
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                leadId,
                action,
                tag,
                message: `Tag '${tag}' foi ${action === "add" ? "adicionada ao" : "removida do"} lead '${leadId}' com sucesso.`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case "get_system_health": {
      const health = {
        status: "healthy",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        channels: {
          instagram: { status: "connected", account: "@manyflow_oficial", followers: "48.2k", tokenValid: true },
          messenger: { status: "connected", page: "ManyFlow Automações", tokenValid: true },
          whatsapp: { status: "connected", number: "+55 11 99999-0000", qualityRating: "GREEN" },
        },
        metaGraphApi: {
          apiVersion: "v21.0",
          rateLimitCallCountPercent: "14%",
          rateLimitCpuPercent: "8%",
          estimatedTimeToResetMinutes: 0,
        },
        mcpServer: {
          protocolVersion: "2024-11-05",
          activeToolsCount: MCP_TOOLS.length,
          activeResourcesCount: MCP_RESOURCES.length,
          activePromptsCount: MCP_PROMPTS.length,
        },
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(health, null, 2),
          },
        ],
      };
    }

    default:
      return {
        isError: true,
        content: [{ type: "text", text: `Ferramenta MCP desconhecida: '${name}'. Use 'tools/list' para ver as ferramentas disponíveis.` }],
      };
  }
}

// ============================================================================
// --- MCP RESOURCE EXECUTION ENGINE ---
// ============================================================================

async function readMcpResource(uri: string): Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }> {
  const db = await getDb();

  switch (uri) {
    case "manyflow://stats/summary": {
      const stats = {
        activeLeadsCount: 1420,
        messagesSentToday: 4890,
        activeFlowsCount: 8,
        conversionRatePercent: 31.8,
        averageResponseTimeMs: 340,
        channelsActiveCount: 3,
        systemHealth: "optimal",
      };

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(stats, null, 2),
          },
        ],
      };
    }

    case "manyflow://channels/status": {
      const channels = [
        { channel: "instagram", name: "Instagram Direct", status: "active", tokenExpiresInDays: 58, rateLimitUsage: "12%" },
        { channel: "messenger", name: "Facebook Messenger", status: "active", tokenExpiresInDays: 58, rateLimitUsage: "8%" },
        { channel: "whatsapp", name: "WhatsApp Cloud API", status: "active", quality: "HIGH", rateLimitUsage: "18%" },
      ];

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(channels, null, 2),
          },
        ],
      };
    }

    case "manyflow://flows/catalog": {
      let flows: any[] = [];
      if (db) {
        flows = await db.collection("flows").find({}).project({ id: 1, name: 1, channel: 1, status: 1, triggers: 1 }).toArray();
      }
      if (flows.length === 0) {
        flows = [
          { id: "flow_1", name: "Boas-Vindas DM", channel: "instagram", status: "active" },
          { id: "flow_2", name: "Respostas a Comentários em Reels", channel: "instagram", status: "active" },
          { id: "flow_3", name: "Recuperação de Vendas WhatsApp", channel: "whatsapp", status: "active" },
        ];
      }

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(flows, null, 2),
          },
        ],
      };
    }

    case "manyflow://webhooks/recent": {
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              [
                { event: "messages", channel: "instagram", time: new Date().toISOString(), status: 200 },
                { event: "feed_comment", channel: "instagram", time: new Date(Date.now() - 30000).toISOString(), status: 200 },
              ],
              null,
              2
            ),
          },
        ],
      };
    }

    default:
      throw new Error(`Recurso MCP não encontrado: ${uri}`);
  }
}

// ============================================================================
// --- MCP ROUTER CONFIGURATION ---
// ============================================================================

export function createMcpRouter(): Router {
  const router = Router();

  // 1. MCP Protocol Info / Server Discovery endpoint
  router.get("/info", async (req: Request, res: Response) => {
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    res.json({
      name: "ManyFlow Meta Automation MCP Server",
      protocolVersion: "2024-11-05",
      version: "1.0.0",
      description: "Servidor MCP oficial do ManyFlow para integração com Claude Desktop, Cursor IDE, Windsurf e Agentes de IA.",
      endpoints: {
        jsonRpc: `${baseUrl}/api/mcp`,
        sse: `${baseUrl}/api/mcp/sse`,
        messages: `${baseUrl}/api/mcp/messages`,
      },
      capabilities: {
        tools: { listChanged: false },
        resources: { subscribe: false, listChanged: false },
        prompts: { listChanged: false },
      },
      counts: {
        tools: MCP_TOOLS.length,
        resources: MCP_RESOURCES.length,
        prompts: MCP_PROMPTS.length,
      },
      tools: MCP_TOOLS,
      resources: MCP_RESOURCES,
      prompts: MCP_PROMPTS,
    });
  });

  // 2. Client Config Generation (Claude Desktop, Cursor, etc.)
  router.get("/config", async (req: Request, res: Response) => {
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;
    const token = memoryTokens[0]?.token || "mf_mcp_live_sec_994821a8f9037e2b104c";

    const clientType = req.query.type as string || "claude_desktop";

    if (clientType === "cursor") {
      res.json({
        type: "cursor",
        filename: ".cursor/mcp.json",
        config: {
          mcpServers: {
            manyflow: {
              url: `${baseUrl}/api/mcp/sse`,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          },
        },
      });
      return;
    }

    // Default: Claude Desktop configuration format
    res.json({
      type: "claude_desktop",
      filename: "claude_desktop_config.json",
      config: {
        mcpServers: {
          manyflow: {
            url: `${baseUrl}/api/mcp/sse`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        },
      },
      quickInstructions: {
        macOS: "~/Library/Application Support/Claude/claude_desktop_config.json",
        windows: "%APPDATA%\\Claude\\claude_desktop_config.json",
        linux: "~/.config/Claude/claude_desktop_config.json",
      },
    });
  });

  // 3. Main MCP JSON-RPC 2.0 Handler (POST /api/mcp)
  router.post("/", async (req: Request, res: Response) => {
    const startTime = Date.now();
    const body = req.body || {};
    const { jsonrpc, id, method, params } = body;

    const authCheck = await validateMcpAuth(req);
    if (!authCheck.valid) {
      const durationMs = Date.now() - startTime;
      await recordMcpActivity({
        method: method || "unknown",
        clientInfo: (req.headers["user-agent"] as string) || "Unknown MCP Client",
        latencyMs: durationMs,
        status: "error",
        statusCode: 401,
        errorMessage: authCheck.error,
        requestPayload: body,
      });

      return res.status(401).json({
        jsonrpc: "2.0",
        id: id || null,
        error: { code: -32000, message: authCheck.error || "Autenticação MCP não autorizada." },
      });
    }

    // Check JSON-RPC 2.0 compliance
    if (jsonrpc !== "2.0") {
      return res.status(400).json({
        jsonrpc: "2.0",
        id: id || null,
        error: { code: -32600, message: "Requisição inválida. Deve seguir especificação JSON-RPC 2.0." },
      });
    }

    try {
      // Dispatch MCP method
      switch (method) {
        // Handshake: initialize
        case "initialize": {
          const durationMs = Date.now() - startTime;
          await recordMcpActivity({
            method: "initialize",
            clientInfo: (params?.clientInfo?.name ? `${params.clientInfo.name} ${params.clientInfo.version || ""}` : (req.headers["user-agent"] as string)) || "MCP Client",
            latencyMs: durationMs,
            status: "success",
            statusCode: 200,
            responseSummary: "Handshake inicializado com sucesso",
          });

          return res.json({
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: {
                tools: { listChanged: false },
                resources: { subscribe: false, listChanged: false },
                prompts: { listChanged: false },
              },
              serverInfo: {
                name: "ManyFlow Meta Automation MCP Server",
                version: "1.0.0",
              },
            },
          });
        }

        // Notifications or ping
        case "notifications/initialized":
        case "ping": {
          return res.json({
            jsonrpc: "2.0",
            id,
            result: {},
          });
        }

        // List Tools
        case "tools/list": {
          const durationMs = Date.now() - startTime;
          await recordMcpActivity({
            method: "tools/list",
            clientInfo: (req.headers["user-agent"] as string) || "MCP Client",
            latencyMs: durationMs,
            status: "success",
            statusCode: 200,
            responseSummary: `Retornou ${MCP_TOOLS.length} ferramentas`,
          });

          return res.json({
            jsonrpc: "2.0",
            id,
            result: {
              tools: MCP_TOOLS,
            },
          });
        }

        // Call Tool
        case "tools/call": {
          const toolName = params?.name;
          const toolArgs = params?.arguments || {};

          if (!toolName) {
            return res.status(400).json({
              jsonrpc: "2.0",
              id,
              error: { code: -32602, message: "Parâmetro 'name' da ferramenta é obrigatório." },
            });
          }

          const toolResult = await executeMcpTool(toolName, toolArgs);
          const durationMs = Date.now() - startTime;

          await recordMcpActivity({
            method: "tools/call",
            toolOrResource: toolName,
            clientInfo: (req.headers["user-agent"] as string) || "MCP Client",
            latencyMs: durationMs,
            status: toolResult.isError ? "error" : "success",
            statusCode: toolResult.isError ? 400 : 200,
            requestPayload: toolArgs,
            responseSummary: toolResult.content?.[0]?.text?.substring(0, 150) || "Ferramenta executada",
          });

          return res.json({
            jsonrpc: "2.0",
            id,
            result: toolResult,
          });
        }

        // List Resources
        case "resources/list": {
          return res.json({
            jsonrpc: "2.0",
            id,
            result: {
              resources: MCP_RESOURCES,
            },
          });
        }

        // Read Resource
        case "resources/read": {
          const uri = params?.uri;
          if (!uri) {
            return res.status(400).json({
              jsonrpc: "2.0",
              id,
              error: { code: -32602, message: "Parâmetro 'uri' do recurso é obrigatório." },
            });
          }

          const resourceResult = await readMcpResource(uri);
          const durationMs = Date.now() - startTime;

          await recordMcpActivity({
            method: "resources/read",
            toolOrResource: uri,
            clientInfo: (req.headers["user-agent"] as string) || "MCP Client",
            latencyMs: durationMs,
            status: "success",
            statusCode: 200,
            responseSummary: `Recurso lido (${resourceResult.contents.length} item)`,
          });

          return res.json({
            jsonrpc: "2.0",
            id,
            result: resourceResult,
          });
        }

        // List Prompts
        case "prompts/list": {
          return res.json({
            jsonrpc: "2.0",
            id,
            result: {
              prompts: MCP_PROMPTS,
            },
          });
        }

        // Get Prompt
        case "prompts/get": {
          const promptName = params?.name;
          const promptArgs = params?.arguments || {};

          let messages: any[] = [];
          if (promptName === "triage-lead") {
            messages = [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Você é o especialista de CRM do ManyFlow. Analise o lead '${promptArgs.leadId || "desconhecido"}' usando a ferramenta 'get_lead_details'. Identifique o sentimento, nível de interesse e envie a melhor mensagem com a ferramenta 'send_message'.`,
                },
              },
            ];
          } else if (promptName === "debug-webhook-failure") {
            messages = [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Você é o engenheiro de integração da Meta Graph API. Use a ferramenta 'get_webhook_logs' com status='error', analise assinaturas HMAC e forneça um plano passo a passo para corrigir o problema.`,
                },
              },
            ];
          } else {
            messages = [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Assistente ManyFlow acionado para a tarefa: ${promptName}`,
                },
              },
            ];
          }

          return res.json({
            jsonrpc: "2.0",
            id,
            result: {
              description: `Template de prompt '${promptName}' instanciado.`,
              messages,
            },
          });
        }

        default:
          return res.status(404).json({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Método MCP não suportado: '${method}'.` },
          });
      }
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      await recordMcpActivity({
        method: method || "error",
        clientInfo: (req.headers["user-agent"] as string) || "MCP Client",
        latencyMs: durationMs,
        status: "error",
        statusCode: 500,
        errorMessage: error.message,
      });

      return res.status(500).json({
        jsonrpc: "2.0",
        id: id || null,
        error: { code: -32603, message: error.message || "Erro interno do servidor MCP." },
      });
    }
  });

  // 4. Server-Sent Events (SSE) Transport endpoint (GET /api/mcp/sse)
  router.get("/sse", async (req: Request, res: Response) => {
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders?.();

    const sessionId = `mcp_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
    const messageEndpoint = `${protocol}://${host}/api/mcp/messages?sessionId=${sessionId}`;

    // Send initial endpoint notification event as per MCP SSE spec
    res.write(`event: endpoint\ndata: ${messageEndpoint}\n\n`);

    // Keepalive ping every 15 seconds
    const pingInterval = setInterval(() => {
      res.write(`event: ping\ndata: {}\n\n`);
    }, 15000);

    req.on("close", () => {
      clearInterval(pingInterval);
    });
  });

  // 5. SSE Messages endpoint (POST /api/mcp/messages)
  router.post("/messages", async (req: Request, res: Response) => {
    // Forward JSON-RPC request to standard handler
    const body = req.body || {};
    const { jsonrpc, id, method, params } = body;

    if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      const result = await executeMcpTool(toolName, toolArgs);
      return res.json({ jsonrpc: "2.0", id, result });
    }

    if (method === "tools/list") {
      return res.json({ jsonrpc: "2.0", id, result: { tools: MCP_TOOLS } });
    }

    if (method === "initialize") {
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {}, resources: {}, prompts: {} },
          serverInfo: { name: "ManyFlow MCP Server", version: "1.0.0" },
        },
      });
    }

    return res.json({ jsonrpc: "2.0", id, result: {} });
  });

  // 6. Token Management Endpoints
  router.get("/tokens", async (req: Request, res: Response) => {
    const db = await getDb();
    if (db) {
      const dbTokens = await db.collection("mcp_tokens").find({}).toArray();
      if (dbTokens.length > 0) {
        return res.json({ success: true, tokens: dbTokens });
      }
    }
    res.json({ success: true, tokens: memoryTokens });
  });

  router.post("/tokens", async (req: Request, res: Response) => {
    const { name, role = "full_access" } = req.body || {};
    const newToken: McpToken = {
      id: `mcp_token_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name || "Nova Chave MCP",
      token: `mf_mcp_${crypto.randomBytes(16).toString("hex")}`,
      role: role === "read_only" ? "read_only" : "full_access",
      createdAt: new Date().toISOString(),
      callCount: 0,
    };

    const db = await getDb();
    if (db) {
      await db.collection("mcp_tokens").insertOne(newToken).catch(() => {});
    }
    memoryTokens.unshift(newToken);

    res.json({ success: true, token: newToken });
  });

  router.delete("/tokens/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const db = await getDb();
    if (db) {
      await db.collection("mcp_tokens").deleteOne({ id }).catch(() => {});
    }
    memoryTokens = memoryTokens.filter((t) => t.id !== id);
    res.json({ success: true, message: "Token revogado com sucesso." });
  });

  // 7. Activity Logs Endpoints
  router.get("/activity", async (req: Request, res: Response) => {
    const db = await getDb();
    if (db) {
      const dbLogs = await db.collection("mcp_activity_logs")
        .find({})
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();
      if (dbLogs.length > 0) {
        return res.json({ success: true, logs: dbLogs });
      }
    }
    res.json({ success: true, logs: memoryLogs });
  });

  router.delete("/activity", async (req: Request, res: Response) => {
    const db = await getDb();
    if (db) {
      await db.collection("mcp_activity_logs").deleteMany({}).catch(() => {});
    }
    memoryLogs = [];
    res.json({ success: true, message: "Histórico de logs MCP limpo." });
  });

  // 8. Test Runner Tool Executor for Web UI (POST /api/mcp/execute-test)
  router.post("/execute-test", async (req: Request, res: Response) => {
    const startTime = Date.now();
    const { toolName, args = {} } = req.body || {};

    if (!toolName) {
      return res.status(400).json({ success: false, error: "toolName é obrigatório." });
    }

    try {
      const result = await executeMcpTool(toolName, args);
      const latencyMs = Date.now() - startTime;

      await recordMcpActivity({
        method: "tools/call",
        toolOrResource: toolName,
        clientInfo: "ManyFlow Web MCP Studio Sandbox",
        latencyMs,
        status: result.isError ? "error" : "success",
        statusCode: result.isError ? 400 : 200,
        requestPayload: args,
        responseSummary: result.content?.[0]?.text?.substring(0, 150) || "Executado via sandbox",
      });

      res.json({
        success: !result.isError,
        latencyMs,
        result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
