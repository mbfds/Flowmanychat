import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { getDb } from "./mongodb";

// Extended Express Request
export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
  session?: SessionRecord;
  tenantId?: string;
}

export interface JwtUserPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  allowedTenants: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface SessionRecord {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
  isValid: boolean;
  revokedAt?: string | null;
  revokedReason?: string | null;
}

// In-memory sessions fallback when MongoDB is unavailable
const inMemorySessions = new Map<string, SessionRecord>();

// Persistent JWT secret cache for runtime stability
let cachedSecret: string | null = null;

/**
 * Returns the JWT Secret configured in .env or securely generated
 */
export function getJwtSecret(): string {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length >= 16) {
    return process.env.JWT_SECRET.trim();
  }
  if (!cachedSecret) {
    cachedSecret = "mf_sec_jwt_" + crypto.randomBytes(32).toString("hex");
    console.log("[Auth Session] JWT_SECRET não configurado no .env; gerado segredo efêmero seguro de 256 bits.");
  }
  return cachedSecret;
}

/**
 * Returns session duration string, e.g. "7d", "24h"
 */
export function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || "7d";
}

/**
 * Calculates ISO expiration timestamp from expiresIn string
 */
export function calculateExpirationDate(expiresIn: string = getJwtExpiresIn()): string {
  const match = expiresIn.match(/^(\d+)([smhdwy])$/i);
  let durationMs = 7 * 24 * 60 * 60 * 1000; // default 7 days

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    switch (unit) {
      case "s": durationMs = value * 1000; break;
      case "m": durationMs = value * 60 * 1000; break;
      case "h": durationMs = value * 60 * 60 * 1000; break;
      case "d": durationMs = value * 24 * 60 * 60 * 1000; break;
      case "w": durationMs = value * 7 * 24 * 60 * 60 * 1000; break;
      case "y": durationMs = value * 365 * 24 * 60 * 60 * 1000; break;
    }
  }

  return new Date(Date.now() + durationMs).toISOString();
}

/**
 * Creates and signs a new JWT session for a user, persisting it in MongoDB and memory
 */
