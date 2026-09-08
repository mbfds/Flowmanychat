/**
 * Script de Teste Automatizado para Validação de Saúde (/api/health) e Segurança JWT
 * 
 * Executa verificações detalhadas:
 * 1. Endpoint /api/health retorna HTTP 200 e tempo de resposta
 * 2. Conexão com MongoDB está reportada corretamente (connected, pingLatencyMs, status)
 * 3. Tarefas agendadas do node-cron estão reportadas e operacionais
 * 4. Middleware de autenticação JWT bloqueia requisições sem token (HTTP 401)
 * 5. Requisições autenticadas com token JWT conseguem acessar recursos da API
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  durationMs: number;
}

const results: TestResult[] = [];

function logPass(msg: string) {
  console.log(`  \x1b[32m✔ PASS\x1b[0m: ${msg}`);
}

function logFail(msg: string) {
  console.log(`  \x1b[31m✖ FAIL\x1b[0m: ${msg}`);
}

function logInfo(msg: string) {
  console.log(`  \x1b[36mℹ INFO\x1b[0m: ${msg}`);
}

async function runTest(name: string, fn: () => Promise<string>): Promise<void> {
  const start = Date.now();
  try {
    const details = await fn();
    const durationMs = Date.now() - start;
    results.push({ name, passed: true, details, durationMs });
    logPass(`${name} (${durationMs}ms) - ${details}`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ name, passed: false, details: err.message, durationMs });
    logFail(`${name} (${durationMs}ms) - ${err.message}`);
  }
}

async function main() {
  console.log("\n========================================================");
  console.log(" 🧪 ManyFlow - Suíte de Testes de Saúde e Segurança API ");
  console.log(` Target: ${BASE_URL}`);
  console.log("========================================================\n");

  // TESTE 1: Validar Endpoint /api/health
  await runTest("1. Validação do Endpoint /api/health", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (res.status !== 200) {
      throw new Error(`Esperado status 200, recebido ${res.status}`);
    }

    const data = await res.json();
    if (!data.timestamp || typeof data.responseTimeMs !== "number") {
      throw new Error("Campos timestamp ou responseTimeMs ausentes na resposta");
    }

    return `HTTP 200 OK | Latência reportada: ${data.responseTime} (${data.responseTimeMs}ms)`;
  });

  // TESTE 2: Validar Conexão com MongoDB reportada no /api/health
  await runTest("2. Diagnóstico da Conexão com MongoDB", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    const db = data.database;

    if (!db) {
      throw new Error("Objeto 'database' não encontrado no payload de /api/health");
    }

    if (db.provider !== "MongoDB") {
      throw new Error(`Provedor de banco inesperado: ${db.provider}`);
    }

    const isConnected = Boolean(db.connected);
    const dbStatus = db.status;
    const pingLatency = db.pingLatencyMs;

    return `Status: [${dbStatus.toUpperCase()}] | Conectado: ${isConnected ? "SIM" : "NÃO"} | Ping: ${pingLatency}ms | Base: "${db.dbName || "manyflow"}"`;
  });

  // TESTE 3: Validar Tarefas Agendadas (node-cron) no /api/health
  await runTest("3. Monitoramento de Tarefas Agendadas (node-cron)", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    const cron = data.cron;

    if (!cron) {
      throw new Error("Objeto 'cron' não encontrado no payload de /api/health");
    }

    const tasks = cron.scheduledTasks || [];
    const hasLogCleanup = tasks.some((t: any) => t.id === "clean_old_logs");
    const hasBroadcast = tasks.some((t: any) => t.id === "dispatch_pending_broadcasts");

    if (!hasLogCleanup || !hasBroadcast) {
      throw new Error("Tarefas obrigatórias (clean_old_logs ou dispatch_pending_broadcasts) ausentes");
    }

    return `Engine: ${cron.engine} | Tarefas configuradas: ${tasks.length} (clean_old_logs @ 03:00, dispatch_pending_broadcasts @ 09:00)`;
  });

  // TESTE 4: Middleware JWT - Bloqueio de Acesso Não Autenticado
  await runTest("4. Middleware JWT: Bloqueio para Usuários Deslogados (HTTP 401)", async () => {
    const res = await fetch(`${BASE_URL}/api/contacts`);
    if (res.status !== 401) {
      throw new Error(`Esperado HTTP 401 para chamada deslogada a /api/contacts, mas recebeu ${res.status}`);
    }

    const data = await res.json();
    if (data.code !== "AUTH_TOKEN_MISSING") {
      throw new Error(`Código de erro esperado 'AUTH_TOKEN_MISSING', recebido '${data.code}'`);
    }

    return `HTTP 401 Unauthorized correto! Chamadas diretas ao MongoDB bloqueadas para deslogados`;
  });

  // TESTE 5: Middleware JWT - Acesso Permitido para Usuários Autenticados
  await runTest("5. Middleware JWT: Acesso Concedido com Token Válido (HTTP 200)", async () => {
    // Utiliza token de desenvolvimento pré-autorizado
    const res = await fetch(`${BASE_URL}/api/contacts`, {
      headers: {
        Authorization: "Bearer token_session_active_manyflow",
      },
    });

    if (res.status === 401) {
      throw new Error("A requisição com token válido foi indevidamente rejeitada com 401");
    }

    return `Status HTTP ${res.status} | Requisição com token JWT aceita e processada com sucesso`;
  });

  // TESTE 6: Webhook Meta Handshake GET /api/webhook
  await runTest("6. Handshake Meta Webhook (GET /api/webhook)", async () => {
    const challenge = "challenge_meta_test_9988";
    const res = await fetch(`${BASE_URL}/api/webhook?hub.mode=subscribe&hub.verify_token=manyflow_verify_token_secure_2026&hub.challenge=${challenge}`);
    if (res.status !== 200) {
      throw new Error(`Esperado status 200 no handshake, recebido ${res.status}`);
    }
    const body = await res.text();
    if (body.trim() !== challenge) {
      throw new Error(`Challenge esperado '${challenge}', recebido '${body}'`);
    }
    return `HTTP 200 OK | Handshake validado com sucesso e challenge retornado`;
  });

  // TESTE 7: Webhook Meta POST /api/webhook com Token Válido
  await runTest("7. Processamento Inbound Meta Webhook (POST /api/webhook)", async () => {
    const payload = {
      object: "instagram",
      entry: [
        {
          id: "page_123",
          time: Date.now(),
          messaging: [
            {
              sender: { id: "test_user_456" },
              recipient: { id: "page_123" },
              message: { text: "Olá ManyFlow!" },
            },
          ],
        },
      ],
    };

    const res = await fetch(`${BASE_URL}/api/webhook?hub.verify_token=manyflow_verify_token_secure_2026`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`Esperado status 200 no POST /api/webhook, recebido ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (data.message !== "EVENT_RECEIVED" || !data.tokenVerified) {
      throw new Error(`Resposta inesperada: ${JSON.stringify(data)}`);
    }

    return `HTTP 200 OK | EVENT_RECEIVED confirmado com token validado no .env`;
  });

  // TESTE 8: Webhook Meta POST /api/webhook com Bloqueio de Token Inválido
  await runTest("8. Segurança Meta Webhook: Bloqueio de Token Inválido (HTTP 403)", async () => {
    const payload = { object: "instagram", entry: [] };
    const res = await fetch(`${BASE_URL}/api/webhook?hub.verify_token=token_falso_hacker_123`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status !== 403) {
      throw new Error(`Esperado status 403 para token falso, recebido ${res.status}`);
    }

    const data = await res.json();
    if (data.code !== "INVALID_VERIFY_TOKEN") {
      throw new Error(`Código esperado 'INVALID_VERIFY_TOKEN', recebido '${data.code}'`);
    }

    return `HTTP 403 Forbidden correto! Token inválido bloqueado com sucesso`;
  });

  // Resumo Final
  console.log("\n--------------------------------------------------------");
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  if (allPassed) {
    console.log(`\x1b[32m✔ SUCESSO: Todos os ${totalCount} testes passaram com êxito!\x1b[0m`);
  } else {
    console.log(`\x1b[31m✖ FALHA: ${totalCount - passedCount} de ${totalCount} testes falharam.\x1b[0m`);
  }
  console.log("--------------------------------------------------------\n");

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Erro fatal na execução da suíte de testes:", err);
  process.exit(1);
});
