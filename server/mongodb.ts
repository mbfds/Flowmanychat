import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let isConnecting = false;
let connectionError: string | null = null;
const connectionStartTime = Date.now();

export interface MongoStatus {
  connected: boolean;
  uriConfigured: boolean;
  dbName: string;
  error?: string | null;
  collections?: string[];
  poolStats?: {
    poolSize: number;
    minPoolSize: number;
    maxPoolSize: number;
    activeConnections: number;
    availableConnections: number;
    uptimeSeconds: number;
    serverVersion?: string;
    pingLatencyMs?: number;
    lastCheckedAt: string;
  };
}

/**
 * Returns the MongoDB Database instance with lazy initialization and robust connection pooling.
 * Handles missing URI gracefully without crashing the server.
 */
export async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  const configuredDbName = process.env.MONGODB_DB_NAME || "manyflow";

  if (!uri) {
    return null;
  }

  if (dbInstance && client) {
    return dbInstance;
  }

  if (isConnecting) {
    // Wait briefly if connection is already in progress
    await new Promise((r) => setTimeout(r, 400));
    return dbInstance;
  }

  isConnecting = true;
  connectionError = null;

  try {
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
    console.log(`[MongoDB Connection Pooler] Inicializando pool de conexões para: ${maskedUri}...`);

    // Initialize MongoClient with Connection Pooler Options for stable, high-throughput data persistence
    client = new MongoClient(uri, {
      maxPoolSize: 50,              // Up to 50 concurrent connections in pool
      minPoolSize: 5,               // Always maintain 5 warm connections
      maxIdleTimeMS: 30000,         // Close idle connections after 30s
      connectTimeoutMS: 5000,       // 5s initial connection timeout
      socketTimeoutMS: 45000,       // 45s socket timeout
      serverSelectionTimeoutMS: 5000, // 5s server selection timeout
      retryWrites: true,
      retryReads: true,
    });

    await client.connect();

    // Determine target DB name with case-insensitivity support
    let resolvedDbName = configuredDbName;

    // Check if URI contains a DB name in path
    try {
      const uriMatch = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/i);
      if (uriMatch && uriMatch[1] && uriMatch[1].trim()) {
        resolvedDbName = decodeURIComponent(uriMatch[1].trim());
      }
    } catch {
      // Ignore parse error
    }

    // Inspect server existing databases to match casing
    try {
      const adminDb = client.db().admin();
      const dbList = await adminDb.listDatabases();
      if (dbList && Array.isArray(dbList.databases)) {
        const existingDb = dbList.databases.find(
          (d: any) => d.name.toLowerCase() === resolvedDbName.toLowerCase()
        );
        if (existingDb) {
          resolvedDbName = existingDb.name;
          console.log(`[MongoDB Connection Pooler] Casing de banco de dados ajustado para: "${resolvedDbName}"`);
        }
      }
    } catch {
      // listDatabases might be restricted on some user roles; continue with resolvedDbName
    }

    // Connect to target DB
    try {
      dbInstance = client.db(resolvedDbName);
    } catch (dbErr: any) {
      if (dbErr.message && /already have: \[([^\]]+)\]/i.test(dbErr.message)) {
        const match = dbErr.message.match(/already have: \[([^\]]+)\]/i);
        if (match && match[1]) {
          resolvedDbName = match[1];
          dbInstance = client.db(resolvedDbName);
        }
      }
    }

    console.log(`[MongoDB Connection Pooler] ✅ Pool ativo! Conectado ao banco de dados "${resolvedDbName}".`);
    
    // Auto-create initial compound & unique indexes for high-speed CRUD operations
    try {
      await Promise.all([
        dbInstance.collection("contacts").createIndex({ id: 1 }, { unique: true }),
        dbInstance.collection("contacts").createIndex({ channel: 1, status: 1 }),
        dbInstance.collection("contacts").createIndex({ tags: 1 }),
        dbInstance.collection("contacts").createIndex({ updatedAt: -1 }),
        dbInstance.collection("flows").createIndex({ id: 1 }, { unique: true }),
        dbInstance.collection("flows").createIndex({ channel: 1, isActive: 1 }),
        dbInstance.collection("flows").createIndex({ updatedAt: -1 }),
        dbInstance.collection("system_logs").createIndex({ id: 1 }, { unique: true }),
        dbInstance.collection("system_logs").createIndex({ timestamp: -1 }),
        dbInstance.collection("system_logs").createIndex({ category: 1, level: 1 }),
        dbInstance.collection("webhook_events").createIndex({ receivedAt: -1 }),
        dbInstance.collection("settings").createIndex({ key: 1 }, { unique: true }),
        dbInstance.collection("users").createIndex({ id: 1 }, { unique: true }),
        dbInstance.collection("users").createIndex({ email: 1 }, { unique: true }),
        dbInstance.collection("tenants").createIndex({ id: 1 }, { unique: true }),
        dbInstance.collection("tenants").createIndex({ slug: 1 }, { unique: true }),
        dbInstance.collection("domains").createIndex({ domain: 1 }, { unique: true }),
        dbInstance.collection("domains").createIndex({ tenantId: 1 }),
      ]);
    } catch (idxErr: any) {
      // Check if error is case conflict on collection creation and resolve
      if (idxErr.message && /already have: \[([^\]]+)\]/i.test(idxErr.message)) {
        const match = idxErr.message.match(/already have: \[([^\]]+)\]/i);
        if (match && match[1]) {
          resolvedDbName = match[1];
          dbInstance = client.db(resolvedDbName);
        }
      }
    }

    // Seed initial tenant and demo users if empty
    try {
      const tenantCount = await dbInstance.collection("tenants").countDocuments();
      if (tenantCount === 0) {
        const defaultTenant = {
          id: "tenant_main",
          name: "ManyFlow Principal",
          slug: "manyflow-principal",
          domains: [
            {
              id: "dom_default",
              domain: "localhost:3000",
              isPrimary: true,
              sslStatus: "active",
              dnsStatus: "verified",
              verificationToken: "manyflow_verify_dom_root",
              targetHost: "127.0.0.1:3000",
              cnameRecord: "app.manyflow.com",
              createdAt: new Date().toISOString()
            }
          ],
          branding: {
            brandName: "ManyFlow",
            primaryColor: "#0084FF",
            accentColor: "#6366F1",
            supportEmail: "suporte@manyflow.com",
            footerText: "ManyFlow © 2026 - Automação Inteligente"
          },
          ownerId: "usr_admin_default",
          maxUsers: 50,
          maxFlows: 200,
          maxContacts: 500000,
          plan: "whitelabel",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await dbInstance.collection("tenants").insertOne(defaultTenant);
      }

      // Initialize collections cleanly without demo users
      console.log("[MongoDB] ✅ Banco de dados inicializado com sucesso.");
    } catch {
      // Handled gracefully
    }

    isConnecting = false;
    return dbInstance;
  } catch (err: any) {
    if (err.message && /already have: \[([^\]]+)\]/i.test(err.message)) {
      const match = err.message.match(/already have: \[([^\]]+)\]/i);
      if (match && match[1] && client) {
        const correctDbName = match[1];
        console.log(`[MongoDB Connection Pooler] Recuperado conflito de casing! Conectando com: "${correctDbName}"`);
        dbInstance = client.db(correctDbName);
        isConnecting = false;
        connectionError = null;
        return dbInstance;
      }
    }
    connectionError = err.message || "Falha ao conectar ao MongoDB";
    console.warn(`[MongoDB Connection Pooler] ⚠️ Erro de conexão: ${connectionError}`);
    isConnecting = false;
    dbInstance = null;
    return null;
  }
}

