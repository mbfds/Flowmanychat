# ManyFlow Multi-Tenant Platform - Documentação Técnica do Mantenedor

> Sistema de automação de mensagens omnichannel, multi-tenant e fluxos de atendimento com backend Node.js/Express, persistência no MongoDB, autenticação JWT criptográfica e motor de agendamento de tarefas via **`node-cron`**.

---

## 📋 Sumário
1. [Visão Geral da Arquitetura](#-visão-geral-da-arquitetura)
2. [Tarefas Agendadas (Cron Jobs)](#-tarefas-agendadas-cron-jobs)
   - [2.1 Limpeza Automática de Logs Antigos (`clean_old_logs`)](#21-limpeza-automática-de-logs-antigos-clean_old_logs)
   - [2.2 Disparo Diário de Broadcasts Pendentes (`dispatch_pending_broadcasts`)](#22-disparo-diário-de-broadcasts-pendentes-dispatch_pending_broadcasts)
   - [2.3 Workers em Segundo Plano Adicionais (`cronManager`)](#23-workers-em-segundo-plano-adicionais-cronmanager)
   - [2.4 Endpoints de Controle e Acionamento Manual](#24-endpoints-de-controle-e-acionamento-manual)
3. [Segurança e Middleware de Autenticação JWT](#-segurança-e-middleware-de-autenticação-jwt)
   - [3.1 Como Funciona o Middleware `jwtApiAuthGuard`](#31-como-funciona-o-middleware-jwtapiauthguard)
   - [3.2 Endpoints Públicos vs. Protegidos](#32-endpoints-públicos-vs-protegidos)
4. [Endpoint de Monitoramento de Saúde (`/api/health`)](#-endpoint-de-monitoramento-de-saúde-apihealth)
5. [Script de Teste Automatizado](#-script-de-teste-automatizado)
6. [Guia de Configuração de Variáveis de Ambiente na Vercel](#-guia-de-configuração-de-variáveis-de-ambiente-na-vercel)

---

## 🏛 Visão Geral da Arquitetura

- **Backend:** Node.js 20+ com Express, TypeScript e empacotamento com esbuild.
- **Banco de Dados:** MongoDB (driver nativo `mongodb` 7.x com connection pooling e reconexão automática).
- **Frontend:** React 19, Tailwind CSS v4, Motion e Vite.
- **Autenticação:** JSON Web Tokens (JWT) com assinatura HS256 de 256 bits, rotação de segredo e tabela ativa de sessões com expurgo automático.
- **Agendador:** `node-cron` com suporte a fuso horário `America/Sao_Paulo` e controle de sobreposição (`noOverlap`).

---

## ⏱ Tarefas Agendadas (Cron Jobs)

O sistema conta com rotinas automáticas de manutenção e processamento assíncrono orquestradas por meio de `src/services/cronService.ts` e `server/cronManager.ts`.

### 2.1 Limpeza Automática de Logs Antigos (`clean_old_logs`)
- **Arquivo:** `src/services/cronService.ts`
- **Expressão Cron:** `0 3 * * *`
- **Frequência:** Diariamente às **03:00 da manhã** (Horário de Brasília - `America/Sao_Paulo`).
- **Coleções Impactadas no MongoDB:**
  - `system_logs` (logs de auditoria, eventos e erros)
  - `webhook_logs` (histórico de eventos recebidos e despachados)
  - `audit_logs` (ações administrativas e mutações de dados)
  - `user_sessions` (remoção de sessões expiradas ou revogadas)
- **Regra de Negócio / Critério:**
  - Calcula a data de corte: `thresholdDate = Agora - 30 dias`.
  - Executa `deleteMany({ timestamp: { $lt: thresholdDate } })`.
  - Remove sessões onde `expiresAt <= now`.
  - Ao concluir, insere um registro de auditoria na coleção `system_logs` contendo: total de registros removidos por coleção, duração do ciclo em milissegundos e fuso horário.

### 2.2 Disparo Diário de Broadcasts Pendentes (`dispatch_pending_broadcasts`)
- **Arquivo:** `src/services/cronService.ts`
- **Expressão Cron:** `0 9 * * *`
- **Frequência:** Diariamente às **09:00 da manhã** (Horário de Brasília - `America/Sao_Paulo`).
- **Coleção Impactada no MongoDB:**
  - `broadcast_campaigns`
  - `system_logs`
- **Regra de Negócio / Fluxo de Estados:**
  1. Busca campanhas com status `"pending"` ou com status `"scheduled"` cujo campo `scheduledAt <= Data/Hora Atual`.
  2. Altera atomicamente o status para `"in_progress"` com registro de `dispatchedAt`.
  3. Processa a entrega para a lista de contatos do público-alvo (WhatsApp, SMS ou Email).
  4. Calcula métricas de entrega (`sent`, `delivered`, `read`, `failed`).
  5. Atualiza o status final para `"completed"` (ou `"failed"` em caso de erro no payload).
  6. Registra o resultado na auditoria do sistema em `system_logs`.

### 2.3 Workers em Segundo Plano Adicionais (`cronManager`)
Gerenciados em `server/cronManager.ts` para monitoramento em tempo real:
| ID do Worker | Frequência | Descrição |
| :--- | :--- | :--- |
| `health_check_worker` | `*/5 * * * *` (A cada 5 min) | Testa ping do MongoDB e uso de memória RSS/Heap |
| `broadcast_scheduler_worker` | `* * * * *` (A cada 1 min) | Varredura de minuto a minuto para campanhas com agendamento imediato |
| `system_log_pruner` | `0 2 * * *` (Diário às 02:00) | Purgador preventivo de tabelas auxiliares |
| `session_cleanup_worker` | `0 */4 * * *` (A cada 4h) | Invalidação de tokens JWT expirados em memória e MongoDB |
| `meta_webhook_retry_worker` | `*/2 * * * *` (A cada 2 min) | Reprocessamento de entregas de webhooks que falharam com status 5xx |
| `metrics_aggregator_worker` | `*/15 * * * *` (A cada 15 min)| Consolidação de métricas por workspace/tenant |

### 2.4 Endpoints de Controle e Acionamento Manual

Os mantenedores podem acionar as rotinas sob demanda ou verificar seu status através das APIs REST:

- **Verificar Status dos Agendamentos:**
  ```bash
  curl -s http://localhost:3000/api/system/cron/cron-service-status
  ```
- **Disparar Limpeza de Logs Imediata (Ex: manter apenas 15 dias):**
  ```bash
  curl -X POST http://localhost:3000/api/system/cron/clean-logs \
    -H "Content-Type: application/json" \
    -d '{"days": 15}'
  ```
- **Forçar Disparo de Broadcasts Pendentes:**
  ```bash
  curl -X POST http://localhost:3000/api/system/cron/dispatch-broadcasts
  ```

---

## 🔒 Segurança e Middleware de Autenticação JWT

Para proteger a integridade dos dados no MongoDB e impedir que usuários deslogados acessem contatos, fluxos, configurações ou relatórios, o sistema aplica o middleware **`jwtApiAuthGuard`** em todas as requisições sob o prefixo `/api/*`.

### 3.1 Como Funciona o Middleware `jwtApiAuthGuard`
- **Arquivo:** `server/authSession.ts` e registrado em `server.ts` via `app.use("/api", jwtApiAuthGuard)`.
- **Inspeção de Cabeçalho:**
  - Extrai o token do cabeçalho `Authorization: Bearer <token>` ou `x-access-token`.
- **Comportamento para Usuários Deslogados:**
  - Rejeita chamadas imediatamente com **HTTP 401 Unauthorized**:
    ```json
    {
      "success": false,
      "statusCode": 401,
      "error": "Acesso não autorizado: Token JWT não fornecido. Usuários deslogados não podem acessar recursos protegidos do banco de dados.",
      "code": "AUTH_TOKEN_MISSING"
    }
    ```
- **Comportamento para Tokens Expirados ou Adulterados:**
  - Validação criptográfica com a chave `JWT_SECRET`. Se expirado ou com assinatura inválida, retorna **HTTP 401** (`AUTH_TOKEN_INVALID`).
- **Injeção de Contexto:**
  - Ao validar com sucesso, anexa os dados do usuário autenticado ao objeto Express (`req.user`, `req.session`, `req.tenantId`), garantindo isolamento multi-tenant.

### 3.2 Endpoints Públicos vs. Protegidos

| Rota | Acesso | Descrição |
| :--- | :--- | :--- |
| `GET /api/health` | **Público** | Verificação de integridade e monitoramento Uptime |
| `POST /api/auth/login` | **Público** | Autenticação de usuários e emissão do token JWT |
| `POST /api/auth/register` | **Público** | Registro de novas contas e workspaces |
| `POST /api/auth/reset-password` | **Público** | Solicitação e redefinição de senha |
| `POST /api/auth/master-login` | **Público** | Acesso emergencial com Senha Mestre de Administrador |
| `GET /api/webhooks/meta-receive` | **Público** | Validação de handshake / challenge do Facebook/Meta |
| `POST /api/webhooks/meta-receive`| **Público (HMAC)** | Recebimento de webhooks assinado por chave HMAC |
| `GET/POST /api/contacts/*` | **🔒 Protegido (JWT)** | Operações de banco de dados no MongoDB |
| `GET/POST /api/flows/*` | **🔒 Protegido (JWT)** | Criação e leitura de fluxos no MongoDB |
| `GET/POST /api/broadcasts/*` | **🔒 Protegido (JWT)** | Gestão de campanhas no MongoDB |
| `GET/POST /api/settings/*` | **🔒 Protegido (JWT)** | Configurações corporativas no MongoDB |

---

## 🩺 Endpoint de Monitoramento de Saúde (`/api/health`)

Utilizado por serviços como Vercel Health Checks, Cloud Run, UptimeRobot e BetterUptime.

- **URL:** `GET /api/health`
- **Código de Resposta:** `200 OK` (sempre retorna 200 para evitar falsos alarmes em balanceadores).
- **Métricas Retornadas:**
  - `responseTime` / `responseTimeMs`: Tempo de execução da consulta em milissegundos.
  - `database.connected`: Booleano informando se o MongoDB está conectado.
  - `database.status`: `"active"`, `"connecting"` ou `"unconfigured"`.
  - `database.pingLatencyMs`: Latência da viagem de ida e volta (RTT) ao cluster MongoDB.
  - `cron.scheduledTasks`: Relação das tarefas do `node-cron` com horário e status.

---

## 🧪 Script de Teste Automatizado

Para validar rapidamente o endpoint de saúde, a conexão com o MongoDB e a proteção do middleware JWT:

```bash
# Execução direta via npm
npm run test:health
```

O script realiza 5 testes essenciais:
1. Validação do status HTTP 200 em `/api/health`.
2. Diagnóstico da conexão com o MongoDB (provedor, banco, latência de ping).
3. Verificação do registro das tarefas `clean_old_logs` e `dispatch_pending_broadcasts`.
4. Confirmação do bloqueio HTTP 401 para chamadas sem token JWT.
5. Confirmação do acesso bem-sucedido com token JWT válido.

---

## 🚀 Guia de Configuração de Variáveis de Ambiente na Vercel

Ao implantar a aplicação na **Vercel**, configure as variáveis de ambiente no painel para assegurar que a persistência no MongoDB, a assinatura dos tokens JWT e as integrações funcionem em produção:

### 1. Acessar as Configurações do Projeto
1. Acesse [vercel.com](https://vercel.com) e entre no seu Workspace.
2. Selecione o projeto **ManyFlow**.
3. No menu superior, clique em **Settings** (Configurações).
4. No menu lateral esquerdo, clique em **Environment Variables**.

### 2. Adicionar as Variáveis Obrigatórias

| Nome da Variável | Exemplo de Valor em Produção | Descrição |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://admin:SUA_SENHA@cluster0.abcde.mongodb.net/manyflow?retryWrites=true&w=majority` | String de conexão oficial com o cluster do MongoDB Atlas. Deve conter usuário, senha e nome do banco. |
| `MONGODB_DB_NAME` | `manyflow` | Nome do banco de dados na instância do MongoDB (padrão: `manyflow`). |
| `JWT_SECRET` | `mf_prod_sec_8f9a2b7c4d1e0f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8` | Segredo criptográfico seguro de alta entropia (mínimo de 32 a 64 caracteres hexadecimais). |
| `JWT_EXPIRES_IN` | `7d` | Tempo de vida dos tokens gerados (`7d` = 7 dias, `24h` = 24 horas). |
| `NODE_ENV` | `production` | Define o modo de execução como produção para ativar otimizações de cache e segurança. |
| `GEMINI_API_KEY` | `AIzaSy...` | Chave de API da Google Cloud / AI Studio para os recursos de inteligência artificial generativa. |

### 3. Ambientes Alvo (Target Environments)
Ao cadastrar cada variável, certifique-se de marcar os três checkboxes:
- ☑ **Production**
- ☑ **Preview**
- ☑ **Development**

### 4. Dicas Importantes para o MongoDB Atlas na Vercel
- **Network Access no MongoDB Atlas:** No painel do MongoDB Atlas (em *Network Access*), adicione a regra de IP `0.0.0.0/0` (Allow Access from Anywhere) ou configure o Vercel Integration do MongoDB. Como a Vercel utiliza funções serverless com IPs dinâmicos, o acesso aberto por IP ou integração oficial é obrigatório para evitar falhas de conexão (*connection timeout*).
- **Redeploy após configurar:** Após salvar as variáveis no painel da Vercel, vá até a aba **Deployments** e clique em **Redeploy** na última versão para que as novas variáveis entrem em vigor no container.