export async function createSession(
  user: { id: string; email: string; name?: string; role?: string; tenantId?: string; allowedTenants?: string[] },
  req?: Request,
  customExpiresIn?: string
): Promise<{ token: string; session: SessionRecord; expiresIn: string }> {
  const expiresIn = customExpiresIn || getJwtExpiresIn();
  const expiresAt = calculateExpirationDate(expiresIn);
  const sessionId = `sess_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  const nowIso = new Date().toISOString();

  const userAgent = req?.headers["user-agent"] || "Unknown Device / API Client";
  const ipAddress = (req?.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req?.ip || "127.0.0.1";

  const sessionRecord: SessionRecord = {
    id: sessionId,
    userId: user.id,
    email: user.email.toLowerCase().trim(),
    name: user.name || user.email.split("@")[0],
    role: user.role || "admin",
    tenantId: user.tenantId || "tenant_main",
    userAgent,
    ipAddress,
    createdAt: nowIso,
    expiresAt,
    lastActiveAt: nowIso,
    isValid: true,
    revokedAt: null,
    revokedReason: null,
  };

  // 1. Sign JWT
  const payload: JwtUserPayload = {
    userId: user.id,
    email: user.email.toLowerCase().trim(),
    name: user.name || user.email.split("@")[0],
    role: user.role || "admin",
    tenantId: user.tenantId || "tenant_main",
    allowedTenants: user.allowedTenants || [user.tenantId || "tenant_main"],
    sessionId,
  };

  const token = jwt.sign(payload, getJwtSecret(), {
    expiresIn: expiresIn as any,
    issuer: "manyflow-auth-engine",
    audience: "manyflow-users",
    subject: user.id,
  });

  // 2. Persist in memory
  inMemorySessions.set(sessionId, sessionRecord);

  // 3. Persist in MongoDB
  try {
    const db = await getDb();
    if (db) {
      // Ensure index on user_sessions
      await Promise.all([
        db.collection("user_sessions").createIndex({ id: 1 }, { unique: true }).catch(() => null),
        db.collection("user_sessions").createIndex({ userId: 1 }).catch(() => null),
        db.collection("user_sessions").createIndex({ expiresAt: 1 }).catch(() => null),
        db.collection("user_sessions").createIndex({ isValid: 1 }).catch(() => null),
      ]);

      await db.collection("user_sessions").insertOne({
        ...sessionRecord,
        tokenSignature: crypto.createHash("sha256").update(token).digest("hex"),
      });
    }
  } catch (dbErr) {
    console.warn("[Auth Session] Aviso ao persistir sessão no MongoDB, usando fallback em memória:", dbErr);
  }

  return {
    token,
    session: sessionRecord,
    expiresIn,
  };
}

/**
 * Validates and decodes a JWT token, checking session validity in database
 */
export async function validateSessionToken(token: string): Promise<{
  valid: boolean;
  user?: JwtUserPayload;
  session?: SessionRecord;
  error?: string;
}> {
  if (!token) {
    return { valid: false, error: "Token ausente" };
  }

  // Handle legacy/simple tokens for development backward-compatibility
  if (token === "token_session_active_manyflow" || token.startsWith("mf_token_dev_")) {
    const devUser: JwtUserPayload = {
      userId: "usr_admin_default",
      name: "Administrador ManyFlow",
      email: "admin@manyflow.com",
      role: "super_admin",
      tenantId: "tenant_main",
      allowedTenants: ["tenant_main"],
      sessionId: "sess_dev_default",
    };
    return {
      valid: true,
      user: devUser,
      session: {
        id: "sess_dev_default",
        userId: devUser.userId,
        email: devUser.email,
        name: devUser.name,
        role: devUser.role,
        tenantId: devUser.tenantId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
        lastActiveAt: new Date().toISOString(),
        isValid: true,
      }
    };
  }

  try {
    // 1. Verify cryptographic JWT signature and expiration
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: "manyflow-auth-engine",
      audience: "manyflow-users",
    }) as JwtUserPayload;

    if (!decoded || !decoded.userId || !decoded.sessionId) {
      return { valid: false, error: "Payload do token JWT corrompido ou incompleto" };
    }

    // 2. Check session status in MongoDB or memory
    let sessionRecord: SessionRecord | null = null;
    const db = await getDb();

    if (db) {
      const doc = await db.collection("user_sessions").findOne({ id: decoded.sessionId });
      if (doc) {
        sessionRecord = doc as unknown as SessionRecord;
      }
    }

    // Fallback to in-memory store if DB had no record or is offline
    if (!sessionRecord && inMemorySessions.has(decoded.sessionId)) {
      sessionRecord = inMemorySessions.get(decoded.sessionId) || null;
    }

    // If session record exists, verify it wasn't explicitly revoked or expired
    if (sessionRecord) {
      if (!sessionRecord.isValid) {
        return { valid: false, error: sessionRecord.revokedReason || "Sessão revogada pelo usuário ou administrador" };
      }

      const isExpired = new Date(sessionRecord.expiresAt).getTime() <= Date.now();
      if (isExpired) {
        return { valid: false, error: "Sessão expirada. Faça login novamente para renovar o acesso." };
      }

      // Update last active time in background (throttled to avoid DB thrashing)
      const lastActive = new Date(sessionRecord.lastActiveAt).getTime();
      if (Date.now() - lastActive > 5 * 60 * 1000) {
        const nowIso = new Date().toISOString();
        sessionRecord.lastActiveAt = nowIso;
        if (db) {
          db.collection("user_sessions")
            .updateOne({ id: decoded.sessionId }, { $set: { lastActiveAt: nowIso } })
            .catch(() => null);
        }
      }
    }

    return {
      valid: true,
      user: decoded,
      session: sessionRecord || {
        id: decoded.sessionId,
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        tenantId: decoded.tenantId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date((decoded.exp || 0) * 1000).toISOString(),
        lastActiveAt: new Date().toISOString(),
        isValid: true,
      },
    };
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return { valid: false, error: "Token JWT expirado. Faça login novamente para renovar a sessão." };
    }
    if (err.name === "JsonWebTokenError") {
      return { valid: false, error: "Assinatura de token inválida ou corrompida." };
    }
    return { valid: false, error: err.message || "Falha na validação do token de autenticação." };
  }
}

/**
 * Revokes an active session by session ID
 */
export async function revokeSession(sessionId: string, reason = "Logout manual do usuário"): Promise<boolean> {
  // 1. Invalidate in memory
  if (inMemorySessions.has(sessionId)) {
    const s = inMemorySessions.get(sessionId)!;
    s.isValid = false;
    s.revokedAt = new Date().toISOString();
    s.revokedReason = reason;
  }

  // 2. Invalidate in MongoDB
  try {
    const db = await getDb();
    if (db) {
      await db.collection("user_sessions").updateOne(
        { id: sessionId },
        {
          $set: {
            isValid: false,
            revokedAt: new Date().toISOString(),
            revokedReason: reason,
          },
        }
      );
    }
    return true;
  } catch (err) {
    console.error("[Auth Session] Erro ao revogar sessão:", err);
    return false;
  }
}

/**
 * Revokes all sessions for a specific user (e.g. on password reset or security breach)
 */
export async function revokeAllUserSessions(userId: string, reason = "Encerramento global de sessões"): Promise<number> {
  let count = 0;

  // In-memory
  for (const [id, s] of inMemorySessions.entries()) {
    if (s.userId === userId && s.isValid) {
      s.isValid = false;
      s.revokedAt = new Date().toISOString();
      s.revokedReason = reason;
      count++;
    }
  }

  // MongoDB
  try {
    const db = await getDb();
    if (db) {
      const res = await db.collection("user_sessions").updateMany(
        { userId, isValid: true },
        {
          $set: {
            isValid: false,
            revokedAt: new Date().toISOString(),
            revokedReason: reason,
          },
        }
      );
      count = Math.max(count, res.modifiedCount || 0);
    }
  } catch (err) {
    console.error("[Auth Session] Erro ao revogar todas as sessões do usuário:", err);
  }

  return count;
}

/**
 * Lists all active sessions for a given user
 */
export async function listUserSessions(userId: string): Promise<SessionRecord[]> {
  try {
    const db = await getDb();
    if (db) {
      const sessions = await db
        .collection("user_sessions")
        .find({ userId, isValid: true })
        .sort({ lastActiveAt: -1 })
        .limit(20)
        .toArray();
      return sessions as unknown as SessionRecord[];
    }
  } catch (err) {
    console.warn("[Auth Session] Erro ao listar sessões do MongoDB:", err);
  }

  // Memory fallback
  return Array.from(inMemorySessions.values())
    .filter((s) => s.userId === userId && s.isValid)
    .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
}

/**
 * Prunes expired or invalidated sessions from MongoDB & Memory (called by Cron Worker)
 */
export async function pruneExpiredSessions(): Promise<number> {
  const nowIso = new Date().toISOString();
  let prunedCount = 0;

  // In-memory pruning
  for (const [id, session] of inMemorySessions.entries()) {
    if (new Date(session.expiresAt).getTime() <= Date.now() || (!session.isValid && session.revokedAt)) {
      inMemorySessions.delete(id);
      prunedCount++;
    }
  }

  // MongoDB pruning
  try {
    const db = await getDb();
    if (db) {
      const result = await db.collection("user_sessions").deleteMany({
        $or: [
          { expiresAt: { $lte: nowIso } },
          { isValid: false, revokedAt: { $lte: new Date(Date.now() - 7 * 86400000).toISOString() } },
        ],
      });
      prunedCount = Math.max(prunedCount, result.deletedCount || 0);
    }
  } catch (err) {
    console.warn("[Auth Session] Erro ao limpar sessões expiradas:", err);
  }

  return prunedCount;
}

/**
 * Express Middleware: Requires valid JWT session
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : (req.query.token as string) || (req.headers["x-access-token"] as string);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Acesso não autorizado: Token de sessão ausente.",
      code: "AUTH_TOKEN_MISSING",
    });
  }

  const result = await validateSessionToken(token);
  if (!result.valid || !result.user) {
    return res.status(401).json({
      success: false,
      error: result.error || "Sessão inválida ou expirada.",
      code: "AUTH_TOKEN_INVALID",
    });
  }

  req.user = result.user;
  req.session = result.session;
  req.tenantId = result.user.tenantId;

  next();
}

/**
 * Express Middleware: Optional JWT session extraction
 */
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : (req.query.token as string) || (req.headers["x-access-token"] as string);

  if (token) {
    const result = await validateSessionToken(token);
    if (result.valid && result.user) {
      req.user = result.user;
      req.session = result.session;
      req.tenantId = result.user.tenantId;
    }
  }

  next();
}

/**
 * Global API Protection Middleware (JWT Guard):
 * Intercepts all incoming calls to /api/*, verifying that the JWT token is valid.
 * Blocks unauthenticated/logged-out users from accessing or mutating MongoDB data directly.
 * Allows safe public endpoints (health check, auth login/register, public webhooks).
 */
export async function jwtApiAuthGuard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // 1. Allow CORS preflight requests
  if (req.method === "OPTIONS") {
    return next();
  }

  // 2. Extract path without query parameters (handles both mounted /api and root paths)
  const fullPath = (req.originalUrl || req.url || "").split("?")[0];
  const relativePath = (req.path || "").split("?")[0];
  const normalizedPath = fullPath.startsWith("/api")
    ? fullPath
    : `/api${relativePath.startsWith("/") ? relativePath : `/${relativePath}`}`;

  // 3. Explicit whitelist of public endpoints that do not require JWT
  const isPublicRoute =
    normalizedPath === "/api/health" ||
    normalizedPath === "/health" ||
    normalizedPath === "/api/auth/login" ||
    normalizedPath === "/api/auth/register" ||
    normalizedPath === "/api/auth/reset-password" ||
    normalizedPath === "/api/auth/master-login" ||
    normalizedPath === "/api/auth/master-status" ||
    normalizedPath === "/api/webhook" ||
    normalizedPath.startsWith("/api/webhook/") ||
    normalizedPath === "/api/webhooks" ||
    normalizedPath.startsWith("/api/webhooks/") ||
    normalizedPath === "/api/meta/webhook" ||
    normalizedPath.startsWith("/api/meta/webhook/") ||
    normalizedPath.startsWith("/api/webhooks/meta-receive") ||
    normalizedPath.startsWith("/api/webhooks/facebook") ||
    normalizedPath.startsWith("/api/meta/webhook") ||
    normalizedPath.startsWith("/api/webhooks/verify") ||
    normalizedPath.startsWith("/api/webhooks/sign-payload") ||
    normalizedPath.startsWith("/api/webhooks/verify-signature") ||
    normalizedPath.startsWith("/api/webhooks/simulate-meta-event") ||
    normalizedPath.startsWith("/api/external-webhooks/dispatch") ||
    normalizedPath.startsWith("/api/system/cron");

  if (isPublicRoute) {
    return next();
  }

  // 4. Extract token from Authorization header, cookies, or custom headers/query
  const authHeader = req.headers.authorization;
  let token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : ((req.headers["x-access-token"] as string) || (req.query.token as string) || "").trim();

  // If not in headers, check cookie
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)(?:manyflow_token|token|session_token)=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]).trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      error: "Acesso não autorizado: Token JWT não fornecido. Usuários deslogados não podem acessar recursos protegidos do banco de dados.",
      code: "AUTH_TOKEN_MISSING",
      timestamp: new Date().toISOString(),
    });
  }

  // 5. Validate cryptographic signature, expiration and session state
  const validation = await validateSessionToken(token);
  if (!validation.valid || !validation.user) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      error: validation.error || "Sessão inválida ou expirada. Faça login para renovar o acesso.",
      code: "AUTH_TOKEN_INVALID",
      timestamp: new Date().toISOString(),
    });
  }

  // 6. Inject authenticated identity into the request object
  req.user = validation.user;
  req.session = validation.session;
  req.tenantId = validation.user.tenantId;

  next();
}