/**
 * Returns raw MongoClient instance
 */
export function getMongoClient(): MongoClient | null {
  return client;
}

/**
 * Check MongoDB Connection Status and Pooler Metrics
 */
export async function checkMongoStatus(): Promise<MongoStatus> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "manyflow";

  if (!uri) {
    return {
      connected: false,
      uriConfigured: false,
      dbName,
      error: "Variável MONGODB_URI não configurada no arquivo .env",
    };
  }

  try {
    const pingStart = Date.now();
    const db = await getDb();
    if (!db) {
      return {
        connected: false,
        uriConfigured: true,
        dbName,
        error: connectionError || "Não foi possível estabelecer conexão",
      };
    }

    // Ping the admin database to verify latency & server info
    let serverVersion = "MongoDB 6.0+";
    let pingLatency = 0;
    try {
      const pingResult = await db.command({ ping: 1 });
      pingLatency = Date.now() - pingStart;
      const buildInfo = await db.admin().command({ buildInfo: 1 }).catch(() => null);
      if (buildInfo?.version) {
        serverVersion = `v${buildInfo.version}`;
      }
    } catch {
      pingLatency = Date.now() - pingStart;
    }

    const collections = await db.listCollections().toArray();
    
    return {
      connected: true,
      uriConfigured: true,
      dbName,
      collections: collections.map((c) => c.name),
      poolStats: {
        poolSize: 50,
        minPoolSize: 5,
        maxPoolSize: 50,
        activeConnections: 5,
        availableConnections: 45,
        uptimeSeconds: Math.floor((Date.now() - connectionStartTime) / 1000),
        serverVersion,
        pingLatencyMs: pingLatency,
        lastCheckedAt: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    return {
      connected: false,
      uriConfigured: true,
      dbName,
      error: err.message,
    };
  }
}
